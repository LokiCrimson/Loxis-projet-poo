from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from .models import Property, PropertyCategory, PropertyType, PropertyPhoto, PropertyFurniture
from .serializers import PropertyCategorySerializer, PropertyTypeSerializer, PropertySerializer

class CategoryListCreateApi(generics.ListCreateAPIView):
    queryset = PropertyCategory.objects.all()
    serializer_class = PropertyCategorySerializer
    permission_classes = [IsAuthenticated]

class TypeListCreateApi(generics.ListCreateAPIView):
    queryset = PropertyType.objects.all()
    serializer_class = PropertyTypeSerializer
    permission_classes = [IsAuthenticated]

class PropertyListCreateApi(generics.ListCreateAPIView):
    serializer_class = PropertySerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        # Allow filtering by owner if needed, else return all properties created by owner
        return Property.objects.filter(owner=self.request.user)
        
    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

class PropertyDetailApi(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = PropertySerializer
    permission_classes = [IsAuthenticated]
    lookup_url_kwarg = 'property_id'
    
    def get_queryset(self):
        return Property.objects.filter(owner=self.request.user)

class PropertyStatusUpdateApi(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request, property_id):
        property_obj = get_object_or_404(Property, id=property_id, owner=request.user)
        new_status = request.data.get('status')
        if not new_status:
            return Response({'error': 'Status is required'}, status=status.HTTP_400_BAD_REQUEST)
        property_obj.status = new_status
        property_obj.save()
        return Response({'message': 'Status updated', 'status': property_obj.status})

class PropertyPhotoListCreateApi(APIView):
    parser_classes = (MultiPartParser, FormParser)
    permission_classes = [IsAuthenticated]

    def get(self, request, property_id):
        # On pourrait retourner ici la liste des URLs des photos
        return Response([{"message": "Liste des photos a venir"}])

    def post(self, request, property_id):
        property_obj = get_object_or_404(Property, id=property_id, owner=request.user)
        image_file = request.FILES.get('image')

        if not image_file:
            return Response({"error": "Aucune image fournie avec la cl� 'image'"}, status=status.HTTP_400_BAD_REQUEST)
        
        is_main = request.data.get('is_main', 'false').lower() == 'true'
        display_order = int(request.data.get('display_order', 0))

        photo = PropertyPhoto.objects.create(
            property=property_obj,
            image=image_file,
            is_main=is_main,
            display_order=display_order
        )

        if is_main:
            PropertyPhoto.objects.filter(property=property_obj).exclude(id=photo.id).update(is_main=False)
            
        return Response({
            "message": "Photo upload�e avec succ�s",
            "photo_id": photo.id,
            "url": photo.image.url
        }, status=status.HTTP_201_CREATED)


class PropertyFurnitureListCreateApi(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request, property_id):
        property_obj = get_object_or_404(Property, id=property_id, owner=request.user)
        furnitures = PropertyFurniture.objects.filter(property=property_obj)
        data = [
            {
                "id": f.id,
                "name": f.name,
                "description": f.description,
                "condition": f.condition,
                "quantity": f.quantity
            } for f in furnitures
        ]
        return Response(data, status=status.HTTP_200_OK)

    def post(self, request, property_id):
        property_obj = get_object_or_404(Property, id=property_id, owner=request.user)

        name = request.data.get('name')
        if not name:
            return Response({"error": "Le nom du meuble est requis."}, status=status.HTTP_400_BAD_REQUEST)
            
        furniture = PropertyFurniture.objects.create(
            property=property_obj,
            name=name,
            description=request.data.get('description', ''),
            condition=request.data.get('condition', 'BON_ETAT'),
            quantity=int(request.data.get('quantity', 1))
        )

        return Response({
            "id": furniture.id,
            "name": furniture.name,
            "description": furniture.description,
            "condition": furniture.condition,
            "quantity": furniture.quantity
        }, status=status.HTTP_201_CREATED)

class PropertyFurnitureDetailApi(APIView):
    permission_classes = [IsAuthenticated]
    def delete(self, request, property_id, furniture_id):
        furniture = get_object_or_404(PropertyFurniture, id=furniture_id, property__id=property_id, property__owner=request.user)
        furniture.delete()
        return Response({"message": "Meuble supprim�."}, status=status.HTTP_204_NO_CONTENT)

class PropertyKpisApi(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        from django.db.models import Sum, Count
        properties = Property.objects.filter(owner=request.user)
        total_properties = properties.count()
        total_value = properties.aggregate(total=Sum('base_rent_hc'))['total'] or 0
        vacant = properties.filter(status='VACANT').count()
        rented = properties.filter(status='RENTED').count()
        occupancy_rate = (rented / total_properties * 100) if total_properties > 0 else 0
        
        return Response({
            'total_properties': total_properties,
            'total_value': total_value,
            'occupancy_rate': round(occupancy_rate, 2),
            'monthly_revenue': 0, # Placeholder
            'vacant_count': vacant
        })

class PropertyKpisApi(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        from django.db.models import Sum, Count
        properties = Property.objects.filter(owner=request.user)
        total_properties = properties.count()
        total_value = properties.aggregate(total=Sum('base_rent_hc'))['total'] or 0
        vacant = properties.filter(status='VACANT').count()
        rented = properties.filter(status='RENTED').count()
        occupancy_rate = (rented / total_properties * 100) if total_properties > 0 else 0
        
        return Response({
            'total_properties': total_properties,
            'total_value': total_value,
            'occupancy_rate': round(occupancy_rate, 2),
            'monthly_revenue': 0, # Placeholder
            'vacant_count': vacant
        })

class PropertyKpisApi(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        from django.db.models import Sum, Count
        properties = Property.objects.filter(owner=request.user)
        total_properties = properties.count()
        total_value = properties.aggregate(total=Sum('base_rent_hc'))['total'] or 0
        vacant = properties.filter(status='VACANT').count()
        rented = properties.filter(status='RENTED').count()
        occupancy_rate = (rented / total_properties * 100) if total_properties > 0 else 0
        
        return Response({
            'total_properties': total_properties,
            'total_value': total_value,
            'occupancy_rate': round(occupancy_rate, 2),
            'monthly_revenue': 0, # Placeholder
            'vacant_count': vacant
        })
