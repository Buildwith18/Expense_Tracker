#!/usr/bin/env python3
"""
Django Server Starter
Automatically sets up and starts the Django development server
"""

import os
import sys
import subprocess
import django
from pathlib import Path

def start_django_server():
    """Start Django development server with proper setup"""
    
    # Change to backend directory
    backend_dir = Path(__file__).parent
    os.chdir(backend_dir)
    
    print("🚀 Starting Django Expense Tracker Server...")
    print(f"📁 Working directory: {os.getcwd()}")
    
    # Set Django settings
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'expense_tracker.settings')
    
    try:
        # Quick setup check
        django.setup()
        print("✅ Django configuration loaded")
        
        # Check if migrations are needed
        print("🔍 Checking for pending migrations...")
        result = subprocess.run(
            ["python", "manage.py", "showmigrations", "--plan"],
            capture_output=True, text=True
        )
        
        if "[ ]" in result.stdout:
            print("📦 Applying pending migrations...")
            subprocess.run(["python", "manage.py", "migrate"], check=True)
        
        # Start the server
        print("\n🌐 Starting development server...")
        print("📍 Server will be available at: http://localhost:8000/")
        print("📍 API endpoints at: http://localhost:8000/api/")
        print("📍 Admin interface at: http://localhost:8000/admin/")
        print("\n⏹️  Press Ctrl+C to stop the server")
        
        # Run the server
        subprocess.run(["python", "manage.py", "runserver"], check=True)
        
    except KeyboardInterrupt:
        print("\n👋 Server stopped by user")
    except subprocess.CalledProcessError as e:
        print(f"❌ Error starting server: {e}")
        print("\n🔧 Try running setup first:")
        print("python setup_django.py")
    except Exception as e:
        print(f"❌ Unexpected error: {e}")

if __name__ == "__main__":
    start_django_server()