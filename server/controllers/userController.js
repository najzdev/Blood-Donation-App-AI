const User = require('../models/User');

exports.getAllUsers = async (req, res) => {
  try {
    const { role, bloodType, city, isAvailable } = req.query;
    const filter = {};
    if (role) filter.role = role;
    if (bloodType) filter.bloodType = bloodType;
    if (city) filter.city = new RegExp(city, 'i');
    if (isAvailable !== undefined) filter.isAvailable = isAvailable === 'true';
    const users = await User.find(filter).sort('-createdAt');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const updates = { ...req.body };
    delete updates.password;
    const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getStats = async (req, res) => {
  try {
    const [totalUsers, donors, patients, doctors] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'donor' }),
      User.countDocuments({ role: 'patient' }),
      User.countDocuments({ role: 'doctor' }),
    ]);
    res.json({ totalUsers, donors, patients, doctors });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
