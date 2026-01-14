import { Request, Response } from 'express';
import * as jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import * as bcrypt from 'bcryptjs';
import * as validator from 'email-validator';
import User from '../models/User.model';
import StudentProfile from '../models/StudentProfile.model';
import TeacherProfile from '../models/TeacherProfile.model';

const validateGmailEmail = async (email: string): Promise<boolean> => {
  // First check if email format is valid
  if (!validator.validate(email)) {
    return false;
  }
  
  // Check if it's a Gmail address
  const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/i;
  if (!gmailRegex.test(email)) {
    return false;
  }
  
  // For Gmail, we can do additional validation by checking if the domain exists
  // Gmail doesn't have MX records that are publicly verifiable in a simple way,
  // but we can at least validate the format and domain structure
  
  try {
    // Extract username part for additional validation
    const username = email.split('@')[0];
    
    // Gmail usernames must be between 6-30 characters
    if (username.length < 6 || username.length > 30) {
      return false;
    }
    
    // Gmail usernames cannot start or end with dots or have consecutive dots
    if (username.startsWith('.') || username.endsWith('.') || username.includes('..')) {
      return false;
    }
    
    // Gmail usernames can only contain letters, numbers, and dots
    const validUsernameRegex = /^[a-zA-Z0-9.]+$/;
    if (!validUsernameRegex.test(username)) {
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Email validation error:', error);
    return false;
  }
};

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('Registration request received:', req.body);
    const { name, email, password, role, age, grade } = req.body;

    // Validate role
    if (!role || !['student', 'teacher', 'admin'].includes(role)) {
      console.log('Invalid role provided:', role);
      res.status(400).json({ message: 'Invalid role. Must be student, teacher, or admin' });
      return;
    }

    // Validate email format and check if it's a real Gmail address
    console.log('Validating email:', email);
    const isValidGmail = await validateGmailEmail(email);
    if (!isValidGmail) {
      console.log('Invalid Gmail address provided:', email);
      res.status(400).json({ 
        message: 'Only valid Gmail addresses are allowed for registration. Please use a real Gmail account.',
        code: 'INVALID_GMAIL_ADDRESS'
      });
      return;
    }

    // Check if MongoDB is connected
    if (mongoose.connection.readyState !== 1) {
      console.log('Database not connected. Please ensure MongoDB is running.');
      res.status(503).json({ message: 'Database service unavailable. Please try again later.' });
      return;
    }

    console.log('Checking if user exists:', email);
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('User already exists');
      res.status(400).json({ message: 'User already exists' });
      return;
    }

    console.log('Creating new user...');
    const user = await User.create({ name, email, password, role, age, grade });
    console.log('User created successfully:', user._id);

    if (role === 'student') {
      console.log('Creating student profile...');
      await StudentProfile.create({ userId: user._id });
    } else if (role === 'teacher') {
      console.log('Creating teacher profile...');
      await TeacherProfile.create({ userId: user._id, subjects: [] });
    }

    console.log('Generating JWT token...');
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: process.env.JWT_EXPIRE || '7d' } as jwt.SignOptions
    );

    console.log('Registration successful, sending response');
    const userResponse = { 
      id: user._id, 
      _id: user._id,
      name: user.name, 
      email: user.email, 
      role: user.role 
    };
    res.status(201).json({ token, user: userResponse });
  } catch (error: any) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Registration failed. Please try again.' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    console.log('Login attempt for:', email);
    console.log('Current active sessions in backend - checking for conflicts...');

    // Check if MongoDB is connected
    if (mongoose.connection.readyState !== 1) {
      console.log('Database not connected. Please ensure MongoDB is running.');
      res.status(503).json({ 
        message: 'Database service unavailable. Please try again later.',
        code: 'DATABASE_DISCONNECTED',
        retryable: true
      });
      return;
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user || !user.password) {
      console.log('User not found or no password for:', email);
      res.status(401).json({ 
        message: 'Invalid credentials',
        code: 'INVALID_CREDENTIALS'
      });
      return;
    }
    
    console.log('User found:', email, 'Role:', user.role, 'Active:', user.isActive);
    
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      console.log('Invalid password for:', email);
      res.status(401).json({ 
        message: 'Invalid credentials',
        code: 'INVALID_CREDENTIALS'
      });
      return;
    }

    console.log('Password validated for:', email);
    
    if (!user.isActive) {
      console.log('User is inactive:', email);
      res.status(401).json({ 
        message: 'Account is deactivated',
        code: 'ACCOUNT_DEACTIVATED'
      });
      return;
    }

    user.lastLogin = new Date();
    await user.save();

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: process.env.JWT_EXPIRE || '7d' } as jwt.SignOptions
    );

    const userResponse = { 
      id: user._id, 
      _id: user._id,
      name: user.name, 
      email: user.email, 
      role: user.role 
    };
    
    console.log('Login successful for:', email, 'Role:', user.role);
    res.json({ token, user: userResponse });
  } catch (error: any) {
    console.error('Login error:', error);
    
    // Handle specific error cases
    if (error.name === 'MongoNetworkError' || error.name === 'MongoTimeoutError') {
      res.status(503).json({ 
        message: 'Database connection lost. Please try again.',
        code: 'DATABASE_ERROR',
        retryable: true
      });
    } else if (error.name === 'ValidationError') {
      res.status(400).json({ 
        message: 'Invalid input data',
        code: 'VALIDATION_ERROR'
      });
    } else {
      res.status(500).json({ 
        message: 'Login failed. Please try again.',
        code: 'INTERNAL_ERROR'
      });
    }
  }
};

