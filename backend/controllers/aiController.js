// backend/controllers/aiController.js
const { GoogleGenAI } = require("@google/genai");

// Pass the configuration explicitly to prevent the initialization crash
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// ==========================================
// 1. GENERATE ARTICLE CONTROLLER
// ==========================================
exports.generateArticle = async (req, res) => {
  try {
    const { topic } = req.body;

    if (!topic) {
      return res.status(400).json({ message: "Topic is required to generate an article." });
    }

    // Call the Gemini API using the updated SDK structure
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Write a detailed, engaging, and professional article about the following topic: ${topic}. Structure it with a compelling title, introduction, body paragraphs, and a forward-looking conclusion.`,
    });

    const article = response.text;

    return res.status(200).json({
      article,
    });

  } catch (error) {
    console.error("Gemini Generation Error:", error);

    if (error.message?.includes("429") || error.status === 429) {
      return res.status(429).json({
        message: "The AI generation engine is experiencing high traffic free-tier limits. Please wait a minute and try clicking generate again!",
      });
    }

    return res.status(500).json({
      message: error.message || "An error occurred while generating the article.",
    });
  }
};

// ==========================================
// 2. SAVED ARTICLE SUMMARIZER CONTROLLER
// ==========================================
exports.summarizeSavedArticle = async (req, res) => {
  try {
    const { text, title } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ message: "Article content cannot be empty." });
    }

    // This prompt matches your custom paste prompt EXACTLY, forcing the same length output
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Provide a concise, high-level executive summary and an analytical abstract of the following text: ${text}`,
    });

    return res.status(200).json({
      summary: response.text,
      cached: false
    });

  } catch (error) {
    console.error("Gemini Saved Article Summarizer Error:", error);
    return res.status(500).json({
      message: error.message || "An exception occurred inside the AI saved summarizer pipeline.",
    });
  }
};

// ==========================================
// 3. PASTE CONTENT CUSTOM SUMMARIZER CONTROLLER
// ==========================================
exports.summarizeCustom = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ message: "Text context payload space cannot be completely empty." });
    }

    // Uses the identical prompt constraint as the saved handler above
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Provide a concise, high-level executive summary and an analytical abstract of the following text: ${text}`,
    });

    return res.status(200).json({
      summary: response.text,
      cached: false
    });

  } catch (error) {
    console.error("Gemini Custom Summarizer Error:", error);

    if (error.message?.includes("429") || error.status === 429) {
      return res.status(429).json({
        message: "The AI engine is experiencing high traffic rate-limits. Please wait a moment and try again.",
      });
    }

    return res.status(500).json({
      message: error.message || "An exception occurred inside the AI custom summarizer pipeline.",
    });
  }
};