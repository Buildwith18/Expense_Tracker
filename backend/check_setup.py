#!/usr/bin/env python3
"""
Django Setup Checker
Checks if Django backend is properly configured
"""

import os
import sys
import django
from pathlib import Path

def check_django_setup():
    """Check Django setup and configuration"""
    
    print("🔍 Checking Django Backend Setup...")
    
    # Check if we're in the right directory
    backend_dir = Path(__file__).parent
    os.chdir(backend_dir)
    
    # Check if manage.py exists
    if not os.path.exists('manage.py'):
        print("❌ manage.py not found. Make sure you're in the backend directory.")
        return False
    
    # Check if requirements.txt exists
    if not os.path.exists('requirements.txt'):
        print("❌ requirements.txt not found.")
        return False
    
    # Set Django settings
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'expense_tracker.settings')
    
    try:
        # Initialize Django
        django.setup()
        print("✅ Django setup successful")
        
        # Check if apps are installed
        from django.apps import apps
        
        # Check accounts app
        try:
            accounts_app = apps.get_app_config('accounts')
            print("✅ Accounts app found")
        except:
            print("❌ Accounts app not found")
            return False
        
        # Check expenses app
        try:
            expenses_app = apps.get_app_config('expenses')
            print("✅ Expenses app found")
        except:
            print("❌ Expenses app not found")
            return False
        
        # Check models
        try:
            from accounts.models import User
            from expenses.models import Expense, RecurringExpense
            print("✅ All models imported successfully")
        except Exception as e:
            print(f"❌ Error importing models: {e}")
            return False
        
        # Check database
        try:
            from django.db import connection
            with connection.cursor() as cursor:
                cursor.execute("SELECT 1")
            print("✅ Database connection successful")
        except Exception as e:
            print(f"❌ Database connection failed: {e}")
            return False
        
        print("\n🎉 All checks passed! Django backend is properly configured.")
        return True
        
    except Exception as e:
        print(f"❌ Django setup failed: {e}")
        return False

if __name__ == "__main__":
    if check_django_setup():
        print("\n📋 To start the server:")
        print("python manage.py runserver")
    else:
        print("\n🔧 To fix issues:")
        print("python setup_django.py")