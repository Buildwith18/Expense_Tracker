# Expense Persistence Fix - Testing Guide

## What Was Fixed

### Problem Identified
The expense data was being saved to **localStorage** instead of the **MySQL database** due to:
1. Aggressive fallback logic that checked backend availability on every request
2. Silent failures that defaulted to localStorage
3. The `isBackendAvailable()` check was interfering with normal API operations

### Solution Applied

**1. API Layer (`src/services/api.ts`)**
- Removed unnecessary `isBackendAvailable()` checks before each request
- Direct API calls now attempt backend first
- Better error handling with clear console logs
- Fallback to localStorage only when backend is truly unavailable
- Added authentication error (401) handling

**2. Backend (`backend/expenses/views.py`)**
- Added explicit `list()` method to return unpaginated expense array
- Ensures consistent response format for frontend
- User filtering is already implemented correctly

**3. Key Changes**
- JWT tokens are automatically added to all requests via axios interceptor
- User association happens automatically on backend via `request.user`
- Each expense is tied to the logged-in user correctly

## How to Test the Fix

### Prerequisites
1. **Start Django Backend**
   ```bash
   cd backend
   python manage.py runserver
   ```

2. **Start React Frontend**
   ```bash
   npm run dev
   ```

3. **Ensure MySQL is Running**
   ```bash
   # Check Django can connect to MySQL
   cd backend
   python manage.py dbshell
   ```

### Test Scenario 1: Create and Persist Expenses

1. **Login to the application**
   - Use any valid credentials or create new account

2. **Add a new expense**
   - Go to "Add Expense" page
   - Fill in: Title, Amount, Category, Date
   - Click "Add Expense"
   - **Expected**: Toast message "Expense saved successfully!"

3. **Verify in browser console**
   - Open DevTools → Console
   - Look for logs:
     ```
     Creating expense: {title: "...", amount: ..., ...}
     Expense created response: {expense: {...}}
     Expenses fetched from backend: [...]
     ```

4. **Check Django admin**
   - Go to `http://localhost:8000/admin/`
   - Login with superuser credentials
   - Navigate to Expenses
   - **Expected**: See your new expense with correct user association

5. **Refresh the page (F5)**
   - **Expected**: Expense still appears in dashboard/history
   - Check console for: `Expenses fetched from backend: [...]`

### Test Scenario 2: Login/Logout Persistence

1. **Add 3-5 expenses**
2. **Logout** from the application
3. **Close browser completely**
4. **Open browser and login again**
5. **Expected**: All previously added expenses appear

### Test Scenario 3: Multi-User Isolation

1. **Create User A** - Add 2 expenses
2. **Logout**
3. **Create User B** - Add 3 expenses
4. **Expected**: User B sees only their 3 expenses
5. **Logout and login as User A**
6. **Expected**: User A sees only their 2 expenses

### Test Scenario 4: Backend Verification

**Using Django Shell:**
```bash
cd backend
python manage.py shell
```

```python
from expenses.models import Expense
from accounts.models import User

# Check all expenses
expenses = Expense.objects.all()
print(f"Total expenses in DB: {expenses.count()}")

# Check expenses by user
for user in User.objects.all():
    user_expenses = Expense.objects.filter(user=user)
    print(f"{user.username}: {user_expenses.count()} expenses")
    for exp in user_expenses:
        print(f"  - {exp.title}: ₹{exp.amount}")
```

**Using MySQL Direct:**
```bash
mysql -u root -p
USE expense_tracker;

-- View all expenses
SELECT e.id, e.title, e.amount, e.date, u.username
FROM expenses e
JOIN auth_user u ON e.user_id = u.id;

-- Count by user
SELECT u.username, COUNT(e.id) as expense_count, SUM(e.amount) as total_amount
FROM auth_user u
LEFT JOIN expenses e ON u.id = e.user_id
GROUP BY u.username;
```

## Debugging Tips

### Check if Backend is Running
```bash
curl http://localhost:8000/api/
```
**Expected**: JSON response with API info

### Check JWT Authentication
```bash
# Get token first (replace with actual credentials)
TOKEN=$(curl -X POST http://localhost:8000/api/token/ \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"testpass123"}' \
  | jq -r '.access')

# Test authenticated request
curl http://localhost:8000/api/expenses/ \
  -H "Authorization: Bearer $TOKEN"
```
**Expected**: JSON array of user's expenses

### Check Browser Storage
Open DevTools → Application → Local Storage → `http://localhost:5173`

**Should see:**
- `auth_token`: JWT token
- `user_data`: User information
- `mock_expenses`: Should be EMPTY or minimal (only used as fallback)

### Common Issues

**Issue 1: "Please login to save expenses"**
- **Cause**: JWT token expired or missing
- **Fix**: Logout and login again

**Issue 2: Expenses disappear after refresh**
- **Cause**: Backend not running or not connected
- **Fix**: Check Django server is running on port 8000
- Check console for error messages

**Issue 3: "Failed to fetch expenses from backend"**
- **Cause**: CORS issue or backend unreachable
- **Fix**: Check Django CORS settings in `settings.py`
- Ensure `CORS_ALLOWED_ORIGINS` includes frontend URL

**Issue 4: Expenses showing but not in database**
- **Cause**: Still using localStorage fallback
- **Fix**: Check console logs - should see "from backend" not "localStorage fallback"
- Clear browser cache and reload

## Expected Console Output (Success)

**When adding expense:**
```
Creating expense: {title: "Grocery Shopping", amount: 5000, category: "food", date: "2025-11-06"}
POST http://localhost:8000/api/expenses/ 201
Expense created response: {message: "...", expense: {id: "123", ...}}
```

**When loading dashboard:**
```
GET http://localhost:8000/api/expenses/ 200
Expenses fetched from backend: [{id: "123", title: "...", amount: 5000, ...}, ...]
```

**When refreshing page:**
```
Auth: Initialized from localStorage {user: "user@example.com"}
GET http://localhost:8000/api/expenses/ 200
Expenses fetched from backend: [...]
```

## Success Criteria

✅ **All tests pass when:**
1. New expenses appear immediately in dashboard
2. Expenses persist after page refresh
3. Expenses persist after logout/login
4. Each user sees only their own expenses
5. Expenses are visible in Django admin
6. Expenses are in MySQL database
7. Console shows "from backend" not "localStorage fallback"
8. JWT authentication works correctly

## Rollback (If Issues Occur)

If you need to revert changes:
```bash
git checkout src/services/api.ts
git checkout backend/expenses/views.py
```

## Additional Notes

- The fix maintains localStorage as a fallback for offline development
- Production deployments should remove localStorage fallback entirely
- JWT tokens have 60-minute expiration (configurable in Django settings)
- Always check browser console for detailed error messages
