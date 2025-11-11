@echo off
echo ==========================================
echo 🔄 Restarting Django Server
echo ==========================================
echo.
echo ⚠️  Make sure to stop the current server first (Ctrl+C)
echo.
echo Starting Django development server...
echo.

python manage.py runserver

pause

