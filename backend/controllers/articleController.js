// backend/controllers/articleController.js
const Article = require("../models/Article");
const redisClient = require("../config/redisClient");
const { GoogleGenAI } = require("@google/genai");

// Safely initialize Gemini with the configuration object to avoid internal library crashes
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// =========================================================================
// ⚡ AI LAYER: GET ARTICLE SUMMARY (WITH UPSTASH REDIS CACHE)
// =========================================================================
// @desc    Get an AI-generated concise summary of an article (Cached via Upstash Redis)
// @route   GET /api/articles/:id/summary
// @access  Private
exports.getArticleSummary = async (req, res) => {
  try {
    const articleId = req.params.id;

    // Defensive check: Ensure the article ID is valid for MongoDB before querying
    const mongoose = require("mongoose");
    if (!mongoose.Types.ObjectId.isValid(articleId)) {
      console.error(`❌ Invalid MongoDB ObjectId shape requested: ${articleId}`);
      return res.status(400).json({ message: "Invalid article identifier layout structure." });
    }

    const redisKey = `summary:${articleId}`;
    let cachedSummary = null;

    // 1. Check Upstash Redis Cloud Cache defensively
    try {
      if (redisClient && typeof redisClient.get === "function") {
        cachedSummary = await redisClient.get(redisKey);
        // Upstash sometimes returns an object or a string depending on serialization
        if (typeof cachedSummary === "object" && cachedSummary !== null) {
          cachedSummary = JSON.stringify(cachedSummary);
        }
      }
    } catch (redisError) {
      console.error("⚠️ Upstash Redis Cache Lookup Failed, bypassing to DB:", redisError.message);
    }

    if (cachedSummary) {
      console.log("⚡ Serving from Upstash Redis Cache!");
      return res.status(200).json({ 
        articleId, 
        summary: cachedSummary, 
        cached: true
      });
    }

    // 2. If not in cache, fetch the article from MongoDB
    const article = await Article.findById(articleId);
    if (!article) {
      return res.status(404).json({ message: "Article not found inside MongoDB atlas cluster." });
    }

    // 3. Trigger Gemini to summarize the content
    try {
      console.log("☁️ Fetching fresh summary from Gemini API...");
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Provide a highly concise, 2-3 sentence executive summary of this article:\n\n${article.content}`,
      });

      let summaryText = "";
      if (typeof response.text === "function") {
        summaryText = response.text();
      } else if (response.text) {
        summaryText = response.text;
      } else if (response.candidates?.[0]?.content?.parts?.[0]?.text) {
        summaryText = response.candidates[0].content.parts[0].text;
      }

      if (!summaryText) {
        throw new Error("Gemini returned an empty text payload structure.");
      }

      // 4. Save the summary to Upstash Redis Cache safely
      try {
        if (redisClient && typeof redisClient.set === "function") {
          await redisClient.set(redisKey, summaryText, { ex: 3600 });
        }
      } catch (redisWriteError) {
        console.error("⚠️ Failed to write fresh summary token to Upstash Redis:", redisWriteError.message);
      }

      return res.status(200).json({ 
        articleId, 
        summary: summaryText, 
        cached: false 
      });

    } catch (aiError) {
      console.error("❌ Gemini SDK Internal processing failure:", aiError.message);
      if (aiError.message?.includes("429") || aiError.status === 429) {
        return res.status(429).json({ 
          message: "Gemini is rate-limited. Wait a minute or check your Redis setup!",
          cached: false 
        });
      }
      return res.status(502).json({ message: `AI Engine internal error: ${aiError.message}` });
    }
  } catch (error) {
    console.error("🚨 Critical Controller Exception inside getArticleSummary:", error);
    res.status(500).json({ message: `Backend Server Error: ${error.message}` });
  }
};

// =========================================================================
// 📝 CORE DATABASE LAYER: MONGODB CRUD INTERFACES
// =========================================================================

// @desc    Create Article
// @route   POST /api/articles
// @access  Private
exports.createArticle = async (req, res) => {
  try {
    const { title, content } = req.body;

    const article = await Article.create({
      title,
      content,
      authorId: req.user._id,
    });

    res.status(201).json(article);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// @desc    Get Articles
// @route   GET /api/articles
// @access  Private
exports.getArticles = async (req, res) => {
  try {
    let articles;

    if (req.user.role === "admin") {
      articles = await Article.find();
    } else {
      articles = await Article.find({
        authorId: req.user._id,
      });
    }

    res.status(200).json(articles);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// @desc    Update Article
// @route   PUT /api/articles/:id
// @access  Private
exports.updateArticle = async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);

    if (!article) {
      return res.status(404).json({
        message: "Article not found",
      });
    }

    if (article.authorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "Not authorized",
      });
    }

    article.title = req.body.title || article.title;
    article.content = req.body.content || article.content;

    const updatedArticle = await article.save();

    res.status(200).json(updatedArticle);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// @desc    Delete Article
// @route   DELETE /api/articles/:id
// @access  Private
exports.deleteArticle = async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);

    if (!article) {
      return res.status(404).json({
        message: "Article not found",
      });
    }

    if (article.authorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "Not authorized",
      });
    }

    await article.deleteOne();

    res.status(200).json({
      message: "Article deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};