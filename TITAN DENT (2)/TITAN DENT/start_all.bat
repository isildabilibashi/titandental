@echo off
echo ========================================
echo Starting TITAN DENT Application
echo ========================================
echo.

echo [1/2] Starting Python Flask Backend...
start "Flask Backend" cmd /k "cd /d %~dp0TITAN DENT\backend && python app.py"

timeout /t 3 /nobreak >nul

echo.
echo [2/2] Starting Vite Frontend...
start "Vite Frontend" cmd /k "cd /d %~dp0TITAN DENT\titan-dental-connect-main && npm run dev"

echo.
echo ========================================
echo Servers starting...
echo ========================================
echo.
echo The application will open in your browser automatically.
echo Frontend: http://localhost:8080
echo Backend:  http://localhost:5000
echo.
echo If the browser doesn't open, manually go to: http://localhost:8080
echo ========================================

timeout /t 5 /nobreak >nul

start http://localhost:8080