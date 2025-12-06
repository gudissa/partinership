@echo off
REM Install PMS as Windows Service using PM2
echo Installing PMS as Windows Service...
echo.

REM Check if PM2 is installed
where pm2 >nul 2>&1
if %errorlevel% neq 0 (
    echo PM2 is not installed. Installing PM2...
    call npm install -g pm2
    call npm install -g pm2-windows-startup
    echo.
)

echo Starting backend service...
cd /d "%~dp0..\backend"
call pm2 start ecosystem.config.js --env production

echo Starting admin frontend...
cd /d "%~dp0..\frontend"
call pm2 start npm --name "pms-admin" -- run preview

echo Starting user frontend...
cd /d "%~dp0..\user-frontend"
call pm2 start npm --name "pms-user" -- run preview

echo.
echo Saving PM2 configuration...
call pm2 save

echo.
echo Setting up PM2 to start on Windows boot...
call pm2 startup

echo.
echo ========================================
echo Installation complete!
echo ========================================
echo.
echo Services are now configured to start automatically on boot.
echo.
echo To manage services:
echo   pm2 list          - View all services
echo   pm2 logs          - View logs
echo   pm2 restart all    - Restart all services
echo   pm2 stop all      - Stop all services
echo.
pause

