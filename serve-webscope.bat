@echo off
echo ========================================
echo   WebScope - Serve
echo ========================================
echo.

cd /d "%~dp0"

where npm >nul 2>nul
if errorlevel 1 (
    echo [!] npm was not found on this system.
    echo     Install Node.js from https://nodejs.org and try again.
    pause
    exit /b 1
)

if not exist "node_modules" (
    echo [1/3] Installing dependencies...
    call npm install
    if errorlevel 1 goto error
) else (
    echo [1/3] Dependencies already installed.
)

echo [2/3] Building frontend...
call npm run build
if errorlevel 1 goto error

echo [3/3] Starting server on http://localhost:3001
echo       Press Ctrl+C to stop.
echo.
call npm start

goto error

:error
echo.
echo [X] The server stopped. See messages above.
pause