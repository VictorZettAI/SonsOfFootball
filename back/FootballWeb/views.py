from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, BasePermission, AllowAny
from rest_framework_simplejwt.tokens import AccessToken
from django.contrib.auth.models import User

class IsJefe(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.has_perm('auth.es_jefe')

# class VerifyTokenView(APIView):
#     def post(self, request):
#         token = request.data.get('token')

#         if not token:
#             return Response({"error": "Token is missing"}, status=400)

#         try:
#             # Verifica el token usando SimpleJWT
#             access_token = AccessToken(token)
#             return Response({"valid": True}, status=200)
#             # user_id = access_token['user_id']
#             # user = User.objects.get(id=user_id)
#             # # Como es usuario único, solo el jefe, solo mira si tiene el permiso. Si fuera usuario, pero sin permiso, no entra. En un futuro se tendría que cambiar.
#             # if user.has_perm('auth.es_jefe'):
#             #     return Response({"valid": True}, status=200)
#             # else:
#             #     return Response({"valid": False}, status=200)
#         except Exception:
#             return Response({"valid": False}, status=401)
        
        # Este bloque es el que prohibe si no tienes el permiso
class VerifyTokenView(APIView):
    def post(self, request):
        token = request.data.get('token')
        try:
            access_token = AccessToken(token)
            user_id = access_token['user_id']
            user = User.objects.get(id=user_id)
            if user.has_perm('auth.es_jefe'):
                return Response({"valid": True}, status=200)
            else:
                return Response({"valid": False}, status=403)
        except Exception:
            return Response({"valid": False}, status=401)

