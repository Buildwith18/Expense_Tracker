# 🚀 Expense Tracker - Complete Setup Guide

## Quick Start (Recommended)

### Option 1: Frontend Only (Demo Mode)
Perfect for testing and development without backend setup.

```bash
# 1. Install dependencies
npm install

# 2. Start development server
npm run dev

# 3. Open browser to http://localhost:5173
```

**That's it!** The app runs in demo mode with localStorage persistence.

### Option 2: Full Stack Setup
For production-ready deployment with Django backend.

## 📋 Prerequisites

- **Node.js** v16+ ([Download](https://nodejs.org/))
- **Python** v3.8+ ([Download](https://python.org/))
- **MySQL** (optional - SQLite works for development)
- **Git** ([Download](https://git-scm.com/))

## 🎯 Step-by-Step Setup

### 1. Clone & Install Frontend

```bash
# Clone the repository
git clone <your-repo-url>
cd expense-tracker

# Install Node.js dependencies
npm install

# Start frontend development server
npm run dev
```

✅ **Frontend is now running at http://localhost:5173**

### 2. Backend Setup (Optional)

```bash
# Navigate to backend directory
cd backend

# Create virtual environment (recommended)
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt

# Setup database
python manage.py makemigrations accounts
python manage.py makemigrations expenses
python manage.py migrate

# Create admin user (optional)
python manage.py createsuperuser

# Start backend server
python manage.py runserver
```

✅ **Backend is now running at http://localhost:8000**

## 🔧 Configuration

### Environment Variables (Backend)

Create `backend/.env`:

```env
SECRET_KEY=your-secret-key-here-make-it-long-and-random
DEBUG=True
DB_NAME=expense_tracker
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_HOST=localhost
DB_PORT=3306
```

### Database Options

#### Option A: SQLite (Default - No setup required)
```python
# In backend/expense_tracker/settings.py
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}
```

#### Option B: MySQL
```python
# In backend/expense_tracker/settings.py
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': config('DB_NAME', default='expense_tracker'),
        'USER': config('DB_USER', default='root'),
        'PASSWORD': config('DB_PASSWORD', default=''),
        'HOST': config('DB_HOST', default='localhost'),
        'PORT': config('DB_PORT', default='3306'),
    }
}
```

## 🧪 Testing the Setup

### 1. Test Frontend (Demo Mode)
1. Open http://localhost:5173
2. Click "Sign Up" and create an account
3. Add a few test expenses
4. Check dashboard for accurate calculations
5. Verify budget tracking works correctly

### 2. Test Full Stack
1. Ensure both servers are running
2. Test user registration/login
3. Add expenses and verify they persist
4. Check API endpoints at http://localhost:8000/api/

## 🐛 Troubleshooting

### Common Issues & Solutions

#### Frontend Issues

**Issue**: `npm install` fails
```bash
# Solution: Clear npm cache
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

**Issue**: Port 5173 already in use
```bash
# Solution: Use different port
npm run dev -- --port 3000
```

#### Backend Issues

**Issue**: Python module not found
```bash
# Solution: Ensure virtual environment is activated
source venv/bin/activate  # macOS/Linux
venv\Scripts\activate     # Windows
pip install -r requirements.txt
```

**Issue**: Database connection error
```bash
# Solution: Check database settings
python manage.py check
python manage.py migrate
```

**Issue**: CORS errors
```bash
# Solution: Verify CORS settings in settings.py
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]
```

### Debug Mode

Enable debug information in the dashboard:
1. Open `src/pages/Dashboard.tsx`
2. Look for the "Debug Info" section
3. This shows real-time calculation details

## 📱 Features to Test

### ✅ Core Functionality
- [ ] User registration/login
- [ ] Add/edit/delete expenses
- [ ] Dashboard calculations accuracy
- [ ] Budget tracking
- [ ] Category filtering
- [ ] CSV export
- [ ] Dark mode toggle
- [ ] Responsive design

### ✅ Data Accuracy (Fixed Issues)
- [ ] Dashboard total matches actual expenses
- [ ] Budget section shows correct values
- [ ] Category breakdown is accurate
- [ ] Monthly calculations are correct

## 🚀 Production Deployment

### Frontend (Netlify/Vercel)
```bash
# Build for production
npm run build

# Deploy the dist/ folder to your hosting service
```

### Backend (Heroku/Railway)
```bash
# Set environment variables
# Configure production database
# Deploy using platform-specific instructions
```

## 📊 Data Flow Verification

### Expected Behavior:
1. **Add Expense** → Dashboard updates immediately
2. **Budget Settings** → Reflects actual current month expenses
3. **Category Charts** → Shows accurate breakdowns
4. **All Sections** → Display consistent data

### If Data Seems Wrong:
1. Check browser console for errors
2. Clear localStorage: `localStorage.clear()`
3. Refresh the page
4. Add a test expense to verify calculations

## 🎯 Success Indicators

You'll know the setup is working correctly when:

- ✅ Dashboard shows accurate expense totals
- ✅ Budget section reflects real spending
- ✅ Category charts match expense data
- ✅ All calculations are consistent
- ✅ No console errors
- ✅ Responsive design works on mobile

## 📞 Need Help?

If you encounter issues:

1. **Check Console**: Open browser DevTools → Console tab
2. **Verify Servers**: Ensure both frontend and backend are running
3. **Clear Cache**: Clear browser cache and localStorage
4. **Check Network**: Verify API calls in Network tab
5. **Review Logs**: Check terminal output for errors

## 🎉 You're All Set!

Your Expense Tracker is now ready for use. The recent bug fixes ensure:
- Accurate financial calculations
- Reliable budget tracking
- Consistent data across all sections
- Improved user experience

Happy expense tracking! 💰📊