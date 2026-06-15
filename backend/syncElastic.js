// backend/syncElastic.js
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Article = require("./models/Article");
const esClient = require("./config/elasticClient");

dotenv.config();
const INDEX_NAME = "articles";

const syncDatabaseToElastic = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected for Sync...");

    // Grab all current records
    const articles = await Article.find({});
    console.log(`Found ${articles.length} articles to synchronize.`);

    for (const article of articles) {
      // Using index with a specified ID makes this operation idempotent (Upsert)
      await esClient.index({
        index: INDEX_NAME,
        id: article._id.toString(),
        document: {
          id: article._id.toString(),
          title: article.title,
          content: article.content,
          authorId: article.authorId.toString(),
          isDeleted: false,
        },
      });
    }

    console.log("Elasticsearch Synchronization complete successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Sync pipeline crashed:", error);
    process.exit(1);
  }
};

syncDatabaseToElastic();