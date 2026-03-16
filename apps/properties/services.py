from django.db import transaction
from django.core.exceptions import ValidationError
from .models import Property, PropertyType, PropertyCategory, PropertyPhoto, StatutBienEnum
from apps.core.services import log_audit

@transaction.atomic
def create_property(*, owner_id: int, type_id: int, actor, **data) -> Property:
    """CU-06 : Ajouter un bien"""
    property_type = PropertyType.objects.select_related('category').get(id=type_id)
    
    # Cohérence Catégorie / Type
    category = property_type.category
    
    if Property.objects.filter(reference=data.get('reference')).exists():
        raise ValidationError("Cette référence existe déjà.")

    property_obj = Property(
        owner_id=owner_id,
        property_type=property_type,
        category=category,
        status=StatutBienEnum.VACANT,
        **data
    )
    property_obj.full_clean()
    property_obj.save()
    
    log_audit(actor=actor, action='CREATE', entity_name='Property', entity_id=str(property_obj.id), details={"ref": property_obj.reference})
    return property_obj

@transaction.atomic
def set_main_photo(*, photo_id: int, property_id: int) -> PropertyPhoto:
    """CU-07 : Définir une photo comme principale (une seule par bien)"""
    photo = PropertyPhoto.objects.get(id=photo_id, property_id=property_id)
    
    # Réinitialiser les autres photos
    PropertyPhoto.objects.filter(property_id=property_id).update(is_main=False)
    
    photo.is_main = True
    photo.save(update_fields=['is_main'])
    return photo

def change_property_status(*, property_id: int, new_status: str, actor) -> Property:
    """CU-20 : Changer manuellement le statut d'un bien"""
    property_obj = Property.objects.get(id=property_id)
    
    # Empêcher de mettre en travaux un bien actuellement loué (bail actif, géré dans une autre app)
    # if property_obj.has_active_lease() and new_status == Property.Status.UNDER_WORK:
    #     raise ValidationError("Impossible de mettre en travaux un bien loué.")
        
    property_obj.status = new_status
    property_obj.save(update_fields=['status'])
    
    log_audit(actor=actor, action='UPDATE', entity_name='Property', entity_id=str(property_obj.id), details={"new_status": new_status})
    return property_obj