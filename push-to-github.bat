@echo off
echo ========================================
echo   WebScope - Push to GitHub
echo ========================================
echo.

cd /d "%~dp0"

rem Locate git: try PATH first, then common install locations
where git >nul 2>nul
if %errorlevel%==0 goto git_found

if exist "E:\Apps\Git\cmd\git.exe" set "PATH=E:\Apps\Git\cmd;%PATH%" & goto git_found
if exist "C:\Program Files\Git\cmd\git.exe" set "PATH=C:\Program Files\Git\cmd;%PATH%" & goto git_found
if exist "C:\Program Files (x86)\Git\cmd\git.exe" set "PATH=C:\Program Files (x86)\Git\cmd;%PATH%" & goto git_found

echo [!] Git was not found on this system.
echo     Install Git from https://git-scm.com and try again.
pause
exit /b 1

:git_found

if "%~1"=="" (
    echo [!] No commit message provided.
    echo     Usage: push-to-github.bat "your commit message"
    pause
    exit /b 1
)

echo [1/3] Staging files...
git add -A
if errorlevel 1 goto error

echo [2/3] Committing...
git commit -m "%~1"
if errorlevel 1 (
    echo [!] Nothing to commit or commit failed.
    goto error
)

echo [3/3] Pushing to origin main...
git push origin main
if errorlevel 1 goto error

echo.
echo ========================================
echo   Done! Changes pushed to GitHub.
echo ========================================
pause
exit /b 0

:error
echo.
echo [X] An error occurred. See messages above.
pause
exit /b 1