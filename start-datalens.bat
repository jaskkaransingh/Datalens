@echo off
title DataLens Industrial Pipeline Setup 
color 0B

echo ====================================================
echo        DATALENS INDUSTRIAL WORKSTATION
echo          System Initialization Protocol
echo ====================================================
echo.

echo [1/4] Verifying System Prerequisites...
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python is not installed or not in PATH. 
    echo Please install Python 3.8 or higher from python.org and check "Add to PATH".
    pause
    exit /b
)
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed or not in PATH. 
    echo Please install Node 18 or higher from nodejs.org.
    pause
    exit /b
)
echo [OK] Python and Node.js detected.
echo.

echo [2/4] Initializing Python Backend Engine...
cd Frontend\api
echo Synchronizing pip dependencies from requirements.txt...
python -m pip install --upgrade pip >nul 2>&1
python -m pip install -r requirements.txt >nul 2>&1
echo [OK] Backend Engine stabilized.
echo.

echo [3/4] Initializing React Frontend Shell...
cd ..
echo Synchronizing NPM packages...
call npm install >nul 2>&1
echo [OK] Frontend Shell stabilized.
echo.

echo [4/4] Booting Core Infrastructure...
echo.

:: Extract Backend Server into a dedicated terminal
cd api
start cmd /k "title DataLens Backend System && echo [SYSTEM] Initializing API Inference Engine... && python app.py"

:: Extract Frontend Server into a dedicated terminal
cd ..
start cmd /k "title DataLens Visual Shell && echo [SYSTEM] Initializing Vite Reactor... && npm run dev"

echo Waiting for system synchronization...
timeout /t 5 >nul

:: Automatically open browser
start http://localhost:5173

echo ====================================================
echo       [SUCCESS] WORKSTATION IS NOW ONLINE
echo ====================================================
echo Note: Keep the two new terminal windows running in the background.
echo You can safely close this initialization script.
echo.
pause
