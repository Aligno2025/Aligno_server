const express = require('express');
const router = express.Router();


const { register,
  login,
  refresh,
  logout,
  apiSendGuestMessage
} = require('./authController');


// Register route
router.post('/register', register);
// Login route
router.post('/login', login);
// Refresh token route
router.post('/refresh', refresh);
// Logout route
router.post('/logout', logout);

router.post('/apiSendGuestMessage', apiSendGuestMessage);


module.exports = router;