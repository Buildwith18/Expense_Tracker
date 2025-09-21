#!/bin/bash

# Quick Setup Script for New Bolt Account
echo "🚀 Setting up Expense Tracker Project..."

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
npm install react-router-dom@^7.6.3 react-hot-toast@^2.5.2 lucide-react@^0.344.0 recharts@^3.1.0 date-fns@^4.1.0 axios@^1.10.0 papaparse@^5.5.3

# Install dev dependencies
echo "🔧 Installing dev dependencies..."
npm install -D @types/papaparse@^5.3.16 @types/react-router-dom@^5.3.3 tailwindcss@^3.4.1 autoprefixer@^10.4.18 postcss@^8.4.35

# Initialize Tailwind CSS
echo "🎨 Setting up Tailwind CSS..."
npx tailwindcss init -p

echo "✅ Setup complete! Now copy all source files and start development server with 'npm run dev'"