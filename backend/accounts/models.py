from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """
    Custom User model extending Django's AbstractUser
    """
    CURRENCY_CHOICES = [
        ('INR', 'Indian Rupee (₹)'),
        ('USD', 'US Dollar ($)'),
        ('EUR', 'Euro (€)'),
        ('GBP', 'British Pound (£)'),
        ('CAD', 'Canadian Dollar (C$)'),
        ('AUD', 'Australian Dollar (A$)'),
        ('JPY', 'Japanese Yen (¥)'),
    ]
    
    email = models.EmailField(unique=True)
    currency = models.CharField(
        max_length=3,
        choices=CURRENCY_CHOICES,
        default='INR',
        help_text='Preferred currency for expense tracking'
    )
    profile_picture = models.ImageField(
        upload_to='profile_pictures/',
        null=True,
        blank=True,
        help_text='Profile picture (optional)'
    )
    monthly_budget = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=25000.00,
        help_text='Monthly budget limit'
    )
    notifications_enabled = models.BooleanField(
        default=True,
        help_text='Enable email notifications'
    )
    dark_mode = models.BooleanField(
        default=False,
        help_text='Enable dark mode'
    )
    theme_color = models.CharField(
        max_length=20,
        default='blue',
        help_text='Preferred theme color'
    )
    compact_mode = models.BooleanField(
        default=False,
        help_text='Enable compact layout mode'
    )
    alert_threshold = models.IntegerField(
        default=80,
        help_text='Budget alert threshold percentage'
    )
    enable_alerts = models.BooleanField(
        default=True,
        help_text='Enable budget alerts'
    )
    reset_token = models.CharField(
        max_length=32,
        null=True,
        blank=True,
        help_text='Password reset token'
    )
    reset_token_expires = models.DateTimeField(
        null=True,
        blank=True,
        help_text='Password reset token expiration'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # Make email required for registration
    REQUIRED_FIELDS = ['email']

    class Meta:
        db_table = 'auth_user'
        verbose_name = 'User'
        verbose_name_plural = 'Users'

    def __str__(self):
        return f"{self.username} ({self.email})"

    @property
    def full_name(self):
        """Return the user's full name."""
        return f"{self.first_name} {self.last_name}".strip() or self.username

    def get_total_expenses(self):
        """Calculate total expenses for this user."""
        return self.expenses.aggregate(
            total=models.Sum('amount')
        )['total'] or 0