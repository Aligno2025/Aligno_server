const mongoose = require('mongoose');


const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: false, // Optional if logging in with Google
    trim: true,
  },
  lastName: {
    type: String,
    required: false,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: false, // Optional for Google OAuth users
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true, // Avoids unique index error for users without Google ID
  },
  messages: [
    {
      message: {
        type: String,
        required: true,
        trim: true,
      },
      date: {
        type: Date,
        default: Date.now,
      },
    },
  ],
});



const User = mongoose.model('User', userSchema);

module.exports = User;
