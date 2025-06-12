const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  type: { type: String, required: true, enum: ['like', 'comment', 'follow'] },
  actor: {
    id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    username: { type: String, required: true },
    displayName: { type: String, required: true },
    avatar: { type: String },
  },
  post: {
    id: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' },
    content: { type: String },
    media: [{ url: String, type: { type: String, enum: ['image', 'video'] } }],
  },
  comment: {
    id: { type: String },
    content: { type: String },
    author: {
      id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      username: { type: String },
      displayName: { type: String },
      avatar: { type: String },
    },
  },
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Notification', notificationSchema);