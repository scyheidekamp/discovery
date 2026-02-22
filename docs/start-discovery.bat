@echo off
cd /d "S:\0claude_experiments\discovery"

:: Start the dev server in a new window
start "Dev Server" cmd /k "npm run dev"

:: Wait a few seconds for the server to start
timeout /t 3 /nobreak > nul

:: Open the browser
start "" "http://localhost:5173"