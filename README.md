# Expense Tracker

A comprehensive personal finance management application built with React and Django, featuring Indian currency support, budget tracking, and recurring expense management.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Quick Start](#quick-start)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [API Documentation](#api-documentation)
- [Screenshots](#screenshots)
- [Contributing](#contributing)
- [License](#license)

## Features

### Core Functionality

- **User Authentication**: Secure JWT-based authentication with registration and login
- **Expense Management**: Add, edit, delete, and categorize expenses
- **Budget Tracking**: Set monthly budgets with real-time progress monitoring
- **Recurring Expenses**: Automate recurring payments with flexible scheduling
- **Indian Currency Support**: Native support for Indian Rupee (₹) with proper formatting
- **Data Export**: Export expense data to CSV format
- **Responsive Design**: Mobile-first design that works on all devices

### Advanced Features

- **Real-time Analytics**: Interactive charts and visualizations
- **Category Management**: Organize expenses by custom categories
- **Search & Filter**: Find expenses quickly with advanced filtering
- **Dark Mode**: Toggle between light and dark themes
- **Budget Alerts**: Get notified when approaching budget limits
- **Demo Account**: Test the application with pre-configured demo data

## Tech Stack

### Frontend

- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Recharts** for data visualization
- **React Hot Toast** for notifications
- **Lucide React** for icons

### Backend

- **Django 4.2** with Django REST Framework
- **MySQL** database (SQLite for development)
- **JWT Authentication** with SimpleJWT
- **CORS** support for cross-origin requests
- **Python Decouple** for environment management

## Quick Start

### Option 1: Frontend Only (Demo Mode)

Perfect for testing without backend setup:

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:5173
```

### Option 2: Full Stack Setup

For complete functionality with backend:

```bash
# Frontend
npm install
npm run dev

# Backend (in separate terminal)
cd backend
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

## Installation

### Prerequisites

- Node.js v16 or higher
- Python 3.8 or higher
- MySQL (optional - SQLite works for development)

### Step 1: Clone Repository

```bash
git clone <repository-url>
cd expense-tracker
```

### Step 2: Frontend Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

### Step 3: Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py makemigrations
python manage.py migrate

# Create superuser (optional)
python manage.py createsuperuser

# Start server
python manage.py runserver
```

## Configuration

### Environment Variables

Create `backend/.env` file:

```env
SECRET_KEY=your-secret-key-here
DEBUG=True
DB_NAME=expense_tracker
DB_USER=root
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=3306
```

### Database Configuration

The application supports both SQLite (default) and MySQL:

**SQLite (Default)**

```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}
```

**MySQL**

```python
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

## Usage

### Demo Account

- **Email**: `demo@example.com`
- **Password**: `demo123`

### Getting Started

1. **Sign Up**: Create a new account or use the demo account
2. **Set Budget**: Go to Settings → Budget to set your monthly budget
3. **Add Expenses**: Use the dashboard or Add Expense page to record spending
4. **Track Progress**: Monitor your budget progress on the dashboard
5. **View Reports**: Check detailed analytics in the Reports section

### Key Features

#### Budget Management

- Set monthly budget limits
- Real-time progress tracking
- Configurable alert thresholds
- Daily average spending calculations

#### Recurring Expenses

- Create recurring expenses (daily, weekly, monthly, yearly)
- Automatic expense generation
- Pause/resume functionality
- Next occurrence tracking

#### Indian Currency Support

- Native ₹ symbol support
- Indian numbering system (1,00,000 format)
- Proper decimal handling
- Currency formatting utilities

## API Documentation

### Authentication Endpoints

- `POST /api/register/` - User registration
- `POST /api/token/` - JWT token generation
- `POST /api/token/refresh/` - Token refresh

### User Management

- `GET /api/profile/` - Get user profile
- `PUT /api/profile/` - Update profile
- `GET /api/budget/` - Get budget information
- `PUT /api/budget/` - Update budget settings

### Expense Management

- `GET /api/expenses/` - List expenses
- `POST /api/expenses/` - Create expense
- `PUT /api/expenses/{id}/` - Update expense
- `DELETE /api/expenses/{id}/` - Delete expense
- `GET /api/expenses/stats/` - Get statistics

### Recurring Expenses

- `GET /api/recurring/` - List recurring expenses
- `POST /api/recurring/` - Create recurring expense
- `PUT /api/recurring/{id}/` - Update recurring expense
- `DELETE /api/recurring/{id}/` - Delete recurring expense
- `POST /api/recurring/{id}/toggle_active/` - Toggle active status
- `POST /api/recurring/generate_expenses/` - Generate expenses

### Reports

- `GET /api/reports/` - Get expense reports
- `GET /api/notifications/` - Get notifications

## Screenshots

### Dashboard Overview

![Dashboard](screenshots/dashboard.png)
_Main dashboard showing expense summary, budget progress, and quick actions_

### Expense Management

![Add Expense](screenshots/add-expense.png)
_Add new expenses with category selection and detailed information_

### Budget Tracking

![Budget Tracking](screenshots/budget-tracking.png)
_Real-time budget monitoring with progress indicators and alerts_

### Reports & Analytics

![Reports](screenshots/reports.png)
_Comprehensive analytics with charts and spending trends_

### Recurring Expenses

![Recurring Expenses](screenshots/recurring.png)
_Manage recurring expenses with flexible scheduling options_

### Settings

![Settings](screenshots/settings.png)
_User preferences, budget configuration, and account settings_

### Mobile View

![Mobile Dashboard](screenshots/mobile-dashboard.png)
_Responsive design optimized for mobile devices_

## Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow the existing code style
- Add tests for new features
- Update documentation as needed
- Ensure responsive design compatibility

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

If you encounter any issues or have questions:

1. Check the [troubleshooting guide](SETUP_GUIDE.md#troubleshooting)
2. Review the browser console for errors
3. Ensure all dependencies are properly installed
4. Verify database connectivity

## Acknowledgments

- Built with modern web technologies
- Designed for Indian users with native currency support
- Responsive design for all device types
- Comprehensive expense tracking capabilities

---

**Note**: This application is designed for personal use and should not be used for commercial purposes without proper licensing and security considerations.
