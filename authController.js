const { generateAccessToken,
  generateRefreshToken } = require('./generateTokens');
const User = require('./user');
// const { bcrypt, jwt} = require('./constants');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


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
          sameSite: 'Strict'
        });
    
        res.cookie('refreshToken', refreshToken, {
          httpOnly: true,
          secure: true,
          maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
          sameSite: 'Strict'
        });
    
        res.status(200).json({ message: 'Login successful' });
      } catch (err) {
  console.error("LOGIN ERROR:", err); // <--- Add this
  res.status(500).json({ message: 'Server error.' });
}
    };

const refreshTokens = async (req, res) => {
        const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) return res.status(401).json({ message: 'No refresh token' });

  jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid refresh token' });

    const payload = { userId: user.userId, email: user.email };
    const newAccessToken = generateAccessToken(payload);

    res.cookie('accessToken', newAccessToken, {
      httpOnly: true,
      secure: true,
      maxAge: 15 * 60 * 1000,
      sameSite: 'Strict'
    });

    res.status(200).json({
  message: 'Token refreshed',
  accessToken: newAccessToken
});
  });
};

const logout = (req, res) => {
     res.clearCookie('accessToken');
  res.clearCookie('refreshToken');
  res.status(200).json({ message: 'Logged out' });
};

module.exports = {
  register,
  login,
  refreshTokens,
  logout
};