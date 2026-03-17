import os

from rest_framework import serializers

from .models import Scene3D, SceneViewLog


class Scene3DSerializer(serializers.ModelSerializer):
	property = serializers.SerializerMethodField()
	created_by = serializers.SerializerMethodField()
	source_file_url = serializers.SerializerMethodField()
	thumbnail_url = serializers.SerializerMethodField()

	class Meta:
		model = Scene3D
		fields = [
			'id',
			'property',
			'created_by',
			'title',
			'description',
			'file_format',
			'status',
			'is_published',
			'published_at',
			'created_at',
			'updated_at',
			'source_file_url',
			'thumbnail_url',
		]

	def get_property(self, obj):
		return {
			'id': obj.property.id,
			'reference': obj.property.reference,
			'city': obj.property.city,
			'owner_id': obj.property.owner_id,
		}

	def get_created_by(self, obj):
		return {
			'id': obj.created_by.id,
			'email': obj.created_by.email,
			'role': obj.created_by.role,
		}

	def get_source_file_url(self, obj):
		request = self.context.get('request')
		if not obj.source_file:
			return ''
		if request:
			return request.build_absolute_uri(obj.source_file.url)
		return obj.source_file.url

	def get_thumbnail_url(self, obj):
		request = self.context.get('request')
		if not obj.thumbnail:
			return ''
		if request:
			return request.build_absolute_uri(obj.thumbnail.url)
		return obj.thumbnail.url


class Scene3DCreateSerializer(serializers.Serializer):
	property_id = serializers.IntegerField()
	title = serializers.CharField(max_length=150)
	description = serializers.CharField(required=False, allow_blank=True)
	source_file = serializers.FileField()
	thumbnail = serializers.ImageField(required=False, allow_null=True)

	def validate_source_file(self, value):
		extension = os.path.splitext(value.name)[1].lower().lstrip('.')
		if extension not in {'glb', 'gltf', 'obj'}:
			raise serializers.ValidationError('Le fichier 3D doit etre au format .glb, .gltf ou .obj.')
		return value


class SceneViewLogCreateSerializer(serializers.Serializer):
	duration_seconds = serializers.IntegerField(required=False, min_value=0, default=0)


class SceneViewLogSerializer(serializers.ModelSerializer):
	class Meta:
		model = SceneViewLog
		fields = ['id', 'scene', 'user', 'viewed_at', 'duration_seconds', 'client_ip']
		read_only_fields = fields
