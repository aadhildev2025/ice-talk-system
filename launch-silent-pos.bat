@echo off
title Ice Talk POS - Silent Auto-Print Launcher
echo ===================================================
echo   ICE TALK POS - SILENT AUTO-PRINT MODE LAUNCHER
echo ===================================================
echo.
echo Launching Google Chrome in Silent Kiosk Print Mode...
echo Prints will automatically go directly to your default printer with no dialog.
echo.

start "" "chrome.exe" --kiosk-printing "http://localhost:5173"

if %ERRORLEVEL% NEQ 0 (
    echo Chrome not found in standard path, trying Microsoft Edge...
    start "" "msedge.exe" --kiosk-printing "http://localhost:5173"
)

exit
