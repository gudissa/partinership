@echo off
REM Get Server IP Address for Configuration
echo ========================================
echo PMS Server IP Address Configuration
echo ========================================
echo.

echo Finding network adapters...
echo.

REM Get IPv4 addresses
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /i "IPv4"') do (
    set ip=%%a
    set ip=!ip: =!
    echo Found IP: !ip!
)

echo.
echo ========================================
echo Configuration Instructions:
echo ========================================
echo.
echo 1. Use one of the IP addresses above (usually the one starting with 192.168.x.x or 10.x.x.x)
echo.
echo 2. Update backend\.env:
echo    ADMIN_APP_URL=http://YOUR_IP:5173
echo    USER_APP_URL=http://YOUR_IP:5174
echo    CORS_ORIGINS=http://YOUR_IP:5173,http://YOUR_IP:5174
echo.
echo 3. Update frontend\.env:
echo    VITE_API_URL=http://YOUR_IP:5000
echo.
echo 4. Update user-frontend\.env:
echo    VITE_API_URL=http://YOUR_IP:5000
echo.
echo 5. Access from client computers:
echo    Admin: http://YOUR_IP:5173
echo    User:  http://YOUR_IP:5174
echo.
pause

