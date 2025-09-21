# Quick Start Guide for Django Backend

## 🚀 Option 1: Automated Setup (Recommended)

```bash
cd backend
python setup_django.py
python start_server.py
```

## 🔧 Option 2: Manual Setup

### Step 1: Install Dependencies
```bash
cd backend
pip install -r requirements.txt
```

### Step 2: Database Setup
```bash
python manage.py makemigrations accounts
python manage.py makemigrations expenses
python manage.py migrate
```

### Step 3: Create Superuser (Optional)
```bash
python manage.py createsuperuser
```

### Step 4: Start Server
```bash
python manage.py runserver
```

## 🔍 Troubleshooting

### Check Setup
```bash
python check_setup.py
```

### Common Issues

**1. Module Import Errors**
```bash
pip install --upgrade pip
pip install -r requirements.txt
```

**2. Database Errors**
```bash
python manage.py migrate --run-syncdb
```

**3. Permission Errors**
```bash
python manage.py makemigrations --empty accounts
python manage.py makemigrations --empty expenses
python manage.py migrate
```

## 📍 API Endpoints

Once server is running at `http://localhost:8000/`:

### Authentication
- `POST /api/register/` - User registration
- `POST /api/token/` - Login
- `POST /api/token/refresh/` - Refresh token

### Expenses
- `GET/POST /api/expenses/` - List/Create expenses
- `GET/PUT/DELETE /api/expenses/{id}/` - Individual expense operations

### Recurring Expenses
- `GET/POST /api/recurring/` - List/Create recurring expenses
- `POST /api/recurring/{id}/toggle_active/` - Toggle active status

### Reports
- `GET /api/reports/` - Analytics and reports

### Settings
- `GET/PUT /api/settings/` - User settings and profile

## 🎯 Frontend Integration

Update `src/services/api.ts`:
```javascript
const API_BASE_URL = 'http://localhost:8000/api';
```

Then uncomment the actual API calls and comment out localStorage mock implementations.