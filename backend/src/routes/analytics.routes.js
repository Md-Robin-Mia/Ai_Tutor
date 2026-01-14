const express = require('express');
const router = express.Router();

// Analytics routes
router.get('/dashboard', (req, res) => {
  // Demo analytics data
  res.json({
    totalStudents: 150,
    totalTeachers: 25,
    totalCourses: 45,
    totalRevenue: 12500,
    weeklyActivity: [
      { day: 'Mon', students: 120, teachers: 20 },
      { day: 'Tue', students: 135, teachers: 22 },
      { day: 'Wed', students: 125, teachers: 21 },
      { day: 'Thu', students: 140, teachers: 23 },
      { day: 'Fri', students: 130, teachers: 20 },
      { day: 'Sat', students: 80, teachers: 15 },
      { day: 'Sun', students: 90, teachers: 16 }
    ],
    courseStats: [
      { name: 'Mathematics', students: 45, completion: 78 },
      { name: 'Science', students: 38, completion: 82 },
      { name: 'English', students: 42, completion: 75 },
      { name: 'History', students: 25, completion: 70 }
    ]
  });
});

module.exports = router;
