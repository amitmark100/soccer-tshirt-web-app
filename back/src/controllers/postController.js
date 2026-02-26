const Post = require('../models/postModel');

async function addPost(req, res) {
  try {
    const { title, content, sender } = req.body;
    if (!title || !content || !sender) {
      return res.status(400).json({ error: 'title, content and sender are required' });
    }
    const created = await Post.create({ title, content, sender });
    res.status(201).json(created);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function getAllPosts(req, res) {
  try {
    const { sender } = req.query;
    const filter = {};
    if (sender) filter.sender = sender;
    const items = await Post.find(filter).sort({ createdAt: -1 }).lean();
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function getPostById(req, res) {
  try {
    const { id } = req.params;
    const post = await Post.findById(id).lean();
    if (!post) return res.status(404).json({ error: 'Post not found' });
    res.json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}


async function updatePost(req, res) {
  try {
    const { id } = req.params;
    const { title, content, sender } = req.body;
    if (!title || !content || !sender) {
      return res.status(400).json({ error: 'title, content and sender are required' });
    }
    const updated = await Post.findByIdAndUpdate(id, { title, content, sender }, { new: true, runValidators: true }).lean();
    if (!updated) return res.status(404).json({ error: 'Post not found' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = {addPost, getAllPosts, getPostById, updatePost};
