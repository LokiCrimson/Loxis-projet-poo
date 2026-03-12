# config/settings/base.py ou config/settings/local.py

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': 'loxis_db',  # Créez cette BD dans MySQL au préalable
        'USER': 'root',         # Souvent 'root' en local
        'PASSWORD': 'D1a2v3i4d5',
        'HOST': '127.0.0.1',                     # ou 'localhost'
        'PORT': '3306',                          # Port par défaut de MySQL
        'OPTIONS': {
            # Assure une gestion stricte et le bon encodage
            'init_command': "SET sql_mode='STRICT_TRANS_TABLES'",
            'charset': 'utf8mb4',
        }
    }
}