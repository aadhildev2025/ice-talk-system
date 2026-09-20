@echo off
title Ice Talk POS
cd /d "c:\Users\peace\Desktop\Works\ice-talk-system"
echo Starting Ice Talk POS...
start "" npx.cmd electron electron/main.cjs
exit
