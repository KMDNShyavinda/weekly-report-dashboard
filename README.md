# Weekly Report Generator & Team Dashboard

A full-stack MERN application for team weekly reporting with role-based access.

---

## Prerequisites
- Node.js v18+
- MongoDB Atlas account (or local MongoDB)
- Git

---

## 1. Installing Dependencies

```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

---

## 2. Running the Backend

```bash
cd server
npm run dev
```
Server runs at: `http://localhost:5000`

---

## 3. Running the Frontend

```bash
cd client
npm run dev
```
Client runs at: `http://localhost:5173`

---

## 4. Database Setup

1. Create a free cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Get your connection string (looks like `mongodb+srv://...`)
3. Create `server/.env` and add:

```
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key_here
PORT=5000
```

---

## 5. AI Assistant (Optional Enhancement)

This application includes an optional manager-facing AI assistant for conversational Q&A and team activity summaries.

### Setup
1. Add `GOOGLE_API_KEY` to `server/.env`.
2. Restart the backend.

Example `server/.env` additions:

```
GOOGLE_API_KEY=your_google_api_key_here
```

### How it works
- The backend route `POST /api/assistant/message` is protected and available only to managers.
- It collects recent report summaries from the review queue and sends them to Google Gemini as assistant context.
- The assistant can answer manager questions about team work, blockers, workload imbalances, and report review status.

### Data privacy notes
- Only recent report summaries are sent to the model; no user passwords or auth tokens are included.
- The assistant uses only report data already stored in the app and does not pull from external sources.
- If the API key is missing, the assistant endpoint returns a clear error rather than attempting a request.

---

## Roles
- **Team Member** — can create, edit, and submit their own weekly reports
- **Manager** — can view all reports, manage projects, and see dashboard analytics
