const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');
const BloodRequest = require('./models/BloodRequest');
const Donation = require('./models/Donation');
const Notification = require('./models/Notification');

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/dem-ai';

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing
    await Promise.all([
      User.deleteMany({}),
      BloodRequest.deleteMany({}),
      Donation.deleteMany({}),
      Notification.deleteMany({}),
    ]);
    console.log('✅ Cleared existing data');

    // Create admin user (HAMZA LABBALLI)
    console.log('\n📝 Creating users...');
    const admin = await User.create({
      name: 'HAMZA LABBALLI',
      email: 'admin@demai.com',
      password: 'admin123',
      role: 'admin',
      bloodType: 'O+',
      city: 'TANTAN',
      phone: '+212600000000',
      gender: 'male',
      isActive: true
    });
    console.log('✅ Created admin: HAMZA LABBALLI');

    // Create 8 doctors
    const doctors = [];
    const doctorNames = [
      'Dr. Karim Hassani', 'Dr. Fatiha Achfry', 'Dr. Niama Benhida', 'Dr. Imane El Hanti',
      'Dr. Mehdi Oulhaj', 'Dr. Hind Chaoui', 'Dr. Rachid Mounir', 'Dr. Zineb Alaoui'
    ];
    const doctorCities = ['Rabat', 'Casablanca', 'Marrakech', 'Fes', 'Tangier', 'Agadir', 'Meknes', 'Oujda'];
    const bloodTypes = ['A+', 'B+', 'O-', 'AB+', 'A-', 'B-', 'O+', 'AB-'];

    for (let i = 0; i < 8; i++) {
      const doctor = await User.create({
        name: doctorNames[i],
        email: `doctor${i + 1}@demai.com`,
        password: 'doctor123',
        role: 'doctor',
        bloodType: bloodTypes[i],
        city: doctorCities[i],
        phone: `+2126000001${i.toString().padStart(2, '0')}`,
        gender: i % 2 === 0 ? 'male' : 'female',
        licenseNumber: `MD-${10001 + i}`,
        isActive: true
      });
      doctors.push(doctor);
    }
    console.log('✅ Created 8 doctors');

    // Create 8 donors
    const donors = [];
    const donorNames = [
      'Youssef El Amrani', 'Sara Benali', 'Omar Khalil', 'Fatima Zahra',
      'Hamza Tazi', 'Imane Bouchra', 'Khalid Messaoudi', 'Amina Roudani'
    ];

    for (let i = 0; i < 8; i++) {
      const donor = await User.create({
        name: donorNames[i],
        email: `donor${i + 1}@demai.com`,
        password: 'donor123',
        role: 'donor',
        bloodType: bloodTypes[i],
        city: doctorCities[i],
        phone: `+2126000002${i.toString().padStart(2, '0')}`,
        gender: i % 2 === 0 ? 'male' : 'female',
        isAvailable: i !== 5, // donor6 unavailable
        isActive: true
      });
      donors.push(donor);
    }
    console.log('✅ Created 8 donors');

    // Create 8 patients
    const patients = [];
    const patientNames = [
      'Ahmed Rachidi', 'Nadia Ouazzani', 'Tarik Boujemaa', 'Layla Mansouri',
      'Soufiane Bennis', 'Houda El Fassi', 'Amine Chraibi', 'Samira Kettani'
    ];
    const medicalHistories = [
      'Thalassemia', 'Surgery scheduled', 'Anemia', 'Leukemia',
      'Road accident', 'Dialysis', 'Cardiac surgery', 'Post-partum hemorrhage'
    ];

    for (let i = 0; i < 8; i++) {
      const patient = await User.create({
        name: patientNames[i],
        email: `patient${i + 1}@demai.com`,
        password: 'patient123',
        role: 'patient',
        bloodType: bloodTypes[i],
        city: doctorCities[i],
        phone: `+2126000003${i.toString().padStart(2, '0')}`,
        gender: i % 2 === 0 ? 'male' : 'female',
        medicalHistory: medicalHistories[i],
        isActive: true
      });
      patients.push(patient);
    }
    console.log('✅ Created 8 patients');

    // Create blood requests
    console.log('\n📝 Creating blood requests...');
    const requestsData = [];
    const urgencies = ['critical', 'high', 'medium', 'low'];
    const hospitals = [
      'CHU Ibn Rochd', 'Hôpital Avicenne', 'Polyclinique Atlas', 'Hôpital Militaire',
      'Centre Hospitalier', 'Clinique Moderne', 'Hôpital Provincial', 'Centres de Santé'
    ];

    for (let i = 0; i < 8; i++) {
      requestsData.push({
        patient: patients[i]._id,
        doctor: doctors[i]._id,
        bloodType: bloodTypes[i],
        units: (i % 5) + 1,
        urgency: urgencies[i % 4],
        status: i < 2 ? 'pending' : i < 5 ? 'matched' : 'fulfilled',
        hospital: hospitals[i],
        city: doctorCities[i],
        diagnosis: medicalHistories[i],
        requiredBy: new Date(Date.now() + (24 * (i + 1)) * 60 * 60 * 1000),
      });
    }
    const requests = await BloodRequest.insertMany(requestsData);
    console.log('✅ Created 8 blood requests');

    // Create donations
    console.log('\n📝 Creating donations...');
    const donationsData = [];
    const donationStatuses = ['scheduled', 'completed', 'completed', 'scheduled'];

    for (let i = 0; i < 8; i++) {
      donationsData.push({
        donor: donors[i]._id,
        request: requests[i]._id,
        bloodType: bloodTypes[i],
        units: (i % 3) + 1,
        status: donationStatuses[i % 4],
        hospital: hospitals[i],
        city: doctorCities[i],
        donationDate: new Date(Date.now() + (2 + i) * 24 * 60 * 60 * 1000),
      });
    }
    const donations = await Donation.insertMany(donationsData);
    console.log('✅ Created 8 donations');

    // Create notifications
    console.log('\n📝 Creating notifications...');
    const notificationsData = [];
    const notificationTypes = ['match', 'urgent', 'donation', 'request'];

    for (let i = 0; i < 8; i++) {
      const notifType = notificationTypes[i % 4];
      let notification = {
        recipient: i % 2 === 0 ? patients[i]._id : donors[i]._id,
        type: notifType,
        read: i > 4,
        relatedRequest: requests[i]._id,
      };

      if (notifType === 'match') {
        notification.title = 'Donor Matched!';
        notification.message = `A donor has been matched for your blood request at ${hospitals[i]}.`;
      } else if (notifType === 'urgent') {
        notification.title = 'Critical Request';
        notification.message = `Critical ${bloodTypes[i]} blood needed - ${(i % 5) + 1} units at ${hospitals[i]}.`;
      } else if (notifType === 'donation') {
        notification.title = 'Donation Scheduled';
        notification.message = `You have been matched to donate ${bloodTypes[i]} blood at ${hospitals[i]}, ${doctorCities[i]}.`;
        notification.relatedDonation = donations[i]._id;
      } else {
        notification.title = 'New Request';
        notification.message = `A new blood request has been created: ${bloodTypes[i]} - ${(i % 5) + 1} units.`;
      }

      notificationsData.push(notification);
    }

    await Notification.insertMany(notificationsData);
    console.log('✅ Created 8 notifications');

    console.log('\n' + '='.repeat(70));
    console.log('✅ DATABASE SEEDED SUCCESSFULLY!');
    console.log('='.repeat(70));
    console.log('\n📊 Seeding Summary:');
    console.log('   • 1 Admin (HAMZA LABBALLI)');
    console.log('   • 8 Doctors');
    console.log('   • 8 Donors');
    console.log('   • 8 Patients');
    console.log('   • 8 Blood Requests');
    console.log('   • 8 Donations');
    console.log('   • 8 Notifications');

    console.log('\n📋 Login Credentials:');
    console.log('');
    console.log('👨‍💼 ADMIN (1):');
    console.log('   Email:    admin@demai.com');
    console.log('   Password: admin123');
    console.log('');
    console.log('👨‍⚕️  DOCTORS (8):');
    for (let i = 0; i < 8; i++) {
      console.log(`   doctor${i + 1}@demai.com / doctor123`);
    }
    console.log('');
    console.log('🩸 DONORS (8):');
    for (let i = 0; i < 8; i++) {
      console.log(`   donor${i + 1}@demai.com / donor123`);
    }
    console.log('');
    console.log('🏥 PATIENTS (8):');
    for (let i = 0; i < 8; i++) {
      console.log(`   patient${i + 1}@demai.com / patient123`);
    }
    console.log('');
    console.log('='.repeat(70));

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    console.error(err);
    process.exit(1);
  }
}

seed();
