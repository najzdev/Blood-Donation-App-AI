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
    
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ message: 'AI service not configured', error: 'GEMINI_API_KEY is missing' });
    }

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
      return res.json({ matches: [], aiAnalysis: 'No compatible donors available at this time.', rankedCount: 0 });
    }

    // Build Gemini AI prompt
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

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
      if (!result || !result.response) {
        throw new Error('Invalid response from Gemini API');
      }
      
      // response.text() is synchronous, not async
      const text = result.response.text();
      if (!text) {
        throw new Error('Empty response from Gemini API');
      }
      
      const clean = text.replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(clean);
      aiAnalysis = `${parsed.recommendation || 'Recommendation pending'} ${parsed.urgencyNote || ''}`.trim();

      // Reorder donors based on AI ranking
      const nameToId = {};
      donors.forEach(d => { nameToId[d.name] = d._id; });
      rankedDonorIds = (parsed.rankedDonors || [])
        .map(name => nameToId[name])
        .filter(Boolean)
        .slice(0, 5);
      if (rankedDonorIds.length === 0) rankedDonorIds = donors.slice(0, 5).map(d => d._id);
    } catch (aiErr) {
      console.error('Gemini AI Error:', aiErr.message);
      aiAnalysis = `${donors.length} compatible donors found for ${request.bloodType} blood type. Urgency: ${request.urgency}.`;
      rankedDonorIds = donors.slice(0, 5).map(d => d._id);
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

    res.json({ 
      matches: matchedDonors.map(d => ({
        _id: d._id,
        name: d.name,
        bloodType: d.bloodType,
        city: d.city,
        phone: d.phone,
        lastDonationDate: d.lastDonationDate,
        isAvailable: d.isAvailable
      })), 
      aiAnalysis, 
      rankedCount: rankedDonorIds.length 
    });
  } catch (err) {
    console.error('Match Donors Error:', err);
    res.status(500).json({ message: err.message });
  }
};

exports.getPrioritizedRequests = async (req, res) => {
  try {
    const requests = await BloodRequest.find({ status: 'pending' })
      .populate('patient', 'name bloodType city')
      .sort({ urgency: -1, createdAt: 1 });

    if (requests.length === 0) return res.json({ requests: [], aiSummary: 'No pending requests.' });

    let aiSummary = `${requests.length} pending requests found.`;

    // Try to get AI summary, but don't fail if Gemini API is unavailable
    if (process.env.GEMINI_API_KEY) {
      try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const prompt = `You are a medical AI for a blood donation platform.
    
Current pending blood requests:
${requests.map((r, i) => `${i+1}. ${r.bloodType} - ${r.units} units - Urgency: ${r.urgency} - City: ${r.city || 'Unknown'} - Required by: ${r.requiredBy ? new Date(r.requiredBy).toDateString() : 'ASAP'}`).join('\n')}

Provide a 2-sentence summary of the most critical needs and prioritization recommendation. Be concise.`;

        const result = await model.generateContent(prompt);
        if (result && result.response) {
          const text = result.response.text();
          if (text && text.trim()) {
            aiSummary = text;
          }
        }
      } catch (aiErr) {
        console.error('Gemini AI Error (getPrioritizedRequests):', aiErr.message);
        // Fall back to basic summary
        aiSummary = `${requests.filter(r => r.urgency === 'critical').length} critical and ${requests.length} total pending requests require attention.`;
      }
    }

    res.json({ requests, aiSummary });
  } catch (err) {
    console.error('Get Prioritized Requests Error:', err);
    res.status(500).json({ message: err.message });
  }
};

exports.chat = async (req, res) => {
  try {
    const { message, history } = req.body;
    
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ message: 'AI service not configured', error: 'GEMINI_API_KEY is missing' });
    }

    if (!message || !message.trim()) {
      return res.status(400).json({ message: 'Message is required' });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const systemContext = `You are Dem AI, an intelligent assistant for a blood donation platform. 
You help donors, patients, doctors, and admins with blood donation information, eligibility, compatibility, and platform usage.
Be concise, helpful, and empathetic. Respond in the same language the user uses (Arabic, English, or French).`;

    // Format history for Gemini API - ensure first message is from user
    let formattedHistory = (history || []).map(h => ({
      role: h.role === 'user' ? 'user' : 'model',
      parts: [{ text: h.content }]
    }));

    // If history is empty or first message is not from user, add system context as first user message
    if (formattedHistory.length === 0 || formattedHistory[0].role !== 'user') {
      formattedHistory.unshift({
        role: 'user',
        parts: [{ text: systemContext }]
      });
      formattedHistory.push({
        role: 'model',
        parts: [{ text: 'Understood. I am Dem AI. How can I help you with blood donation?' }]
      });
    }

    const chat = model.startChat({
      history: formattedHistory,
      generationConfig: { maxOutputTokens: 500 },
    });

    // Send user message without system context in the message itself
    // The system context should only be in the generationConfig or as a separate context
    const result = await chat.sendMessage(message);
    
    if (!result || !result.response) {
      return res.status(500).json({ message: 'Invalid response from AI service' });
    }

    // response.text() is synchronous, not async
    let response;
    try {
      response = result.response.text();
    } catch (textErr) {
      console.error('Error getting text from response:', textErr);
      return res.status(500).json({ message: 'Failed to extract text from AI response' });
    }
    
    if (!response || response.trim() === '') {
      return res.status(500).json({ message: 'AI service returned empty response' });
    }
    
    res.json({ response });
  } catch (err) {
    console.error('AI Chat Error:', err.message || err);
    
    // If Gemini API fails, provide fallback response instead of error
    if (err.status === 404 || err.message?.includes('not found')) {
      return res.json({
        response: `I'm experiencing API issues, but here's some blood donation info:\n\n` +
          `• Blood Types: O- (universal donor), AB+ (universal recipient)\n` +
          `• Eligibility: 18-65 years, 50kg+, good health\n` +
          `• Compatibility: Same type or compatible types required\n\n` +
          `For full AI assistance, please configure a valid Gemini API key.`
      });
    }
    
    res.status(500).json({ 
      message: 'AI chat error', 
      error: err.message || 'Unknown error',
      type: err.constructor.name
    });
  }
};
