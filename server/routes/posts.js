const express = require('express');
const router = express.Router();
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
const mongoose = require('mongoose');
const Post = require('../models/Post');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Validate Cloudinary configuration
if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
  console.error('Cloudinary configuration is incomplete. Please check environment variables.');
  process.exit(1);
}

// Set up Cloudinary storage for multer
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'posts',
    allowed_formats: ['jpg', 'png', 'jpeg', 'mp4'],
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
}).array('media', 4);

// Middleware to verify JWT
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
    console.log('Decoded JWT:', decoded); // Debug the token payload
    if (!decoded.id || !decoded.username || !decoded.displayName) {
      console.error('Invalid JWT payload, missing required fields:', decoded);
      return res.status(401).json({ error: 'Unauthorized: Incomplete user data in token' });
    }
    req.user = decoded;
    next();
  } catch (error) {
    console.error('JWT verification failed:', error.message);
    res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};

// Multer error handling middleware
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    console.error('Multer error:', err.message, err.field);
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({ error: `Unexpected field: ${err.field}. Expected 'media'.` });
    }
    return res.status(400).json({ error: `Multer error: ${err.message}` });
  }
  next(err);
};

// POST /api/posts
// POST /api/posts
router.post('/', authMiddleware, upload, handleMulterError, async (req, res) => {
  try {
    const { content, location } = req.body;
    console.log('Received post data:', { content, location, files: req.files?.length });

    const media = req.files ? req.files.map(file => ({
      url: file.path, // Cloudinary URL
      type: file.mimetype.startsWith('image') ? 'image' : 'video',
    })) : [];

    // Validate author fields
    if (!req.user.id || !req.user.username || !req.user.displayName) {
      console.error('Missing author fields in req.user:', req.user);
      return res.status(400).json({ error: 'Missing required author fields' });
    }

    const newPost = new Post({
      content,
      location,
      media,
      author: {
        id: req.user.id,
        username: req.user.username,
        displayName: req.user.displayName,
      },
      hashtags: content ? content.match(/#[^\s#]+/g) || [] : [],
      createdAt: new Date(),
    });

    await newPost.save(); // Save to MongoDB
    console.log('Post created successfully:', newPost._id);
    res.status(201).json({ ...newPost.toObject(), id: newPost._id });
  } catch (error) {
    console.error('Error creating post:', {
      message: error.message,
      stack: error.stack,
    });
    res.status(500).json({ error: 'Failed to create post: ' + error.message });
  }
});

// GET /api/posts
router.get('/', authMiddleware, async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 }); // Fetch posts sorted by creation date
    res.json(posts.map(post => ({ ...post.toObject(), id: post._id }))); // Normalize _id to id
  } catch (error) {
    console.error('Error fetching posts:', error.message);
    res.status(500).json({ error: 'Failed to fetch posts: ' + error.message });
  }
});

// GET /api/posts/user/:username
router.get('/user/:username', authMiddleware, async (req, res) => {
  try {
    const { username } = req.params;
    const userPosts = await Post.find({ 'author.username': username }).sort({ createdAt: -1 });
    res.json(userPosts.map(post => ({ ...post.toObject(), id: post._id }))); // Normalize _id to id
  } catch (error) {
    console.error('Error fetching user posts:', error.message);
    res.status(500).json({ error: 'Failed to fetch user posts: ' + error.message });
  }
});

// POST /api/posts/:postId/comments
router.post('/:postId/comments', authMiddleware, async (req, res) => {
  try {
    const { postId } = req.params;
    const { content } = req.body;

    const post = await Post.findById(postId);
    if (!post) {
      console.error('Post not found:', postId);
      return res.status(404).json({ error: 'Post not found' });
    }

    const newComment = {
      id: new mongoose.Types.ObjectId().toString(),
      content,
      author: {
        id: req.user.id,
        username: req.user.username,
        displayName: req.user.displayName,
      },
      createdAt: new Date(),
    };

    post.comments.push(newComment);
    await post.save(); // Save updated post to MongoDB
    console.log('Comment added to post:', postId);
    res.json({ ...post.toObject(), id: post._id }); // Normalize _id to id
  } catch (error) {
    console.error('Error adding comment:', error.message);
    res.status(500).json({ error: 'Failed to add comment: ' + error.message });
  }
});

// POST /api/posts/:postId/like (new)
router.post('/:postId/like', authMiddleware, async (req, res) => {
  try {
    const { postId } = req.params;
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    const isLiked = post.likes.some(like => like.user.toString() === req.user.id);
    if (isLiked) {
      post.likes = post.likes.filter(like => like.user.toString() !== req.user.id);
    } else {
      post.likes.push({ user: req.user.id });
      if (post.author.id.toString() !== req.user.id) {
        const notification = new Notification({
          type: 'like',
          actor: {
            id: req.user.id,
            username: req.user.username,
            displayName: req.user.displayName,
            avatar: req.user.avatar,
          },
          post: {
            id: post._id,
            content: post.content,
            media: post.media,
          },
          recipient: post.author.id,
          createdAt: new Date(),
        });
        await notification.save();
      }
    }
    await post.save();
    res.json({ ...post.toObject(), id: post._id, isLiked: !isLiked });
  } catch (error) {
    console.error('Error liking post:', error.message);
    res.status(500).json({ error: 'Failed to like post: ' + error.message });
  }
});

// POST /api/posts/:postId/comments (updated)
router.post('/:postId/comments', authMiddleware, async (req, res) => {
  try {
    const { postId } = req.params;
    const { content } = req.body;
    const post = await Post.findById(postId);
    if (!post) {
      console.error('Post not found:', postId);
      return res.status(404).json({ error: 'Post not found' });
    }
    const newComment = {
      id: new mongoose.Types.ObjectId().toString(),
      content,
      author: {
        id: req.user.id,
        username: req.user.username,
        displayName: req.user.displayName,
        avatar: req.user.avatar,
      },
      createdAt: new Date(),
    };
    post.comments.push(newComment);
    await post.save();
    if (post.author.id.toString() !== req.user.id) {
      const notification = new Notification({
        type: 'comment',
        actor: {
          id: req.user.id,
          username: req.user.username,
          displayName: req.user.displayName,
          avatar: req.user.avatar,
        },
        post: {
          id: post._id,
          content: post.content,
          media: post.media,
        },
        comment: {
          id: newComment.id,
          content: newComment.content,
          author: newComment.author,
        },
        recipient: post.author.id,
        createdAt: new Date(),
      });
      await notification.save();
    }
    console.log('Comment added to post:', postId);
    res.json({ ...post.toObject(), id: post._id });
  } catch (error) {
    console.error('Error adding comment:', error.message);
    res.status(500).json({ error: 'Failed to add comment: ' + error.message });
  }
});

// Export authMiddleware for use in other routes
module.exports = { router, authMiddleware };

module.exports = router;