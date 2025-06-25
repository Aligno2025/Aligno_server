const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: { type: String, unique: true },
  messages: [
    {
      message: String,
      date: { type: Date, default: Date.now },
    },
  ],
});

module.exports = mongoose.model('Contact', contactSchema);
