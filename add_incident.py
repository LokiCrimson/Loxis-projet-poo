import re

file_path = r"C:\Users\LENOVO\Desktop\Projet_location\Backend\apps\properties\models.py"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

incident_model = '''
class PropertyIncident(models.Model):
    property = models.ForeignKey(Property, on_delete=models.CASCADE, related_name='incidents')
    title = models.CharField(max_length=200)
    description = models.TextField()
    status = models.CharField(max_length=20, choices=[('PENDING', 'En attente'), ('IN_PROGRESS', 'En cours'), ('RESOLVED', 'Résolu')], default='PENDING')
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Incident {self.title} - {self.property.reference}"
'''

if "class PropertyIncident" not in content:
    content += incident_model
    with open(file_path, "w", encoding="utf-8") as f:
        f.write(content)
    print("Added PropertyIncident model")
