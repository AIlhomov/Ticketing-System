#!/bin/bash
echo "Starting Python server..."
gnome-terminal -- bash -c "python D:/Ticketing-System/scripts/app.py; exec bash"
echo "Starting Node.js server..."
cd D:/Ticketing-System
npm run dev
