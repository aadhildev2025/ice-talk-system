@echo off
setlocal
title Ice Talk POS - Windows Setup Builder
color 0B
cls
echo =====================================================================
echo           ICE TALK FAMILY RESTAURANT - POS SETUP BUILDER
echo =====================================================================
echo.
echo [1/4] Synchronizing Application Icons and Favicon...
powershell -NoProfile -ExecutionPolicy Bypass -Command "Copy-Item 'client\src\favicon.png' 'client\public\favicon.png' -Force -ErrorAction SilentlyContinue; Copy-Item 'client\src\favicon.png' 'electron\icon.png' -Force -ErrorAction SilentlyContinue; Copy-Item 'client\src\favicon.png' 'build\icon.png' -Force -ErrorAction SilentlyContinue; Write-Host 'Icons synced successfully.' -ForegroundColor Green"

echo.
echo [2/4] Compiling React Frontend Production Build (Vite)...
call npm.cmd run client:build
if %ERRORLEVEL% NEQ 0 (
    color 0C
    echo [ERROR] Frontend build failed. Please check client code.
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo [3/4] Packaging Standalone Windows Setup Installer (.exe)...
call npx.cmd electron-builder --win
if %ERRORLEVEL% NEQ 0 (
    color 0C
    echo [ERROR] Packaging failed.
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo =====================================================================
echo  BUILD SUCCESSFUL!
echo =====================================================================
echo  Your client distribution packages are located in:
echo    "dist-setup"
echo.
echo  Generated Packages:
echo   [1] Ice-Talk-POS-Setup-1.0.0.exe  (Full Windows Installer Setup)
echo   [2] Ice Talk POS 1.0.0.exe        (Portable Standalone Executable)
echo =====================================================================
echo.
explorer "dist-setup"
pause
