const express = require('express');
const { register, login, googleAuth, googleCallback } = require('../controllers/auth.controller');

const router = express.Router();

// Register new user
router.post('/register', register);

// Login user
router.post('/login', login);

// Google OAuth
router.get('/google', googleAuth);
router.get('/google/callback', googleCallback);

module.exports = router;
