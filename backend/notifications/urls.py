from django.urls import path, include
from rest_framework.routers import DefaultRouter
# from .views import ExpenseViewSet, RecurringExpenseViewSet, ReportsView, NotificationsView
from expenses.views import ExpenseViewSet, RecurringExpenseViewSet, ReportsView, NotificationsView
router = DefaultRouter()
router.register(r'expenses', ExpenseViewSet, basename='expense')
router.register(r'recurring', RecurringExpenseViewSet, basename='recurring')

urlpatterns = [
    path('', include(router.urls)),
    path('reports/', ReportsView.as_view(), name='reports'),
    path('notifications/', NotificationsView.as_view(), name='notifications'),
]


# from django.urls import path
# from .views import NotificationView

# urlpatterns = [
#     path('', NotificationView.as_view(), name='notifications'),
# ]
