@echo off
echo Starting Python server...
start cmd /k "python D:\Ticketing-System\scripts\app.py"
echo Starting Node.js server...
cd D:\Ticketing-System
npm run dev