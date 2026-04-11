const BloodRequest = require('../models/BloodRequest');
const User = require('../models/User');
const Notification = require('../models/Notification');

exports.getAll = async (req, res) => {
  try {
    const { status, bloodType, urgency, city } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (bloodType) filter.bloodType = bloodType;
    if (urgency) filter.urgency = urgency;
    if (city) filter.city = new RegExp(city, 'i');

    // Role-based filtering
    if (req.user.role === 'patient') filter.patient = req.user._id;
    if (req.user.role === 'donor') filter.status = filter.status || 'pending';

    const requests = await BloodRequest.find(filter)
      .populate('patient', 'name bloodType city')
      .populate('doctor', 'name')
      .populate('matchedDonors', 'name bloodType city')
      .sort({ urgency: -1, createdAt: -1 });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const request = await BloodRequest.findById(req.params.id)
      .populate('patient', 'name email bloodType city phone')
      .populate('doctor', 'name email')
      .populate('matchedDonors', 'name bloodType city phone');
    if (!request) return res.status(404).json({ message: 'Request not found' });
    res.json(request);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const requestData = { ...req.body, patient: req.user._id };
    if (req.user.role === 'doctor') requestData.doctor = req.user._id;
    const request = await BloodRequest.create(requestData);

    // Notify admins and doctors of new request
    if (request.urgency === 'critical') {
      const adminsAndDoctors = await User.find({ role: { $in: ['admin', 'doctor'] } });
      const notifications = adminsAndDoctors.map(u => ({
        recipient: u._id,
        type: 'urgent',
        title: 'Critical Blood Request',
        message: `Critical ${request.bloodType} blood needed - ${request.units} units at ${request.hospital || request.city}`,
        relatedRequest: request._id,
      }));
      await Notification.insertMany(notifications);
    }

    res.status(201).json(request);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const request = await BloodRequest.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!request) return res.status(404).json({ message: 'Request not found' });
    res.json(request);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const request = await BloodRequest.findByIdAndDelete(req.params.id);
    if (!request) return res.status(404).json({ message: 'Request not found' });
    res.json({ message: 'Request deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getStats = async (req, res) => {
  try {
    const [total, pending, matched, fulfilled, critical] = await Promise.all([
      BloodRequest.countDocuments(),
      BloodRequest.countDocuments({ status: 'pending' }),
      BloodRequest.countDocuments({ status: 'matched' }),
      BloodRequest.countDocuments({ status: 'fulfilled' }),
      BloodRequest.countDocuments({ urgency: 'critical', status: 'pending' }),
    ]);
    res.json({ total, pending, matched, fulfilled, critical });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
