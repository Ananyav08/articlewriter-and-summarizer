// frontend/app/page.js

export default async function Home() {
  // ✅ Environment variable is read here
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  // ✅ Fetch data from your Render backend
  const res = await fetch(`${apiUrl}/_/backend/api`);
  const data = await res.json();

  return (
    <main>
      <h1>Data from Backend</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </main>
  );
}

"use client";

import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { 
  FiLogOut, FiCopy, FiTrash2, FiCheck, FiX, FiInfo, FiZap, 
  FiBookOpen, FiFileText, FiSearch, FiPlus, FiMinus,
  FiLoader, FiSun, FiMoon, FiSend, FiSave, FiStar,
  FiUserPlus, FiArrowLeft, FiClock, FiHash, FiPenTool, FiTrendingUp
} from "react-icons/fi";

export default function Home() {
  // Navigation & Session Core
  const [view, setView] = useState("login");
  const [token, setToken] = useState("");
  const [darkMode, setDarkMode] = useState(true);

  // Auth Pipeline States
  const [name, setName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Document & Processing Engine States
  const [topic, setTopic] = useState("");
  const [generatedArticle, setGeneratedArticle] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [articles, setArticles] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("writer");

  // Track if workspace is actively showing or hidden
  const [showWorkspace, setShowWorkspace] = useState(false);

  // Track expanded state for individual articles
  const [expandedArticles, setExpandedArticles] = useState({});

  // Summarizer Specific States
  const [summarizerInputMode, setSummarizerInputMode] = useState("saved"); 
  const [customTextToSummarize, setCustomTextToSummarize] = useState("");
  
  // Single Unified Destination for any generated summary content
  const [activeSummaryOutput, setActiveSummaryOutput] = useState({
    sourceTitle: "",
    text: "",
    cached: false,
    wordCount: 0,
    sourceType: ""
  });

  // UI Modals, Interactivity & Async Tracking
  const [loading, setLoading] = useState({ generate: false, save: false, load: false, summary: null, customSummary: false });
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  // Recommended Topics List
  const recommendedTopicsList = [
    { category: "AI", topic: "Future of Artificial Intelligence", icon: "🤖" },
    { category: "AI", topic: "Machine Learning Applications", icon: "🧠" },
    { category: "AI", topic: "Generative AI Revolution", icon: "✨" },
    { category: "Tech", topic: "Modern Web Development", icon: "🌐" },
    { category: "Tech", topic: "Cloud Computing Trends", icon: "☁️" },
    { category: "Tech", topic: "Mobile App Development", icon: "📱" },
    { category: "Security", topic: "Cyber Security Essentials", icon: "🔒" },
    { category: "Security", topic: "Data Privacy Guide", icon: "🛡️" },
    { category: "Finance", topic: "Stock Market Analysis", icon: "📈" },
    { category: "Finance", topic: "Personal Finance Tips", icon: "💰" },
    { category: "Finance", topic: "Cryptocurrency Trends", icon: "₿" },
    { category: "Business", topic: "Startup Growth Strategies", icon: "🚀" },
    { category: "Business", topic: "Remote Work Best Practices", icon: "🏠" },
    { category: "Business", topic: "Leadership Skills", icon: "👔" },
    { category: "Marketing", topic: "Digital Marketing Guide", icon: "📊" },
    { category: "Marketing", topic: "Content Strategy", icon: "✍️" },
    { category: "Education", topic: "Effective Study Tips", icon: "📚" },
    { category: "Education", topic: "Career Growth Paths", icon: "🎯" },
    { category: "Health", topic: "Healthy Lifestyle Habits", icon: "💪" },
    { category: "Health", topic: "Mental Wellness Guide", icon: "🧘" },
    { category: "Environment", topic: "Climate Change Solutions", icon: "🌍" },
    { category: "Environment", topic: "Green Energy Future", icon: "⚡" },
    { category: "Lifestyle", topic: "Ultimate Travel Guide", icon: "✈️" },
    { category: "Lifestyle", topic: "Productivity Hacks", icon: "⚡" }
  ];

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 4000);
  };

  const getWordCount = (text) => {
    if (!text || typeof text !== "string") return 0;
    const cleanText = text.trim();
    return cleanText === "" ? 0 : cleanText.split(/\s+/).length;
  };

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    if (savedToken && savedToken !== "undefined") {
      setToken(savedToken);
      setView("dashboard");
    }
    const savedDarkMode = localStorage.getItem("darkMode");
    if (savedDarkMode !== null) {
      setDarkMode(savedDarkMode === "true");
    } else {
      setDarkMode(true);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("darkMode", darkMode);
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  const loadArticles = useCallback(async () => {
    if (!token) return;
    setLoading((prev) => ({ ...prev, load: true }));
    try {
      const endpoint = searchQuery && activeTab !== "writer"
        ? `http://localhost:5000/api/articles?search=${encodeURIComponent(searchQuery)}`
        : "http://localhost:5000/api/articles";

      const res = await axios.get(endpoint, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setArticles(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Fetch failed:", err);
      showToast(err.response?.data?.message || "Failed to sync articles.", "error");
    } finally {
      setLoading((prev) => ({ ...prev, load: false }));
    }
  }, [token, searchQuery, activeTab]);

  useEffect(() => {
    if (!token || view !== "dashboard" || activeTab === "writer") return;
    const delayDebounceFn = setTimeout(() => loadArticles(), 400);
    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, token, view, activeTab, loadArticles]);

  useEffect(() => {
    if (token && view === "dashboard" && activeTab !== "writer") {
      loadArticles();
    }
  }, [token, view, activeTab, loadArticles]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken("");
    setView("login");
    setArticles([]);
    showToast("Logged out securely.", "info");
  };

  const registerUser = async () => {
    if (!name || !regEmail || !regPassword) return showToast("Please fill all registration fields.", "error");
    if (!regEmail.includes("@")) return showToast("Please enter a valid email address.", "error");
    
    try {
      const res = await axios.post("http://localhost:5000/api/auth/register", {
        name,
        email: regEmail,
        password: regPassword,
      });
      showToast(res.data.message || "Account created successfully!", "success");
      setView("login");
      setName("");
      setRegEmail("");
      setRegPassword("");
    } catch (err) {
      showToast(err.response?.data?.message || "Registration failed.", "error");
    }
  };

  const loginUser = async () => {
    if (!loginEmail || !loginPassword) return showToast("Please provide your login credentials.", "error");
    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", {
        email: loginEmail,
        password: loginPassword,
      });
      localStorage.setItem("token", res.data.token);
      setToken(res.data.token);
      setView("dashboard");
      showToast("Welcome back!", "success");
      setLoginEmail("");
      setLoginPassword("");
    } catch (err) {
      showToast(err.response?.data?.message || "Invalid email or password.", "error");
    }
  };

  const handleGenerateArticle = async () => {
    if (!topic) return showToast("Please enter a topic first.", "error");
    setLoading((prev) => ({ ...prev, generate: true }));
    try {
      const res = await axios.post("http://localhost:5000/api/ai/generate", { topic });
      setGeneratedArticle(res.data.article);
      setContent(res.data.article);
      
      if (title === "") {
        setTitle(`${topic} Analysis Report`);
      }
      
      setShowWorkspace(true);
      showToast("Article generated successfully!", "success");
    } catch (err) {
      showToast(err.response?.data?.message || "AI generation failed.", "error");
    } finally {
      setLoading((prev) => ({ ...prev, generate: false }));
    }
  };

  const createArticle = async () => {
    if (!title || !content) return showToast("Please provide both title and content.", "error");
    setLoading((prev) => ({ ...prev, save: true }));
    try {
      await axios.post(
        "http://localhost:5000/api/articles",
        { title, content },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      showToast("Article saved successfully!", "success");
      
      setTitle("");
      setContent("");
      setGeneratedArticle("");
      setTopic("");
      setSearchQuery("");
      setShowWorkspace(false);
      loadArticles();
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to save article.", "error");
    } finally {
      setLoading((prev) => ({ ...prev, save: false }));
    }
  };

  const deleteArticle = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/articles/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      showToast("Article deleted successfully.", "info");
      setDeleteConfirmId(null);
      loadArticles();
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to delete article.", "error");
    }
  };

  const fetchAISummaryForSaved = async (id, articleTitle) => {
    const targetArticle = articles.find(a => (a._id || a.id) === id);
    if (!targetArticle) return showToast("Article not found.", "error");

    setLoading((prev) => ({ ...prev, summary: id }));
    try {
      const res = await axios.post(
        "http://localhost:5000/api/ai/summarize-saved", 
        { text: targetArticle.content, title: articleTitle },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      const responseText = res.data.summary || res.data.text || "No summary generated.";
      
      setActiveSummaryOutput({
        sourceTitle: articleTitle,
        text: responseText,
        cached: res.data.cached || false,
        wordCount: getWordCount(responseText),
        sourceType: "saved"
      });
      
      showToast("Summary generated successfully!", "success");
    } catch (err) {
      console.error("Summary error:", err);
      showToast(err.response?.data?.message || "Summary generation failed.", "error");
    } finally {
      setLoading((prev) => ({ ...prev, summary: null }));
    }
  };

  const handleCustomSummary = async () => {
    if (!customTextToSummarize || !customTextToSummarize.trim()) {
      return showToast("Please enter text to summarize.", "error");
    }
    setLoading((prev) => ({ ...prev, customSummary: true }));
    try {
      const res = await axios.post(
        "http://localhost:5000/api/ai/summarize-custom", 
        { text: customTextToSummarize.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      const responseText = res.data.summary || res.data.text || "No summary generated.";
      
      setActiveSummaryOutput({
        sourceTitle: "Custom Text",
        text: responseText,
        cached: res.data.cached || false,
        wordCount: getWordCount(responseText),
        sourceType: "custom"
      });

      showToast("Summary generated successfully!", "success");
    } catch (err) {
      console.error("Custom summarizer failed:", err);
      showToast(err.response?.data?.message || "Summary generation failed.", "error");
    } finally {
      setLoading((prev) => ({ ...prev, customSummary: false }));
    }
  };

  const toggleReadMore = (id) => {
    setExpandedArticles(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCopyText = (textData) => {
    if (!textData) return;
    navigator.clipboard.writeText(textData);
    showToast("Copied to clipboard!", "success");
  };

  const renderLeftBoxArticles = () => {
    if (loading.load && articles.length === 0) {
      return [1, 2].map((n) => (
        <div key={n} className="p-5 border border-gray-200 dark:border-gray-700 rounded-2xl space-y-3 animate-pulse bg-white dark:bg-gray-800">
          <div className="h-4 bg-gray-100 dark:bg-gray-700 rounded w-1/3"></div>
          <div className="h-3.5 bg-gray-100 dark:bg-gray-700 rounded w-5/6"></div>
          <div className="h-3.5 bg-gray-100 dark:bg-gray-700 rounded w-1/2"></div>
        </div>
      ));
    }

    if (articles.length === 0) {
      return (
        <div className="text-center py-12 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl bg-gray-50/30 dark:bg-gray-800/30">
          <FiFileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-base font-semibold text-gray-600 dark:text-gray-400">No articles found</p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">Create your first article in the Writer Hub</p>
        </div>
      );
    }

    return articles.map((article) => {
      const articleId = article._id || article.id;
      const isExpanded = expandedArticles[articleId];
      const isSummarizing = loading.summary === articleId;
      const articleWords = getWordCount(article.content);

      return (
        <div
          key={articleId}
          className="p-5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl hover:border-indigo-300 dark:hover:border-indigo-500 hover:shadow-xl transition-all duration-300 relative animate-in fade-in duration-150 flex flex-col justify-between group"
        >
          <div>
            <div className="flex items-start justify-between gap-2 mb-3">
              <div className="flex-1">
                <h5 className="font-semibold text-gray-900 dark:text-gray-100 text-base line-clamp-1">{article.title}</h5>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-sm text-indigo-600 dark:text-indigo-400 font-medium">{articleWords} words</p>
                  <span className="text-xs text-gray-400">•</span>
                  <p className="text-xs text-gray-500 dark:text-gray-500 flex items-center gap-1"><FiClock size={10} /> {new Date(article.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
              <button
                onClick={() => handleCopyText(article.content)}
                className="opacity-0 group-hover:opacity-100 transition-all duration-300 text-xs font-bold text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 px-3 py-1.5 rounded-xl shadow-sm hover:shadow"
              >
                <FiCopy className="inline mr-1" size={12} /> Copy
              </button>
            </div>
            
            <div className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
              <p className={isExpanded ? "" : "line-clamp-2"}>
                {article.content}
              </p>
              {article.content && article.content.length > 90 && (
                <button 
                  onClick={() => toggleReadMore(articleId)}
                  className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 font-semibold mt-2 block focus:outline-none text-sm transition-colors"
                >
                  {isExpanded ? <><FiMinus className="inline mr-1" size={12} /> Show Less</> : <><FiPlus className="inline mr-1" size={12} /> Read More</>}
                </button>
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
            <button
              onClick={() => fetchAISummaryForSaved(articleId, article.title)}
              disabled={isSummarizing}
              className="text-sm text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 font-bold px-5 py-2 rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
            >
              {isSummarizing ? <><FiLoader className="inline animate-spin mr-2" size={14} /> Processing...</> : <><FiZap className="inline mr-1" size={14} /> Summarize</>}
            </button>
            <span className="text-xs text-gray-500 dark:text-gray-500 font-mono flex items-center gap-1"><FiHash className="inline" size={10} />{articleId.substring(0, 6)}</span>
          </div>
        </div>
      );
    });
  };

  const renderMainArticleFeed = () => {
    if (loading.load && articles.length === 0) {
      return [1, 2, 3].map((n) => (
        <div key={n} className="p-6 border border-gray-200 dark:border-gray-700 rounded-2xl space-y-3 animate-pulse bg-white dark:bg-gray-800">
          <div className="h-5 bg-gray-100 dark:bg-gray-700 rounded w-1/4"></div>
          <div className="h-4 bg-gray-100 dark:bg-gray-700 rounded w-5/6"></div>
          <div className="h-4 bg-gray-100 dark:bg-gray-700 rounded w-1/2"></div>
        </div>
      ));
    }

    if (articles.length === 0) {
      return (
        <div className="w-full col-span-2 flex flex-col items-center justify-center text-center py-20 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl bg-gray-50/30 dark:bg-gray-800/30">
          <FiBookOpen className="w-20 h-20 text-gray-400 mx-auto mb-4" />
          <p className="text-xl font-semibold text-gray-600 dark:text-gray-400">No articles yet</p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">Generate and save your first article in the Writer Hub</p>
        </div>
      );
    }

    return articles.map((article) => {
      const articleId = article._id || article.id;
      const isDeleting = deleteConfirmId === articleId;
      const isExpanded = expandedArticles[articleId];
      const articleWords = getWordCount(article.content);

      return (
        <div
          key={articleId}
          className="p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl hover:border-indigo-300 dark:hover:border-indigo-500 hover:shadow-2xl transition-all duration-300 relative group animate-in fade-in duration-200 flex flex-col justify-between"
        >
          <div>
            <div className="flex items-start justify-between gap-4 mb-3">
              <div className="flex-1">
                <h4 className="font-bold text-gray-900 dark:text-gray-100 text-xl mb-2">{article.title}</h4>
                <div className="flex items-center gap-3 flex-wrap">
                  <p className="text-sm text-indigo-600 dark:text-indigo-400 font-medium flex items-center gap-1">
                    <FiFileText size={14} /> {articleWords} words
                  </p>
                  <span className="text-xs text-gray-400">•</span>
                  <p className="text-xs text-gray-500 dark:text-gray-500 flex items-center gap-1"><FiClock size={12} /> {new Date(article.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
              <button
                onClick={() => handleCopyText(article.content)}
                className="text-sm font-bold text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all duration-300 flex items-center gap-1 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 px-4 py-2 rounded-xl shadow-sm hover:shadow-md"
              >
                <FiCopy size={14} /> Copy
              </button>
            </div>
            
            <div className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed mb-5">
              <p className={isExpanded ? "" : "line-clamp-3"}>
                {article.content}
              </p>
              {article.content && article.content.length > 150 && (
                <button 
                  onClick={() => toggleReadMore(articleId)}
                  className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 font-semibold mt-2 block focus:outline-none text-sm transition-colors"
                >
                  {isExpanded ? <><FiMinus className="inline mr-1" size={14} /> Show Less</> : <><FiPlus className="inline mr-1" size={14} /> Read More</>}
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700 text-sm font-medium mt-auto">
            <div className="text-sm text-gray-500 dark:text-gray-500 flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              <span>Synced to Cloud</span>
            </div>
            
            <div className="flex items-center">
              {isDeleting ? (
                <div className="flex items-center space-x-2 animate-in fade-in zoom-in-95">
                  <span className="text-rose-600 dark:text-rose-400 font-semibold text-sm">Confirm delete?</span>
                  <button onClick={() => deleteArticle(articleId)} className="text-rose-700 dark:text-rose-400 hover:underline bg-rose-50 dark:bg-rose-950/30 px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors">Yes</button>
                  <button onClick={() => setDeleteConfirmId(null)} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors text-sm">Cancel</button>
                </div>
              ) : (
                <button onClick={() => setDeleteConfirmId(articleId)} className="text-gray-500 dark:text-gray-500 hover:text-rose-600 dark:hover:text-rose-400 transition-all duration-300 font-medium flex items-center gap-1">
                  <FiTrash2 size={14} /> Delete
                </button>
              )}
            </div>
          </div>
        </div>
      );
    });
  };

  const filteredRecommendations = recommendedTopicsList.filter(item => 
    item.topic.toLowerCase().includes(topic.toLowerCase()) ||
    item.category.toLowerCase().includes(topic.toLowerCase())
  );

  return (
    <div className={`min-h-screen font-sans antialiased transition-colors duration-300 ${darkMode ? 'dark bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' : 'bg-gradient-to-br from-gray-50 via-white to-gray-50'}`}>
      
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute -top-40 -right-40 w-96 h-96 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob ${darkMode ? 'bg-indigo-600 dark:mix-blend-soft-light' : 'bg-indigo-300'}`}></div>
        <div className={`absolute -bottom-40 -left-40 w-96 h-96 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000 ${darkMode ? 'bg-purple-600 dark:mix-blend-soft-light' : 'bg-purple-300'}`}></div>
        <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000 ${darkMode ? 'bg-pink-600 dark:mix-blend-soft-light' : 'bg-pink-300'}`}></div>
      </div>

      {/* Toast Layer */}
      {toast.show && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl border shadow-2xl backdrop-blur-md transition-all duration-500 animate-in fade-in slide-in-from-bottom-4 text-sm font-medium
          ${toast.type === "success" ? (darkMode ? "bg-gray-800/95 border-emerald-800 text-gray-200" : "bg-white/95 border-emerald-200 text-gray-800") : ""}
          ${toast.type === "error" ? (darkMode ? "bg-gray-800/95 border-rose-800 text-gray-200" : "bg-white/95 border-rose-200 text-gray-800") : ""}
          ${toast.type === "info" ? (darkMode ? "bg-gray-800/95 border-blue-800 text-gray-200" : "bg-white/95 border-blue-200 text-gray-800") : ""}`}
        >
          <div className={`h-8 w-8 rounded-xl flex items-center justify-center text-base
            ${toast.type === "success" ? (darkMode ? "bg-emerald-900/50 text-emerald-400" : "bg-emerald-100 text-emerald-600") : ""}
            ${toast.type === "error" ? (darkMode ? "bg-rose-900/50 text-rose-400" : "bg-rose-100 text-rose-600") : ""}
            ${toast.type === "info" ? (darkMode ? "bg-blue-900/50 text-blue-400" : "bg-blue-100 text-blue-600") : ""}`}
          >
            {toast.type === "success" ? <FiCheck size={18} /> : toast.type === "error" ? <FiX size={18} /> : <FiInfo size={18} />}
          </div>
          <span>{toast.message}</span>
        </div>
      )}

      {/* Navigation Layer */}
      <nav className={`w-full ${darkMode ? 'bg-gray-900/90 border-gray-700' : 'bg-white/90 border-gray-200'} backdrop-blur-xl border-b shadow-xl sticky top-0 z-40 transition-all duration-300`}>
        <div className="w-full px-8 lg:px-12 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3 group cursor-pointer">
            <div className="h-10 w-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-base shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
              <FiStar size={20} />
            </div>
            <div>
              <span className={`font-bold text-xl tracking-tight ${darkMode ? 'bg-gradient-to-r from-white to-gray-400' : 'bg-gradient-to-r from-gray-900 to-gray-600'} bg-clip-text text-transparent`}>
                InkWell-AI Article Writer & Summarizer
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2.5 rounded-xl transition-all duration-300 hover:scale-105 ${
                darkMode ? 'bg-gray-800 text-gray-400 hover:bg-gray-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {darkMode ? <FiSun size={18} /> : <FiMoon size={18} />}
            </button>
            
            {view === "dashboard" ? (
              <>
                <div className={`hidden md:flex items-center gap-2 px-3 py-1.5 ${darkMode ? 'bg-indigo-950/50 border-indigo-800' : 'bg-indigo-50 border-indigo-200'} rounded-full border`}>
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className={`text-xs font-bold tracking-wide uppercase ${darkMode ? 'text-indigo-300' : 'text-indigo-700'}`}>Connected</span>
                </div>
                <button
                  onClick={handleLogout}
                  className={`text-sm font-semibold transition-all duration-300 hover:scale-105 px-4 py-1.5 rounded-xl shadow-sm hover:shadow-md ${
                    darkMode 
                      ? 'text-gray-300 hover:text-indigo-400 border-gray-600 hover:border-indigo-500 bg-gray-800' 
                      : 'text-gray-700 hover:text-indigo-600 border-gray-300 hover:border-indigo-400 bg-white'
                  } border`}
                >
                  <FiLogOut className="inline mr-1" size={14} /> Logout
                </button>
              </>
            ) : (
              <div className={`p-1 rounded-xl flex space-x-1 text-sm font-semibold ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                <button onClick={() => setView("login")} className={`px-5 py-1.5 rounded-lg transition-all duration-300 ${view === 'login' ? (darkMode ? 'bg-gray-700 text-indigo-400 shadow-md' : 'bg-white text-indigo-600 shadow-md') : (darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-900')}`}>Login</button>
                <button onClick={() => setView("register")} className={`px-5 py-1.5 rounded-lg transition-all duration-300 ${view === 'register' ? (darkMode ? 'bg-gray-700 text-indigo-400 shadow-md' : 'bg-white text-indigo-600 shadow-md') : (darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-900')}`}>Register</button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Core Layout Hub */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 py-10">
        
        {/* VIEW 1: LOGIN */}
        {view === "login" && (
          <div className="min-h-[70vh] flex items-center justify-center">
            <div className={`w-full max-w-md ${darkMode ? 'bg-gray-800/90 border-gray-700' : 'bg-white/90 border-gray-200'} backdrop-blur-xl p-8 rounded-3xl border shadow-2xl transition-all duration-300 hover:shadow-3xl`}>
              <div className="text-center mb-8">
                <div className="h-20 w-20 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl transition-transform hover:scale-110 duration-300">
                  <FiStar className="text-white" size={32} />
                </div>
                <h2 className={`text-3xl font-bold ${darkMode ? 'bg-gradient-to-r from-white to-gray-400' : 'bg-gradient-to-r from-gray-900 to-gray-600'} bg-clip-text text-transparent`}>Welcome back</h2>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} mt-2`}>Sign in to continue your creative journey</p>
              </div>
              <div className="space-y-5">
                <div>
                  <label className={`block text-xs font-bold uppercase tracking-wider ${darkMode ? 'text-gray-400' : 'text-gray-500'} mb-2`}>Email Address</label>
                  <input
                    type="email"
                    className={`w-full px-4 py-3 ${darkMode ? 'bg-gray-900 border-gray-700 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'} border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-300 text-base`}
                    placeholder="Your Email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                  />
                </div>
                <div>
                  <label className={`block text-xs font-bold uppercase tracking-wider ${darkMode ? 'text-gray-400' : 'text-gray-500'} mb-2`}>Password</label>
                  <input
                    type="password"
                    className={`w-full px-4 py-3 ${darkMode ? 'bg-gray-900 border-gray-700 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'} border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-300 text-base`}
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && loginUser()}
                  />
                </div>
                <button onClick={loginUser} className="w-full mt-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 text-sm">
                  Sign In
                </button>
                
                <div className="text-center mt-4">
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Don't have an account?{" "}
                    <button
                      onClick={() => {
                        setView("register");
                        setLoginEmail("");
                        setLoginPassword("");
                      }}
                      className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline transition-all duration-300"
                    >
                      Register here
                    </button>
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 2: REGISTER */}
        {view === "register" && (
          <div className="min-h-[70vh] flex items-center justify-center">
            <div className={`w-full max-w-md ${darkMode ? 'bg-gray-800/90 border-gray-700' : 'bg-white/90 border-gray-200'} backdrop-blur-xl p-8 rounded-3xl border shadow-2xl transition-all duration-300 hover:shadow-3xl`}>
              <div className="text-center mb-8">
                <div className="h-20 w-20 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl transition-transform hover:scale-110 duration-300">
                  <FiUserPlus className="text-white" size={32} />
                </div>
                <h2 className={`text-3xl font-bold ${darkMode ? 'bg-gradient-to-r from-white to-gray-400' : 'bg-gradient-to-r from-gray-900 to-gray-600'} bg-clip-text text-transparent`}>Create account</h2>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} mt-2`}>Join the AI writing revolution</p>
              </div>
              <div className="space-y-5">
                <div>
                  <label className={`block text-xs font-bold uppercase tracking-wider ${darkMode ? 'text-gray-400' : 'text-gray-500'} mb-2`}>Full Name</label>
                  <input
                    type="text"
                    className={`w-full px-4 py-3 ${darkMode ? 'bg-gray-900 border-gray-700 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'} border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-300 text-base`}
                    placeholder="Your Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div>
                  <label className={`block text-xs font-bold uppercase tracking-wider ${darkMode ? 'text-gray-400' : 'text-gray-500'} mb-2`}>Email Address</label>
                  <input
                    type="email"
                    className={`w-full px-4 py-3 ${darkMode ? 'bg-gray-900 border-gray-700 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'} border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-300 text-base`}
                    placeholder="Your Email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                  />
                </div>
                <div>
                  <label className={`block text-xs font-bold uppercase tracking-wider ${darkMode ? 'text-gray-400' : 'text-gray-500'} mb-2`}>Password</label>
                  <input
                    type="password"
                    className={`w-full px-4 py-3 ${darkMode ? 'bg-gray-900 border-gray-700 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'} border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-300 text-base`}
                    placeholder="••••••••"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                  />
                </div>
                <button onClick={registerUser} className="w-full mt-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 text-sm">
                  Create Account
                </button>
                
                <div className="text-center mt-4">
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Already have an account?{" "}
                    <button
                      onClick={() => {
                        setView("login");
                        setName("");
                        setRegEmail("");
                        setRegPassword("");
                      }}
                      className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline transition-all duration-300"
                    >
                      Login here
                    </button>
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 3: MAIN INSTANCE WORKSPACE */}
        {view === "dashboard" && (
          <div className="space-y-8">
            {/* Modern Tab Navigation */}
            <div className={`flex gap-3 ${darkMode ? 'bg-gray-800/90 border-gray-700' : 'bg-white/90 border-gray-200'} backdrop-blur-xl p-2 rounded-2xl shadow-xl border w-fit mx-auto`}>
              {[
                { id: "writer", label: "✍️ Writer Hub", icon: FiPenTool },
                { id: "articles", label: "📚 Saved Articles", icon: FiBookOpen },
                { id: "summary", label: "🤖 Summarizer", icon: FiZap }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => { setActiveTab(tab.id); }}
                  className={`px-7 py-2.5 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 text-sm ${
                    activeTab === tab.id 
                      ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg transform scale-105" 
                      : (darkMode ? "text-gray-400 hover:text-gray-200 hover:bg-gray-700" : "text-gray-600 hover:text-gray-900 hover:bg-gray-100")
                  }`}
                >
                  {activeTab === tab.id && tab.icon && <tab.icon size={16} />}
                  {tab.label}
                </button>
              ))}
            </div>

            {/* TAB CONTENT 1: WRITER HUB */}
            {activeTab === "writer" && (
              <div className="w-full max-w-4xl mx-auto space-y-10 text-center animate-in fade-in duration-300">
                
                {!showWorkspace && (
                  <div className="space-y-6 pt-6">
                    <div className="relative max-w-3xl mx-auto group">
                      <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                        <FiSearch className={`${darkMode ? 'text-gray-500' : 'text-gray-400'}`} size={20} />
                      </div>
                      <input
                        type="text"
                        className={`w-full pl-14 pr-40 py-5 ${darkMode ? 'bg-gray-800/90 border-gray-700 text-white placeholder-gray-500' : 'bg-white/90 border-gray-200 text-gray-900 placeholder-gray-400'} backdrop-blur-xl border rounded-2xl shadow-lg focus:outline-none focus:ring-4 focus:ring-indigo-500/30 focus:border-indigo-500 focus:shadow-xl transition-all duration-300 text-lg`}
                        placeholder="What do you want to write about?"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleGenerateArticle()}
                      />
                      
                      <button
                        onClick={handleGenerateArticle}
                        disabled={loading.generate}
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 text-white text-sm font-bold px-7 py-2.5 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg flex items-center gap-2"
                      >
                        {loading.generate ? <><FiLoader className="animate-spin" size={16} /> Drafting...</> : <><FiSend size={16} /> Generate</>}
                      </button>
                    </div>

                    <div className="max-w-3xl mx-auto">
                      <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} font-bold uppercase tracking-wider text-left mb-4 flex items-center gap-2`}>
                        <FiTrendingUp size={14} className="text-indigo-500" />
                        Trending Topics
                      </p>
                      <div className="flex flex-wrap justify-start gap-3 max-h-48 overflow-y-auto custom-scrollbar pb-2">
                        {filteredRecommendations.length > 0 ? (
                          filteredRecommendations.map((item, idx) => (
                            <button
                              key={idx}
                              onClick={() => {
                                setTopic(item.topic);
                                showToast(`Topic loaded: "${item.topic}"`, "info");
                              }}
                              className={`inline-flex items-center gap-2 px-4 py-2 ${darkMode ? 'bg-gray-800 border-gray-700 text-gray-300 hover:border-indigo-500' : 'bg-white border-gray-200 text-gray-700 hover:border-indigo-400'} border rounded-full hover:shadow-lg text-sm font-medium transition-all duration-300 transform hover:scale-105`}
                            >
                              <span className="text-lg">{item.icon}</span>
                              <span className="font-semibold text-indigo-600 dark:text-indigo-400 text-xs uppercase">{item.category}</span>
                              <span className="truncate max-w-[200px]">{item.topic}</span>
                            </button>
                          ))
                        ) : (
                          <p className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-400'} italic`}>No matching suggestions</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {showWorkspace && (
                  <div className={`${darkMode ? 'bg-gray-800/95 border-gray-700' : 'bg-white/95 border-gray-200'} backdrop-blur-xl border rounded-2xl shadow-2xl text-left max-w-4xl mx-auto p-8 space-y-6 animate-in fade-in zoom-in-95 duration-300`}>
                    
                    <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-4">
                      <h3 className={`font-bold ${darkMode ? 'text-gray-100' : 'text-gray-900'} text-sm uppercase tracking-wider flex items-center gap-2`}>
                        <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center">
                          <FiStar className="text-white" size={14} />
                        </div>
                        Dynamic Production Workspace
                      </h3>
                      <button 
                        onClick={() => setShowWorkspace(false)} 
                        className="text-sm text-indigo-600 dark:text-indigo-400 font-semibold hover:underline bg-indigo-50 dark:bg-indigo-950/50 px-4 py-2 rounded-lg transition-all duration-300 hover:shadow-md"
                      >
                        <FiArrowLeft className="inline mr-1" size={14} /> Back to Search
                      </button>
                    </div>

                    <div className="space-y-3">
                      <label className={`block text-xs font-bold ${darkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider`}>
                        Article Title
                      </label>
                      <input
                        type="text"
                        className={`w-full px-5 py-3.5 ${darkMode ? 'bg-gray-900/50 border-gray-700 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'} border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-300 text-base font-semibold`}
                        placeholder="Enter a compelling title..."
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                      />
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <label className={`block text-xs font-bold ${darkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider`}>
                          Article Content
                        </label>
                        <span className="text-sm bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent font-bold">{getWordCount(content)} words</span>
                      </div>
                      <textarea
                        className={`w-full px-5 py-3.5 ${darkMode ? 'bg-gray-900/50 border-gray-700 text-gray-300' : 'bg-gray-50 border-gray-200 text-gray-700'} border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-300 text-base leading-relaxed min-h-[300px] font-medium`}
                        placeholder="Your generated content will appear here. You can edit it freely..."
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                      />
                    </div>

                    <button
                      onClick={createArticle}
                      disabled={loading.save}
                      className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 text-sm uppercase tracking-wider transform hover:scale-105"
                    >
                      {loading.save ? <><FiLoader className="animate-spin" size={18} /> Saving...</> : <><FiSave size={18} /> Save Article</>}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT 2: SAVED ARTICLES FEED */}
            {activeTab === "articles" && (
              <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in duration-200">
                <div className="relative">
                  <FiSearch className={`absolute left-4 top-1/2 transform -translate-y-1/2 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} size={18} />
                  <input
                    type="text"
                    placeholder="Search your articles..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`w-full pl-12 pr-4 py-3 ${darkMode ? 'bg-gray-800/90 border-gray-700 text-white' : 'bg-white/90 border-gray-200 text-gray-900'} backdrop-blur-xl border rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-300 text-base`}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {renderMainArticleFeed()}
                </div>
              </div>
            )}

            {/* TAB CONTENT 3: SUMMARIZER CONSOLE HUB */}
            {activeTab === "summary" && (
              <div className="w-full max-w-7xl mx-auto animate-in fade-in duration-200">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  
                  <div className={`lg:col-span-6 ${darkMode ? 'bg-gray-800/95 border-gray-700' : 'bg-white/95 border-gray-200'} backdrop-blur-xl border rounded-2xl p-6 shadow-xl min-h-[500px] flex flex-col`}>
                    
                    <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-3 mb-5">
                      <div className="flex items-center space-x-2">
                        <div className="h-3 w-3 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 animate-pulse" />
                        <h4 className={`font-bold ${darkMode ? 'text-gray-100' : 'text-gray-900'} text-sm uppercase tracking-wider`}>Article Summarizer</h4>
                      </div>

                      <div className={`flex ${darkMode ? 'bg-gray-900' : 'bg-gray-100'} p-1 rounded-xl text-xs font-bold uppercase tracking-tight`}>
                        <button 
                          onClick={() => setSummarizerInputMode("saved")} 
                          className={`px-5 py-1.5 rounded-lg transition-all duration-300 ${summarizerInputMode === "saved" ? (darkMode ? 'bg-gray-700 text-indigo-400 shadow-md' : 'bg-white text-indigo-600 shadow-md') : (darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700')}`}
                        >
                          📚 Saved
                        </button>
                        <button 
                          onClick={() => setSummarizerInputMode("custom")} 
                          className={`px-5 py-1.5 rounded-lg transition-all duration-300 ${summarizerInputMode === "custom" ? (darkMode ? 'bg-gray-700 text-indigo-400 shadow-md' : 'bg-white text-indigo-600 shadow-md') : (darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700')}`}
                        >
                          ✏️ Custom
                        </button>
                      </div>
                    </div>

                    {summarizerInputMode === "saved" && (
                      <div className="flex-1 flex flex-col">
                        <div className="space-y-4 max-h-[450px] overflow-y-auto pr-1 custom-scrollbar">
                          {renderLeftBoxArticles()}
                        </div>
                      </div>
                    )}

                    {summarizerInputMode === "custom" && (
                      <div className="flex-1 flex flex-col justify-between space-y-4">
                        <div className="flex-1 flex flex-col space-y-3">
                          <textarea
                            className={`w-full px-4 py-3 ${darkMode ? 'bg-gray-900/50 border-gray-700 text-gray-300' : 'bg-gray-50 border-gray-200 text-gray-700'} border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-300 text-sm leading-relaxed flex-1 min-h-[350px] font-medium`}
                            placeholder="Paste your text here...\n\nAny article, blog post, or document you want to summarize..."
                            value={customTextToSummarize}
                            onChange={(e) => setCustomTextToSummarize(e.target.value)}
                          />
                          <div className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'} px-1 text-right flex justify-between items-center`}>
                            <span>📊 {getWordCount(customTextToSummarize)} words</span>
                            <span>{customTextToSummarize.length} characters</span>
                          </div>
                        </div>

                        <button
                          onClick={handleCustomSummary}
                          disabled={loading.customSummary}
                          className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 text-white font-bold text-sm rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 transform hover:scale-105"
                        >
                          {loading.customSummary ? <><FiLoader className="animate-spin" size={16} /> Analyzing...</> : <><FiZap size={16} /> Generate Summary</>}
                        </button>
                      </div>
                    )}
                  </div>

                  <div className={`lg:col-span-6 ${darkMode ? 'bg-gray-800/95 border-gray-700' : 'bg-white/95 border-gray-200'} backdrop-blur-xl border rounded-2xl p-6 shadow-xl min-h-[500px] flex flex-col justify-between`}>
                    
                    <div className="w-full">
                      <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-3 mb-5">
                        <h4 className={`font-bold ${darkMode ? 'text-gray-100' : 'text-gray-900'} text-sm uppercase tracking-wider flex items-center gap-2`}>
                          <FiFileText size={14} />
                          Summary Output
                        </h4>
                        {activeSummaryOutput.text && (
                          <button 
                            onClick={() => handleCopyText(activeSummaryOutput.text)}
                            className={`text-xs font-bold ${darkMode ? 'text-indigo-400 bg-indigo-950/50 border-indigo-800' : 'text-indigo-600 bg-indigo-50 border-indigo-200'} border px-4 py-1.5 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 flex items-center gap-1 hover:scale-105`}
                          >
                            <FiCopy size={12} /> Copy
                          </button>
                        )}
                      </div>

                      {activeSummaryOutput.text ? (
                        <div className="space-y-4 animate-in fade-in zoom-in-95 duration-150">
                          
                          <div className={`${darkMode ? 'bg-indigo-950/30 border-indigo-800' : 'bg-indigo-50 border-indigo-200'} border rounded-xl p-4 flex flex-wrap gap-3 items-center justify-between text-sm font-semibold`}>
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center">
                                <FiStar className="text-white" size={14} />
                              </div>
                              <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>{activeSummaryOutput.sourceTitle}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-1 rounded-lg ${darkMode ? 'bg-gray-800 text-indigo-400 border-indigo-800' : 'bg-white text-indigo-700 border-indigo-200'} border text-xs uppercase font-bold`}>
                                {activeSummaryOutput.sourceType === "saved" ? "Saved Article" : "Custom Text"}
                              </span>
                              <span className={`px-2 py-1 rounded-lg ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'} text-xs font-bold`}>
                                📊 {activeSummaryOutput.wordCount} words
                              </span>
                            </div>
                          </div>

                          <div className={`border ${darkMode ? 'border-gray-700 bg-gray-900/30 text-gray-300' : 'border-gray-200 bg-gray-50 text-gray-700'} rounded-xl p-5 text-sm font-medium leading-relaxed min-h-[250px] max-h-[400px] overflow-y-auto custom-scrollbar`}>
                            {activeSummaryOutput.text}
                          </div>

                          <div className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'} pt-3 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'} flex justify-between items-center`}>
                            <span className="flex items-center gap-1">
                              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                              Pipeline Active
                            </span>
                            <span className="flex items-center gap-1">
                              {activeSummaryOutput.cached ? (
                                <><FiZap size={12} className="text-indigo-500" /> Cache Hit</>
                              ) : (
                                <><FiStar size={12} className="text-indigo-500" /> Gemini AI</>
                              )}
                            </span>
                          </div>

                        </div>
                      ) : (
                        <div className={`border-2 border-dashed ${darkMode ? 'border-gray-700' : 'border-gray-200'} rounded-2xl p-10 text-center flex flex-col items-center justify-center min-h-[350px]`}>
                          <div className={`w-24 h-24 ${darkMode ? 'bg-indigo-950/50' : 'bg-indigo-100'} rounded-2xl flex items-center justify-center mb-4 transition-all duration-300 hover:scale-110`}>
                            <FiZap className="text-indigo-600 dark:text-indigo-400" size={40} />
                          </div>
                          <p className={`text-lg font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>No summary yet</p>
                          <p className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-400'} mt-2`}>Select an article or paste text to summarize</p>
                        </div>
                      )}
                    </div>
                  </div>

                </div>
              </div>
            )}
          </div>
        )}
      </main>

      <style jsx>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: ${darkMode ? '#1f2937' : '#f1f1f1'};
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #6366f1, #a855f7);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #4f46e5, #9333ea);
        }
        .shadow-3xl {
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        }
      `}</style>
    </div>
  );
}
