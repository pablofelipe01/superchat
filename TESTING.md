# 🧪 Testing Sirius Video Platform

## Script de Testing Agora

El archivo `test-agora-functionality.js` contiene un conjunto completo de tests para verificar que la funcionalidad de Agora funciona correctamente.

### Cómo usar el script

1. **En la consola del navegador:**
   ```javascript
   // Cargar el script en cualquier página de la aplicación
   // Luego ejecutar:
   SiriusAgoraTests.runAllTests()
   ```

2. **Test rápido:**
   ```javascript
   SiriusAgoraTests.quickConnectivityTest()
   ```

### Tests que ejecuta

- ✅ Carga del SDK de Agora desde CDN
- ✅ Creación del cliente Agora
- ✅ Creación de tracks de audio y video
- ✅ Conexión al canal
- ✅ Publicación de tracks
- ✅ Cleanup y desconexión

### Páginas de test disponibles

- `/simple-meeting` - Implementación completa que funciona
- Botón "Probar Videollamada" en la homepage redirige a `/simple-meeting`

### Configuración

El script usa la configuración que sabemos que funciona:
- **App ID:** 0e9bc15cc29e45ba9dabf5e3adc37503
- **Modo:** Testing (sin certificado)
- **Canal:** test-sirius
- **SDK:** Versión 4.20.0 CDN

### Estructura simplificada

El código ha sido simplificado para mantener solo lo esencial:
- `useAgora.ts` - Hook simplificado (243 líneas vs 489 anteriores)
- `client.ts` - Cliente básico sin complejidad innecesaria
- `types.ts` - Tipos mínimos para lo que realmente usamos

Esto asegura que el sistema sea mantenible y funcione de forma consistente. 