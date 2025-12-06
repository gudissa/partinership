@echo off
REM Quick Deployment Script for Windows Server
echo ========================================
echo PMS Quick Deployment Script
echo ========================================
echo.
echo This script will:
echo   1. Install dependencies
echo   2. Configure firewall
echo   3. Build frontend applications
echo   4. Start all services
echo.
pause

REM Check for admin privileges
net session >nul 2>&1
if %errorlevel% neq 0 (
    echo WARNING: Some steps require Administrator privileges.
    echo Please run this script as Administrator for full functionality.
    echo.
    pause
)

echo [Step 1/4] Installing backend dependencies...
cd /d "%~dp0..\backend"
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Backend installation failed!
    pause
    exit /b 1
)

echo.
echo [Step 2/4] Installing frontend dependencies...
cd /d "%~dp0..\frontend"
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Frontend installation failed!
    pause
    exit /b 1
)

cd /d "%~dp0..\user-frontend"
call npm install
if %errorlevel% neq 0 (
    echo ERROR: User frontend installation failed!
    pause
    exit /b 1
)

echo.
echo [Step 3/4] Building frontend applications...
cd /d "%~dp0..\frontend"
call npm run build
if %errorlevel% neq 0 (
    echo ERROR: Frontend build failed!
    pause
    exit /b 1
)

cd /d "%~dp0..\user-frontend"
call npm run build
if %errorlevel% neq 0 (
    echo ERROR: User frontend build failed!
    pause
    exit /b 1
)

echo.
echo [Step 4/4] Configuring firewall...
call "%~dp0configure-firewall.bat"

echo.
echo ========================================
echo Deployment Complete!
echo ========================================
echo.
echo IMPORTANT: Before starting services:
echo   1. Configure .env files with your server IP address
echo   2. Run get-server-ip.bat to find your IP
echo   3. Update all .env files with the correct IP
echo.
echo To start services, run: start-all.bat
echo.
pause

