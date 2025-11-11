from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'expenses', views.ExpenseViewSet, basename='expense')
router.register(r'recurring', views.RecurringExpenseViewSet, basename='recurring_expense')

urlpatterns = [
    path('', include(router.urls)),
    path('reports/', views.ReportsView.as_view(), name='reports'),
    # path('notifications/', views.NotificationsView.as_view(), name='notifications'),
]