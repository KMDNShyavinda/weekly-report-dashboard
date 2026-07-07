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

## Roles
- **Team Member** — can create, edit, and submit their own weekly reports
- **Manager** — can view all reports, manage projects, and see dashboard analytics
