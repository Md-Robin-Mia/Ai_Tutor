import mongoose from 'mongoose';
import User, { UserRole } from './src/models/User.model';
import Course from './src/models/Course.model';
import * as dotenv from 'dotenv';

dotenv.config();

async function seedData() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ai-tutor');
    console.log('Connected to MongoDB');

    // Check if we have any users
    const existingUsers = await User.countDocuments();
    console.log(`Existing users: ${existingUsers}`);

    // Create a teacher user if none exists
    let teacher;
    if (existingUsers === 0) {
      teacher = new User({
        name: 'John Teacher',
        email: 'teacher@example.com',
        password: 'password123',
        role: 'teacher',
        isActive: true
      });
      await teacher.save();
      console.log('Created teacher user');
    } else {
      // Get first teacher
      teacher = await User.findOne({ role: 'teacher' });
      if (!teacher) {
        teacher = new User({
          name: 'John Teacher',
          email: 'teacher@example.com',
          password: 'password123',
          role: 'teacher',
          isActive: true
        });
        await teacher.save();
        console.log('Created teacher user');
      }
    }

    // Create sample courses
    const sampleCourses = [
      {
        title: 'Introduction to React Development',
        slug: 'introduction-to-react-development',
        description: 'Learn the fundamentals of React including components, props, state, and hooks. This comprehensive course covers everything you need to get started with modern React development.',
        thumbnail: 'https://via.placeholder.com/300x200?text=React+Course',
        instructor: teacher._id,
        category: {
          name: 'Web Development',
          _id: new mongoose.Types.ObjectId()
        },
        level: 'Beginner' as const,
        price: 49.99,
        isFree: false,
        published: true,
        approvedByAdmin: true,
        featured: false,
        enrolledCount: 12,
        rating: {
          average: 4.5,
          count: 8
        },
        totalLessons: 15,
        duration: 8.5,
        requirements: ['Basic HTML knowledge', 'Basic CSS knowledge', 'JavaScript fundamentals'],
        whatYouLearn: ['React components', 'Props and state', 'React hooks', 'Component lifecycle'],
        targetAudience: ['Beginner developers', 'Web developers new to React'],
        lessons: [
          {
            title: 'Introduction to React',
            description: 'What is React and why use it?',
            duration: 15,
            order: 1,
            isPreview: true
          },
          {
            title: 'Setting up the environment',
            description: 'Install Node.js and create your first React app',
            duration: 20,
            order: 2,
            isPreview: false
          }
        ]
      },
      {
        title: 'Advanced JavaScript Concepts',
        slug: 'advanced-javascript-concepts',
        description: 'Deep dive into advanced JavaScript concepts including closures, prototypes, async programming, and modern ES6+ features.',
        thumbnail: 'https://via.placeholder.com/300x200?text=JavaScript+Course',
        instructor: teacher._id,
        category: {
          name: 'Programming',
          _id: new mongoose.Types.ObjectId()
        },
        level: 'Advanced' as const,
        price: 79.99,
        isFree: false,
        published: true,
        approvedByAdmin: true,
        featured: true,
        enrolledCount: 25,
        rating: {
          average: 4.8,
          count: 15
        },
        totalLessons: 20,
        duration: 12,
        requirements: ['Strong JavaScript foundation', 'Understanding of basic programming concepts'],
        whatYouLearn: ['Closures and scope', 'Prototypes and inheritance', 'Async/await patterns', 'ES6+ features'],
        targetAudience: ['Experienced developers', 'JavaScript developers'],
        lessons: [
          {
            title: 'Understanding Closures',
            description: 'Deep dive into JavaScript closures',
            duration: 25,
            order: 1,
            isPreview: true
          }
        ]
      },
      {
        title: 'Python for Data Science',
        slug: 'python-for-data-science',
        description: 'Learn Python programming with a focus on data science applications including NumPy, Pandas, and data visualization.',
        thumbnail: 'https://via.placeholder.com/300x200?text=Python+Course',
        instructor: teacher._id,
        category: {
          name: 'Data Science',
          _id: new mongoose.Types.ObjectId()
        },
        level: 'Intermediate' as const,
        price: 0,
        isFree: true,
        published: true,
        approvedByAdmin: true,
        featured: false,
        enrolledCount: 45,
        rating: {
          average: 4.2,
          count: 12
        },
        totalLessons: 18,
        duration: 10,
        requirements: ['Basic programming knowledge', 'Understanding of data concepts'],
        whatYouLearn: ['Python basics', 'NumPy fundamentals', 'Pandas for data manipulation', 'Data visualization'],
        targetAudience: ['Data science beginners', 'Analysts', 'Researchers'],
        lessons: [
          {
            title: 'Python Basics',
            description: 'Introduction to Python syntax and concepts',
            duration: 30,
            order: 1,
            isPreview: true
          }
        ]
      }
    ];

    // Clear existing courses
    await Course.deleteMany({});
    console.log('Cleared existing courses');

    // Insert sample courses
    const insertedCourses = await Course.insertMany(sampleCourses);
    console.log(`Created ${insertedCourses.length} sample courses`);

    // Display created courses
    insertedCourses.forEach((course, index) => {
      console.log(`${index + 1}. ${course.title} - ${course.published ? 'Published' : 'Draft'} - ${course.approvedByAdmin ? 'Approved' : 'Pending Approval'}`);
    });

    console.log('Data seeding completed successfully!');
    process.exit(0);

  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
}

seedData();
