from rest_framework import serializers
from .models import Expense
from .models import RecurringExpense
from decimal import Decimal


class RecurringExpenseSerializer(serializers.ModelSerializer):
    """
    Serializer for RecurringExpense model
    """
    user = serializers.StringRelatedField(read_only=True)
    
    class Meta:
        model = RecurringExpense
        fields = [
            'id', 'user', 'title', 'amount', 'category', 'frequency',
            'start_date', 'end_date', 'next_date', 'is_active', 'description',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']
        extra_kwargs = {
            'next_date': {'required': False},
            'description': {'required': False, 'allow_blank': True},
            'end_date': {'required': False, 'allow_null': True},
        }

    def validate_amount(self, value):
        """Validate that amount is positive"""
        if value <= Decimal('0'):
            raise serializers.ValidationError("Amount must be greater than 0.")
        return value

    def validate_title(self, value):
        """Validate title is not empty"""
        if not value.strip():
            raise serializers.ValidationError("Title cannot be empty.")
        return value.strip()

    def validate_category(self, value):
        """Ensure category matches available choices"""
        value = value.lower()
        valid_categories = {choice[0] for choice in Expense.CATEGORY_CHOICES}
        if value not in valid_categories:
            raise serializers.ValidationError("Invalid category.")
        return value

    def validate_frequency(self, value):
        """Ensure frequency is a supported value"""
        valid_frequencies = {choice[0] for choice in RecurringExpense.FREQUENCY_CHOICES}
        if value not in valid_frequencies:
            raise serializers.ValidationError("Invalid frequency.")
        return value

    def validate(self, data):
        """Validate start_date and end_date"""
        start_date = data.get('start_date')
        end_date = data.get('end_date')
        
        if end_date and start_date and end_date <= start_date:
            raise serializers.ValidationError("End date must be after start date.")
        
        return data

    def create(self, validated_data):
        """Create recurring expense and set next_date if not provided"""
        if 'next_date' not in validated_data:
            validated_data['next_date'] = validated_data['start_date']
        request = self.context.get('request')
        if request is None or request.user.is_anonymous:
            raise serializers.ValidationError("User context is required.")
        validated_data['user'] = request.user
        return super().create(validated_data)
class ExpenseSerializer(serializers.ModelSerializer):
    """
    Serializer for Expense model
    """
    user = serializers.StringRelatedField(read_only=True)
    formatted_amount = serializers.ReadOnlyField()
    
    class Meta:
        model = Expense
        fields = [
            'id', 'user', 'title', 'amount', 'category', 'date',
            'description', 'formatted_amount', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']

    def validate_amount(self, value):
        """
        Validate that amount is positive
        """
        if value <= Decimal('0'):
            raise serializers.ValidationError("Amount must be greater than 0.")
        return value

    def validate_title(self, value):
        """
        Validate title is not empty
        """
        if not value.strip():
            raise serializers.ValidationError("Title cannot be empty.")
        return value.strip()

    def create(self, validated_data):
        """
        Create expense and associate with current user
        """
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)


class ExpenseCreateSerializer(serializers.ModelSerializer):
    """
    Serializer for creating expenses (simplified)
    """
    class Meta:
        model = Expense
        fields = ['title', 'amount', 'category', 'date', 'description']
        extra_kwargs = {
            'description': {'required': False, 'allow_blank': True},
        }

    def validate_amount(self, value):
        """
        Validate that amount is positive
        """
        if value <= Decimal('0'):
            raise serializers.ValidationError("Amount must be greater than 0.")
        return value

    def validate_title(self, value):
        """
        Validate title is not empty
        """
        if not value.strip():
            raise serializers.ValidationError("Title cannot be empty.")
        return value.strip()

    def validate_category(self, value):
        """
        Ensure category aligns with model choices
        """
        value = value.lower()
        valid_categories = {choice[0] for choice in Expense.CATEGORY_CHOICES}
        if value not in valid_categories:
            raise serializers.ValidationError("Invalid category.")
        return value

    def create(self, validated_data):
        """
        Associate expense with the authenticated user
        """
        request = self.context.get('request')
        if request is None or request.user.is_anonymous:
            raise serializers.ValidationError("User context is required.")
        return Expense.objects.create(user=request.user, **validated_data)


class ExpenseStatsSerializer(serializers.Serializer):
    """
    Serializer for expense statistics
    """
    total_expenses = serializers.DecimalField(max_digits=10, decimal_places=2)
    total_count = serializers.IntegerField()
    today_expenses = serializers.DecimalField(max_digits=10, decimal_places=2)
    this_week_expenses = serializers.DecimalField(max_digits=10, decimal_places=2)
    this_month_expenses = serializers.DecimalField(max_digits=10, decimal_places=2)
    category_breakdown = serializers.DictField()
    recent_expenses = ExpenseSerializer(many=True, read_only=True)