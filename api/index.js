require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const PORT = 5000;
const app = express();

app.use(cors());
app.use(express.json());

// ✅ MongoDB Connection
async function connectDB() {
    try {
        if (mongoose.connection.readyState >= 1) return;

        await mongoose.connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 15000,
            connectTimeoutMS: 10000
        });

        console.log("MongoDB Connected");
    } catch (error) {
        console.error("MongoDB Connection error:", error);
    }
}
connectDB();

// ✅ Schema
const newsSchema = new mongoose.Schema({
    title: { type: String, required: true },
    date: { type: Date, default: Date.now },
    description: { type: String, required: true },
    imagelink: { type: String, required: true }
});

const News = mongoose.model("News", newsSchema);

app.get('/api/news', async (req, res) => {
    try {
        const allNews = await News.find().sort({ date: -1 });
        res.status(200).json(allNews);
    } catch (error) {
        res.status(500).json({ message: "Error fetching news", error });
    }
});

app.post('/api/news', async (req, res) => {
    try {
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


app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});