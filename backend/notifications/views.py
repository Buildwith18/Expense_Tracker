from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

class NotificationView(APIView):
    """
    Dummy notifications endpoint — returns static or empty data.
    Replace later with real logic if you add notifications.
    """
    def get(self, request):
        # You can later connect this with your user notifications model
        data = [
            {"id": 1, "message": "Welcome to Expense Tracker!", "is_read": False},
            {"id": 2, "message": "You can set your monthly budget under Settings.", "is_read": True},
        ]
        return Response(data, status=status.HTTP_200_OK)

    def post(self, request):
        # Handle "mark as read" requests
        notification_id = request.data.get("notification_id")
        return Response(
            {"message": f"Notification {notification_id} marked as read"},
            status=status.HTTP_200_OK
        )
