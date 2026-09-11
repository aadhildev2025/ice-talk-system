@echo off
title Ice Talk POS - Desktop Software
echo ========================================================
echo        ICE TALK POS - DESKTOP SOFTWARE & SERVER
echo ========================================================
echo.

:: Check if server on port 5000 is running
netstat -ano | findstr :5000 | findstr LISTENING >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [OK] Backend server is already active on port 5000.
    echo Launching Desktop POS App...
    echo.
    npx electron electron/main.cjs
) else (
    echo Starting Backend Server, Web API, and Desktop App...
    echo.
    npm run desktop
)

pause
