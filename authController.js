const { generateAccessToken,
  generateRefreshToken } = require('./generateTokens');
const User = require('./user');
// const { bcrypt, jwt} = require('./constants');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Contact = require('./contact'); // adjust path to your Contact model

const passport = require('passport'); // Add passport if not already imported

// Google OAuth route
const googleAuth = passport.authenticate('google', { scope: ['profile', 'email'] });

// Google OAuth callback handler
const googleCallback = [
  passport.authenticate('google', { failureRedirect: 'https://alignoteam99.netlify.app/Sign_in' }),
  (req, res) => {
    const payload = {
      userId: req.user._id,
      email: req.user.email
    };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    // Set tokens in cookies
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      sameSite: 'Lax',
      secure: false, // Set to true in production (HTTPS)
      maxAge: 15 * 60 * 1000,
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      sameSite: 'Lax',
      secure: false, // Set to true in production
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // Redirect to frontend
    res.redirect('https://alignoteam99.netlify.app/MainDash');
  }
];


// Twitter OAuth initiation
const twitterAuth = passport.authenticate('twitter', {
  scope: ['tweet.read', 'users.read', 'offline.access'],
});

// Twitter OAuth callback
const twitterCallback = [
  passport.authenticate('twitter', {
    failureRedirect: 'https://alignoteam99.netlify.app/Sign_in',
  }),
  (req, res) => {
    const payload = {
      userId: req.user._id,
      email: req.user.email || null,
    };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      sameSite: 'Lax',
      secure: false, // Set to true with HTTPS in production
      maxAge: 15 * 60 * 1000,
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      sameSite: 'Lax',
      secure: false,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.redirect('https://alignoteam99.netlify.app/MainDash');
  },
];

const register = async (req, res) => {
    const { name, email, password, confirmPassword } = req.body;
  // console.log(req.body);

  // Validation
  if (!name || !email || !password || !confirmPassword) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ message: 'Passwords do not match.' });
  }

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'Email already registered.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
    });

    await newUser.save();

    res.status(201).json({ message: 'User registered successfully.' });
  } catch (err) {
  console.error("LOGIN ERROR:", err); // <--- Add this
  res.status(500).json({ message: 'Server error.' });
}
};

const login = async (req, res) => {
     const { email, password } = req.body;
    
      if (!email || !password) return res.status(400).json({ message: 'Missing credentials.' });
    
      try {
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: 'Invalid credentials.' });
    
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials.' });
    
        const payload = { userId: user._id, email: user.email };
        const accessToken = generateAccessToken(payload);
        const refreshToken = generateRefreshToken(payload);
    
        // Set tokens in HttpOnly cookies
        res.cookie('accessToken', accessToken, {
          httpOnly: true,
          secure: true, // set to false if not using HTTPS
          maxAge: 15 * 60 * 1000, // 15 mins
        //   sameSite: 'Strict'
        sameSite: process.env.CLIENT_ORIGIN === 'cross-domain' ? 'none' : 'strict',
        });
    
        res.cookie('refreshToken', refreshToken, {
          httpOnly: true,
          secure: true,
          maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        //   sameSite: 'Strict'
        sameSite: process.env.CLIENT_ORIGIN === 'cross-domain' ? 'none' : 'strict',
        });
    
        res.status(200).json({ message: 'Login successful', accessToken });
      } catch (err) {
  console.error("LOGIN ERROR:", err); // <--- Add this
  res.status(500).json({ message: 'Server error.' });
}
    };

// const refreshTokens = async (req, res) => {
//         const refreshToken = req.cookies.refreshToken;

//   if (!refreshToken) return res.status(401).json({ message: 'No refresh token' });

//   jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, (err, user) => {
//     if (err) return res.status(403).json({ message: 'Invalid refresh token' });

//     const payload = { userId: user.userId, email: user.email };
//     const newAccessToken = generateAccessToken(payload);

//     res.cookie('accessToken', newAccessToken, {
//       httpOnly: true,
//       secure: true,
//       maxAge: 15 * 60 * 1000,
//       sameSite: 'Strict'
//     });

//     res.status(200).json({
//   message: 'Token refreshed',
//   accessToken: newAccessToken
// });
//   });
// };

const refreshTokens = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({ message: 'No refresh token provided' });
    }

    // Verify refresh token (use promisified jwt.verify)
    const user = await new Promise((resolve, reject) => {
      jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, (err, decoded) => {
        if (err) reject(err);
        resolve(decoded);
      });
    });

    // Optional: Validate refresh token against database (if stored)
    // Example: const storedToken = await db.findRefreshToken(refreshToken);
    // if (!storedToken) return res.status(403).json({ message: 'Invalid refresh token' });

    // Generate new access token
    const payload = { userId: user.userId, email: user.email };
    const newAccessToken = generateAccessToken(payload);

    // Optionally refresh the refresh token to extend session
    const newRefreshToken = generateRefreshToken(payload); // Assume generateRefreshToken exists
    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
    //   secure: process.env.NODE_ENV === 'production', // true in prod, false in dev
    //   path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      sameSite: process.env.CLIENT_ORIGIN === 'cross-domain' ? 'none' : 'strict', // Dynamic SameSite
    //   domain: 'https://alignoteam99.netlify.app' || undefined, // e.g., .yourdomain.com
    });

    // Set access token in response body (matches frontend expectation)
    res.status(200).json({
      message: 'Token refreshed successfully',
      accessToken: newAccessToken,
    });
  } catch (error) {
    console.error('Refresh token error:', error.message);
    res.status(403).json({ message: 'Failed to refresh token' });
  }
};


const logout = (req, res) => {
     res.clearCookie('accessToken');
  res.clearCookie('refreshToken');
  res.status(200).json({ message: 'Logged out' });
};


const apiSendGuestMessage = async (req, res) => {
  try {
    const { firstName, lastName, email, message } = req.body;

    let contact = await Contact.findOne({ email });

    if (contact) {
      // Append new message
     return res.status(400).json({ error: 'You have already submitted a message.' });
    } else {
      // Create new contact
      const newContact = new Contact({
        firstName,
        lastName,
        email,
        messages: [{ message }],
      });

      await newContact.save();
      return res.status(200).json({ message: 'New user and message saved.' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to save message.' });
  }
};




module.exports = {
  register,
  login,
  refreshTokens,
  logout,
  googleAuth,
  googleCallback,
  twitterAuth,
  twitterCallback,
  apiSendGuestMessage,
};
