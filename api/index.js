const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();

app.use(cors());
app.use(express.json());

// ✅ MongoDB Connection (optimized for serverless)
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(process.env.MONGODB_URI, {
      bufferCommands: false,
    }).then((mongoose) => mongoose);
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

// ✅ Schema
const newsSchema = new mongoose.Schema({
  title: { type: String, required: true },
  date: { type: Date, default: Date.now },
  description: { type: String, required: true },
  imagelink: { type: String, required: true }
});

const News = mongoose.models.News || mongoose.model("News", newsSchema);

// ✅ Routes
app.get('/api/news', async (req, res) => {
  try {
    await connectDB();
    const allNews = await News.find().sort({ date: -1 });
    res.status(200).json(allNews);
  } catch (error) {
    res.status(500).json({ message: "Error fetching news", error });
  }
});

app.post('/api/news', async (req, res) => {
  try {
    await connectDB();
    const { title, description, imagelink } = req.body;

    const newNews = new News({
      title,
      description,
      imagelink
    });

    await newNews.save();

    res.status(201).json({
      message: "News added successfully",
      data: newNews
    });
  } catch (error) {
    res.status(400).json({ message: "Error adding news", error });
  }
});

module.exports = app;
