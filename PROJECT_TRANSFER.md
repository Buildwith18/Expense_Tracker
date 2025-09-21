# Project Transfer Guide

## 📋 **Project Structure to Transfer**

### **Frontend Files:**
```
src/
├── components/
│   ├── Layout/
│   │   ├── Layout.tsx
│   │   ├── Sidebar.tsx
│   │   └── TopBar.tsx
│   ├── Settings/
│   │   ├── ProfileTab.tsx
│   │   ├── BudgetTab.tsx
│   │   ├── AppearanceTab.tsx
│   │   └── PasswordTab.tsx
│   ├── Cards/
│   │   └── StatCard.tsx
│   ├── Charts/
│   │   ├── PieChart.tsx
│   │   └── BarChart.tsx
│   ├── Navbar.tsx
│   └── ProtectedRoute.tsx
├── pages/
│   ├── Login.tsx
│   ├── Signup.tsx
│   ├── Dashboard.tsx
│   ├── AddExpense.tsx
│   ├── History.tsx
│   ├── Reports.tsx
│   ├── Recurring.tsx
│   └── Settings.tsx
├── context/
│   └── AuthContext.tsx
├── services/
│   └── api.ts
├── types/
│   └── index.ts
├── App.tsx
├── main.tsx
└── index.css
```

### **Backend Files:**
```
backend/
├── expense_tracker/
│   ├── __init__.py
│   ├── settings.py
│   ├── urls.py
│   ├── wsgi.py
│   └── asgi.py
├── accounts/
│   ├── __init__.py
│   ├── admin.py
│   ├── apps.py
│   ├── models.py
│   ├── serializers.py
│   ├── urls.py
│   └── views.py
├── expenses/
│   ├── __init__.py
│   ├── admin.py
│   ├── apps.py
│   ├── models.py
│   ├── serializers.py
│   ├── urls.py
│   └── views.py
├── manage.py
├── requirements.txt
└── .env.example
```

### **Root Files:**
```
├── package.json
├── vite.config.ts
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
├── tailwind.config.js
├── postcss.config.js
├── eslint.config.js
├── index.html
└── README.md
```

## 🚀 **Setup Instructions for New Account**

### **1. Create New Vite React TypeScript Project**
```bash
npm create vite@latest expense-tracker -- --template react-ts
cd expense-tracker
```

### **2. Install Dependencies**
```bash
npm install react-router-dom react-hot-toast lucide-react recharts date-fns axios papaparse
npm install -D @types/papaparse @types/react-router-dom tailwindcss autoprefixer postcss
```

### **3. Setup Tailwind CSS**
```bash
npx tailwindcss init -p
```

### **4. Copy All Files**
- Copy all source files maintaining the exact folder structure
- Update package.json with correct dependencies
- Copy configuration files (vite.config.ts, tailwind.config.js, etc.)

### **5. Backend Setup (Optional)**
```bash
cd backend
pip install -r requirements.txt
python manage.py makemigrations accounts
python manage.py makemigrations expenses
python manage.py migrate
python manage.py runserver
```

## 🔧 **Key Dependencies**

### **Frontend:**
- React 18.3.1
- TypeScript
- Vite
- Tailwind CSS
- React Router DOM
- Lucide React (icons)
- Recharts (charts)
- React Hot Toast
- Date-fns
- Axios

### **Backend:**
- Django 4.2.7
- Django REST Framework
- Django CORS Headers
- Django Simple JWT
- Python Decouple

## ⚠️ **Important Notes**

1. **Environment Variables:** Update API URLs in `src/services/api.ts`
2. **Database:** Backend uses localStorage for demo, can be connected to Django API
3. **Authentication:** Currently uses mock authentication
4. **File Structure:** Maintain exact folder structure for imports to work
5. **Dependencies:** Ensure all packages are installed with correct versions

## 🎯 **Features Included**

- ✅ Complete expense tracking system
- ✅ User authentication (mock)
- ✅ Dashboard with charts and statistics
- ✅ Add/Edit/Delete expenses
- ✅ Recurring expenses management
- ✅ Reports and analytics
- ✅ Settings with 4 tabs (Profile, Budget, Appearance, Password)
- ✅ Responsive design
- ✅ Dark mode support
- ✅ CSV export functionality
- ✅ Search and filtering
- ✅ Budget tracking and alerts

## 🔄 **Migration Checklist**

- [ ] Copy all source files
- [ ] Install dependencies
- [ ] Update configuration files
- [ ] Test frontend functionality
- [ ] Setup backend (if needed)
- [ ] Verify all features work
- [ ] Update API endpoints
- [ ] Test responsive design
- [ ] Verify routing works
- [ ] Test all CRUD operations