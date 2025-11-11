#!/usr/bin/env python
"""
Migration script to ensure all tables are created and data is properly set up
"""
import os
import sys
import django

# Add the backend directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'expense_tracker.settings')
django.setup()

from django.core.management import call_command
from django.db import connection

def run_migrations():
    """Run all pending migrations"""
    print("🔄 Running migrations...")
    try:
        call_command('makemigrations')
        call_command('migrate')
        print("✅ Migrations completed successfully!")
        return True
    except Exception as e:
        print(f"❌ Migration failed: {e}")
        return False

def check_tables():
    """Check if all required tables exist"""
    print("\n📊 Checking database tables...")
    
    required_tables = [
        'auth_user',
        'expenses',
        'recurring_expenses',
        'expenses_notification',
    ]
    
    with connection.cursor() as cursor:
        cursor.execute("SHOW TABLES")
        existing_tables = [table[0] for table in cursor.fetchall()]
    
    all_exist = True
    for table in required_tables:
        if table in existing_tables:
            print(f"  ✅ {table}")
        else:
            print(f"  ❌ {table} - MISSING!")
            all_exist = False
    
    return all_exist

def verify_user_budget():
    """Verify users have budget set"""
    print("\n👤 Checking user budgets...")
    from accounts.models import User
    
    users = User.objects.all()
    print(f"  Found {users.count()} user(s)")
    
    for user in users:
        budget = user.monthly_budget
        print(f"  - {user.email}: ₹{budget}")

def main():
    print("=" * 60)
    print("Expense Tracker - Database Setup")
    print("=" * 60)
    
    # Run migrations
    if not run_migrations():
        print("\n❌ Setup failed during migrations")
        sys.exit(1)
    
    # Check tables
    if not check_tables():
        print("\n⚠️  Some tables are missing. Please check migrations.")
    
    # Verify user data
    verify_user_budget()
    
    print("\n" + "=" * 60)
    print("✅ Database setup complete!")
    print("=" * 60)
    print("\n📝 Next steps:")
    print("  1. Start Django server: python manage.py runserver")
    print("  2. Start frontend: npm run dev")
    print("  3. Login and test the application")
    print("")

if __name__ == '__main__':
    main()

