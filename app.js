// Load environment variables first
const dotenv = require('dotenv');
dotenv.config();

// Imports
const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const { googleAuth, googleCallback } = require('./authController');
const { twitterAuth, twitterCallback } = require('./authController');
const authenticate = require('./authenticate'); // your JWT or session check
const User = require('./user'); // Adjust to your actual user model path

const app = express();

const passport = require('passport');
const session = require('express-session');
require('./passport');

// Middleware
app.use(express.json());
app.use(cookieParser());


app.use(cors({
  origin: 'https://alignoteam99.netlify.app',
  // origin: 'http://localhost:5173',
  credentials: true
}));

app.use(session({
  secret: process.env.SESSION_SECRET || 'yoursecret',
  resave: false,
  saveUninitialized: true,
}));

app.use(passport.initialize());
app.use(passport.session());

// Health routes
app.get('/', (req, res) => {
  res.send('Server is up and running!');
});


// Routes
const authRoutes = require('./auth');
app.use('/api/auth', authRoutes);

// Google OAuth routes
app.get('/auth/google', googleAuth);
app.get('/auth/google/callback', googleCallback);


// Twitter OAuth routes
app.get('/auth/twitter', twitterAuth);
app.get('/auth/twitter/callback', twitterCallback);


// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal Server Error' });
});


app.patch('/api/user/message', authenticate, async (req, res) => {
  try {
    const userId = req.user.id; // from JWT/session
    const { message } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    user.messages.push({ message });
    await user.save();

    res.status(200).json({ message: 'Message added successfully', user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

if (!process.env.GOOGLE_CLIENT_ID) {
  console.error("Missing GOOGLE_CLIENT_ID in environment variables");
}

// MongoDB connection
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;


mongoose.connect(MONGO_URI)
.then(() => {
  console.log('Connected to MongoDB via Mongoose');
  app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
  });
})
.catch(err => {
  console.error('MongoDB connection failed:', err.message);
});
