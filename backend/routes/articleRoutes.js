// backend/routes/articleRoutes.js
const express = require("express");
const router = express.Router();
const { 
  createArticle, 
  getArticles, 
  updateArticle, 
  deleteArticle,
  getArticleSummary // 1. IMPORT YOUR NEW CONTROLLER FUNCTION HERE
} = require("../controllers/articleController");

const { protect } = require("../middleware/authMiddleware");

// All article endpoints require authentication
router.route("/")
  .post(protect, createArticle)
  .get(protect, getArticles);

router.route("/:id")
  .put(protect, updateArticle)
  .delete(protect, deleteArticle);

// 2. ADD THIS NEW ROUTE AT THE BOTTOM:
router.route("/:id/summary")
  .get(protect, getArticleSummary);

module.exports = router;