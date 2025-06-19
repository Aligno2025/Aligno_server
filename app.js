// Load environment variables first
const dotenv = require('dotenv');
dotenv.config();

// Imports
const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const cors = require('cors');

const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());

app.use(cors({
  origin: 'https://alignoteam99.netlify.app',
  credentials: true
}));

// Health routes
app.get('/', (req, res) => {
  res.send('✅ Server is up and running!');
});


// Routes
const authRoutes = require('./auth');
app.use('/api/auth', authRoutes);

// MongoDB connection
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

// if (!MONGO_URI) {
//   console.error('❌ MONGO_URI is undefined. Set it in Railway Environment Variables.');
//   process.exit(1);
// }

// const uri = "mongodb+srv://Adebayo:Gbola51389@cluster0.fyd7gun.mongodb.net/user-auth?retryWrites=true&w=majority&appName=Cluster0";

mongoose.connect(MONGO_URI)
.then(() => {
  console.log('✅ Connected to MongoDB via Mongoose');
  app.listen(PORT, () => {
    console.log(`🚀 Server is running at http://localhost:${PORT}`);
  });
})
.catch(err => {
  console.error('❌ MongoDB connection failed:', err.message);
});
