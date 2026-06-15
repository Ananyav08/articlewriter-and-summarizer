// backend/config/elasticClient.js
const { Client } = require("@elastic/elasticsearch");
const dotenv = require("dotenv");

dotenv.config();

const esClient = new Client({
  node: process.env.ELASTIC_URL || "http://192.168.1.151:9200",
});

// Helper function to verify connection
const checkElasticConnection = async () => {
  try {
    await esClient.ping();
    console.log("Elasticsearch Connected Successfully");
  } catch (error) {
    console.error("Elasticsearch Connection Failed:", error.message);
  }
};

checkElasticConnection();

module.exports = esClient;