export const googleAuth = (req: Request, res: Response): void => {
  const googleClientId = process.env.GOOGLE_CLIENT_ID;
  const redirectUri = process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3003/api/auth/google/callback';
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3003';
  const state = req.query.state as string || Math.random().toString(36).substring(2, 15);
  
  if (!googleClientId) {
    res.status(500).json({ message: 'Google OAuth not configured. Please contact administrator.' });
    return;
  }
  
  const scope = 'openid profile email';
  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${googleClientId}&` +
    `redirect_uri=${encodeURIComponent(redirectUri)}&` +
    `response_type=code&` +
    `scope=${encodeURIComponent(scope)}&` +
    `state=${encodeURIComponent(state)}&` +
    `access_type=offline&` +
    `prompt=consent`;
  
  console.log('Google OAuth - Redirecting to:', authUrl);
  res.redirect(authUrl);
};

export const googleCallback = async (req: Request, res: Response): Promise<void> => {
  try {
    const { code, state } = req.query;
    
    if (!code) {
      res.status(400).json({ message: 'Authorization code required' });
      return;
    }
    
    // Exchange code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        code: code as string,
        redirect_uri: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3003/api/auth/google/callback',
        grant_type: 'authorization_code',
      }),
    });
    
    const tokenData: any = await tokenResponse.json();
    
    if (tokenData.error) {
      res.status(400).json({ message: 'Failed to exchange code for tokens' });
      return;
    }
    
    // Get user info
    const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    });
    
    const googleUserData: any = await userResponse.json();
    
    // Find or create user
    let user = await User.findOne({ googleId: googleUserData.id });
    
    if (!user) {
      // Check if user exists with same email
      user = await User.findOne({ email: googleUserData.email });
      if (user) {
        // Link Google account to existing user
        user.googleId = googleUserData.id;
        user.avatar = googleUserData.picture;
        await user.save();
      } else {
        // Create new user
        user = await User.create({
          name: googleUserData.name,
          email: googleUserData.email,
          googleId: googleUserData.id,
          avatar: googleUserData.picture,
          password: Math.random().toString(36).slice(-8), // Random password for Google users
          role: 'student', // Explicitly set role for Google users
        });
      }
    } else {
      // Update avatar if changed
      if (googleUserData.picture && user.avatar !== googleUserData.picture) {
        user.avatar = googleUserData.picture;
        await user.save();
      }
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: process.env.JWT_EXPIRE || '7d' } as jwt.SignOptions
    );
    
    // Redirect to frontend with token
    const frontendUrl = state as string || process.env.FRONTEND_URL || 'http://localhost:3003';
    const userData = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar
    };
    
    console.log('Google OAuth - Redirecting with user data:', userData);
    
    const redirectUrl = `${frontendUrl}/auth/callback?token=${token}&user=${encodeURIComponent(JSON.stringify(userData))}`;
    
    console.log('Google OAuth - Redirect URL:', redirectUrl);
    res.redirect(redirectUrl);
  } catch (error: any) {
    console.error('Google OAuth callback error:', error);
    res.status(500).json({ message: 'Google OAuth failed' });
  }
};

export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal if user exists or not for security
      res.json({ message: 'If an account with that email exists, a password reset link has been sent.' });
      return;
    }

    // Generate reset token
    const resetToken = jwt.sign(
      { userId: user._id, type: 'password-reset' },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '1h' } as jwt.SignOptions
    );

    // TODO: Send email with reset link
    // For now, just return success message
    console.log('Password reset token for', email, ':', resetToken);
    
    res.json({ message: 'If an account with that email exists, a password reset link has been sent.' });
  } catch (error: any) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Failed to process request' });
  }
};

export const getProfile = async (req: any, res: Response) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({ user });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
