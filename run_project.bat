@echo off
title TCET Carbon Pulse - Project Launcher
echo ===================================================
echo   CAMPUS CARBON HEARTBEAT - FULL SYSTEM LAUNCHER
echo ===================================================
echo.

:: 1. Environment Check
echo [1/3] Preparing environment...
:: Check if port 8000 is occupied and kill it
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8000') do (
    echo [INFO] Freeing Port 8000 (Process %%a)...
    taskkill /f /pid %%a >nul 2>&1
)

:: 2. Dependency Sync
echo [2/3] Syncing dependencies (this may take a moment)...
python -m pip install --upgrade pip >nul 2>&1
pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo [ERROR] Dependency installation failed.
    echo Please ensure Python and Pip are installed correctly.
    pause
    exit /b
)

:: 3. Launching
echo [3/3] Starting the TCET Carbon Pulse Engine...
echo.
echo ---------------------------------------------------
echo ACCESS URLS:
echo Dashboard: http://localhost:8000
echo API Docs:  http://localhost:8000/docs
echo ---------------------------------------------------
echo.
echo SERVER LOGS:
python main.py
if %errorlevel% neq 0 (
    echo.
    echo [CRITICAL] Server crashed. 
    pause
)
