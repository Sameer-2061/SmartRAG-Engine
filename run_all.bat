@echo off
echo Starting RAG-MERN Development Environment...

:: Start Backend
start "Backend Server" /D "%~dp0\backend" npm run dev

:: Start Frontend
start "Frontend App" /D "%~dp0\frontend\frontend-app" npm run dev

:: Yeh exit command main controller window ko turant band kar degi
exit