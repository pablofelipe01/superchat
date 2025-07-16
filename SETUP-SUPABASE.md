# 🌱 Configuración Supabase para Sirius Regenerative Video Platform

## 🎯 Objetivo: Sistema de Autenticación por Cédula para Empleados de Sirius

En lugar de usar autenticación tradicional por email/contraseña, usamos un sistema simplificado donde los empleados de Sirius se autentican únicamente con su cédula (ya pre-cargados en la base de datos).

## 🚀 Pasos de Configuración

### 1. Crear Proyecto en Supabase

1. Ve a [https://app.supabase.com](https://app.supabase.com)
2. Crea una nueva organización o usa una existente
3. Crear nuevo proyecto:
   - **Nombre**: `sirius-regenerative-video`
   - **Base de datos password**: (genera una segura y guárdala)
   - **Región**: `South America (São Paulo)` (más cercana a Colombia)

### 2. Configurar Variables de Entorno

Crea un archivo `.env.local` en la raíz del proyecto:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key-aquí

# Agora Configuration (ya existente)
NEXT_PUBLIC_AGORA_APP_ID=0e9bc15cc29e45ba9dabf5e3adc37503
```

### 3. Ejecutar Script SQL de Inicialización

1. Ve a **SQL Editor** en tu dashboard de Supabase
2. Copia y pega todo el contenido de `supabase-init.sql`
3. Ejecuta el script completo

Este script:
- ✅ Crea la tabla `sirius_employees` con todos los 18 empleados
- ✅ Crea tablas complementarias (`meetings`, `recordings`, `transcriptions`, etc.)
- ✅ Configura políticas de seguridad (RLS)
- ✅ Crea índices para rendimiento

### 4. Verificar Datos Cargados

Después de ejecutar el script, verifica en **Table Editor**:

```sql
-- Ver todos los empleados cargados
SELECT cedula, full_name, role, is_active 
FROM sirius_employees 
ORDER BY apellidos;

-- Debería mostrar 18 empleados activos
```

### 5. Configurar Políticas de Seguridad

Las políticas RLS ya están incluidas en el script:
- ✅ Solo empleados activos pueden ser consultados públicamente
- ✅ Los empleados pueden actualizar su propio `last_login`

## 🔐 Sistema de Autenticación Implementado

### Flujo de Login:
1. **Empleado ingresa cédula** → `/login`
2. **Sistema valida** contra tabla `sirius_employees`
3. **Si válido** → Guarda sesión en localStorage
4. **Redirige** → `/dashboard`

### Datos de Sesión:
```javascript
// Se guarda en localStorage
{
  sirius_employee: {
    id: "uuid",
    cedula: "1006834877",
    nombres: "Santiago",
    apellidos: "Amaya", 
    full_name: "Santiago Amaya",
    role: "agronomist",
    expertise: ["soil_health", "crop_rotation"],
    // ... otros campos
  },
  sirius_session: "timestamp-de-login"
}
```

## 👥 Empleados Pre-cargados

| Cédula | Nombre Completo | Rol |
|--------|----------------|-----|
| 1006834877 | Santiago Amaya | agronomist |
| 1006774686 | David Hernandez | agronomist |
| 1057014925 | Yesenia Ramirez | researcher |
| 1122626299 | Mario Barrera | farmer |
| 1006866318 | Kevin Avila | consultant |
| 1026272126 | Joys Moreno | agronomist |
| 1019090206 | Luisa Ramirez | researcher |
| 1122626068 | Angi Yohana Cardenas Rey | agronomist |
| 1006416103 | Yeison Cogua | farmer |
| 1123561461 | Alexandra Orosco | consultant |
| 1018497693 | Alejandro Uricoechea Reyes | agronomist |
| 1016080562 | Yenny Casas | researcher |
| 1019887392 | Luis Obando | farmer |
| 1003625031 | Fabián Bejarano | consultant |
| 52586323 | Lina Loaiza | agronomist |
| 79454772 | Pablo Acebedo | researcher |
| 1018422135 | Martín Herrera | farmer |
| 1018502606 | Juan Manuel Triana | consultant |

## 🧪 Testing del Sistema

### 1. Probar Login
1. Ir a `http://localhost:3000/login`
2. Ingresar cualquier cédula de la tabla (ej: `1006834877`)
3. Debe redirigir al dashboard

### 2. Probar Dashboard
1. Verificar que muestra datos del empleado
2. Probar "Crear Reunión" y "Unirse a Reunión"
3. Verificar que las videollamadas funcionan

### 3. Probar Persistencia de Sesión
1. Recargar página → debe mantenerse logueado
2. Cerrar y abrir browser → debe mantenerse logueado
3. Esperar 24 horas → debe expirar y redirigir al login

## 🔄 Flujo de Reuniones (Próximo Paso)

Con Supabase configurado, el próximo paso será conectar las reuniones:

1. **Empleado crea reunión** → Se guarda en tabla `meetings`
2. **Se genera código único** → Se guarda en `meeting_invites`
3. **Participantes externos** → Se unen sin registro
4. **Al finalizar** → Se guardan grabaciones y transcripciones

## 🛠️ Funciones de Supabase Disponibles

Ya implementadas en `src/lib/supabase/client.ts`:

```javascript
// Autenticación
validateSiriusEmployee(cedula)
recordEmployeeLogin(cedula)

// Gestión de empleados
getActiveSiriusEmployees()
searchSiriusEmployees(searchTerm)

// Reuniones (base implementada)
createMeeting(meetingData)
getMeetingsByContext(filters)
```

## 🚨 Consideraciones de Seguridad

### ✅ Implementado:
- Row Level Security (RLS) habilitado
- Solo empleados activos pueden ser consultados
- Validación de sesiones con expiración (24h)
- Sanitización de entrada de cédulas (solo números)

### 🔄 Por Implementar:
- Rate limiting en login
- Logs de acceso y auditoría
- Notificaciones de login sospechoso
- Backup y recovery de datos

## 📊 Métricas y Monitoring

Supabase provee automáticamente:
- **Logs de API** en tiempo real
- **Métricas de performance** de queries
- **Monitoring de conexiones** activas
- **Alertas** por uso de recursos

## 🎯 Próximos Pasos

1. ✅ **Base de datos configurada** (Supabase)
2. ✅ **Autenticación funcionando** (por cédula)
3. ✅ **Dashboard operativo** (interfaz empleados)
4. 🔄 **Conectar reuniones con DB** (persistir datos)
5. 🔄 **Sistema de invitaciones** (códigos únicos)
6. 🔄 **Grabaciones automáticas** (almacenamiento)
7. 🔄 **Transcripciones IA** (procesamiento)
8. 🔄 **Sirius Assistant** (IA agrícola)

---

## 🆘 Troubleshooting

### Error: "Cannot connect to Supabase"
- Verificar que las variables `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` estén correctas
- Revisar que el proyecto esté activo en Supabase

### Error: "Cédula no encontrada"
- Verificar que el script SQL se ejecutó correctamente
- Confirmar que la cédula existe en la tabla `sirius_employees`

### Error: "RLS policy violation"
- Revisar que las políticas RLS estén configuradas
- Verificar que el empleado tenga `is_active = true`

---

**🌱 ¡Sistema listo para producción con autenticación simplificada por cédula!** 