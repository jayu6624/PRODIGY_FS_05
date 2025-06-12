const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  content: { type: String, required: false },
  location: { type: String, required: false },
  media: [{
    url: { type: String, required: true },
    type: { type: String, enum: ['image', 'video'], required: true },
  }],
  author: {
    id: { type: mongoose.Schema.Types.ObjectId, required: true },
    username: { type: String, required: true },
    displayName: { type: String, required: true },
  },
  comments: [{
    id: { type: String, required: true },
    content: { type: String, required: true },
    author: {
      id: { type: mongoose.Schema.Types.ObjectId, required: true },
      username: { type: String, required: true },
      displayName: { type: String, required: true },
    },
    createdAt: { type: Date, default: Date.now },
  }],
  hashtags: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Post', postSchema);