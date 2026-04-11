const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');
const BloodRequest = require('./models/BloodRequest');
const Donation = require('./models/Donation');
const Notification = require('./models/Notification');

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/dem-ai';

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');

  // Clear existing
  await Promise.all([
    User.deleteMany({}),
    BloodRequest.deleteMany({}),
    Donation.deleteMany({}),
    Notification.deleteMany({}),
  ]);
  console.log('Cleared existing data');

  const hash = pwd => bcrypt.hash(pwd, 12);

  const users = await User.insertMany([
    { name: 'Admin User', email: 'admin@demai.com', password: await hash('admin123'), role: 'admin', bloodType: 'O+', city: 'Casablanca', phone: '+212600000001', gender: 'male' },
    { name: 'Dr. Karim Hassani', email: 'doctor@demai.com', password: await hash('doctor123'), role: 'doctor', bloodType: 'A+', city: 'Rabat', phone: '+212600000002', gender: 'male', licenseNumber: 'MD-12345' },
    { name: 'Youssef El Amrani', email: 'donor@demai.com', password: await hash('donor123'), role: 'donor', bloodType: 'O+', city: 'Casablanca', phone: '+212600000003', gender: 'male', isAvailable: true },
    { name: 'Sara Benali', email: 'donor2@demai.com', password: await hash('donor123'), role: 'donor', bloodType: 'A-', city: 'Casablanca', phone: '+212600000004', gender: 'female', isAvailable: true },
    { name: 'Omar Khalil', email: 'donor3@demai.com', password: await hash('donor123'), role: 'donor', bloodType: 'B+', city: 'Marrakech', phone: '+212600000005', gender: 'male', isAvailable: true },
    { name: 'Fatima Zahra', email: 'donor4@demai.com', password: await hash('donor123'), role: 'donor', bloodType: 'AB+', city: 'Fes', phone: '+212600000006', gender: 'female', isAvailable: true },
    { name: 'Ahmed Rachidi', email: 'patient@demai.com', password: await hash('patient123'), role: 'patient', bloodType: 'O-', city: 'Casablanca', phone: '+212600000007', gender: 'male', medicalHistory: 'Thalassemia' },
    { name: 'Nadia Ouazzani', email: 'patient2@demai.com', password: await hash('patient123'), role: 'patient', bloodType: 'B-', city: 'Rabat', phone: '+212600000008', gender: 'female', medicalHistory: 'Surgery scheduled' },
  ]);
  console.log(`Created ${users.length} users`);

  const [admin, doctor, donor1, donor2, donor3, donor4, patient1, patient2] = users;

  const requests = await BloodRequest.insertMany([
    {
      patient: patient1._id,
      doctor: doctor._id,
      bloodType: 'O-',
      units: 3,
      urgency: 'critical',
      status: 'pending',
      hospital: 'CHU Ibn Rochd',
      city: 'Casablanca',
      diagnosis: 'Post-operative hemorrhage',
      requiredBy: new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
    {
      patient: patient2._id,
      bloodType: 'B-',
      units: 2,
      urgency: 'high',
      status: 'pending',
      hospital: 'Hôpital Avicenne',
      city: 'Rabat',
      diagnosis: 'Scheduled surgery',
      requiredBy: new Date(Date.now() + 48 * 60 * 60 * 1000),
    },
    {
      patient: patient1._id,
      bloodType: 'O+',
      units: 1,
      urgency: 'medium',
      status: 'matched',
      hospital: 'Polyclinique Atlas',
      city: 'Casablanca',
      matchedDonors: [donor1._id],
      aiAnalysis: 'Best match found: Youssef El Amrani (O+, same city). Compatibility: Exact match.',
    },
  ]);
  console.log(`Created ${requests.length} blood requests`);

  const donations = await Donation.insertMany([
    {
      donor: donor1._id,
      request: requests[2]._id,
      bloodType: 'O+',
      units: 1,
      status: 'scheduled',
      hospital: 'Polyclinique Atlas',
      city: 'Casablanca',
      donationDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    },
  ]);
  console.log(`Created ${donations.length} donations`);

  await Notification.insertMany([
    {
      recipient: patient1._id,
      type: 'match',
      title: 'Donor Matched!',
      message: 'A donor has been matched for your blood request at Polyclinique Atlas.',
      relatedRequest: requests[2]._id,
      read: false,
    },
    {
      recipient: donor1._id,
      type: 'match',
      title: 'Donation Scheduled',
      message: 'You have been matched to donate O+ blood at Polyclinique Atlas, Casablanca.',
      relatedDonation: donations[0]._id,
      read: false,
    },
    {
      recipient: doctor._id,
      type: 'urgent',
      title: 'Critical Request',
      message: 'Critical O- blood needed - 3 units at CHU Ibn Rochd, Casablanca.',
      relatedRequest: requests[0]._id,
      read: false,
    },
  ]);
  console.log('Created notifications');

  console.log('\n✅ Database seeded successfully!\n');
  console.log('Demo accounts:');
  console.log('  Admin:   admin@demai.com   / admin123');
  console.log('  Doctor:  doctor@demai.com  / doctor123');
  console.log('  Donor:   donor@demai.com   / donor123');
  console.log('  Patient: patient@demai.com / patient123');

  await mongoose.disconnect();
}

seed().catch(err => { console.error(err); process.exit(1) });
