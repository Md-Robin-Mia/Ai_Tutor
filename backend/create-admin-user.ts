const mongoose = require('mongoose');
const User = require('./src/models/User.model');
const dotenv = require('dotenv');

dotenv.config();

async function createAdminUser() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ai-tutor');
    console.log('Connected to MongoDB');

    // Find or create an admin user
    let admin = await User.findOne({ email: 'admin@example.com' });
    
    if (!admin) {
      admin = new User({
        name: 'Admin User',
        email: 'admin@example.com',
        password: 'admin123',
        role: 'admin',
        isActive: true,
        isSuperAdmin: true
      });
      await admin.save();
      console.log('Created admin user');
    } else {
      console.log('Admin user already exists');
    }

    console.log('\nAdmin login details:');
    console.log('Email: admin@example.com');
    console.log('Password: admin123');
    console.log('Role:', admin.role);

    console.log('Admin user creation test completed successfully!');
    process.exit(0);

  } catch (error) {
    console.error('Error creating admin user:', error);
    process.exit(1);
  }
}

createAdminUser();
