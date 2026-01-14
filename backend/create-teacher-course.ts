import mongoose from 'mongoose';
import User, { UserRole } from './src/models/User.model';
import Course from './src/models/Course.model';
import * as dotenv from 'dotenv';

dotenv.config();

async function createTeacherCourse() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ai-tutor');
    console.log('Connected to MongoDB');

    // Find or create a teacher user
    let teacher = await User.findOne({ email: 'teacher@example.com' });
    
    if (!teacher) {
      teacher = new User({
        name: 'Test Teacher',
        email: 'teacher@example.com',
        password: 'password123',
        role: 'teacher',
        isActive: true
      });
      await teacher.save();
      console.log('Created teacher user');
    }

    // Create a new course as this teacher
    const courseData = {
      title: 'Teacher Created Course - Test',
      slug: 'teacher-created-course-test-' + Date.now(),
      description: 'This is a test course created by a teacher to verify admin dashboard visibility.',
      thumbnail: 'https://via.placeholder.com/300x200?text=Teacher+Course',
      instructor: teacher._id,
      category: {
        name: 'Web Development',
        _id: new mongoose.Types.ObjectId()
      },
      level: 'Beginner' as const,
      price: 29.99,
      isFree: false,
      published: true,
      approvedByAdmin: false, // This should make it appear in admin dashboard for approval
      featured: false,
      enrolledCount: 0,
      rating: {
        average: 0,
        count: 0
      },
      totalLessons: 5,
      duration: 2.5,
      requirements: ['Basic computer skills'],
      whatYouLearn: ['Course creation', 'Admin approval process'],
      targetAudience: ['Beginner students'],
      lessons: [
        {
          title: 'Introduction to Teacher Course',
          description: 'Getting started with this test course',
          duration: 15,
          order: 1,
          isPreview: true
        }
      ]
    };

    // Clear existing test courses first
    await Course.deleteMany({ title: /Teacher Created Course - Test/ });

    // Create the course
    const course = await Course.create(courseData);
    console.log('Created teacher course:', course.title);
    console.log('Course ID:', course._id);
    console.log('Published:', course.published);
    console.log('Approved by Admin:', course.approvedByAdmin);

    // Verify the course was created
    const createdCourse = await Course.findById(course._id).populate('instructor', 'name email');
    console.log('\nCourse details:');
    console.log('- Title:', createdCourse.title);
    console.log('- Instructor:', (createdCourse.instructor as any).name);
    console.log('- Published:', createdCourse.published);
    console.log('- Approved by Admin:', createdCourse.approvedByAdmin);
    console.log('- Created at:', createdCourse.createdAt);

    // Now test the admin API to see if it would find this course
    console.log('\n--- Testing Admin API ---');
    const allCourses = await Course.find({})
      .populate('instructor', 'name email')
      .populate('category', 'name')
      .sort({ createdAt: -1 });

    console.log('Total courses in database:', allCourses.length);
    
    const teacherCourse = allCourses.find(c => c._id.toString() === course._id.toString());
    if (teacherCourse) {
      console.log('✅ Teacher course found by admin API!');
      console.log('   - Title:', teacherCourse.title);
      console.log('   - Instructor:', (teacherCourse.instructor as any).name);
      console.log('   - Published:', teacherCourse.published);
      console.log('   - Approved by Admin:', teacherCourse.approvedByAdmin);
    } else {
      console.log('❌ Teacher course NOT found by admin API!');
    }

    console.log('\nTeacher course creation test completed successfully!');
    process.exit(0);

  } catch (error) {
    console.error('Error creating teacher course:', error);
    process.exit(1);
  }
}

createTeacherCourse();
