from rest_framework.views import exception_handler

def custom_exception_handler(exc, context):
    """
    Gestionnaire d'exceptions personnalisé pour DRF.
    Permet de formater toutes les erreurs d'API de la même façon.
    """
    response = exception_handler(exc, context)

    if response is not None:
        custom_data = {
            'error': True,
            'message': str(exc),
            'details': response.data
        }
        response.data = custom_data

    return response

# (Dans config/settings/base.py, vous pouvez l'activer avec :
# REST_FRAMEWORK['EXCEPTION_HANDLER'] = 'common.utils.custom_exception_handler')