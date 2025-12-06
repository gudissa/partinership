@echo off
REM Configure Windows Firewall for PMS
echo Configuring Windows Firewall for PMS...
echo.
echo This script requires Administrator privileges.
echo.

REM Check for admin privileges
net session >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: This script must be run as Administrator!
    echo Right-click and select "Run as administrator"
    pause
    exit /b 1
)

echo Creating firewall rules...
echo.

REM Backend API (Port 5000)
netsh advfirewall firewall delete rule name="PMS Backend API" >nul 2>&1
netsh advfirewall firewall add rule name="PMS Backend API" dir=in action=allow protocol=TCP localport=5000
echo [OK] Port 5000 (Backend API) - ALLOWED

REM Admin Frontend (Port 5173)
netsh advfirewall firewall delete rule name="PMS Admin Frontend" >nul 2>&1
netsh advfirewall firewall add rule name="PMS Admin Frontend" dir=in action=allow protocol=TCP localport=5173
echo [OK] Port 5173 (Admin Frontend) - ALLOWED

REM User Frontend (Port 5174)
netsh advfirewall firewall delete rule name="PMS User Frontend" >nul 2>&1
netsh advfirewall firewall add rule name="PMS User Frontend" dir=in action=allow protocol=TCP localport=5174
echo [OK] Port 5174 (User Frontend) - ALLOWED

echo.
echo ========================================
echo Firewall configuration complete!
echo ========================================
echo.
echo Ports opened:
echo   - 5000  (Backend API)
echo   - 5173  (Admin Frontend)
echo   - 5174  (User Frontend)
echo.
pause

