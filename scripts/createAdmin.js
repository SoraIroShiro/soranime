// Script untuk membuat admin user pertama
// Jalankan dengan: node scripts/createAdmin.js

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import 'dotenv/config';

const userSchema = mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isAdmin: { type: Boolean, required: true, default: false },
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.model('User', userSchema);

async function createAdmin() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@soranime.com' });
    
    if (existingAdmin) {
      console.log('❌ Admin user already exists with email: admin@soranime.com');
      process.exit(0);
    }

    // Create admin user
    const adminUser = new User({
      name: 'Super Admin',
      email: 'admin@soranime.com',
      password: 'admin123', // Will be hashed by pre-save hook
      isAdmin: true
    });

    await adminUser.save();
    console.log('✅ Admin user created successfully!');
    console.log('📧 Email: admin@soranime.com');
    console.log('🔑 Password: admin123');
    console.log('👑 Role: Admin');

  } catch (error) {
    console.error('❌ Error creating admin:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('📡 Database connection closed');
  }
}

createAdmin();