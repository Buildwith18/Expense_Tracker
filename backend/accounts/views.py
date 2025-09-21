from django.db import models
from rest_framework import status, generics, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from .models import User
from .serializers import (
    UserRegistrationSerializer,
    UserProfileSerializer,
    UserSettingsSerializer,
    ChangePasswordSerializer
)
from django.db.models import Sum, Q
from django.utils import timezone
from datetime import datetime, timedelta
from .models import User
from .serializers import UserSerializer, UserProfileSerializer
from expenses.models import Expense
from expenses.serializers import ExpenseSerializer


class RegisterView(generics.CreateAPIView):
    """
    User registration endpoint
    """
    queryset = User.objects.all()
    serializer_class = UserRegistrationSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        # Generate JWT tokens for the new user
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'message': 'User registered successfully',
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'currency': user.currency,
            },
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }
        }, status=status.HTTP_201_CREATED)


class UserProfileView(generics.RetrieveUpdateAPIView):
    """
    View for user profile management
    """
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


class BudgetManagementView(generics.GenericAPIView):
    """
    View for budget management and tracking
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        """Get current budget status and statistics"""
        user = request.user
        today = timezone.now().date()
        month_start = today.replace(day=1)
        
        # Get current month expenses
        current_month_expenses = Expense.objects.filter(
            user=user,
            date__gte=month_start,
            date__lte=today
        ).aggregate(total=Sum('amount'))['total'] or 0
        
        # Calculate budget statistics
        monthly_budget = user.monthly_budget
        budget_remaining = monthly_budget - current_month_expenses
        budget_percentage = (current_month_expenses / monthly_budget) * 100 if monthly_budget > 0 else 0
        
        # Get daily average spending
        days_in_month = (today - month_start).days + 1
        daily_average = current_month_expenses / days_in_month if days_in_month > 0 else 0
        
        # Projected monthly spending
        days_in_month_total = (month_start.replace(month=month_start.month + 1) - month_start).days
        projected_spending = daily_average * days_in_month_total
        
        # Check if budget alerts should be triggered
        alert_threshold = user.alert_threshold
        is_alert_threshold_reached = budget_percentage >= alert_threshold
        is_budget_exceeded = current_month_expenses > monthly_budget
        
        return Response({
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'currency': user.currency,
                'monthly_budget': float(monthly_budget),
                'alert_threshold': user.alert_threshold,
                'enable_alerts': user.enable_alerts,
                'notifications_enabled': user.notifications_enabled,
                'dark_mode': user.dark_mode,
                'theme_color': user.theme_color,
                'compact_mode': user.compact_mode,
            },
            'budget_stats': {
                'monthly_budget': float(monthly_budget),
                'current_month_expenses': float(current_month_expenses),
                'budget_remaining': float(budget_remaining),
                'budget_percentage': round(budget_percentage, 2),
                'daily_average': float(daily_average),
                'projected_spending': float(projected_spending),
                'days_in_month': days_in_month,
                'days_in_month_total': days_in_month_total,
            },
            'alerts': {
                'is_alert_threshold_reached': is_alert_threshold_reached,
                'is_budget_exceeded': is_budget_exceeded,
                'alert_threshold': alert_threshold,
            }
        })

    def put(self, request):
        """Update budget settings"""
        user = request.user
        data = request.data
        
        # Update budget-related fields
        if 'monthly_budget' in data:
            user.monthly_budget = data['monthly_budget']
        if 'alert_threshold' in data:
            user.alert_threshold = data['alert_threshold']
        if 'enable_alerts' in data:
            user.enable_alerts = data['enable_alerts']
        if 'notifications_enabled' in data:
            user.notifications_enabled = data['notifications_enabled']
        if 'dark_mode' in data:
            user.dark_mode = data['dark_mode']
        if 'theme_color' in data:
            user.theme_color = data['theme_color']
        if 'compact_mode' in data:
            user.compact_mode = data['compact_mode']
        
        user.save()
        
        return Response({
            'message': 'Budget settings updated successfully',
            'user': {
                'monthly_budget': float(user.monthly_budget),
                'alert_threshold': user.alert_threshold,
                'enable_alerts': user.enable_alerts,
                'notifications_enabled': user.notifications_enabled,
                'dark_mode': user.dark_mode,
                'theme_color': user.theme_color,
                'compact_mode': user.compact_mode,
            }
        })


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def user_settings(request):
    """Get user settings and preferences"""
    user = request.user
    
    return Response({
        'user': {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'currency': user.currency,
            'monthly_budget': float(user.monthly_budget),
            'alert_threshold': user.alert_threshold,
            'enable_alerts': user.enable_alerts,
            'notifications_enabled': user.notifications_enabled,
            'dark_mode': user.dark_mode,
            'theme_color': user.theme_color,
            'compact_mode': user.compact_mode,
        }
    })


@api_view(['PUT'])
@permission_classes([permissions.IsAuthenticated])
def update_settings(request):
    """Update user settings"""
    user = request.user
    data = request.data
    
    # Update user fields
    if 'first_name' in data:
        user.first_name = data['first_name']
    if 'last_name' in data:
        user.last_name = data['last_name']
    if 'currency' in data:
        user.currency = data['currency']
    if 'monthly_budget' in data:
        user.monthly_budget = data['monthly_budget']
    if 'alert_threshold' in data:
        user.alert_threshold = data['alert_threshold']
    if 'enable_alerts' in data:
        user.enable_alerts = data['enable_alerts']
    if 'notifications_enabled' in data:
        user.notifications_enabled = data['notifications_enabled']
    if 'dark_mode' in data:
        user.dark_mode = data['dark_mode']
    if 'theme_color' in data:
        user.theme_color = data['theme_color']
    if 'compact_mode' in data:
        user.compact_mode = data['compact_mode']
    
    user.save()
    
    return Response({
        'message': 'Settings updated successfully',
        'user': UserSerializer(user).data
    })


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def change_password(request):
    """Change user password"""
    user = request.user
    current_password = request.data.get('current_password')
    new_password = request.data.get('new_password')
    confirm_password = request.data.get('confirm_password')
    
    if not current_password or not new_password or not confirm_password:
        return Response({
            'error': 'All password fields are required'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    if new_password != confirm_password:
        return Response({
            'error': 'New passwords do not match'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    if not user.check_password(current_password):
        return Response({
            'error': 'Current password is incorrect'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    user.set_password(new_password)
    user.save()
    
    return Response({
        'message': 'Password changed successfully'
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_profile(request):
    """
    Get current user profile
    """
    serializer = UserProfileSerializer(request.user)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    """
    Custom login view (alternative to SimpleJWT token view)
    """
    username = request.data.get('username')
    password = request.data.get('password')
    
    if not username or not password:
        return Response({
            'error': 'Username and password are required'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Try to authenticate with username or email
    user = authenticate(username=username, password=password)
    if not user:
        # Try with email
        try:
            user_obj = User.objects.get(email=username)
            user = authenticate(username=user_obj.username, password=password)
        except User.DoesNotExist:
            pass
    
    if user:
        refresh = RefreshToken.for_user(user)
        return Response({
            'message': 'Login successful',
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'currency': user.currency,
            },
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }
        })
    else:
        return Response({
            'error': 'Invalid credentials'
        }, status=status.HTTP_401_UNAUTHORIZED)