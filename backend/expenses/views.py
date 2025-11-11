from rest_framework import viewsets, status, permissions, generics
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError
from django.db import models
from django.db.models import Sum, Count, Q
from django.utils import timezone
from datetime import datetime, timedelta
from dateutil.relativedelta import relativedelta
from .models import Expense, RecurringExpense
from .serializers import (
    ExpenseSerializer, 
    ExpenseCreateSerializer, 
    ExpenseStatsSerializer,
    RecurringExpenseSerializer
)
from rest_framework.pagination import PageNumberPagination


class NotificationsView(generics.ListAPIView):
    """
    View for user notifications
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return self.request.user.notifications.all()
    
    def get(self, request):
        """Get user notifications"""
        notifications = self.get_queryset()[:10]  # Latest 10 notifications
        
        notification_data = []
        for notification in notifications:
            notification_data.append({
                'id': notification.id,
                'title': notification.title,
                'message': notification.message,
                'type': notification.type,
                'is_read': notification.is_read,
                'created_at': notification.created_at.isoformat()
            })
        
        return Response({
            'notifications': notification_data,
            'unread_count': notifications.filter(is_read=False).count()
        })
    
    def post(self, request):
        """Mark notification as read"""
        notification_id = request.data.get('notification_id')
        try:
            notification = self.get_queryset().get(id=notification_id)
            notification.is_read = True
            notification.save()
            return Response({'message': 'Notification marked as read'})
        except:
            return Response({'error': 'Notification not found'}, status=404)
class ReportsView(generics.GenericAPIView):
    """
    View for generating expense reports and analytics
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        """Get comprehensive expense reports"""
        user = request.user
        expenses = Expense.objects.filter(user=user)
        
        # Date filters
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        
        if start_date:
            try:
                start_date = datetime.strptime(start_date, '%Y-%m-%d').date()
                expenses = expenses.filter(date__gte=start_date)
            except ValueError:
                return Response({
                    'error': 'Invalid start_date format. Use YYYY-MM-DD'
                }, status=status.HTTP_400_BAD_REQUEST)
        
        if end_date:
            try:
                end_date = datetime.strptime(end_date, '%Y-%m-%d').date()
                expenses = expenses.filter(date__lte=end_date)
            except ValueError:
                return Response({
                    'error': 'Invalid end_date format. Use YYYY-MM-DD'
                }, status=status.HTTP_400_BAD_REQUEST)
        
        # Calculate statistics
        total_expenses = expenses.aggregate(total=Sum('amount'))['total'] or 0
        total_count = expenses.count()
        
        # Daily average
        if expenses.exists():
            date_range = expenses.aggregate(
                min_date=models.Min('date'),
                max_date=models.Max('date')
            )
            if date_range['min_date'] and date_range['max_date']:
                days = (date_range['max_date'] - date_range['min_date']).days + 1
                daily_average = total_expenses / days if days > 0 else 0
            else:
                daily_average = 0
        else:
            daily_average = 0
        
        # Category breakdown
        category_breakdown = {}
        for choice in Expense.CATEGORY_CHOICES:
            category_total = expenses.filter(category=choice[0]).aggregate(
                total=Sum('amount')
            )['total'] or 0
            if category_total > 0:
                category_breakdown[choice[1]] = {
                    'amount': float(category_total),
                    'percentage': (float(category_total) / float(total_expenses)) * 100 if total_expenses > 0 else 0
                }
        
        # Top category
        top_category = None
        if category_breakdown:
            top_category = max(category_breakdown.items(), key=lambda x: x[1]['amount'])
            top_category = {
                'name': top_category[0],
                'amount': top_category[1]['amount']
            }
        
        # Monthly trend (last 6 months)
        monthly_trend = []
        today = timezone.now().date()
        for i in range(6):
            month_start = today.replace(day=1) - timedelta(days=i*30)
            month_end = (month_start + timedelta(days=32)).replace(day=1) - timedelta(days=1)
            
            month_total = expenses.filter(
                date__gte=month_start,
                date__lte=month_end
            ).aggregate(total=Sum('amount'))['total'] or 0
            
            monthly_trend.append({
                'month': month_start.strftime('%b %Y'),
                'amount': float(month_total)
            })
        
        monthly_trend.reverse()  # Show oldest to newest
        
        return Response({
            'total_expenses': float(total_expenses),
            'total_count': total_count,
            'daily_average': float(daily_average),
            'category_breakdown': category_breakdown,
            'top_category': top_category,
            'monthly_trend': monthly_trend,
            'date_range': {
                'start': start_date.isoformat() if start_date else None,
                'end': end_date.isoformat() if end_date else None
            }
        })

    @action(detail=False, methods=['get'])
    def spending_trend(self, request):
        """Get spending trend data for charts"""
        user = request.user
        expenses = Expense.objects.filter(user=user)
        
        # Get view type (monthly or yearly)
        view_type = request.query_params.get('view', 'monthly')
        months_back = int(request.query_params.get('months', 12))
        
        today = timezone.now().date()
        trend_data = []
        
        if view_type == 'monthly':
            # Monthly trend data
            for i in range(months_back):
                if i == 0:
                    month_start = today.replace(day=1)
                    month_end = today
                else:
                    month_start = (today.replace(day=1) - relativedelta(months=i))
                    month_end = (month_start + relativedelta(months=1) - timedelta(days=1))
                
                month_total = expenses.filter(
                    date__gte=month_start,
                    date__lte=month_end
                ).aggregate(total=Sum('amount'))['total'] or 0
                
                trend_data.append({
                    'period': month_start.strftime('%b %Y'),
                    'amount': float(month_total),
                    'date': month_start.isoformat()
                })
        
        elif view_type == 'yearly':
            # Yearly trend data
            years_back = max(1, months_back // 12)
            for i in range(years_back):
                year_start = today.replace(month=1, day=1) - relativedelta(years=i)
                year_end = year_start.replace(month=12, day=31)
                
                year_total = expenses.filter(
                    date__gte=year_start,
                    date__lte=year_end
                ).aggregate(total=Sum('amount'))['total'] or 0
                
                trend_data.append({
                    'period': year_start.strftime('%Y'),
                    'amount': float(year_total),
                    'date': year_start.isoformat()
                })
        
        trend_data.reverse()  # Show oldest to newest
        
        return Response({
            'trend_data': trend_data,
            'view_type': view_type,
            'total_periods': len(trend_data)
        })

    @action(detail=False, methods=['get'])
    def category_summary(self, request):
        """Get category summary data for charts"""
        user = request.user
        expenses = Expense.objects.filter(user=user)
        
        # Date filters
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        
        if start_date:
            try:
                start_date = datetime.strptime(start_date, '%Y-%m-%d').date()
                expenses = expenses.filter(date__gte=start_date)
            except ValueError:
                return Response({
                    'error': 'Invalid start_date format. Use YYYY-MM-DD'
                }, status=status.HTTP_400_BAD_REQUEST)
        
        if end_date:
            try:
                end_date = datetime.strptime(end_date, '%Y-%m-%d').date()
                expenses = expenses.filter(date__lte=end_date)
            except ValueError:
                return Response({
                    'error': 'Invalid end_date format. Use YYYY-MM-DD'
                }, status=status.HTTP_400_BAD_REQUEST)
        
        # Calculate category totals
        category_data = []
        total_amount = expenses.aggregate(total=Sum('amount'))['total'] or 0
        
        for choice in Expense.CATEGORY_CHOICES:
            category_total = expenses.filter(category=choice[0]).aggregate(
                total=Sum('amount')
            )['total'] or 0
            
            if category_total > 0:
                category_data.append({
                    'category': choice[1],
                    'amount': float(category_total),
                    'percentage': (float(category_total) / float(total_amount)) * 100 if total_amount > 0 else 0,
                    'count': expenses.filter(category=choice[0]).count()
                })
        
        # Sort by amount descending
        category_data.sort(key=lambda x: x['amount'], reverse=True)
        
        return Response({
            'category_data': category_data,
            'total_amount': float(total_amount),
            'total_categories': len(category_data)
        })
class RecurringExpenseViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing recurring expenses
    """
    serializer_class = RecurringExpenseSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """Return recurring expenses for the current user only"""
        return RecurringExpense.objects.filter(user=self.request.user)

    def create(self, request, *args, **kwargs):
        """Create a new recurring expense"""
        serializer = self.get_serializer(data=request.data, context={'request': request})
        try:
            serializer.is_valid(raise_exception=True)
        except ValidationError as exc:
            return Response(
                {'message': 'Invalid recurring expense data', 'errors': exc.detail},
                status=status.HTTP_400_BAD_REQUEST
            )

        recurring_expense = serializer.save()
        response_data = RecurringExpenseSerializer(
            recurring_expense, context={'request': request}
        ).data

        return Response(
            {
                'message': 'Recurring expense created successfully',
                'recurring_expense': response_data,
            },
            status=status.HTTP_201_CREATED,
        )

    def update(self, request, *args, **kwargs):
        """Update a recurring expense"""
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(
            instance, data=request.data, partial=partial, context={'request': request}
        )
        try:
            serializer.is_valid(raise_exception=True)
        except ValidationError as exc:
            return Response(
                {'message': 'Invalid recurring expense data', 'errors': exc.detail},
                status=status.HTTP_400_BAD_REQUEST
            )
        self.perform_update(serializer)

        return Response(
            {
                'message': 'Recurring expense updated successfully',
                'recurring_expense': serializer.data,
            }
        )

    def destroy(self, request, *args, **kwargs):
        """Delete a recurring expense"""
        instance = self.get_object()
        self.perform_destroy(instance)
        return Response({
            'message': 'Recurring expense deleted successfully'
        }, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'])
    def toggle_active(self, request, pk=None):
        """Toggle active status of recurring expense"""
        recurring_expense = self.get_object()
        recurring_expense.is_active = not recurring_expense.is_active
        recurring_expense.save()

        serialized = RecurringExpenseSerializer(
            recurring_expense, context={'request': request}
        ).data

        return Response(
            {
                'message': (
                    f'Recurring expense {"activated" if recurring_expense.is_active else "deactivated"}'
                ),
                'recurring_expense': serialized,
            }
        )

    @action(detail=False, methods=['post'])
    def generate_expenses(self, request):
        """Generate expenses from due recurring expenses"""
        today = timezone.now().date()
        due_recurring = self.get_queryset().filter(
            is_active=True,
            next_date__lte=today
        )
        
        generated_count = 0
        for recurring in due_recurring:
            # Check if we should stop generating (if end_date is set)
            if recurring.end_date and recurring.next_date > recurring.end_date:
                recurring.is_active = False
                recurring.save()
                continue
            
            # Create expense from recurring
            Expense.objects.create(
                user=recurring.user,
                title=f"{recurring.title} (Auto-generated)",
                amount=recurring.amount,
                category=recurring.category,
                date=recurring.next_date,
                description=f"Auto-generated from recurring expense: {recurring.description or ''}"
            )
            
            # Update next date
            recurring.next_date = recurring.calculate_next_date()
            recurring.save()
            generated_count += 1
        
        return Response({
            'message': f'Generated {generated_count} expenses from recurring expenses',
            'generated_count': generated_count
        })

    @action(detail=False, methods=['post'])
    def generate_all_recurring_expenses(self, request):
        """Generate all recurring expenses for the current month"""
        today = timezone.now().date()
        current_month_start = today.replace(day=1)
        current_month_end = (current_month_start + timedelta(days=32)).replace(day=1) - timedelta(days=1)
        
        active_recurring = self.get_queryset().filter(
            is_active=True,
            start_date__lte=current_month_end
        )
        
        generated_count = 0
        for recurring in active_recurring:
            # Generate expenses for each occurrence in the current month
            current_date = max(recurring.start_date, current_month_start)
            
            while current_date <= current_month_end:
                # Check if we should stop generating (if end_date is set)
                if recurring.end_date and current_date > recurring.end_date:
                    break
                
                # Check if this date matches the frequency
                if self._should_generate_on_date(recurring, current_date):
                    # Check if expense already exists for this date
                    existing_expense = Expense.objects.filter(
                        user=recurring.user,
                        title=f"{recurring.title} (Auto-generated)",
                        date=current_date
                    ).exists()
                    
                    if not existing_expense:
                        Expense.objects.create(
                            user=recurring.user,
                            title=f"{recurring.title} (Auto-generated)",
                            amount=recurring.amount,
                            category=recurring.category,
                            date=current_date,
                            description=f"Auto-generated from recurring expense: {recurring.description or ''}"
                        )
                        generated_count += 1
                
                # Move to next occurrence
                current_date = self._get_next_occurrence_date(recurring, current_date)
        
        return Response({
            'message': f'Generated {generated_count} recurring expenses for current month',
            'generated_count': generated_count
        })

    def _should_generate_on_date(self, recurring, date):
        """Check if a recurring expense should generate on a specific date"""
        if recurring.frequency == 'daily':
            return True
        elif recurring.frequency == 'weekly':
            return date.weekday() == recurring.start_date.weekday()
        elif recurring.frequency == 'monthly':
            return date.day == recurring.start_date.day
        elif recurring.frequency == 'yearly':
            return date.month == recurring.start_date.month and date.day == recurring.start_date.day
        return False

    def _get_next_occurrence_date(self, recurring, current_date):
        """Get the next occurrence date for a recurring expense"""
        if recurring.frequency == 'daily':
            return current_date + timedelta(days=1)
        elif recurring.frequency == 'weekly':
            return current_date + timedelta(weeks=1)
        elif recurring.frequency == 'monthly':
            return current_date + relativedelta(months=1)
        elif recurring.frequency == 'yearly':
            return current_date + relativedelta(years=1)
        return current_date
class ExpensePagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100

class ExpenseViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing expenses
    """
    serializer_class = ExpenseSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = ExpensePagination

    def get_queryset(self):
        """
        Return expenses for the current user only
        """
        return Expense.objects.filter(user=self.request.user)

    def list(self, request, *args, **kwargs):
        """
        List all expenses for authenticated user
        """
        queryset = self.filter_queryset(self.get_queryset())

        # Return unpaginated list for simple API calls
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    def get_serializer_class(self):
        """
        Return appropriate serializer based on action
        """
        if self.action == 'create':
            return ExpenseCreateSerializer
        return ExpenseSerializer

    def create(self, request, *args, **kwargs):
        """
        Create a new expense
        """
        serializer = self.get_serializer(data=request.data, context={'request': request})
        try:
            serializer.is_valid(raise_exception=True)
        except ValidationError as exc:
            return Response(
                {'message': 'Invalid expense data', 'errors': exc.detail},
                status=status.HTTP_400_BAD_REQUEST
            )
        expense = serializer.save()

        response_serializer = ExpenseSerializer(expense, context={'request': request})
        return Response(
            {
                'message': 'Expense created successfully',
                'expense': response_serializer.data,
            },
            status=status.HTTP_201_CREATED,
        )

    def update(self, request, *args, **kwargs):
        """
        Update an expense
        """
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(
            instance, data=request.data, partial=partial, context={'request': request}
        )
        try:
            serializer.is_valid(raise_exception=True)
        except ValidationError as exc:
            return Response(
                {'message': 'Invalid expense data', 'errors': exc.detail},
                status=status.HTTP_400_BAD_REQUEST
            )
        self.perform_update(serializer)

        return Response({
            'message': 'Expense updated successfully',
            'expense': serializer.data
        })

    def destroy(self, request, *args, **kwargs):
        """
        Delete an expense
        """
        instance = self.get_object()
        self.perform_destroy(instance)
        return Response({
            'message': 'Expense deleted successfully'
        }, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'])
    def stats(self, request):
        """
        Get expense statistics for the current user
        """
        user = request.user
        expenses = self.get_queryset()
        
        # Calculate date ranges
        today = timezone.now().date()
        week_start = today - timedelta(days=today.weekday())
        month_start = today.replace(day=1)
        
        # Total expenses
        total_stats = expenses.aggregate(
            total_amount=Sum('amount'),
            total_count=Count('id')
        )
        
        # Today's expenses
        today_expenses = expenses.filter(date=today).aggregate(
            total=Sum('amount')
        )['total'] or 0
        
        # This week's expenses
        week_expenses = expenses.filter(date__gte=week_start).aggregate(
            total=Sum('amount')
        )['total'] or 0
        
        # This month's expenses
        month_expenses = expenses.filter(date__gte=month_start).aggregate(
            total=Sum('amount')
        )['total'] or 0
        
        # Category breakdown
        category_breakdown = {}
        for choice in Expense.CATEGORY_CHOICES:
            category_total = expenses.filter(category=choice[0]).aggregate(
                total=Sum('amount')
            )['total'] or 0
            if category_total > 0:
                category_breakdown[choice[1]] = float(category_total)
        
        # Recent expenses (last 5)
        recent_expenses = expenses[:5]
        
        stats_data = {
            'total_expenses': total_stats['total_amount'] or 0,
            'total_count': total_stats['total_count'] or 0,
            'today_expenses': today_expenses,
            'this_week_expenses': week_expenses,
            'this_month_expenses': month_expenses,
            'category_breakdown': category_breakdown,
            'recent_expenses': recent_expenses
        }
        
        serializer = ExpenseStatsSerializer(stats_data)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def by_category(self, request):
        """
        Get expenses grouped by category
        """
        category = request.query_params.get('category')
        expenses = self.get_queryset()
        
        if category:
            expenses = expenses.filter(category=category)
        
        # Group by category
        categories = {}
        for expense in expenses:
            cat_name = expense.get_category_display()
            if cat_name not in categories:
                categories[cat_name] = []
            categories[cat_name].append(ExpenseSerializer(expense).data)
        
        return Response(categories)

    @action(detail=False, methods=['get'])
    def by_date_range(self, request):
        """
        Get expenses within a date range
        """
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        
        expenses = self.get_queryset()
        
        if start_date:
            try:
                start_date = datetime.strptime(start_date, '%Y-%m-%d').date()
                expenses = expenses.filter(date__gte=start_date)
            except ValueError:
                return Response({
                    'error': 'Invalid start_date format. Use YYYY-MM-DD'
                }, status=status.HTTP_400_BAD_REQUEST)
        
        if end_date:
            try:
                end_date = datetime.strptime(end_date, '%Y-%m-%d').date()
                expenses = expenses.filter(date__lte=end_date)
            except ValueError:
                return Response({
                    'error': 'Invalid end_date format. Use YYYY-MM-DD'
                }, status=status.HTTP_400_BAD_REQUEST)
        
        serializer = self.get_serializer(expenses, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def monthly_grouped(self, request):
        """
        Get expenses grouped by month and year
        """
        expenses = self.get_queryset()
        
        # Optional filters
        year = request.query_params.get('year')
        month = request.query_params.get('month')
        
        if year:
            try:
                year_int = int(year)
                expenses = expenses.filter(date__year=year_int)
            except ValueError:
                return Response({
                    'error': 'Invalid year format. Use YYYY'
                }, status=status.HTTP_400_BAD_REQUEST)
        
        if month:
            try:
                month_int = int(month)
                expenses = expenses.filter(date__month=month_int)
            except ValueError:
                return Response({
                    'error': 'Invalid month format. Use MM (1-12)'
                }, status=status.HTTP_400_BAD_REQUEST)
        
        # Group expenses by year and month
        from django.db.models import Sum, Count
        from collections import defaultdict
        
        # Get all expenses ordered by date
        expenses_list = expenses.order_by('-date')
        
        # Group by year-month
        grouped_expenses = defaultdict(lambda: {'expenses': [], 'total': 0, 'count': 0})
        
        for expense in expenses_list:
            year_month = f"{expense.date.year}-{expense.date.month:02d}"
            grouped_expenses[year_month]['expenses'].append(ExpenseSerializer(expense).data)
            grouped_expenses[year_month]['total'] += float(expense.amount)
            grouped_expenses[year_month]['count'] += 1
        
        # Convert to list format with proper month names
        result = []
        for year_month, data in sorted(grouped_expenses.items(), key=lambda x: x[0], reverse=True):
            year, month = year_month.split('-')
            month_name = datetime(int(year), int(month), 1).strftime('%B')
            
            result.append({
                'year_month': year_month,
                'year': int(year),
                'month': int(month),
                'month_name': month_name,
                'expenses': data['expenses'],
                'total_amount': data['total'],
                'expense_count': data['count']
            })
        
        return Response({
            'grouped_expenses': result,
            'total_months': len(result)
        })