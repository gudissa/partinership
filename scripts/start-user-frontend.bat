@echo off
REM Start PMS User Frontend
echo Starting PMS User Frontend...
cd /d "%~dp0..\user-frontend"
call npm run preview
pause

