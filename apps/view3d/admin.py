from django.contrib import admin

from .models import Scene3D, SceneViewLog


@admin.register(Scene3D)
class Scene3DAdmin(admin.ModelAdmin):
	list_display = ('id', 'title', 'property', 'file_format', 'status', 'is_published', 'created_by', 'created_at')
	list_filter = ('file_format', 'status', 'is_published')
	search_fields = ('title', 'property__reference', 'created_by__email')


@admin.register(SceneViewLog)
class SceneViewLogAdmin(admin.ModelAdmin):
	list_display = ('id', 'scene', 'user', 'viewed_at', 'duration_seconds')
	list_filter = ('viewed_at',)
	search_fields = ('scene__title', 'user__email', 'scene__property__reference')
