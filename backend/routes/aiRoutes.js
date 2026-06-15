const express = require("express");
const router = express.Router();

// Import all controller handlers from aiController
const {
  generateArticle,
  summarizeCustom,
  summarizeSavedArticle,
} = require("../controllers/aiController");

// Route mappings
router.post("/generate", generateArticle);
router.post("/summarize-custom", summarizeCustom); 
router.post("/summarize-saved", summarizeSavedArticle); 

module.exports = router;