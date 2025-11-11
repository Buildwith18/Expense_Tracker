# 🚀 Quick Test Guide - Expense Tracker

## ⚡ Quick Start (5 minutes)

### 1. Start Backend (Terminal 1)
```bash
cd backend
python manage.py runserver
```

### 2. Start Frontend (Terminal 2)
```bash
npm run dev
```

### 3. Open Browser
Navigate to: `http://localhost:5173`

---

## 🧪 Quick Test Sequence

### ✅ Step 1: Authentication (2 minutes)

1. **Register New User**
   - Click "Sign Up"
   - Fill form with test data
   - Click "Register"
   - ✅ Should auto-login and redirect to dashboard

2. **Test Logout/Login**
   - Click logout
   - ✅ Should redirect to login page
   - Login with same credentials
   - ✅ Should redirect to dashboard

3. **Test Refresh Persistence**
   - Press F5 to refresh page
   - ✅ Should stay logged in
   - ✅ Should remain on same page

---

### ✅ Step 2: Add Test Data (2 minutes)

1. **Navigate to Add Expense**
   - Click "Add Expense" in sidebar
   - ✅ Form should load

2. **Add 3 Test Expenses**

   **Expense 1:**
   - Title: "Grocery Shopping"
   - Amount: 2500
   - Category: Food
   - Date: Today
   - Click "Add Expense"
   - ✅ Should show success toast

   **Expense 2:**
   - Title: "Uber Ride"
   - Amount: 350
   - Category: Transport
   - Date: Today
   - Click "Add Expense"
   - ✅ Should show success toast

   **Expense 3:**
   - Title: "Movie Tickets"
   - Amount: 600
   - Category: Entertainment
   - Date: Today
   - Click "Add Expense"
   - ✅ Should show success toast

---

### ✅ Step 3: Test Dashboard (1 minute)

1. **Navigate to Dashboard**
   - Click "Dashboard" in sidebar
   - ✅ Should load without errors

2. **Verify Display**
   - ✅ Total Spent: Should show 3450 (2500 + 350 + 600)
   - ✅ Budget Remaining: Should show 11550 (15000 - 3450)
   - ✅ Daily Average: Should show calculated value
   - ✅ Transactions: Should show 3
   - ✅ Budget Progress Bar: Should show ~23%
   - ✅ Pie Chart: Should show 3 categories

3. **Test Refresh**
   - Click "Refresh" button
   - ✅ Should reload data

---

### ✅ Step 4: Test Reports (1 minute)

1. **Navigate to Reports**
   - Click "Reports" in sidebar
   - ✅ Should load without errors

2. **Verify Display**
   - ✅ Total Expenses: Should show 3450
   - ✅ Daily Average: Calculated value
   - ✅ Top Category: Food (2500)
   - ✅ Spending Trend Chart: Should show data
   - ✅ Category Pie Chart: Should show 3 slices
   - ✅ Category Table: Should show 3 rows

3. **Test View Toggle**
   - Click "Monthly" / "Yearly" toggle
   - ✅ Chart should update

4. **Test Export**
   - Click "Export CSV"
   - ✅ Should download CSV file

---

### ✅ Step 5: Test History (1 minute)

1. **Navigate to History**
   - Click "History" in sidebar
   - ✅ Should load without errors

2. **Verify Display**
   - ✅ Should show current month group
   - ✅ Should show 3 expenses
   - ✅ Total: Should show 3450

3. **Test Search**
   - Type "Grocery" in search
   - ✅ Should filter to 1 result

4. **Test Edit**
   - Click edit icon on any expense
   - Change amount to 2600
   - Click "Save Changes"
   - ✅ Should show success toast
   - ✅ Total should update

5. **Test Delete**
   - Click delete icon
   - Confirm deletion
   - ✅ Should show success toast
   - ✅ Expense should disappear

---

### ✅ Step 6: Test Recurring (1 minute)

1. **Navigate to Recurring**
   - Click "Recurring" in sidebar
   - ✅ Should load without errors

