"""
URL configuration for expense_tracker project.
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import JsonResponse


def api_root(request):
    return JsonResponse({
        'message': 'Expense Tracker API',
        'version': '1.0',
        'endpoints': {
            'auth': '/api/token/',
            'register': '/api/register/',
            'profile': '/api/profile/',
            'expenses': '/api/expenses/',
            'settings': '/api/settings/'
        }
    })


urlpatterns = [
    path('admin/', admin.site.urls),

    # ✅ Include app routes
    path('api/', include('accounts.urls')),
    path('api/', include('expenses.urls')),

    # ✅ Place api_root last (acts as a welcome message for /api/)
    path('api/', api_root, name='api_root'),
]

# ✅ Serve media files during development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

# """
# URL configuration for expense_tracker project.
# """
# from django.contrib import admin
# from django.urls import path, include
# from django.conf import settings
# from django.conf.urls.static import static
# from django.http import JsonResponse

# def api_root(request):
#     return JsonResponse({
#         'message': 'Expense Tracker API',
#         'version': '1.0',
#         'endpoints': {
#             'auth': '/api/token/',
#             'register': '/api/register/',
#             'profile': '/api/profile/',
#             'expenses': '/api/expenses/',
#             'settings': '/api/settings/'
#         }
#     })

# urlpatterns = [
#     path('admin/', admin.site.urls),
#     path('api/', api_root, name='api_root'),
#     path('api/', include('accounts.urls')),
#     path('api/', include('expenses.urls')),
# ]

# # Serve media files during development
# if settings.DEBUG:
#     urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)