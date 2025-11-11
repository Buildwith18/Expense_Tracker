from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator
from decimal import Decimal
from datetime import timedelta
from dateutil.relativedelta import relativedelta


class Expense(models.Model):
    """
    Expense model for tracking user expenses
    """
    CATEGORY_CHOICES = [
        ('food', 'Food'),
        ('transport', 'Transport'),
        ('entertainment', 'Entertainment'),
        ('utilities', 'Utilities'),
        ('healthcare', 'Healthcare'),
        ('shopping', 'Shopping'),
        ('education', 'Education'),
        ('travel', 'Travel'),
        ('other', 'Other'),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='expenses',
        help_text='User who created this expense'
    )
    title = models.CharField(
        max_length=200,
        help_text='Brief description of the expense'
    )
    amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.01'))],
        help_text='Amount spent'
    )
    category = models.CharField(
        max_length=20,
        choices=CATEGORY_CHOICES,
        default='other',
        help_text='Category of the expense'
    )
    date = models.DateField(
        help_text='Date when the expense occurred'
    )
    description = models.TextField(
        blank=True,
        null=True,
        help_text='Additional details about the expense (optional)'
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
        help_text='When this expense record was created'
    )
    updated_at = models.DateTimeField(
        auto_now=True,
        help_text='When this expense record was last updated'
    )

    class Meta:
        db_table = 'expenses'
        verbose_name = 'Expense'
        verbose_name_plural = 'Expenses'
        ordering = ['-date', '-created_at']
        indexes = [
            models.Index(fields=['user', 'date']),
            models.Index(fields=['user', 'category']),
            models.Index(fields=['date']),
        ]

    def __str__(self):
        return f"{self.title} - ${self.amount} ({self.user.username})"

    @property
    def formatted_amount(self):
        """Return formatted amount with Indian currency formatting."""
        import locale
        try:
            # Set locale for Indian formatting
            locale.setlocale(locale.LC_ALL, 'en_IN.UTF-8')
            formatted = locale.currency(self.amount, grouping=True, symbol='₹')
            return formatted
        except:
            # Fallback to simple formatting
            return f"₹{self.amount:,.2f}"

    def save(self, *args, **kwargs):
        """Override save to ensure amount is positive."""
        if self.amount <= 0:
            raise ValueError("Amount must be greater than 0")
        super().save(*args, **kwargs)

class RecurringExpense(models.Model):
    """
    Model for recurring expenses (subscriptions, monthly bills, etc.)
    """

    FREQUENCY_CHOICES = [
        ('daily', 'Daily'),
        ('weekly', 'Weekly'),
        ('monthly', 'Monthly'),
        ('yearly', 'Yearly'),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='recurring_expenses',
        help_text='User who created this recurring expense'
    )
    title = models.CharField(
        max_length=200,
        help_text='Brief description of the recurring expense'
    )
    amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.01'))],
        help_text='Amount for each occurrence'
    )
    category = models.CharField(
        max_length=50,
        choices=Expense.CATEGORY_CHOICES,
        default='other',
        help_text='Category of the recurring expense'
    )
    frequency = models.CharField(
        max_length=10,
        choices=FREQUENCY_CHOICES,
        default='monthly',
        help_text='How often this expense occurs'
    )
    start_date = models.DateField(
        help_text='When this recurring expense starts'
    )
    end_date = models.DateField(
        null=True,
        blank=True,
        help_text='When this recurring expense ends (optional)'
    )
    next_date = models.DateField(
        help_text='Next occurrence date'
    )
    is_active = models.BooleanField(
        default=True,
        help_text='Whether this recurring expense is active'
    )
    description = models.TextField(
        blank=True,
        null=True,
        help_text='Additional details about the recurring expense'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'recurring_expenses'
        verbose_name = 'Recurring Expense'
        verbose_name_plural = 'Recurring Expenses'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'is_active']),
            models.Index(fields=['next_date']),
        ]

    def __str__(self):
        return f"{self.title} - {self.frequency} - ₹{self.amount} ({self.user.username})"

    # ✅ Auto-calculate next occurrence date based on frequency
    def calculate_next_date(self):
        """Calculate the next occurrence date based on frequency."""
        if self.frequency == 'daily':
            return self.next_date + timedelta(days=1)
        elif self.frequency == 'weekly':
            return self.next_date + timedelta(weeks=1)
        elif self.frequency == 'monthly':
            return self.next_date + relativedelta(months=1)
        elif self.frequency == 'yearly':
            return self.next_date + relativedelta(years=1)
        return self.next_date

