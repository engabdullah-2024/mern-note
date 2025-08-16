require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();

// Middleware
app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET','POST','PUT','DELETE','OPTIONS']
}));
app.use(express.json());

// Connect Mongo
(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Mongo connected');
  } catch (e) {
    console.error('❌ Mongo connect error:', e.message);
    process.exit(1);
  }
})();

// Model
const { Schema, model, models } = mongoose;
const noteSchema = new Schema({
  title: { type: String, trim: true, default: '', maxlength: 300 },
  content: { type: String, default: '' },
  contentPreview: { type: String, default: '', maxlength: 3000 },
  tags: { type: [String], default: [] },
  isPinned: { type: Boolean, default: false },
  status: { type: String, enum: ['active','archived','trashed'], default: 'active' },
}, { timestamps: true });
const Note = models.Note || model('Note', noteSchema);

// ----------------- Routes -----------------

// List all notes
app.get('/api/notes', async (_req, res, next) => {
  try {
    const notes = await Note.find({}).sort({ updatedAt: -1, _id: -1 }).lean();
    res.json({ items: notes });
  } catch (e) { next(e); }
});

// Create note
app.post('/api/notes', async (req, res, next) => {
  try {
    const { title = '', content = '', contentPreview = '', tags = [], isPinned = false } = req.body || {};
    const note = await Note.create({
      title: String(title).slice(0, 300),
      content,
      contentPreview: String(contentPreview).slice(0, 3000),
      tags: Array.isArray(tags) ? tags.map(t => String(t)).slice(0, 20) : [],
      isPinned: Boolean(isPinned)
    });
    res.status(201).json({ id: note._id });
  } catch (e) { next(e); }
});

// Update note
app.put('/api/notes/:id', async (req, res, next) => {
  try {
    const { title, content, contentPreview, tags, isPinned, status } = req.body || {};
    const $set = {};
    if (typeof title === 'string') $set.title = title.slice(0, 300);
    if (typeof content === 'string') $set.content = content;
    if (typeof contentPreview === 'string') $set.contentPreview = contentPreview.slice(0, 3000);
    if (Array.isArray(tags)) $set.tags = tags.map(t => String(t)).slice(0, 20);
    if (typeof isPinned === 'boolean') $set.isPinned = isPinned;
    if (['active','archived','trashed'].includes(status)) $set.status = status;

    const updated = await Note.findByIdAndUpdate(
      req.params.id,
      { $set },
      { new: true, runValidators: true }
    ).lean();

    if (!updated) return res.status(404).json({ message: 'Not found' });
    res.json(updated);
  } catch (e) { next(e); }
});

// Delete note (soft by default, hard with ?hard=true)
app.delete('/api/notes/:id', async (req, res, next) => {
  try {
    const hard = String(req.query.hard || '').toLowerCase() === 'true';
    if (hard) {
      const del = await Note.deleteOne({ _id: req.params.id });
      if (del.deletedCount === 0) return res.status(404).json({ message: 'Not found' });
      return res.json({ ok: true, hard: true });
    }
    const updated = await Note.findByIdAndUpdate(
      req.params.id,
      { $set: { status: 'trashed' } },
      { new: true }
    ).lean();
    if (!updated) return res.status(404).json({ message: 'Not found' });
    res.json({ ok: true, hard: false });
  } catch (e) { next(e); }
});

// ----------------- Error Helpers -----------------

// Unknown routes
app.use((req, _res, next) => {
  console.warn('404 route:', req.method, req.originalUrl);
  next();
});

// Error handler
app.use((err, _req, res, _next) => {
  console.error('💥 Error:', err.message);
  if (err.name === 'ValidationError' || err.name === 'CastError') {
    return res.status(400).json({ message: err.message });
  }
  res.status(500).json({ message: err.message || 'Server error' });
});

// ----------------- Listen -----------------
const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`API running on http://localhost:${port}`));
