const mongoose = require('mongoose');
const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const app = express();

const authRoutes = require('./auth');

dotenv.config();

// Middleware
app.use(express.json());
app.use(cookieParser());

// CORS configuration
app.use(cors({
  origin: 'https://alignoteam99.netlify.app/', // your frontend URL
  credentials: true               // allow cookies to be sent
}));

app.use('/api/auth', authRoutes); // Use auth routes

// Connect to DB and Start Server
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    app.listen(process.env.PORT, () =>
      console.log(`Server running on http://localhost:${process.env.PORT}`)
    );
  })
  .catch(err => console.error(err));





// middleware/authMiddleware.js

const authenticate = (req, res, next) => {
  const token = req.cookies.accessToken;

  if (!token) return res.status(401).json({ message: 'Unauthorized' });

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ message: 'Token invalid or expired' });

    req.user = decoded;
    next();
  });
};

// authenticalted route example

app.get('/protected', authenticate, (req, res) => {
  res.json({ message: `Welcome, ${req.user.email}!` });
});

