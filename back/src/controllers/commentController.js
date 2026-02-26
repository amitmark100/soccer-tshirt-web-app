const Comment = require('../models/commentModel');
const Post = require('../models/postModel');

async function addComment(req, res) {
  try {
    const { postId, sender, message } = req.body;
    if (!postId || !sender || !message) {
      return res.status(400).json({ error: 'postId, sender and message are required' });
    }
    
    const post = await Post.findById(postId);
    if (!post) return res.status(400).json({ error: 'Post not found for given postId' });
    const created = await Comment.create({ postId, sender, message });
    res.status(201).json(created);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function getAllComments(req, res) {
  try {
    const { post } = req.query;
    const filter = {};
    if (post) filter.postId = post;
    const items = await Comment.find(filter).sort({ createdAt: -1 }).lean();
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function getCommentById(req, res) {
  try {
    const { id } = req.params;
    const c = await Comment.findById(id).lean();
    if (!c) return res.status(404).json({ error: 'Comment not found' });
    res.json(c);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function updateComment(req, res) {
  try {
    const { id } = req.params;
    const { postId, sender, message } = req.body;
    if (!postId || !sender || !message) {
      return res.status(400).json({ error: 'postId, sender and message are required' });
    }
    const updated = await Comment.findByIdAndUpdate(id, { postId, sender, message }, { new: true, runValidators: true }).lean();
    if (!updated) return res.status(404).json({ error: 'Comment not found' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
async function deleteComment(req, res) {
  try {
    const { id } = req.params;
    const deleted = await Comment.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ error: 'Comment not found' });
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function getCommentByPostId(req, res) {
  try {
    const { postId } = req.params;
    const comments = await Comment.find({ postId }).sort({ createdAt: -1 }).lean();
    res.json(comments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { addComment, getAllComments, getCommentById, updateComment, deleteComment, getCommentByPostId };
