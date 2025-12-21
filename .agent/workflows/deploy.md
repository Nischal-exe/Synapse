---
description: Deployment Guide for Synapse Full-Stack App
---

This workflow provides instructions for deploying the Synapse application (FastAPI + React) to **Render.com**.

### 1. Database Setup (Render PostgreSQL)
1. Go to [Render Dashboard](https://dashboard.render.com/).
2. Click **New +** and select **PostgreSQL**.
3. Name your database (e.g., `synapse-db`) and create it.
4. Copy the **Internal Database URL** for the backend and **External Database URL** for local testing.

### 2. Backend Deployment (FastAPI)
1. In Render, click **New +** and select **Web Service**.
2. Connect your GitHub repository.
3. Configure the service:
   - **Name**: `synapse-backend`
   - **Root Directory**: `backend`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `python -m uvicorn app.main:app --host 0.0.0.0 --port 10000`
4. Add **Environment Variables**:
   - `DATABASE_URL`: Your Render PostgreSQL Internal URL.
   - `SECRET_KEY`: A long random string (e.g., generated with `openssl rand -hex 32`).
   - `ALGORITHM`: `HS256`
   - `RESEND_API_KEY`: Your Resend API key.
   - `REDIS_URL`: (Optional) Render Redis URL if you add a Redis service.

### 3. Frontend Deployment (Static Site)
1. In Render, click **New +** and select **Static Site**.
2. Connect your GitHub repository.
3. Configure the service:
   - **Name**: `synapse-frontend`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Publish Directory**: `dist`
4. Add **Environment Variables**:
   - `VITE_API_BASE_URL`: The URL of your backend service (e.g., `https://synapse-backend.onrender.com`).

### 4. Final Configuration
1. **CORS**: Update `backend/app/main.py` to include your production frontend URL in `allow_origins`.
2. **Environment File**: Ensure all `.env` variables are correctly set in the Render dashboard for both services.