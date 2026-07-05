# IMUCET LMS Platform

A premium, localized AI-powered Learning Management System for IMUCET aspirants built with React + Vite (Frontend) and Express + MongoDB (Backend).

## Requirements
- Node.js v16+
- MongoDB installed and running locally on `mongodb://localhost:27017`

## Setup & Running Locally

### 1. Backend Setup
1. Open a terminal and navigate to the `backend` folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Seed the database with initial questions and mock scenarios:
   ```bash
   npm run seed
   ```
4. Start the backend server:
   ```bash
   npm start
   ```
   *The backend will run on `http://localhost:5000`*

### 2. Frontend Setup
1. Open a new terminal in the root directory.
2. Install dependencies (if you haven't already):
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *The frontend will run typically on `http://localhost:5174` (or 5173/5175). It is pre-configured to proxy `/api` requests automatically to the backend.*

## 3. Production Deployment (Vercel / Render)

### Frontend (Vercel)
1. Push the repository to GitHub.
2. Go to [Vercel](https://vercel.com) and import the root directory.
3. Vercel automatically detects React/Vite. Set `Build Command` to `npm run build` and `Output Directory` to `dist`.
4. Define your backend API URL in Vercel environment variables (e.g., `VITE_API_URL=https://imupilot-api.onrender.com`).

### Backend (Render / Heroku)
1. On [Render](https://render.com), create a new Web Service.
2. Select the repository and specify the `backend/` directory as the Root Directory.
3. Set the start command to `npm start`.
4. Add environment variables:
   - `MONGODB_URI`: Your MongoDB Atlas connection string.
   - `JWT_SECRET`: A secure random secret key.

## Core Features Implemented
- **Premium UI:** Stripe-inspired styling with native Dark/Light mode support.
- **Mock Test Engine:** Real exam interface, timer, palettes, and autosubmit features mapped exactly to computer-based tests.
- **Smart Revision:** Spaced repetition 3D flashcards.
- **Backend Architecture:** Robust schemas built out using Mongoose for `Users`, `Questions`, `Tests`, `Results`, and `Analytics`.
- **API Endpoints:** Authentication (Login/Register with JWT) and performance tracking routes implemented.
- **Admin Panel:** A hidden route `/admin` handling content injection directly into the MongoDB.
