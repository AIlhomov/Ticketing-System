#!/bin/bash
echo "Starting Python server..."
python3 ~/Ticketing-System/scripts/app.py &
echo "Starting Node.js server..."
cd ~/Ticketing-System
npm run dev
