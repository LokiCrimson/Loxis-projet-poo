import os
import re

src_dir = r"c:\Users\ajavo\Documents\Dossier projet\loxis (3)\src"

replacements = {
    'Ã©': 'é',
    'Ã¨': 'è',
    'Ã ': 'à',
    'Ã¢': 'â',
    'Ãª': 'ê',
    'Ã®': 'î',
    'Ã´': 'ô',
    'Ã»': 'û',
    'Ã¹': 'ù',
    'Ã§': 'ç',
    'Ã¯': 'ï',
    'Ã‰': 'É',
    'Ãˆ': 'È',
    'Ã€': 'À',
    'â‚¬': '€',
    'â€™': "'",
    'Å“': 'œ',
    'Â°': '°',
    'Â«': '«',
    'Â»': '»',
    'Â ': ' ', # non-breaking space mapping artifact
}

def fix_file(filepath):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
    except Exception as e:
        return False, str(e)
        
    original = content
    for bad, good in replacements.items():
        content = content.replace(bad, good)
        
    # specific manual fixes for ï¿½ if needed (most are probably known words)
    # let's write to file if changed
    if content != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        return True, "Fixed"
    return False, "No changes"

modified_files = []
for root, dirs, files in os.walk(src_dir):
    for file in files:
        if file.endswith(('.jsx', '.js', '.tsx', '.ts', '.css', '.html')):
            path = os.path.join(root, file)
            changed, msg = fix_file(path)
            if changed:
                modified_files.append(file)

print(f"Fixed {len(modified_files)} files.")
for f in modified_files:
    print(f"- {f}")
