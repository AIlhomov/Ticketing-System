#!/bin/bash
echo "Starting Python server..."
python ~/Ticketing-System/scripts/app.py &
echo "Starting Node.js server..."
cd ~/Ticketing-System
npm run dev
