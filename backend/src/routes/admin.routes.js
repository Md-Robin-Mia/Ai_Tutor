const express = require('express');
const router = express.Router();

// Admin routes placeholder
router.get('/dashboard', (req, res) => {
  res.json({ message: 'Admin dashboard endpoint' });
});

module.exports = router;
