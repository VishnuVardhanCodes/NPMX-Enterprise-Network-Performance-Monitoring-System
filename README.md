# NPM-PRO — Network Performance Monitoring System

A complete, self-hosted, offline-capable Network Performance Monitoring (NPM) web application with a modern Dashboard built on React, Tailwind, and Framer Motion with a scalable Flask + MySQL Backend.

## Features

- **Modern Dashboard UI:** Glassmorphism, animated charts, and dark theme UI layout.
- **Background Monitoring:** Thread-based background worker that checks server health.
- **Topology Map:** Visual map of your local instance acting as source monitoring destination nodes.
- **Detailed Analytics:** Latency, Jitter, Packet Loss, Throughput.
- **Self-Hosted Offline Mode:** Doesn't require active internet post-installation.

## Tech Stack
- Frontend: ReactJS, Vite, TailwindCSS, Framer Motion, Chart.js
- Backend: Flask, Python, PySNMP, Ping3
- Database: MySQL
- Production Target Server: Apache (Ubuntu 24.04 LTS)

## Run Locally (Dev)
1. Setup DB
   - Import `database/schema.sql` into MySQL.
   - Enter credentials in `backend/config.py`.

2. Backend
   ```
   cd backend
   pip install -r requirements.txt
   python app.py
   ```

3. Frontend
   ```
   cd frontend
   npm install
   npm run dev
   ```
