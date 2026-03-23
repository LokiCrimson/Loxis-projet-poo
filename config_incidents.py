import re
file_path_serializers = r"C:\Users\LENOVO\Desktop\Projet_location\Backend\apps\properties\serializers.py"
with open(file_path_serializers, "r", encoding="utf-8") as f:
    text = f.read()

incident_ser = '''
class PropertyIncidentSerializer(serializers.ModelSerializer):
    class Meta:
        model = PropertyIncident
        fields = '__all__'
'''
if "PropertyIncidentSerializer" not in text:
    text = text.replace("from .models import PropertyCategory, PropertyType, Property, PropertyPhoto, PropertyFurniture", "from .models import PropertyCategory, PropertyType, Property, PropertyPhoto, PropertyFurniture, PropertyIncident")
    text += incident_ser
    with open(file_path_serializers, "w", encoding="utf-8") as f:
        f.write(text)


file_path_apis = r"C:\Users\LENOVO\Desktop\Projet_location\Backend\apps\properties\apis.py"
with open(file_path_apis, "r", encoding="utf-8") as f:
    text_api = f.read()

incident_api = '''
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
'''
if "PropertyIncidentListCreateApi" not in text_api:
    text_api = text_api.replace("from .serializers import PropertyCategorySerializer, PropertyTypeSerializer, PropertySerializer", "from .serializers import PropertyCategorySerializer, PropertyTypeSerializer, PropertySerializer, PropertyIncidentSerializer")
    text_api = text_api.replace("from .models import Property, PropertyCategory, PropertyType, PropertyPhoto, PropertyFurniture", "from .models import Property, PropertyCategory, PropertyType, PropertyPhoto, PropertyFurniture, PropertyIncident")
    text_api += incident_api
    with open(file_path_apis, "w", encoding="utf-8") as f:
        f.write(text_api)

file_path_urls = r"C:\Users\LENOVO\Desktop\Projet_location\Backend\apps\properties\urls.py"
with open(file_path_urls, "r", encoding="utf-8") as f:
    text_urls = f.read()

if "incidents" not in text_urls:
    text_urls = text_urls.replace("]", "    path('biens/<int:property_id>/incidents/', apis.PropertyIncidentListCreateApi.as_view(), name='gestion-incidents-bien'),\n]")
    with open(file_path_urls, "w", encoding="utf-8") as f:
        f.write(text_urls)

print("Added Incident endpoints")
