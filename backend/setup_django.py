#!/usr/bin/env python3
"""
Django Backend Setup Script
Run this script to set up the Django backend properly
"""

import os
import sys
import subprocess
import django
from pathlib import Path

def run_command(command, description):
    """Run a command and handle errors"""
    print(f"\n🔧 {description}...")
    try:
        result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
        print(f"✅ {description} completed successfully")
        if result.stdout:
            print(result.stdout)
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Error in {description}:")
        print(f"Command: {command}")
        print(f"Error: {e.stderr}")
        return False

def setup_django_backend():
    """Set up Django backend step by step"""
    
    # Change to backend directory
    backend_dir = Path(__file__).parent
    os.chdir(backend_dir)
    
    print("🚀 Setting up Django Expense Tracker Backend...")
    print(f"📁 Working directory: {os.getcwd()}")
    
    # Step 1: Install dependencies
    if not run_command("pip install -r requirements.txt", "Installing dependencies"):
        print("💡 Try: pip install --upgrade pip")
        return False
    
    # Step 2: Set Django settings
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'expense_tracker.settings')
    
    # Step 3: Make migrations
    if not run_command("python manage.py makemigrations accounts", "Creating accounts migrations"):
        return False
        
    if not run_command("python manage.py makemigrations expenses", "Creating expenses migrations"):
        return False
    
    # Step 4: Apply migrations
    if not run_command("python manage.py migrate", "Applying database migrations"):
        return False
    
    # Step 5: Collect static files (if needed)
    run_command("python manage.py collectstatic --noinput", "Collecting static files")
    
    print("\n🎉 Django backend setup completed successfully!")
    print("\n📋 Next steps:")
    print("1. Create a superuser: python manage.py createsuperuser")
    print("2. Start the server: python manage.py runserver")
    print("3. Access admin at: http://localhost:8000/admin/")
    print("4. API endpoints at: http://localhost:8000/api/")
    
    return True

if __name__ == "__main__":
    setup_django_backend()