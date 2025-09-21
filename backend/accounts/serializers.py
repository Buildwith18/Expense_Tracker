from rest_framework import serializers
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from .models import User


class UserRegistrationSerializer(serializers.ModelSerializer):
    """
    Serializer for user registration
    """
    password = serializers.CharField(
        write_only=True,
        validators=[validate_password],
        style={'input_type': 'password'}
    )
    password_confirm = serializers.CharField(
        write_only=True,
        style={'input_type': 'password'}
    )

    class Meta:
        model = User
        fields = (
            'username', 'email', 'password', 'password_confirm',
            'first_name', 'last_name', 'currency'
        )
        extra_kwargs = {
            'email': {'required': True},
            'first_name': {'required': False},
            'last_name': {'required': False},
        }

    def validate(self, attrs):
        """
        Validate that passwords match
        """
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError("Passwords don't match.")
        return attrs

    def validate_email(self, value):
        """
        Validate that email is unique
        """
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value

    def create(self, validated_data):
        """
        Create and return a new user instance
        """
        # Remove password_confirm from validated_data
        validated_data.pop('password_confirm', None)
        
        # Create user with encrypted password
        user = User.objects.create_user(**validated_data)
        return user


class UserProfileSerializer(serializers.ModelSerializer):
    """
    Serializer for user profile (settings)
    """
    total_expenses = serializers.SerializerMethodField()
    full_name = serializers.ReadOnlyField()

    class Meta:
        model = User
        fields = (
            'id', 'username', 'email', 'first_name', 'last_name',
            'currency', 'profile_picture', 'full_name', 'total_expenses', 'monthly_budget',
            'notifications_enabled', 'dark_mode',
            'date_joined', 'last_login'
        )
        read_only_fields = ('id', 'date_joined', 'last_login')

    def get_total_expenses(self, obj):
        """
        Get total expenses for the user
        """
        return obj.get_total_expenses()

    def validate_email(self, value):
        """
        Validate that email is unique (excluding current user)
        """
        user = self.instance
        if user and User.objects.filter(email=value).exclude(pk=user.pk).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value


class UserSettingsSerializer(serializers.ModelSerializer):
    """
    Serializer for user settings and preferences
    """
    preferences = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = (
            'monthly_budget', 'notifications_enabled', 'dark_mode', 'preferences'
        )
    
    def get_preferences(self, obj):
        """Get user preferences"""
        return {
            'currency': obj.currency,
            'notifications_enabled': obj.notifications_enabled,
            'dark_mode': obj.dark_mode,
            'theme_color': getattr(obj, 'theme_color', 'blue'),
            'compact_mode': getattr(obj, 'compact_mode', False),
            'alert_threshold': getattr(obj, 'alert_threshold', 80),
            'enable_alerts': getattr(obj, 'enable_alerts', True),
        }


class ChangePasswordSerializer(serializers.Serializer):
    """
    Serializer for changing password
    """
    current_password = serializers.CharField(
        required=True,
        style={'input_type': 'password'}
    )
    new_password = serializers.CharField(
        required=True,
        validators=[validate_password],
        style={'input_type': 'password'}
    )
    confirm_password = serializers.CharField(
        required=True,
        style={'input_type': 'password'}
    )

    def validate_current_password(self, value):
        """
        Validate current password
        """
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("Current password is incorrect.")
        return value

    def validate(self, attrs):
        """
        Validate that new passwords match
        """
        if attrs['new_password'] != attrs['confirm_password']:
            raise serializers.ValidationError("New passwords don't match.")
        return attrs

    def save(self):
        """
        Update user password
        """
        user = self.context['request'].user
        user.set_password(self.validated_data['new_password'])
        user.save()
        return user