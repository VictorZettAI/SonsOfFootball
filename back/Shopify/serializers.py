# serializers.py
from rest_framework import serializers
from .models import Patrocinador, Publicidad
import os
server = os.environ.get('HOSTING_BACK_URL', 'http://127.0.0.1:8000')

class PatrocinadorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Patrocinador
        fields = '__all__'

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        # Asegurarse de que el logo sea None si no existe
        representation['logo'] = representation['logo'] if representation.get('logo') else None
        return representation

# Para crear/modificar patrocinadores
class Patrocinador_CrearSerializer(serializers.ModelSerializer):
    class Meta:
        model = Patrocinador
        fields = '__all__'

    def create(self, validated_data):
        # Asegurarnos que descripcion es opcional
        if 'descripcion' not in validated_data:
            validated_data['descripcion'] = ''
        return Patrocinador.objects.create(**validated_data)

    def validate_logo(self, value):
        if value:
            if not value.content_type.startswith('image'):
                raise serializers.ValidationError("El archivo debe ser una imagen")
        return value

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        # Asegurar que la URL del logo es correcta
        if representation.get('logo'):
            if not representation['logo'].startswith('http'):
                request = self.context.get('request')
                if request is not None:
                    representation['logo'] = request.build_absolute_uri(instance.logo.url)
        return representation
    

class Publicidad_GeneralSerializer(serializers.ModelSerializer):
    imagen = serializers.SerializerMethodField()
    class Meta:
        model = Publicidad
        fields = ('id','titulo','descripcion','precio','url','imagen','region')
    def get_imagen(self,publi):
        return server + publi.imagen.url if publi.imagen else None
    
class Publicidad_CrearSerializer(serializers.ModelSerializer):
    class Meta:
        model = Publicidad
        fields = '__all__'
