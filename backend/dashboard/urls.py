from django.urls import path
from .views import DirectionStatsView

urlpatterns = [
    path('stats/', DirectionStatsView.as_view(), name='direction-stats'),
]