# class RecurringExpense(models.Model):
#     """
#     Model for recurring expenses (subscriptions, monthly bills, etc.)
#     """
#     FREQUENCY_CHOICES = [
#         ('daily', 'Daily'),
#         ('weekly', 'Weekly'),
#         ('monthly', 'Monthly'),
#         ('yearly', 'Yearly'),
#     ]

#     user = models.ForeignKey(
#         settings.AUTH_USER_MODEL,
#         on_delete=models.CASCADE,
#         related_name='recurring_expenses',
#         help_text='User who created this recurring expense'
#     )
#     title = models.CharField(
#         max_length=200,
#         help_text='Brief description of the recurring expense'
#     )
#     amount = models.DecimalField(
#         max_digits=10,
#         decimal_places=2,
#         validators=[MinValueValidator(Decimal('0.01'))],
#         help_text='Amount for each occurrence'
#     )
#     category = models.CharField(
#         max_length=20,
#         choices=Expense.CATEGORY_CHOICES,
#         default='other',
#         help_text='Category of the recurring expense'
#     )
#     frequency = models.CharField(
#         max_length=10,
#         choices=FREQUENCY_CHOICES,
#         default='monthly',
#         help_text='How often this expense occurs'
#     )
#     start_date = models.DateField(
#         help_text='When this recurring expense starts'
#     )
#     end_date = models.DateField(
#         null=True,
#         blank=True,
#         help_text='When this recurring expense ends (optional)'
#     )
#     next_date = models.DateField(
#         help_text='Next occurrence date'
#     )
#     is_active = models.BooleanField(
#         default=True,
#         help_text='Whether this recurring expense is active'
#     )
#     description = models.TextField(
#         blank=True,
#         null=True,
#         help_text='Additional details about the recurring expense'
#     )
#     created_at = models.DateTimeField(auto_now_add=True)
#     updated_at = models.DateTimeField(auto_now=True)

#     class Meta:
#         db_table = 'recurring_expenses'
#         verbose_name = 'Recurring Expense'
#         verbose_name_plural = 'Recurring Expenses'
#         ordering = ['-created_at']
#         indexes = [
#             models.Index(fields=['user', 'is_active']),
#             models.Index(fields=['next_date']),
#         ]

#     def __str__(self):
#         return f"{self.title} - {self.frequency} - ${self.amount} ({self.user.username})"

#     def calculate_next_date(self):
#         """Calculate the next occurrence date based on frequency."""
#         from datetime import timedelta
#         from dateutil.relativedelta import relativedelta
        
#         if self.frequency == 'daily':
#             return self.next_date + timedelta(days=1)
#         elif self.frequency == 'weekly':
#             return self.next_date + timedelta(weeks=1)
#         elif self.frequency == 'monthly':
#             return self.next_date + relativedelta(months=1)
#         elif self.frequency == 'yearly':
#             return self.next_date + relativedelta(years=1)
#         return self.next_date


class Notification(models.Model):
    """
    Model for user notifications
    """
    TYPE_CHOICES = [
        ('budget_alert', 'Budget Alert'),
        ('expense_added', 'Expense Added'),
        ('recurring_generated', 'Recurring Expense Generated'),
        ('budget_exceeded', 'Budget Exceeded'),
    ]
    
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='notifications'
    )
    title = models.CharField(max_length=200)
    message = models.TextField()
    type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
        
    def __str__(self):
        return f"{self.title} - {self.user.username}"