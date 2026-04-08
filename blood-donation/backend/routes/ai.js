const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const Patient = require('../models/Patient');
const Donor = require('../models/Donor');
const Inventory = require('../models/Inventory');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Blood type compatibility map
const BLOOD_COMPATIBILITY = {
  'A+':  ['A+', 'A-', 'O+', 'O-'],
  'A-':  ['A-', 'O-'],
  'B+':  ['B+', 'B-', 'O+', 'O-'],
  'B-':  ['B-', 'O-'],
  'AB+': ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
  'AB-': ['A-', 'B-', 'AB-', 'O-'],
  'O+':  ['O+', 'O-'],
  'O-':  ['O-'],
};

function initGemini() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    return null;
  }
  return new GoogleGenerativeAI(apiKey);
}

// AI: Analyze and prioritize all waiting patients
router.post('/analyze-patients', auth, async (req, res) => {
  try {
    const patients = await Patient.find({ status: { $in: ['waiting', 'partially_fulfilled'] } });
    const inventory = await Inventory.find();

    if (patients.length === 0) {
      return res.json({ success: true, message: 'No patients waiting', results: [] });
    }

    const invMap = inventory.reduce((acc, i) => {
      acc[i.bloodGroup] = i.unitsAvailable;
      return acc;
    }, {});

    const genAI = initGemini();

    // Build patient summaries for AI
    const patientSummaries = patients.map(p => ({
      id: p._id,
      name: p.name,
      bloodGroup: p.bloodGroup,
      age: p.age,
      urgencyLevel: p.urgencyLevel,
      diagnosis: p.diagnosis,
      unitsNeeded: p.unitsRequired - p.unitsProvided,
      hemoglobin: p.medicalCondition?.hemoglobinLevel,
      oxygenSaturation: p.medicalCondition?.oxygenSaturation,
      hasAnemia: p.medicalCondition?.hasAnemia,
      hasSurgery: p.medicalCondition?.hasSurgery,
      hasThalassemia: p.medicalCondition?.hasThalassemia,
      hasCancer: p.medicalCondition?.hasCancer,
      requiredBy: p.requiredBy,
      admittedAt: p.admittedAt,
      notes: p.medicalCondition?.notes,
    }));

    let aiResults = [];

    if (genAI) {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      const prompt = `You are a medical AI assistant for a blood bank management system. Analyze these patients and assign a priority score (0-100) for blood transfusion urgency, with 100 being most urgent.

Patients awaiting blood:
${JSON.stringify(patientSummaries, null, 2)}

Current blood inventory:
${JSON.stringify(invMap, null, 2)}

For each patient, provide:
1. priorityScore (0-100): Based on urgency level, medical condition, hemoglobin levels, diagnosis severity, time waiting, and available inventory
2. recommendation: A brief medical justification (2-3 sentences max)
3. immediacy: "immediate" | "within_hours" | "within_24h" | "scheduled"

Critical factors to consider:
- Critical urgency level = base score 80-100
- Hemoglobin < 7 g/dL = severe anemia, add 20 points
- Hemoglobin 7-10 g/dL = moderate anemia, add 10 points
- Surgery scheduled = urgent, add 15 points
- Oxygen saturation < 90% = critical, add 25 points
- Thalassemia = regular transfusion need
- Children under 15 = higher priority
- Longer wait time = slightly higher priority

Respond ONLY with a valid JSON array:
[{"patientId": "...", "priorityScore": 85, "recommendation": "...", "immediacy": "immediate"}, ...]`;

      const result = await model.generateContent(prompt);
      const text = result.response.text();

      // Parse JSON from response
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        aiResults = parsed;
      }
    } else {
      // Fallback scoring without AI
      aiResults = patientSummaries.map(p => {
        let score = 0;
        if (p.urgencyLevel === 'critical') score += 80;
        else if (p.urgencyLevel === 'urgent') score += 60;
        else if (p.urgencyLevel === 'moderate') score += 40;
        else score += 20;
        if (p.hemoglobin && p.hemoglobin < 7) score += 20;
        else if (p.hemoglobin && p.hemoglobin < 10) score += 10;
        if (p.oxygenSaturation && p.oxygenSaturation < 90) score += 15;
        if (p.hasSurgery) score += 10;
        if (p.age < 15) score += 5;
        score = Math.min(score, 100);
        const immediacy = score >= 80 ? 'immediate' : score >= 60 ? 'within_hours' : score >= 40 ? 'within_24h' : 'scheduled';
        return {
          patientId: p.id,
          priorityScore: score,
          recommendation: `Patient with ${p.urgencyLevel} urgency and diagnosis: ${p.diagnosis}. Algorithmic scoring applied (no AI key configured).`,
          immediacy,
        };
      });
    }

    // Update patients in DB with AI scores
    const updatedPatients = [];
    for (const result of aiResults) {
      const patient = await Patient.findByIdAndUpdate(
        result.patientId,
        {
          'aiAnalysis.priorityScore': result.priorityScore,
          'aiAnalysis.recommendation': result.recommendation,
          'aiAnalysis.analyzedAt': new Date(),
        },
        { new: true }
      );
      if (patient) updatedPatients.push({ ...result, patient });
    }

    // Sort by priority
    updatedPatients.sort((a, b) => b.priorityScore - a.priorityScore);

    res.json({
      success: true,
      message: genAI ? 'AI analysis complete (Gemini)' : 'Analysis complete (algorithmic fallback)',
      results: updatedPatients,
      usingAI: !!genAI,
    });
  } catch (err) {
    console.error('AI analysis error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// AI: Find best donor match for a specific patient
router.post('/match-donor/:patientId', auth, async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.patientId);
    if (!patient) return res.status(404).json({ success: false, message: 'Patient not found' });

    // Get compatible blood groups
    const compatibleGroups = BLOOD_COMPATIBILITY[patient.bloodGroup] || [patient.bloodGroup];

    // Find eligible donors with compatible blood
    const donors = await Donor.find({
      bloodGroup: { $in: compatibleGroups },
      isEligible: true,
      status: 'active',
    });

    if (donors.length === 0) {
      return res.json({ success: true, message: 'No eligible donors found', matches: [] });
    }

    const genAI = initGemini();

    const donorSummaries = donors.map(d => ({
      id: d._id,
      name: d.name,
      bloodGroup: d.bloodGroup,
      age: d.age,
      gender: d.gender,
      weight: d.weight,
      totalDonations: d.totalDonations,
      daysSinceLastDonation: d.daysSinceLastDonation,
      hasDiabetes: d.medicalHistory?.hasDiabetes,
      hasHypertension: d.medicalHistory?.hasHypertension,
      recentSurgery: d.medicalHistory?.recentSurgery,
      phone: d.phone,
      email: d.email,
    }));

    const patientData = {
      bloodGroup: patient.bloodGroup,
      age: patient.age,
      gender: patient.gender,
      diagnosis: patient.diagnosis,
      urgencyLevel: patient.urgencyLevel,
      unitsNeeded: patient.unitsRequired - patient.unitsProvided,
      hemoglobin: patient.medicalCondition?.hemoglobinLevel,
      hasThalassemia: patient.medicalCondition?.hasThalassemia,
      hasCancer: patient.medicalCondition?.hasCancer,
      notes: patient.medicalCondition?.notes,
    };

    let matches = [];

    if (genAI) {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      const prompt = `You are a medical AI for a blood bank. Find the best donor matches for this patient.

Patient needing blood:
${JSON.stringify(patientData, null, 2)}

Available eligible donors (sorted by blood group compatibility):
${JSON.stringify(donorSummaries, null, 2)}

Blood compatibility info:
- Exact blood group match is ideal
- O- is universal donor
- Consider: time since last donation (longer = better), total donations (experienced = reliable), age 25-45 optimal, weight 70kg+ preferred, no diabetes/hypertension for best quality

For the top 5 best matches, provide:
1. donorId
2. matchScore (0-100)
3. bloodGroupMatch: "exact" | "compatible"  
4. reason: brief explanation (1-2 sentences)

Respond ONLY with valid JSON array of top 5:
[{"donorId": "...", "matchScore": 95, "bloodGroupMatch": "exact", "reason": "..."}, ...]`;

      const result = await model.generateContent(prompt);
      const text = result.response.text();
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        matches = JSON.parse(jsonMatch[0]);
      }
    } else {
      // Fallback matching
      matches = donors.map(d => {
        let score = d.bloodGroup === patient.bloodGroup ? 100 : 80;
        if (d.daysSinceLastDonation && d.daysSinceLastDonation > 90) score += 5;
        if (d.age >= 25 && d.age <= 45) score += 3;
        if (d.weight >= 70) score += 2;
        if (d.medicalHistory?.hasDiabetes) score -= 10;
        if (d.medicalHistory?.hasHypertension) score -= 5;
        return {
          donorId: d._id,
          matchScore: Math.min(score, 100),
          bloodGroupMatch: d.bloodGroup === patient.bloodGroup ? 'exact' : 'compatible',
          reason: `${d.bloodGroup} donor, ${d.totalDonations} total donations, last donated ${d.daysSinceLastDonation || 'never'} days ago.`,
        };
      }).sort((a, b) => b.matchScore - a.matchScore).slice(0, 5);
    }

    // Enrich with donor details
    const enrichedMatches = await Promise.all(
      matches.map(async m => {
        const donor = donors.find(d => d._id.toString() === m.donorId?.toString());
        return { ...m, donor };
      })
    );

    // Save compatible donors to patient
    await Patient.findByIdAndUpdate(req.params.patientId, {
      'aiAnalysis.compatibleDonors': enrichedMatches.slice(0, 5).map(m => m.donorId),
      'aiAnalysis.analyzedAt': new Date(),
    });

    res.json({
      success: true,
      patient,
      matches: enrichedMatches,
      usingAI: !!genAI,
      compatibleBloodGroups: compatibleGroups,
    });
  } catch (err) {
    console.error('Donor matching error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// AI: General medical chatbot
router.post('/chat', auth, async (req, res) => {
  try {
    const { message, context } = req.body;
    const genAI = initGemini();

    if (!genAI) {
      return res.json({
        success: true,
        reply: 'AI chat is not available. Please configure your Gemini API key in the backend .env file.',
        usingAI: false,
      });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const systemContext = `You are a helpful medical assistant for a blood donation management system. 
You help staff understand blood compatibility, patient priorities, donor eligibility, and general blood bank operations.
Keep responses concise and medically accurate. Do not give personal medical advice.
Context: ${JSON.stringify(context || {})}`;

    const result = await model.generateContent(`${systemContext}\n\nUser: ${message}`);
    const reply = result.response.text();

    res.json({ success: true, reply, usingAI: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// AI: Dashboard insights
router.get('/insights', auth, async (req, res) => {
  try {
    const [patients, donors, inventory] = await Promise.all([
      Patient.find({ status: { $in: ['waiting', 'partially_fulfilled'] } }),
      Donor.find({ status: 'active' }),
      Inventory.find(),
    ]);

    const genAI = initGemini();

    const stats = {
      waitingPatients: patients.length,
      criticalPatients: patients.filter(p => p.urgencyLevel === 'critical').length,
      activeDonors: donors.length,
      eligibleDonors: donors.filter(d => d.isEligible).length,
      totalBloodUnits: inventory.reduce((a, b) => a + b.unitsAvailable, 0),
      criticalInventory: inventory.filter(i => i.unitsAvailable <= 5).map(i => i.bloodGroup),
      bloodGroupDemand: patients.reduce((acc, p) => {
        acc[p.bloodGroup] = (acc[p.bloodGroup] || 0) + (p.unitsRequired - p.unitsProvided);
        return acc;
      }, {}),
    };

    let insights = null;
    if (genAI) {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const prompt = `Blood bank stats: ${JSON.stringify(stats)}. Give 3 brief operational insights and recommendations in JSON: {"insights": [{"title":"...","description":"...","type":"warning|info|success|danger"}]}`;
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) insights = JSON.parse(jsonMatch[0]);
    }

    res.json({ success: true, stats, insights, usingAI: !!genAI });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
