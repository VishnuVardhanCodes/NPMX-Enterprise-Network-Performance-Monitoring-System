@echo off
title NPMX Enterprise Network Performance Monitoring System
echo ============================================================
echo      NPMX ENTERPRISE - INITIALIZING MONITORING STACK
echo ============================================================

:: Start Backend
echo Starting Backend API...
cd backend
start cmd /k "python app.py"
cd ..

:: Start Frontend
echo Starting Frontend UI...
cd frontend
start cmd /k "npm run dev"
cd ..

:: Open Browser
echo Waiting for services to initialize...
timeout /t 5
start http://localhost:5173

echo ============================================================
echo      STACK DEPLOYED - SYSTEM MONITORING ENGAGED
echo ============================================================
pause
