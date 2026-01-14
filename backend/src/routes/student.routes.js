const express = require('express');
const router = express.Router();

// Student routes placeholder
router.get('/dashboard', (req, res) => {
  res.json({ message: 'Student dashboard endpoint' });
});

module.exports = router;
