const express = require('express');
const router = express.Router();

// Mock users (replace with your DB)
const users = [
  {
    id: '1',
    username: 'john_doe',
    displayName: 'John Doe',
    avatar: 'https://example.com/avatar.jpg',
    bio: 'Hello, world!',
    followerCount: 100,
    followingCount: 50,
  },
  // Add more users
];

// Middleware to verify JWT
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    console.error('No token provided in Authorization header');
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }

  try {
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    console.error('JWT verification failed:', error.message);
    res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};

// GET /api/users/:username
router.get('/:username', authMiddleware, async (req, res) => {
  try {
    const { username } = req.params;
    const user = users.find(u => u.username === username);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ ...user, isCurrentUser: req.user.username === username });
  } catch (error) {
    console.error('Error fetching user:', error.message);
    res.status(500).json({ error: 'Failed to fetch user: ' + error.message });
  }
});

module.exports = router;