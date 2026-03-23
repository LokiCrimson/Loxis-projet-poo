import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.local')
django.setup()

from apps.users.models import User

# Admin
admin, created = User.objects.get_or_create(username='admin', email='admin@loxis.com')
admin.set_password('admin123')
admin.role = 'ADMIN'
admin.is_superuser = True
admin.is_staff = True
admin.save()

# Proprio
proprio, created = User.objects.get_or_create(username='proprio', email='proprio@loxis.com')
proprio.set_password('proprio123')
proprio.role = 'OWNER'
proprio.save()

# Locataire
locataire, created = User.objects.get_or_create(username='locataire', email='locataire@loxis.com')
locataire.set_password('locataire123')
locataire.role = 'TENANT'
locataire.save()

print('Users created successfully!')
