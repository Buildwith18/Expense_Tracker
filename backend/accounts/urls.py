from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .serializers import CustomTokenObtainPairView
from . import views

urlpatterns = [
    # Authentication endpoints
    path('register/', views.RegisterView.as_view(), name='register'),
    path('login/', views.login_view, name='login'),

    # ✅ Custom JWT login (email-based)
    path('token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # User profile endpoints
    path('profile/', views.UserProfileView.as_view(), name='user_profile'),
    path('budget/', views.BudgetManagementView.as_view(), name='budget_management'),
    path('settings/', views.user_settings, name='user_settings'),
    path('settings/', views.user_settings, name='user_settings'),
    # path('update-settings/', views.update_settings, name='update_settings'),
    path('change-password/', views.change_password, name='change_password'),
    path('forgot-password/', views.forgot_password, name='forgot_password'),
    path('reset-password/', views.reset_password, name='reset_password'),
]


# from django.urls import path
# from rest_framework_simplejwt.views import (
#     TokenObtainPairView,
#     TokenRefreshView,
# )
# from . import views

# urlpatterns = [
#     # Authentication endpoints
#     path('register/', views.RegisterView.as_view(), name='register'),
#     path('login/', views.login_view, name='login'),
#     path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
#     path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
#     # User profile endpoints
#     path('profile/', views.UserProfileView.as_view(), name='user_profile'),
#     path('budget/', views.BudgetManagementView.as_view(), name='budget_management'),
#     path('settings/', views.user_settings, name='user_settings'),
#     path('update-settings/', views.update_settings, name='update_settings'),
#     path('change-password/', views.change_password, name='change_password'),
#     path('forgot-password/', views.forgot_password, name='forgot_password'),
#     path('reset-password/', views.reset_password, name='reset_password'),
# ]