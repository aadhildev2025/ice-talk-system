@echo off
title Ice Talk POS
cd /d "%~dp0"
echo Starting Ice Talk POS...
start "" npx.cmd electron electron/main.cjs
exit
