
<h1 align="center">✨ InkWell-AI Article Writer & Summarizer ✨</h1>


Live Demo💥

<video src="https://github.com/user-attachments/assets/98ed75d9-2d34-4f1a-aa4a-f97777cfb58a" controls width="600">
</video>

Highlights:


- ✍️ AI-powered article generation
- 📄 Intelligent article summarization
- 🔐 User authentication and authorization using JWT
- 👤 User account management
- 📚 Save and manage generated articles
- 🔍 Search and browse articles
- 📱 Responsive and modern UI
- ⚡ Fast performance with Next.js


---

## 🧪 .env Setup

### Backend (`/backend`)

```
PORT=5001
MONGO_URI=your_mongo_uri
JWT_SECRET_KEY=your_jwt_secret
NODE_ENV=development
ELASTIC_URL=your_elastic_url
GEMINI_API_KEY=your_gemini_api_key
UPSTASH_REDIS_REST_URL=your_upstash_redis_rest_url
UPSTASH_REDIS_REST_TOKEN=your_upstash_redis_rest_token
```


## 🔧 Run the Backend

```bash
cd backend
npm install
npm run dev
```

## 💻 Run the Frontend

```bash
cd frontend
npm install
npm run dev
```

## 🛠️ Tech Stack

### 🎨 Frontend

* ⚛️ React.js
* ▲ Next.js
* 🎨 Tailwind CSS
* 🔄 Axios

### ⚙️ Backend

* 🟢 Node.js
* 🚀 Express.js
* 🍃 MongoDB
* 📦 Mongoose

### 🔍 Search & Caching

* 🔎 Elasticsearch
* ⚡ Redis

### 🔐 Authentication

* 🛡️ JWT (JSON Web Token)

### 🤖 AI Integration

* ✨ Google Gemini API
* 🧠 OpenAI API

*## How It Works

* 🔐 Users create an account and log in securely using JWT authentication.
* ✍️ Generate high-quality articles through AI-powered content generation.
* 📄 Summarize lengthy articles instantly for quick understanding.
* 🗄️ Store articles persistently in MongoDB.
* 🔍 Search articles efficiently with Elasticsearch indexing.
* ⚡ Improve performance using Redis caching for frequently accessed data.
* 📚 View, search, and manage saved articles from a centralized dashboard.
* 🔗 REST APIs seamlessly connect the frontend, backend, AI services, and databases.
