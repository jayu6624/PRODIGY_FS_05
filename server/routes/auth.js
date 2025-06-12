const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Notification = require('../models/Notification');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
const authMiddleware = require('./posts'); // Assuming authMiddleware is exported from posts.js

const router = express.Router();

// Configure Cloudinary for avatar uploads
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'avatars',
    allowed_formats: ['jpg', 'png', 'jpeg'],
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB limit
}).single('avatar');

// Register Endpoint (unchanged from previous)
router.post('/register', async (req, res) => {
  const { username, email, password, displayName } = req.body;
  try {
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res.status(400).json({ error: 'Username or email already exists' });
    }
    if (!displayName) {
      return res.status(400).json({ error: 'Display name is required' });
    }
    const user = new User({ username, email, password, displayName });
    await user.save();
    const token = jwt.sign(
      {
        id: user._id,
        username: user.username,
        displayName: user.displayName,
        avatar: user.avatar,
        bio: user.bio, // Include bio
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    res.status(201).json({ token });
  } catch (err) {
    console.error('Error registering user:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Login Endpoint (unchanged from previous)
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ error: 'Invalid username or password' });
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid username or password' });
    }
    const token = jwt.sign(
      {
        id: user._id,
        username: user.username,
        displayName: user.displayName,
        avatar: user.avatar,
        bio: user.bio, // Include bio
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    res.json({ token });
  } catch (err) {
    console.error('Error logging in user:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update Profile (bio and avatar)
router.patch('/profile', authMiddleware, upload, async (req, res) => {
  try {
    const { bio } = req.body;
    const updates = { bio };
    if (req.file) {
      updates.avatar = req.file.path; // Cloudinary URL
    }
    const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({
      id: user._id,
      username: user.username,
      displayName: user.displayName,
      avatar: user.avatar,
      bio: user.bio,
      followerCount: user.followers.length,
      followingCount: user.following.length,
    });
  } catch (err) {
    console.error('Error updating profile:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Follow/Unfollow User
router.post('/follow/:userId', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;
    if (userId === req.user.id) {
      return res.status(400).json({ error: 'Cannot follow yourself' });
    }
    const targetUser = await User.findById(userId);
    if (!targetUser) {
      return res.status(404).json({ error: 'User not found' });
    }
    const currentUser = await User.findById(req.user.id);
    const isFollowing = currentUser.following.includes(userId);
    if (isFollowing) {
      // Unfollow
      currentUser.following = currentUser.following.filter(id => id.toString() !== userId);
      targetUser.followers = targetUser.followers.filter(id => id.toString() !== req.user.id);
    } else {
      // Follow
      currentUser.following.push(userId);
      targetUser.followers.push(req.user.id);
      // Create notification
      const notification = new Notification({
        type: 'follow',
        actor: {
          id: req.user.id,
          username: req.user.username,
          displayName: req.user.displayName,
          avatar: req.user.avatar,
        },
        recipient: userId,
        createdAt: new Date(),
      });
      await notification.save();
    }
    await currentUser.save();
    await targetUser.save();
    res.json({ isFollowing: !isFollowing });
  } catch (err) {
    console.error('Error following/unfollowing user:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get Followers
router.get('/followers/:userId', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId).populate('followers', 'username displayName avatar');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user.followers);
  } catch (err) {
    console.error('Error fetching followers:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get Following
router.get('/following/:userId', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId).populate('following', 'username displayName avatar');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user.following);
  } catch (err) {
    console.error('Error fetching following:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;