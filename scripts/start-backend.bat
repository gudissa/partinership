@echo off
REM Start PMS Backend Server
echo Starting PMS Backend Server...
cd /d "%~dp0..\backend"
call npm start
pause

