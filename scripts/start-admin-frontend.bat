@echo off
REM Start PMS Admin Frontend
echo Starting PMS Admin Frontend...
cd /d "%~dp0..\frontend"
call npm run preview
pause

