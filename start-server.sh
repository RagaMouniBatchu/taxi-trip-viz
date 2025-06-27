#!/bin/bash

echo "🚕 Starting Interactive Taxi Trip Visualization Server..."
echo "📍 Server will be available at: http://localhost:8000"
echo "🛑 Press Ctrl+C to stop the server"
echo ""

# Try different methods to start a local server
if command -v python3 &> /dev/null; then
    echo "🐍 Using Python 3 server..."
    python3 -m http.server 8000
elif command -v python &> /dev/null; then
    echo "🐍 Using Python server..."
    python -m http.server 8000
elif command -v node &> /dev/null; then
    echo "🟢 Using Node.js server..."
    npx http-server -p 8000
elif command -v php &> /dev/null; then
    echo "🐘 Using PHP server..."
    php -S localhost:8000
else
    echo "❌ No suitable server found. Please install Python, Node.js, or PHP."
    echo "💡 You can also use any other local web server."
    exit 1
fi 