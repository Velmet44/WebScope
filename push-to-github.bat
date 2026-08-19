@echo off
echo ========================================
echo   WebScope - Push to GitHub
echo ========================================
echo.

cd /d "%~dp0"

set PATH=E:\Apps\Git\cmd;%PATH%

echo [1/3] Staging files...
git add -A

echo [2/3] Committing...
git commit -m "%~1"

echo [3/3] Pushing to origin main...
git push origin main

echo.
echo ========================================
echo   Done!
echo ========================================
pause
