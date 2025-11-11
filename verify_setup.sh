#!/bin/bash

# Expense Tracker - Setup Verification Script
# This script helps verify that all components are properly set up

echo "🔍 Expense Tracker - Setup Verification"
echo "========================================"
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -d "backend" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

echo "✅ Project structure verified"
echo ""

# Check Node.js
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo "✅ Node.js installed: $NODE_VERSION"
else
    echo "❌ Node.js not found. Please install Node.js"
    exit 1
fi

# Check Python
if command -v python &> /dev/null; then
    PYTHON_VERSION=$(python --version)
    echo "✅ Python installed: $PYTHON_VERSION"
elif command -v python3 &> /dev/null; then
    PYTHON_VERSION=$(python3 --version)
    echo "✅ Python installed: $PYTHON_VERSION"
else
    echo "❌ Python not found. Please install Python"
    exit 1
fi

echo ""

# Check if node_modules exists
if [ -d "node_modules" ]; then
    echo "✅ Node modules installed"
else
    echo "⚠️  Node modules not found. Run: npm install"
fi

# Check if backend migrations exist
if [ -d "backend/expenses/migrations" ]; then
    echo "✅ Backend migrations directory exists"
else
    echo "⚠️  Backend migrations missing"
fi

# Check if database exists
if [ -f "backend/db.sqlite3" ]; then
    echo "✅ Database file exists"
else
    echo "⚠️  Database not initialized. Run: cd backend && python manage.py migrate"
fi

echo ""
echo "📋 Next Steps:"
echo "=============="
echo ""
echo "1. Install dependencies (if not done):"
echo "   npm install"
echo "   cd backend && pip install -r requirements.txt"
echo ""
echo "2. Run migrations (if not done):"
echo "   cd backend && python manage.py migrate"
echo ""
echo "3. Start backend server (Terminal 1):"
echo "   cd backend && python manage.py runserver"
echo ""
echo "4. Start frontend server (Terminal 2):"
echo "   npm run dev"
echo ""
echo "5. Open browser:"
echo "   http://localhost:5173"
echo ""
echo "6. Follow the testing guide:"
echo "   See QUICK_TEST_GUIDE.md"
echo ""
echo "✨ All fixes are complete and ready to test!"
echo ""

