# Django Expense Tracker Backend Setup

## Prerequisites
- Python 3.8+
- pip
- virtualenv (recommended)

## Setup Instructions

### 1. Create Virtual Environment
```bash
python -m venv expense_tracker_env
source expense_tracker_env/bin/activate  # On Windows: expense_tracker_env\Scripts\activate
```

### 2. Install Dependencies
```bash
cd backend
pip install -r requirements.txt
```

### 3. Environment Variables
```bash
cp .env.example .env
# Edit .env file with your settings
```

### 4. Database Setup
```bash
python manage.py makemigrations accounts
python manage.py makemigrations expenses
python manage.py migrate
```

### 5. Create Superuser
```bash
python manage.py createsuperuser
```

### 6. Run Development Server
```bash
python manage.py runserver
```

The API will be available at: `http://localhost:8000/api/`

## API Endpoints

### Authentication
- `POST /api/register/` - User registration
- `POST /api/token/` - Login (get JWT tokens)
- `POST /api/token/refresh/` - Refresh JWT token

### User Profile
- `GET /api/profile/` - Get user profile
- `PUT /api/profile/` - Update user profile
- `POST /api/change-password/` - Change password

### Expenses
- `GET /api/expenses/` - List user's expenses
- `POST /api/expenses/` - Create new expense
- `GET /api/expenses/{id}/` - Get specific expense
- `PUT /api/expenses/{id}/` - Update expense
- `DELETE /api/expenses/{id}/` - Delete expense
- `GET /api/expenses/stats/` - Get expense statistics
- `GET /api/expenses/by_category/` - Get expenses by category
- `GET /api/expenses/by_date_range/` - Get expenses by date range

## Frontend Integration

Update your React frontend API base URL to:
```javascript
const API_BASE_URL = 'http://localhost:8000/api';
```

## Testing

### Using curl
```bash
# Register user
curl -X POST http://localhost:8000/api/register/ \
  -H "Content-Type: application/json" \
  -d '{"username": "testuser", "email": "test@example.com", "password": "testpass123", "password_confirm": "testpass123"}'

# Login
curl -X POST http://localhost:8000/api/token/ \
  -H "Content-Type: application/json" \
  -d '{"username": "testuser", "password": "testpass123"}'

# Create expense (replace TOKEN with actual token)
curl -X POST http://localhost:8000/api/expenses/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"title": "Lunch", "amount": "15.50", "category": "food", "date": "2024-01-15"}'
```

## Production Deployment

1. Set `DEBUG=False` in settings
2. Configure proper database (PostgreSQL recommended)
3. Set up static file serving
4. Configure CORS for your frontend domain
5. Use environment variables for sensitive settings
6. Set up proper logging
7. Use a production WSGI server (gunicorn)

## Security Notes

- JWT tokens are used for authentication
- CORS is configured for frontend integration
- User data is isolated (users can only access their own expenses)
- Password validation is enforced
- All sensitive endpoints require authentication