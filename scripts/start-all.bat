@echo off
REM Start All PMS Services
echo ========================================
echo Starting Partnership Management System
echo ========================================
echo.

REM Start Backend
echo [1/3] Starting Backend Server...
start "PMS Backend" cmd /k "cd /d %~dp0..\backend && npm start"

timeout /t 3 /nobreak >nul

REM Start Admin Frontend
echo [2/3] Starting Admin Frontend...
start "PMS Admin Frontend" cmd /k "cd /d %~dp0..\frontend && npm run preview"

timeout /t 3 /nobreak >nul

REM Start User Frontend
echo [3/3] Starting User Frontend...
start "PMS User Frontend" cmd /k "cd /d %~dp0..\user-frontend && npm run preview"

echo.
echo ========================================
echo All services are starting...
echo ========================================
echo.
echo Backend API: http://localhost:5000
echo Admin Frontend: http://localhost:5173
echo User Frontend: http://localhost:5174
echo.
echo To access from network, use your server IP address instead of localhost
echo.
pause

