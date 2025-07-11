const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
 const token = req.cookies.accessToken || req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Unauthorized' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // should contain `id`, `email`, etc.
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid token' });
  }
};
module.exports = authenticate;