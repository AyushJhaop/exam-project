#!/bin/bash

# Sehat Mitra - Development Verification Script
echo "🏥 Sehat Mitra - Development Environment Check"
echo "=============================================="
echo ""

# Check if servers are running
echo "📡 Checking server status..."
if lsof -ti:5173 > /dev/null; then
    echo "✅ Frontend server running on port 5173"
else
    echo "❌ Frontend server not running"
fi

if lsof -ti:5000 > /dev/null; then
    echo "✅ Backend server running on port 5000"
else
    echo "❌ Backend server not running"
fi

echo ""

# Check essential files
echo "📁 Checking essential files..."
files=(
    "src/App.jsx"
    "src/pages/LandingPage.jsx"
    "src/components/layout/Navbar.jsx"
    "src/contexts/AuthContext.jsx"
    "tailwind.config.js"
    "backend/server.js"
    "backend/models/User.js"
)

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file exists"
    else
        echo "❌ $file missing"
    fi
done

echo ""

# Check dependencies
echo "📦 Checking key dependencies..."
if npm list tailwindcss > /dev/null 2>&1; then
    echo "✅ Tailwind CSS installed"
else
    echo "❌ Tailwind CSS missing"
fi

if npm list react > /dev/null 2>&1; then
    echo "✅ React installed"
else
    echo "❌ React missing"
fi

if npm list axios > /dev/null 2>&1; then
    echo "✅ Axios installed"
else
    echo "❌ Axios missing"
fi

echo ""
echo "🌐 Application URLs:"
echo "Frontend: http://localhost:5173"
echo "Backend:  http://localhost:5000"
echo ""
echo "🚀 Ready to develop!"
