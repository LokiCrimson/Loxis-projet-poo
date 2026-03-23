from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.permissions import IsAuthenticated
from common.permissions import IsAdminRole, IsAdminOrOwnerRole
from django.shortcuts import get_object_or_404
from .models import Property, PropertyCategory, PropertyType, PropertyPhoto, PropertyFurniture, PropertyIncident, PropertyReview
from .serializers import PropertyCategorySerializer, PropertyTypeSerializer, PropertySerializer, PropertyIncidentSerializer, PropertyReviewSerializer

class CategoryListCreateApi(generics.ListCreateAPIView):
    queryset = PropertyCategory.objects.all()
    serializer_class = PropertyCategorySerializer
    permission_classes = [IsAuthenticated]
    
    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsAdminRole()]
        return [IsAuthenticated()]

class TypeListCreateApi(generics.ListCreateAPIView):
    queryset = PropertyType.objects.all()
    serializer_class = PropertyTypeSerializer
    permission_classes = [IsAuthenticated]
    
    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsAdminRole()]
        return [IsAuthenticated()]

class PropertyListCreateApi(generics.ListCreateAPIView):
    serializer_class = PropertySerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        
        # Admin voit tout
        if user.role == 'ADMIN':
            queryset = Property.objects.all()
        # Locataire voit les biens VACANT pour réservation
        elif user.role == 'TENANT':
            queryset = Property.objects.filter(status='VACANT')
        # Propriétaire voit ses propres biens
        else:
            queryset = Property.objects.filter(owner=user)
        
        # Filters
        query_params = self.request.query_params
        
        search = query_params.get('search')
        if search:
            from django.db.models import Q
            queryset = queryset.filter(
                Q(reference__icontains=search) | 
                Q(address__icontains=search) | 
                Q(city__icontains=search)
            )
            
        statut = query_params.get('statut')
        if statut and statut != 'tous':
            if statut == 'loue':
                queryset = queryset.filter(status='RENTED')
            elif statut == 'en_travaux':
                queryset = queryset.filter(status='UNDER_WORK')
            elif statut == 'vacant':
                queryset = queryset.filter(status='VACANT')
            else:
                # Fallback if using exact match
                queryset = queryset.filter(status__iexact=statut)
                
        categorie = query_params.get('categorie')
        if categorie and categorie != 'tous':
            queryset = queryset.filter(category__name__iexact=categorie)
            
        return queryset
        
    def perform_create(self, serializer):
        # L'owner est déjà géré dans le serializer.create
        serializer.save()

class PropertyDetailApi(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = PropertySerializer
    permission_classes = [IsAuthenticated]
    lookup_url_kwarg = 'property_id'
    
    def get_queryset(self):
        user = self.request.user
        if user.role == 'ADMIN':
            return Property.objects.all()
        elif user.role == 'TENANT':
            # Un locataire peut voir les détails du bien qu'il a réservé ou loué, ou les biens vacants
            from django.db.models import Q
            return Property.objects.filter(Q(status='VACANT') | Q(leases__locataire__user=user) | Q(reservations__tenant=user)).distinct()
        return Property.objects.filter(owner=user)

class PropertyStatusUpdateApi(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request, property_id):
        user = request.user
        if user.role == 'ADMIN':
            property_obj = get_object_or_404(Property, id=property_id)
        else:
            property_obj = get_object_or_404(Property, id=property_id, owner=user)
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
        user = request.user
        if user.role == 'ADMIN':
            property_obj = get_object_or_404(Property, id=property_id)
        elif user.role == 'TENANT':
            from django.db.models import Q
            property_obj = get_object_or_404(Property.objects.filter(Q(status='VACANT') | Q(leases__locataire__user=user) | Q(reservations__tenant=user)).distinct(), id=property_id)
        else:
            property_obj = get_object_or_404(Property, id=property_id, owner=user)
            
        photos = PropertyPhoto.objects.filter(property=property_obj)
        data = [{"id": p.id, "image": request.build_absolute_uri(p.image.url), "is_main": p.is_main, "display_order": p.display_order} for p in photos if p.image]
        return Response(data, status=status.HTTP_200_OK)

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
        from django.db.models import Sum
        from apps.leases.models import Lease, StatutBailEnum
        
        properties = Property.objects.filter(owner=request.user)
        total_properties = properties.count()
        
        # Calculate active leases for the user's properties
        active_leases_qs = Lease.objects.filter(bien__in=properties, statut=StatutBailEnum.ACTIF)
        active_leases_count = active_leases_qs.count()
        
        # Monthly revenue from active leases (loyer + charges)
        monthly_revenue = active_leases_qs.aggregate(
            total=Sum('loyer_actuel') + Sum('charges')
        )['total'] or 0
        
        # Occupancy rate
        rented_count = properties.filter(status='RENTED').count()
        occupancy_rate = (rented_count / total_properties * 100) if total_properties > 0 else 0
        
        return Response({
            'total_properties': total_properties,
            'active_tenants': active_leases_count, # Assuming 1 tenant per active lease
            'active_leases': active_leases_count,
            'occupancy_rate': round(occupancy_rate, 0),
            'total_revenue': monthly_revenue
        })

class PropertyIncidentListCreateApi(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request, property_id):
        property_obj = get_object_or_404(Property, id=property_id, owner=request.user)
        incidents = PropertyIncident.objects.filter(property=property_obj)
        data = PropertyIncidentSerializer(incidents, many=True).data
        return Response(data, status=status.HTTP_200_OK)
        
    def post(self, request, property_id):
        property_obj = get_object_or_404(Property, id=property_id, owner=request.user)
        data = request.data.copy()
        data['property'] = property_obj.id
        serializer = PropertyIncidentSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
class PropertyReviewListCreateApi(generics.ListCreateAPIView):
    serializer_class = PropertyReviewSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        property_id = self.kwargs.get('property_id')
        return PropertyReview.objects.filter(property_id=property_id, is_public=True)

    def perform_create(self, serializer):
        property_obj = get_object_or_404(Property, id=self.kwargs.get('property_id'))
        # Seuls les locataires devraient pouvoir commenter (ou n'importe quel connecté pour la demo)
        serializer.save(tenant=self.request.user, property=property_obj)