2. **Add Recurring Expense**
   - Click "Add Recurring"
   - Fill form:
     - Title: "Netflix Subscription"
     - Amount: 649
     - Category: Entertainment
     - Frequency: Monthly
     - Start Date: Today
   - Click "Add Recurring"
   - ✅ Should show success toast
   - ✅ Should appear in list

3. **Test Generate**
   - Click "Generate Expenses"
   - ✅ Should show success toast
   - Go to History
   - ✅ Should see auto-generated expense

4. **Test Toggle**
   - Back to Recurring page
   - Click "Pause" button
   - ✅ Status should change to "Paused"
   - Click "Resume"
   - ✅ Status should change to "Active"

---

## 🎯 Expected Results Summary

After completing all tests:

### Dashboard
- ✅ Shows updated totals
- ✅ Charts display correctly
- ✅ No console errors

### Reports
- ✅ All 3 API calls successful
- ✅ Charts and tables render
- ✅ Export works

### History
- ✅ Expenses grouped by month
- ✅ Search/filter works
- ✅ Edit/delete works

### Recurring
- ✅ CRUD operations work
- ✅ Generate creates expenses
- ✅ Toggle changes status

### Authentication
- ✅ Login persists across refreshes
- ✅ Logout clears session
- ✅ Protected routes redirect when not logged in

---

## 🐛 If Something Fails

### Check Console (F12)
- Look for red error messages
- Check Network tab for failed requests

### Verify Backend is Running
```bash
# Should show: "Starting development server at http://127.0.0.1:8000/"
```

### Verify Frontend is Running
```bash
# Should show: "Local: http://localhost:5173/"
```

### Check Database
```bash
cd backend
python manage.py shell
>>> from expenses.models import Expense
>>> Expense.objects.all().count()
# Should show number of expenses
```

### Clear Cache & Retry
1. Open DevTools (F12)
2. Right-click refresh button
3. Select "Empty Cache and Hard Reload"
4. Try again

---

## ✅ Success Indicators

You've successfully tested everything if:

1. ✅ All pages load without console errors
2. ✅ All API calls return 200 status (check Network tab)
3. ✅ Data displays correctly on all pages
4. ✅ CRUD operations work (Create, Read, Update, Delete)
5. ✅ Authentication persists on refresh
6. ✅ Toast notifications appear for all actions
7. ✅ Loading spinners show during API calls
8. ✅ Empty states show when no data
9. ✅ Error messages show when API fails

---

## 🎉 All Tests Passed?

**Congratulations!** Your Expense Tracker is now fully functional. You can now:

- Track expenses in real-time
- View detailed reports and analytics
- Manage recurring expenses
- Export data to CSV
- Use across devices (data persists in backend)

---

## 📊 What's Working Now

| Feature | Status |
|---------|--------|
| User Registration | ✅ Working |
| User Login/Logout | ✅ Working |
| Token Persistence | ✅ Working |
| Add Expense | ✅ Working |
| Edit Expense | ✅ Working |
| Delete Expense | ✅ Working |
| Dashboard Stats | ✅ Working |
| Budget Tracking | ✅ Working |
| Pie Chart | ✅ Working |
| Reports Page | ✅ Working |
| Spending Trend | ✅ Working |
| Category Summary | ✅ Working |
| History Page | ✅ Working |
| Grouped by Month | ✅ Working |
| Search/Filter | ✅ Working |
| Recurring Expenses | ✅ Working |
| Auto-Generate | ✅ Working |
| CSV Export | ✅ Working |
| Error Handling | ✅ Working |
| Loading States | ✅ Working |
| Empty States | ✅ Working |
| Toast Notifications | ✅ Working |

---

## 🚀 Ready for Production?

Before deploying to production, consider:

1. ✅ Update `ALLOWED_HOSTS` in Django settings
2. ✅ Set `DEBUG = False` in production
3. ✅ Configure proper CORS settings
4. ✅ Use environment variables for secrets
5. ✅ Set up PostgreSQL (instead of SQLite)
6. ✅ Configure static files serving
7. ✅ Add HTTPS certificate
8. ✅ Set up backup system

---

Enjoy your fully functional Expense Tracker! 🎉


