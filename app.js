// Load environment variables first
const dotenv = require('dotenv');
dotenv.config();

// Imports
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser'); // optional, express.json() is sufficient
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');

const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());

// CORS configuration
app.use(cors({
  origin: 'https://alignoteam99.netlify.app', // ✅ No trailing slash
  credentials: true
}));

// Simple health check route
app.get('/', (req, res) => {
  res.send('✅ Server is up and running!');
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', uptime: process.uptime() });
});


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


// Routes
const authRoutes = require('./auth');
app.use('/api/auth', authRoutes);

// Connect to MongoDB and start server
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

if (!uri) {
  console.error('❌ MONGO_URI is undefined. Did you set it in Railway Environment Variables?');
  process.exit(1);
}


const uri = "mongodb+srv://Adebayo:<Gbola51389@cluster0.fyd7gun.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";


// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}
run().catch(console.dir);




