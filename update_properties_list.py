import re

file_path = r'c:\Users\LENOVO\Desktop\Projet_location\Frontend\Loxis-projet-poo-template\src\pages\Properties\PropertiesList.jsx'
with open(file_path, 'r', encoding='utf-8') as f:
    text = f.read()

# Replace photo src
text = text.replace(
    'src={`https://picsum.photos/seed/prop-${property.id}/800/400`}',
    'src={property.main_photo || `https://picsum.photos/seed/prop-${property.id}/800/400`}'
)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(text)
print("Updated successfully.")
