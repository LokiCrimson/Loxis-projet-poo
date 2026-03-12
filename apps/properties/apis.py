from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework import status
from django.shortcuts import get_object_or_404
from .models import Property, PropertyPhoto

class CategoryListCreateApi(APIView):
    def get(self, request):
        return Response([])

class TypeListCreateApi(APIView):
    def get(self, request):
        return Response([])

class PropertyListCreateApi(APIView):
    def get(self, request):
        return Response([])

class PropertyDetailApi(APIView):
    def get(self, request, property_id):
        return Response({})

class PropertyStatusUpdateApi(APIView):
    def post(self, request, property_id):
        return Response({})

class PropertyPhotoListCreateApi(APIView):
    # Permet de recevoir des données de type 'multipart/form-data' (fichiers)
    parser_classes = (MultiPartParser, FormParser)

    def get(self, request, property_id):
        # On pourrait retourner ici la liste des URLs des photos
        return Response([{"message": "Liste des photos à venir"}])
        
    def post(self, request, property_id):
        property_obj = get_object_or_404(Property, id=property_id)
        image_file = request.FILES.get('image')
        
        if not image_file:
            return Response({"error": "Aucune image fournie avec la clé 'image'"}, status=status.HTTP_400_BAD_REQUEST)
            
        is_main = request.data.get('is_main', 'false').lower() == 'true'
        display_order = int(request.data.get('display_order', 0))

        # Création de l'objet Photo via le modèle
        photo = PropertyPhoto.objects.create(
            property=property_obj,
            image=image_file,
            is_main=is_main,
            display_order=display_order
        )
        
        # Si la nouvelle photo est principale, on décoche les autres (logique à déplacer idéalement dans services.py comme fait précédemment)
        if is_main:
            PropertyPhoto.objects.filter(property=property_obj).exclude(id=photo.id).update(is_main=False)

        return Response({
            "message": "Photo uploadée avec succès", 
            "photo_id": photo.id,
            "url": photo.image.url
        }, status=status.HTTP_201_CREATED)
