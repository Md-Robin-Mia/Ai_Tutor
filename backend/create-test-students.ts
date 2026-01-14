import mongoose from 'mongoose';
import User, { UserRole } from './src/models/User.model';
import * as dotenv from 'dotenv';

dotenv.config();

async function createTestStudents() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ai-tutor');
    console.log('Connected to MongoDB');

    // Create test students
    const testStudents = [
      {
        name: 'Alice Johnson',
        email: 'alice@student.com',
        password: 'password123',
        role: 'student' as UserRole,
        isActive: true,
        grade: '10th Grade'
      },
      {
        name: 'Bob Smith',
        email: 'bob@student.com',
        password: 'password123',
        role: 'student' as UserRole,
        isActive: true,
        grade: '11th Grade'
      },
      {
        name: 'Carol Williams',
        email: 'carol@student.com',
        password: 'password123',
        role: 'student' as UserRole,
        isActive: true,
        grade: '12th Grade'
      },
      {
        name: 'David Brown',
        email: 'david@student.com',
        password: 'password123',
        role: 'student' as UserRole,
        isActive: true,
        grade: '10th Grade'
      },
      {
        name: 'Emma Davis',
        email: 'emma@student.com',
        password: 'password123',
        role: 'student' as UserRole,
        isActive: false, // This one is inactive/blocked
        grade: '11th Grade'
      }
    ];

    // Check if students already exist
    const existingStudents = await User.countDocuments({ role: 'student' });
    console.log(`Existing students: ${existingStudents}`);

    if (existingStudents === 0) {
      // Insert test students
      const insertedStudents = await User.insertMany(testStudents);
      console.log(`Created ${insertedStudents.length} test students`);

      // Display created students
      insertedStudents.forEach((student, index) => {
        console.log(`${index + 1}. ${student.name} (${student.email}) - ${student.isActive ? 'Active' : 'Inactive'} - ${student.grade || 'No grade'}`);
      });
    } else {
      console.log('Students already exist, skipping creation');
      
      // Display existing students
      const existingStudentDocs = await User.find({ role: 'student' }).sort({ createdAt: -1 });
      console.log('\nExisting students:');
      existingStudentDocs.forEach((student, index) => {
        console.log(`${index + 1}. ${student.name} (${student.email}) - ${student.isActive ? 'Active' : 'Inactive'} - ${student.grade || 'No grade'}`);
      });
    }

    console.log('Test students creation completed successfully!');
    process.exit(0);

  } catch (error) {
    console.error('Error creating test students:', error);
    process.exit(1);
  }
}

createTestStudents();
