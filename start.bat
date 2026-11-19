@echo off
cd /d "%~dp0"
echo Starting Sixpad local mirror...
node server.mjs
pause
