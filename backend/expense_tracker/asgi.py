"""
ASGI config for expense_tracker project.
"""

import os

from django.core.asgi import get_asgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'expense_tracker.settings')

application = get_asgi_application()