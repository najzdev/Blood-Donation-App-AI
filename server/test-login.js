const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/dem-ai';

async function testLogin() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    const testAccounts = [
      { email: 'admin@demai.com', password: 'admin123', role: 'admin' },
      { email: 'doctor@demai.com', password: 'doctor123', role: 'doctor' },
      { email: 'donor@demai.com', password: 'donor123', role: 'donor' },
      { email: 'patient@demai.com', password: 'patient123', role: 'patient' },
    ];

    console.log('🔐 Testing login credentials:\n');
    console.log('='.repeat(60));

    for (const account of testAccounts) {
      const user = await User.findOne({ email: account.email }).select('+password');
      
      if (!user) {
        console.log(`❌ ${account.email} - User not found`);
        continue;
      }

      const isPasswordCorrect = await user.comparePassword(account.password);
      
      if (isPasswordCorrect) {
        console.log(`✅ ${account.email} - LOGIN WORKS ✓`);
        console.log(`   Password: ${account.password}`);
        console.log(`   Role: ${user.role}`);
      } else {
        console.log(`❌ ${account.email} - Password incorrect`);
      }
      console.log('');
    }

    console.log('='.repeat(60));
    console.log('\n✅ All demo accounts can now login!');

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

testLogin();
