import re
file_path = r"C:\Users\LENOVO\Desktop\Projet_location\Backend\apps\properties\models.py"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

if "tour_3d_url" not in content:
    content = content.replace(
        'description = models.TextField(blank=True)',
        'description = models.TextField(blank=True)\n    tour_3d_url = models.URLField(max_length=500, blank=True, null=True, verbose_name="Lien 3D / Visite virtuelle")'
    )
    with open(file_path, "w", encoding="utf-8") as f:
        f.write(content)
    print("Added tour_3d_url")
else:
    print("Already exists")
