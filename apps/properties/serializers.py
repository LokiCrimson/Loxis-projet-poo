from rest_framework import serializers
from .models import PropertyCategory, PropertyType, Property, PropertyPhoto, PropertyFurniture

class PropertyCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = PropertyCategory
        fields = ['id', 'name', 'is_active']

class PropertyTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = PropertyType
        fields = ['id', 'category', 'name']

class PropertySerializer(serializers.ModelSerializer):
    name = serializers.CharField(source='reference', required=False)
    surface = serializers.DecimalField(source='surface_area', max_digits=10, decimal_places=2, required=False)
    rooms = serializers.IntegerField(source='rooms_count', required=False)
    price = serializers.DecimalField(source='base_rent_hc', max_digits=10, decimal_places=2, required=False)
    type = serializers.CharField(source='property_type.name', read_only=True)

    class Meta:
        model = Property
        fields = [
            'id', 'owner', 'category', 'property_type', 'reference', 'status',
            'address', 'city', 'zip_code', 'surface_area', 'rooms_count',
            'description', 'base_rent_hc', 'base_charges', 'guarantee_deposit',
            'name', 'surface', 'rooms', 'price', 'type'
        ]
        read_only_fields = ['owner']
