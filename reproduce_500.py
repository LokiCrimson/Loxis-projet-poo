
import os
import django
from django.test import Client
from django.contrib.auth import get_user_model

# Configuration de Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.base')
django.setup()

from apps.leases.models import Lease
from apps.users.models import User as CustomUser
from rest_framework.test import APIClient, force_authenticate

def reproduce_error():
    # 1. Créer ou récupérer un utilisateur admin pour l'authentification
    User = get_user_model()
    admin_user, created = User.objects.get_or_create(
        email='admin_debug@example.com',
        defaults={
            'username': 'admin_debug',
            'is_staff': True,
            'is_superuser': True,
            'role': User.Role.ADMIN
        }
    )
    if created:
        admin_user.set_password('password123')
        admin_user.save()

    # 2. Récupérer un bail existant ou en créer un
    lease = Lease.objects.first()
    if not lease:
        print("Aucun bail trouvé dans la base de données pour le test.")
        return

    print(f"Test du bail ID: {lease.id}")

    # 3. Simuler la requête POST sur /api/baux/{id}/toggle_suivi/
    client = APIClient()
    client.force_authenticate(user=admin_user)
    
    url = f'/api/baux/{lease.id}/toggle_suivi/'
    print(f"Appel POST {url}")
    
    try:
        response = client.post(url)
        print(f"Status Code: {response.status_code}")
        if response.status_code >= 400:
            print(f"Erreur détectée: {response.data}")
        else:
            print(f"Réponse: {response.data}")
    except Exception as e:
        print("EXCEPTION CAPTUREE:")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    reproduce_error()
