const { GoogleGenerativeAI } = require('@google/generative-ai');
const BloodRequest = require('../models/BloodRequest');
const User = require('../models/User');
const Notification = require('../models/Notification');

const COMPATIBLE_BLOOD = {
  'A+':  ['A+', 'A-', 'O+', 'O-'],
  'A-':  ['A-', 'O-'],
  'B+':  ['B+', 'B-', 'O+', 'O-'],
  'B-':  ['B-', 'O-'],
  'AB+': ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
  'AB-': ['A-', 'B-', 'AB-', 'O-'],
  'O+':  ['O+', 'O-'],
  'O-':  ['O-'],
};

exports.matchDonors = async (req, res) => {
  try {
    const { requestId } = req.params;
    const request = await BloodRequest.findById(requestId).populate('patient');
    if (!request) return res.status(404).json({ message: 'Request not found' });

    const compatible = COMPATIBLE_BLOOD[request.bloodType] || [];
    const donors = await User.find({
      role: 'donor',
      bloodType: { $in: compatible },
      isAvailable: true,
      isActive: true,
    });

    if (donors.length === 0) {
      return res.json({ matches: [], aiAnalysis: 'No compatible donors available at this time.' });
    }

    // Build Gemini AI prompt
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `You are a medical AI assistant for a blood donation platform called Dem AI.
    
Patient needs: ${request.units} units of ${request.bloodType} blood.
Urgency: ${request.urgency}
Hospital: ${request.hospital || 'Not specified'}
City: ${request.city || 'Not specified'}
Diagnosis: ${request.diagnosis || 'Not specified'}
Required by: ${request.requiredBy ? new Date(request.requiredBy).toDateString() : 'ASAP'}

Available compatible donors (${donors.length} total):
${donors.map((d, i) => `${i+1}. ${d.name} - Blood: ${d.bloodType} - City: ${d.city || 'Unknown'} - Last donation: ${d.lastDonationDate ? new Date(d.lastDonationDate).toDateString() : 'Never'}`).join('\n')}

Based on urgency, blood compatibility, donor availability, and location proximity, rank the top 5 best donor matches and provide a brief medical recommendation (2-3 sentences). Consider:
1. Critical urgency cases need immediate matches
2. Exact blood type matches preferred over compatible ones
3. Donors who haven't donated recently are better candidates
4. Same city is preferred

Respond in JSON format:
{
  "rankedDonors": [list of donor names in order],
  "recommendation": "brief medical recommendation",
  "urgencyNote": "urgency assessment"
}`;

    let aiAnalysis = '';
    let rankedDonorIds = donors.slice(0, 5).map(d => d._id);

    try {
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      const clean = text.replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(clean);
      aiAnalysis = `${parsed.recommendation} ${parsed.urgencyNote}`;

      // Reorder donors based on AI ranking
      const nameToId = {};
      donors.forEach(d => { nameToId[d.name] = d._id; });
      rankedDonorIds = (parsed.rankedDonors || [])
        .map(name => nameToId[name])
        .filter(Boolean)
        .slice(0, 5);
      if (rankedDonorIds.length === 0) rankedDonorIds = donors.slice(0, 5).map(d => d._id);
    } catch {
      aiAnalysis = `${donors.length} compatible donors found for ${request.bloodType} blood type. Urgency: ${request.urgency}.`;
    }

    // Save AI analysis and matched donors
    await BloodRequest.findByIdAndUpdate(requestId, {
      aiAnalysis,
      matchedDonors: rankedDonorIds,
      status: 'matched',
    });

    // Notify matched donors
    const matchedDonors = await User.find({ _id: { $in: rankedDonorIds } });
    const notifications = matchedDonors.map(donor => ({
      recipient: donor._id,
      type: 'match',
      title: 'Blood Donation Match Found!',
      message: `You have been matched to donate ${request.bloodType} blood. Urgency: ${request.urgency}. Hospital: ${request.hospital || request.city}`,
      relatedRequest: request._id,
    }));
    if (notifications.length > 0) await Notification.insertMany(notifications);

    res.json({ matches: matchedDonors, aiAnalysis, rankedCount: rankedDonorIds.length });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getPrioritizedRequests = async (req, res) => {
  try {
    const requests = await BloodRequest.find({ status: 'pending' })
      .populate('patient', 'name bloodType city')
      .sort({ urgency: -1, createdAt: 1 });

    if (requests.length === 0) return res.json({ requests: [], aiSummary: 'No pending requests.' });

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `You are a medical AI for a blood donation platform.
    
Current pending blood requests:
${requests.map((r, i) => `${i+1}. ${r.bloodType} - ${r.units} units - Urgency: ${r.urgency} - City: ${r.city || 'Unknown'} - Required by: ${r.requiredBy ? new Date(r.requiredBy).toDateString() : 'ASAP'}`).join('\n')}

Provide a 2-sentence summary of the most critical needs and prioritization recommendation. Be concise.`;

    let aiSummary = '';
    try {
      const result = await model.generateContent(prompt);
      aiSummary = result.response.text();
    } catch {
      aiSummary = `${requests.filter(r => r.urgency === 'critical').length} critical and ${requests.length} total pending requests require attention.`;
    }

    res.json({ requests, aiSummary });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.chat = async (req, res) => {
  try {
    const { message, history } = req.body;
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const systemContext = `You are Dem AI, an intelligent assistant for a blood donation platform. 
You help donors, patients, doctors, and admins with blood donation information, eligibility, compatibility, and platform usage.
Be concise, helpful, and empathetic. Respond in the same language the user uses (Arabic, English, or French).`;

    const chat = model.startChat({
      history: (history || []).map(h => ({ role: h.role, parts: [{ text: h.content }] })),
      generationConfig: { maxOutputTokens: 500 },
    });

    const result = await chat.sendMessage(`${systemContext}\n\nUser: ${message}`);
    const response = result.response.text();
    res.json({ response });
  } catch (err) {
    res.status(500).json({ message: 'AI chat error', error: err.message });
  }
};
