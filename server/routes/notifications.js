const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const authMiddleware = require('./posts'); // Assuming authMiddleware is exported from posts.js

// Get Notifications
router.get('/', authMiddleware, async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user.id })
      .sort({ createdAt: -1 })
      .populate('actor.id', 'username displayName avatar')
      .populate('post.id', 'content media')
      .populate('comment.author.id', 'username displayName avatar');
    const unreadCount = await Notification.countDocuments({ recipient: req.user.id, read: false });
    res.json({ notifications, unreadCount });
  } catch (err) {
    console.error('Error fetching notifications:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Mark Notification as Read
router.patch('/:id/read', authMiddleware, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification || notification.recipient.toString() !== req.user.id) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    notification.read = true;
    await notification.save();
    const unreadCount = await Notification.countDocuments({ recipient: req.user.id, read: false });
    res.json({ notification, unreadCount });
  } catch (err) {
    console.error('Error marking notification as read:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Mark All Notifications as Read
router.patch('/read-all', authMiddleware, async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user.id, read: false },
      { read: true }
    );
    const notifications = await Notification.find({ recipient: req.user.id })
      .sort({ createdAt: -1 })
      .populate('actor.id', 'username displayName avatar')
      .populate('post.id', 'content media')
      .populate('comment.author.id', 'username displayName avatar');
    res.json({ notifications, unreadCount: 0 });
  } catch (err) {
    console.error('Error marking all notifications as read:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;