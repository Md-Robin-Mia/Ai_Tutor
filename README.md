# AI Tutor - Personalized Learning Assistant

A comprehensive AI-powered learning platform with adaptive learning, gamification, multi-language support, and real-time collaboration features.

## 🚀 Features

### 1️⃣ AI Intelligence & Personalization
- **Adaptive Learning Engine**: Automatically adjusts difficulty based on student performance
- **Learning Style Detection**: Identifies and adapts to visual, text-based, or practice-based learning preferences
- **Weak Area Analyzer**: Detects struggling topics and provides targeted support
- **AI Mentor Mode**: Provides motivation, study tips, and career guidance

### 2️⃣ Student Progress & Analytics
- **Learning Dashboard**: Track completion, time spent, and quiz accuracy
- **Smart Reports**: Weekly and monthly performance reports with recommendations
- **Goal Tracking**: Set and track short-term and long-term learning goals

### 3️⃣ Assessment & Practice System
- **AI-Generated Quizzes**: Automatically creates MCQ, short answer, and coding questions
- **Exam Simulator**: Simulates real exam conditions with time limits
- **Instant Feedback**: Detailed explanations for every answer

### 4️⃣ Voice, Vision & Multimodal AI
- **Voice Tutor**: Speech-to-text and text-to-speech capabilities
- **Handwriting Recognition**: Evaluate handwritten answers from images
- **Diagram Explanation**: AI-powered diagram and image analysis

### 5️⃣ Language & Accessibility
- **Multi-Language Support**: Bangla, English, Hindi
- **Dyslexia Friendly Mode**: Simplified language and formatting
- **Offline Mode**: Limited offline learning capabilities

### 6️⃣ Teacher Features
- **Teacher Dashboard**: Class analytics and custom task assignment

### 7️⃣ Gamification & Engagement
- **XP & Level System**: Earn experience points and level up
- **Badges & Achievements**: Unlock achievements for milestones
- **Leaderboard**: Compete with friends and classmates

### 8️⃣ Collaboration & Social Learning
- **AI Study Groups**: Group learning with AI moderation
- **Peer Explanation Mode**: Students explain concepts to each other

### 9️⃣ Security & Scalability
- **JWT Authentication**: Secure token-based authentication
- **Role-Based Access**: Student, Teacher, Admin roles
- **Cloud-Ready**: Designed for AWS/GCP deployment

### 🔟 Career & Real-World Integration
- **AI Career Advisor**: Personalized career path recommendations
- **Project-Based Learning**: Real-world project assignments
- **Certification System**: Auto-generated certificates

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT, Passport.js (Google OAuth)
- **AI Integration**: OpenAI GPT-4
- **Real-time**: Socket.io
- **Security**: Helmet, Rate Limiting

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Routing**: React Router v6
- **State Management**: Zustand
- **Data Fetching**: React Query
- **UI Components**: Radix UI, shadcn/ui
- **Styling**: TailwindCSS
- **Icons**: Lucide React
- **Charts**: Recharts

## 📦 Installation

### Prerequisites
- Node.js 18+ and npm
- MongoDB (local or Atlas)
- OpenAI API Key

### Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env and add your configuration:
# - MongoDB URI
# - JWT Secret
# - OpenAI API Key
# - Email credentials (optional)
# - Google OAuth credentials (optional)

# Run development server (builds frontend automatically)
npm run dev
```

The backend API will start on `http://localhost:3003` and frontend on `http://localhost:3004`

### Frontend Setup (Development Only)

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Run development server (for frontend-only development)
npm run dev
```

The frontend will start on `http://localhost:3004`

### Quick Start (Recommended)

```bash
# From root directory - install all dependencies
npm run install:all

# Start application with frontend and backend
npm run dev
```

This will start both frontend (port 3004) and backend (port 3003) servers. Frontend proxies API calls to the backend.

## 🗄️ Database Models

- **User**: Authentication and profile data
- **StudentProfile**: Learning progress, XP, badges, goals
- **TeacherProfile**: Classrooms, assignments
- **Quiz**: Quiz questions and metadata
- **QuizAttempt**: Student quiz submissions and scores
- **StudyGroup**: Collaborative learning groups

## 🔑 Environment Variables

### Backend (.env)
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/ai_tutor
JWT_SECRET=your_secret_key
OPENAI_API_KEY=your_openai_key
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
EMAIL_HOST=smtp.gmail.com
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_password
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000/api
```

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/google` - Google OAuth
- `GET /api/auth/profile` - Get user profile

### AI Features
- `POST /api/ai/teach` - Get AI teaching response
- `POST /api/ai/quiz/generate` - Generate AI quiz
- `GET /api/ai/motivation` - Get motivational message
- `POST /api/ai/evaluate/handwriting` - Evaluate handwriting

### Student
- `GET /api/student/profile` - Get student profile
- `POST /api/student/goals` - Add learning goal
- `POST /api/student/sessions` - Record study session

### Analytics
- `GET /api/analytics/dashboard` - Get dashboard data
- `GET /api/analytics/report/:type` - Get weekly/monthly report
- `GET /api/analytics/weak-areas` - Get weak areas

### Gamification
- `GET /api/gamification/leaderboard` - Get leaderboard
- `GET /api/gamification/badges` - Get user badges

## 🚀 Deployment

### Backend (Node.js)
- Deploy to AWS EC2, Heroku, or Railway
- Set environment variables
- Configure MongoDB Atlas for production
- Enable CORS for frontend domain

### Frontend (React)
- Build: `npm run build`
- Deploy to Vercel, Netlify, or AWS S3 + CloudFront
- Set API URL environment variable

### Database
- Use MongoDB Atlas for production
- Enable authentication and IP whitelisting
- Set up automated backups

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

## 📝 License

MIT License - feel free to use this project for learning and development.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For support, email support@aitutor.com or open an issue on GitHub.

## 🎯 Roadmap

- [ ] Mobile app (React Native)
- [ ] Voice assistant integration
- [ ] AR/VR classroom support
- [ ] Advanced emotion detection
- [ ] Blockchain-based certificates
- [ ] AI debate partner
- [ ] Personal knowledge graph

---

Built with ❤️ using React, Node.js, and OpenAI
