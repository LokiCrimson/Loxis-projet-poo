from rest_framework import serializers
from .models import PropertyCategory, PropertyType, Property, PropertyPhoto, PropertyFurniture, PropertyIncident, PropertyReview

class PropertyCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = PropertyCategory
        fields = ['id', 'name', 'is_active']
        
    def create(self, validated_data):
        # Handle implicit translations if modeltranslation is used
        name = validated_data.get('name', '')
        # Check if fields exist before setting them to avoid errors if modeltranslation is not active
        if hasattr(self.Meta.model, 'name_fr'):
            validated_data['name_fr'] = name
        if hasattr(self.Meta.model, 'name_en'):
            validated_data['name_en'] = name
        return super().create(validated_data)

class PropertyTypeSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    
    class Meta:
        model = PropertyType
        fields = ['id', 'category', 'category_name', 'name']


class PropertyReviewSerializer(serializers.ModelSerializer):
    tenant_name = serializers.CharField(source='tenant.get_full_name', read_only=True)
    
    class Meta:
        model = PropertyReview
        fields = ['id', 'property', 'tenant', 'tenant_name', 'rating', 'comment', 'is_public', 'created_at']
        read_only_fields = ['tenant']

    def validate_rating(self, value):
        if value < 1 or value > 5:
            raise serializers.ValidationError("La note doit être entre 1 et 5.")
        return value

class PropertySerializer(serializers.ModelSerializer):
    name = serializers.CharField(source='reference', required=False)
    surface = serializers.DecimalField(source='surface_area', max_digits=10, decimal_places=2, required=False)
    rooms = serializers.IntegerField(source='rooms_count', required=False)
    price = serializers.DecimalField(source='base_rent_hc', max_digits=10, decimal_places=2, required=False)
    type = serializers.CharField(source='property_type.name', read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)
    main_photo = serializers.SerializerMethodField()
    reviews = PropertyReviewSerializer(many=True, read_only=True)
    average_rating = serializers.SerializerMethodField()

    class Meta:
        model = Property
        fields = [
            'id', 'owner', 'category', 'property_type', 'reference', 'status',
            'address', 'city', 'zip_code', 'surface_area', 'rooms_count',
            'description', 'base_rent_hc', 'base_charges', 'guarantee_deposit',
            'name', 'surface', 'rooms', 'price', 'type', 'category_name', 'tour_3d_url', 'main_photo',
            'reviews', 'average_rating'
        ]
        read_only_fields = ['owner', 'reference']

    def create(self, validated_data):
        # La référence est maintenant gérée automatiquement dans le modèle
        # On s'assure que l'owner est bien passé
        request = self.context.get('request')
        if request and request.user:
            validated_data['owner'] = request.user
        return super().create(validated_data)

    def get_main_photo(self, obj):
        request = self.context.get('request')
        photo = obj.photos.filter(is_main=True).first() or obj.photos.first()
        if photo and photo.image:
            if request:
                return request.build_absolute_uri(photo.image.url)
            return photo.image.url
        return None

    def get_average_rating(self, obj):
        from django.db.models import Avg
        avg = obj.reviews.aggregate(Avg('rating'))['rating__avg']
        return round(avg, 1) if avg else 0.0

class PropertyIncidentSerializer(serializers.ModelSerializer):
    class Meta:
        model = PropertyIncident
        fields = '__all__'
