import os

from django.core.validators import FileExtensionValidator
from django.db import models

from apps.properties.models import Property
from apps.users.models import User


class Scene3D(models.Model):
	class FileFormat(models.TextChoices):
		GLB = 'glb', 'GLB'
		GLTF = 'gltf', 'glTF'
		OBJ = 'obj', 'OBJ'

	class Status(models.TextChoices):
		READY = 'READY', 'Prete'
		FAILED = 'FAILED', 'Echec'

	property = models.ForeignKey(Property, on_delete=models.CASCADE, related_name='scenes_3d')
	created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_scenes_3d')
	title = models.CharField(max_length=150)
	description = models.TextField(blank=True)
	source_file = models.FileField(
		upload_to='view3d/scenes/',
		validators=[FileExtensionValidator(allowed_extensions=['glb', 'gltf', 'obj'])],
	)
	thumbnail = models.ImageField(upload_to='view3d/thumbnails/', null=True, blank=True)
	file_format = models.CharField(max_length=10, choices=FileFormat.choices, default=FileFormat.GLB)
	status = models.CharField(max_length=20, choices=Status.choices, default=Status.READY)
	is_published = models.BooleanField(default=False)
	published_at = models.DateTimeField(null=True, blank=True)
	created_at = models.DateTimeField(auto_now_add=True)
	updated_at = models.DateTimeField(auto_now=True)

	class Meta:
		ordering = ['-created_at']
		indexes = [
			models.Index(fields=['property', '-created_at']),
			models.Index(fields=['property', 'is_published']),
			models.Index(fields=['created_by', '-created_at']),
		]

	def clean(self):
		if self.source_file:
			extension = os.path.splitext(self.source_file.name)[1].lower().lstrip('.')
			if extension and extension != self.file_format:
				self.file_format = extension

	def save(self, *args, **kwargs):
		self.clean()
		return super().save(*args, **kwargs)

	def __str__(self):
		return f"{self.title} ({self.property.reference})"


class SceneViewLog(models.Model):
	scene = models.ForeignKey(Scene3D, on_delete=models.CASCADE, related_name='view_logs')
	user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='scene_view_logs')
	viewed_at = models.DateTimeField(auto_now_add=True)
	duration_seconds = models.PositiveIntegerField(default=0)
	client_ip = models.GenericIPAddressField(null=True, blank=True)

	class Meta:
		ordering = ['-viewed_at']
		indexes = [
			models.Index(fields=['scene', '-viewed_at']),
			models.Index(fields=['user', '-viewed_at']),
		]

	def __str__(self):
		return f"Visionnage scene={self.scene_id} user={self.user_id}"
