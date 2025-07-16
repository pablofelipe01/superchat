# 🌿 Sirius Regenerative Video Platform

**Plataforma de videoconferencia para agricultura regenerativa** - Conectando ecosistemas digitales con la sabiduría de la naturaleza.

## 🎯 Descripción

Sirius Regenerative Video Platform es una aplicación de videoconferencia especializada para **Sirius Regenerative Solutions**, diseñada específicamente para facilitar la comunicación y colaboración en proyectos de agricultura regenerativa y sostenibilidad ambiental.

## ✨ Características Principales

### 🔐 Sistema de Autenticación
- **Autenticación por cédula** para empleados de Sirius (sin necesidad de passwords)
- **18 empleados pre-registrados** con sus especialidades agrícolas
- **Sesiones persistentes de 24 horas**

### 👥 Gestión de Reuniones
- **Dashboard personalizado** por empleado con historial de reuniones
- **Códigos de invitación naturales** usando términos agrícolas (ej: "roble-viento-42")
- **Sistema de invitados** sin registro requerido
- **Persistencia completa en base de datos** con metadatos y estadísticas

### 🎥 Videoconferencia HD
- **Video HD con Agora RTC SDK 4.20.0**
- **Hasta 50 participantes** por reunión
- **Controles profesionales** (audio, video, compartir pantalla)
- **UI cuadrada optimizada** para videos de participantes
- **Nombres reales** de participantes mostrados en tiempo real

### 🌱 Diseño Temático Agrícola
- **Colores azul-verde** inspirados en la naturaleza
- **Efectos glassmorphism** con fondo personalizable
- **UI responsiva** con elementos orgánicos
- **Iconografía agrícola** throughout the interface

## 🛠️ Stack Tecnológico

- **Framework**: Next.js 15.4.1 con TypeScript
- **Styling**: Tailwind CSS
- **Base de Datos**: Supabase PostgreSQL
- **Video**: Agora RTC SDK 4.20.0 (CDN)
- **Autenticación**: Sistema personalizado con localStorage
- **Deployment**: Vercel compatible

## 📊 Datos de Empleados

El sistema incluye 18 empleados pre-registrados con especialidades como:
- 🌱 Salud del suelo
- 💧 Gestión hídrica
- 🦋 Biodiversidad
- 🌾 Fertilidad de suelos
- 🌳 Agroforestería
- Y más especializaciones agrícolas

## 🚀 Configuración e Instalación

### Prerrequisitos
- Node.js 18+
- Cuenta de Supabase
- Cuenta de Agora.io

### Instalación

1. **Clonar el repositorio**
```bash
git clone https://github.com/pablofelipe01/superchat.git
cd superchat
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**
```bash
cp .env.local.example .env.local
# Editar .env.local con tus credenciales
```

4. **Configurar Supabase**
```bash
# Ejecutar el script SQL incluido
psql -f supabase-init.sql
```

5. **Iniciar desarrollo**
```bash
npm run dev
```

## 📁 Estructura del Proyecto

```
src/
├── app/                    # Pages de Next.js
│   ├── dashboard/         # Dashboard de empleados
│   ├── login/            # Autenticación por cédula
│   ├── join/[code]/      # Acceso de invitados
│   └── simple-meeting/   # Interfaz de videollamada
├── lib/
│   ├── supabase/         # Cliente y configuración DB
│   └── agora/           # Hooks y tipos de Agora
├── components/
│   └── video/           # Componentes de video
└── types/               # Tipos TypeScript
```

## 🎮 Uso

### Para Empleados de Sirius:
1. Ir a `/login`
2. Ingresar cédula (ej: 1006834877)
3. Acceder al dashboard personalizado
4. Crear o unirse a reuniones

### Para Invitados:
1. Recibir código de invitación
2. Ir a `/join/[codigo]`
3. Ingresar nombre y organización
4. Unirse a la reunión directamente

## 📈 Rendimiento

- ⚡ **Login**: < 3 segundos
- 🚀 **Creación de reunión**: < 5 segundos
- 💾 **Consultas DB**: < 200ms
- 🎥 **Calidad de video**: HD hasta 50 participantes

## 📖 Documentación

- [`SETUP-SUPABASE.md`](./SETUP-SUPABASE.md) - Configuración de base de datos
- [`SISTEMA-EMPLEADOS-SIRIUS.md`](./SISTEMA-EMPLEADOS-SIRIUS.md) - Sistema de empleados
- [`SISTEMA-COMPLETO-FUNCIONANDO.md`](./SISTEMA-COMPLETO-FUNCIONANDO.md) - Documentación completa

## 🤝 Contribuir

1. Fork el proyecto
2. Crear rama de feature (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## 🌍 Contacto

**Sirius Regenerative Solutions**
- Website: [sirius-regenerative.com](https://sirius-regenerative.com)
- Email: info@sirius-regenerative.com

---

*Construido con 💚 para un futuro más sostenible*
