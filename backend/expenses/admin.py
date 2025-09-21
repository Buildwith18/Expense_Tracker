from django.contrib import admin
from .models import Expense, RecurringExpense


@admin.register(RecurringExpense)
class RecurringExpenseAdmin(admin.ModelAdmin):
    """
    Admin interface for RecurringExpense model
    """
    list_display = ('title', 'user', 'amount', 'category', 'frequency', 'next_date', 'is_active', 'created_at')
    list_filter = ('category', 'frequency', 'is_active', 'created_at', 'user')
    search_fields = ('title', 'description', 'user__username', 'user__email')
    ordering = ('-created_at',)
    date_hierarchy = 'next_date'
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('user', 'title', 'amount', 'category', 'frequency')
        }),
        ('Schedule', {
            'fields': ('start_date', 'next_date', 'is_active')
        }),
        ('Additional Details', {
            'fields': ('description',),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',),
        }),
    )
    
    readonly_fields = ('created_at', 'updated_at')
    
    def get_queryset(self, request):
        """Optimize queryset with select_related"""
        return super().get_queryset(request).select_related('user')
@admin.register(Expense)
class ExpenseAdmin(admin.ModelAdmin):
    """
    Admin interface for Expense model
    """
    list_display = ('title', 'user', 'amount', 'category', 'date', 'created_at')
    list_filter = ('category', 'date', 'created_at', 'user')
    search_fields = ('title', 'description', 'user__username', 'user__email')
    ordering = ('-date', '-created_at')
    date_hierarchy = 'date'
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('user', 'title', 'amount', 'category', 'date')
        }),
        ('Additional Details', {
            'fields': ('description',),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',),
        }),
    )
    
    readonly_fields = ('created_at', 'updated_at')
    
    def get_queryset(self, request):
        """
        Optimize queryset with select_related
        """
        return super().get_queryset(request).select_related('user')