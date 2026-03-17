from modeltranslation.translator import register, TranslationOptions
from .models import PropertyCategory, PropertyType, Property, PropertyFurniture

@register(PropertyCategory)
class PropertyCategoryTranslationOptions(TranslationOptions):
    fields = ('name',)

@register(PropertyType)
class PropertyTypeTranslationOptions(TranslationOptions):
    fields = ('name',)

@register(Property)
class PropertyTranslationOptions(TranslationOptions):
    fields = ('description',)

@register(PropertyFurniture)
class PropertyFurnitureTranslationOptions(TranslationOptions):
    fields = ('name', 'description')
