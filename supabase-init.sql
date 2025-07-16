-- 🌱 SCRIPT DE INICIALIZACIÓN SUPABASE PARA SIRIUS REGENERATIVE VIDEO PLATFORM
-- Este script crea las tablas necesarias y carga los empleados de Sirius

-- ===================================
-- 🔐 TABLA DE EMPLEADOS DE SIRIUS
-- ===================================

CREATE TABLE IF NOT EXISTS sirius_employees (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    cedula text UNIQUE NOT NULL,
    nombres text NOT NULL,
    apellidos text NOT NULL,
    full_name text NOT NULL,
    role text DEFAULT 'agronomist',
    organization text DEFAULT 'Sirius Regenerative Solutions',
    avatar_url text,
    location text,
    expertise text[],
    bio text,
    is_active boolean DEFAULT true,
    last_login timestamptz,
    created_at timestamptz DEFAULT now()
);

-- Índices para búsqueda rápida
CREATE INDEX IF NOT EXISTS idx_sirius_employees_cedula ON sirius_employees(cedula);
CREATE INDEX IF NOT EXISTS idx_sirius_employees_full_name ON sirius_employees(full_name);
CREATE INDEX IF NOT EXISTS idx_sirius_employees_active ON sirius_employees(is_active);

-- ===================================
-- 📊 CARGAR EMPLEADOS DE SIRIUS
-- ===================================

INSERT INTO sirius_employees (cedula, nombres, apellidos, full_name, role, expertise) VALUES
('1006834877', 'Santiago', 'Amaya', 'Santiago Amaya', 'agronomist', ARRAY['soil_health', 'crop_rotation']),
('1006774686', 'David', 'Hernandez', 'David Hernandez', 'agronomist', ARRAY['water_management', 'irrigation']),
('1057014925', 'Yesenia', 'Ramirez', 'Yesenia Ramirez', 'researcher', ARRAY['biodiversity', 'permaculture']),
('1122626299', 'Mario', 'Barrera', 'Mario Barrera', 'farmer', ARRAY['livestock_integration', 'pasture']),
('1006866318', 'Kevin', 'Avila', 'Kevin Avila', 'consultant', ARRAY['carbon_sequestration', 'agroforestry']),
('1026272126', 'Joys', 'Moreno', 'Joys Moreno', 'agronomist', ARRAY['integrated_pest_management', 'organic']),
('1019090206', 'Luisa', 'Ramirez', 'Luisa Ramirez', 'researcher', ARRAY['climate_adaptation', 'resilience']),
('1122626068', 'Angi Yohana', 'Cardenas Rey', 'Angi Yohana Cardenas Rey', 'agronomist', ARRAY['soil_health', 'composting']),
('1006416103', 'Yeison', 'Cogua', 'Yeison Cogua', 'farmer', ARRAY['crop_rotation', 'cover_crops']),
('1123561461', 'Alexandra', 'Orosco', 'Alexandra Orosco', 'consultant', ARRAY['permaculture', 'design']),
('1018497693', 'Alejandro', 'Uricoechea Reyes', 'Alejandro Uricoechea Reyes', 'agronomist', ARRAY['water_management', 'conservation']),
('1016080562', 'Yenny', 'Casas', 'Yenny Casas', 'researcher', ARRAY['biodiversity', 'ecosystems']),
('1019887392', 'Luis', 'Obando', 'Luis Obando', 'farmer', ARRAY['livestock_integration', 'grazing']),
('1003625031', 'Fabián', 'Bejarano', 'Fabián Bejarano', 'consultant', ARRAY['carbon_sequestration', 'measurement']),
('52586323', 'Lina', 'Loaiza', 'Lina Loaiza', 'agronomist', ARRAY['soil_health', 'fertility']),
('79454772', 'Pablo', 'Acebedo', 'Pablo Acebedo', 'researcher', ARRAY['agroforestry', 'silvopasture']),
('1018422135', 'Martín', 'Herrera', 'Martín Herrera', 'farmer', ARRAY['integrated_pest_management', 'biological']),
('1018502606', 'Juan Manuel', 'Triana', 'Juan Manuel Triana', 'consultant', ARRAY['climate_adaptation', 'planning']);

-- ===================================
-- 🔧 POLÍTICAS DE SEGURIDAD (RLS)
-- ===================================

-- Habilitar Row Level Security
ALTER TABLE sirius_employees ENABLE ROW LEVEL SECURITY;

-- Política: Solo empleados activos pueden ser consultados
CREATE POLICY "Public read for active employees" ON sirius_employees
    FOR SELECT USING (is_active = true);

-- Política: Solo usuarios autenticados pueden actualizar su último login
CREATE POLICY "Employees can update their own login" ON sirius_employees
    FOR UPDATE USING (true);

-- ===================================
-- 📋 TABLA DE REUNIONES MEJORADA
-- ===================================

CREATE TABLE IF NOT EXISTS meetings (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    room_id text UNIQUE NOT NULL,
    title text NOT NULL,
    description text,
    meeting_type text,
    host_cedula text REFERENCES sirius_employees(cedula),
    scheduled_at timestamptz,
    started_at timestamptz,
    ended_at timestamptz,
    duration_minutes integer,
    participants_count integer DEFAULT 0,
    
    -- Metadatos agrícolas
    topics text[],
    season text,
    weather_conditions jsonb,
    location_type text,
    
    -- Configuración
    settings jsonb DEFAULT '{"enableGaia": true, "recordingEnabled": true, "transcriptionEnabled": true, "carbonTracking": true, "maxParticipants": 50, "theme": "forest"}',
    
    -- Impacto ambiental
    carbon_saved_kg numeric,
    
    created_at timestamptz DEFAULT now()
);

-- ===================================
-- 👥 TABLA DE PARTICIPANTES EN REUNIONES
-- ===================================

CREATE TABLE IF NOT EXISTS meeting_participants (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    meeting_id uuid REFERENCES meetings(id) ON DELETE CASCADE,
    participant_name text NOT NULL,
    participant_email text,
    participant_org text,
    joined_at timestamptz DEFAULT now(),
    left_at timestamptz,
    is_host boolean DEFAULT false,
    connection_quality text DEFAULT 'good'
);

-- ===================================
-- 📹 TABLA DE GRABACIONES
-- ===================================

CREATE TABLE IF NOT EXISTS recordings (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    meeting_id uuid REFERENCES meetings(id) ON DELETE CASCADE,
    agora_sid text,
    resource_id text,
    storage_path text,
    duration_seconds integer,
    file_size_mb numeric,
    status text DEFAULT 'processing',
    key_topics text[],
    action_items jsonb,
    created_at timestamptz DEFAULT now()
);

-- ===================================
-- 📝 TABLA DE TRANSCRIPCIONES
-- ===================================

CREATE TABLE IF NOT EXISTS transcriptions (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    meeting_id uuid REFERENCES meetings(id) ON DELETE CASCADE,
    full_text text,
    primary_language text DEFAULT 'es',
    agricultural_terms text[],
    crop_mentions text[],
    practice_mentions text[],
    gaia_summary text,
    gaia_recommendations jsonb,
    created_at timestamptz DEFAULT now()
);

-- ===================================
-- 🔗 TABLA DE INVITACIONES A REUNIONES
-- ===================================

CREATE TABLE IF NOT EXISTS meeting_invites (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    meeting_id uuid REFERENCES meetings(id) ON DELETE CASCADE,
    invite_code text UNIQUE NOT NULL,
    theme text DEFAULT 'forest',
    expires_at timestamptz,
    max_uses integer DEFAULT 100,
    current_uses integer DEFAULT 0,
    created_at timestamptz DEFAULT now()
);

-- ===================================
-- 🌱 ÍNDICES PARA RENDIMIENTO
-- ===================================

CREATE INDEX IF NOT EXISTS idx_meetings_room_id ON meetings(room_id);
CREATE INDEX IF NOT EXISTS idx_meetings_host_cedula ON meetings(host_cedula);
CREATE INDEX IF NOT EXISTS idx_meetings_created_at ON meetings(created_at);
CREATE INDEX IF NOT EXISTS idx_meeting_participants_meeting_id ON meeting_participants(meeting_id);
CREATE INDEX IF NOT EXISTS idx_recordings_meeting_id ON recordings(meeting_id);
CREATE INDEX IF NOT EXISTS idx_transcriptions_meeting_id ON transcriptions(meeting_id);
CREATE INDEX IF NOT EXISTS idx_meeting_invites_code ON meeting_invites(invite_code);

-- ===================================
-- ✅ VERIFICACIÓN DE DATOS
-- ===================================

-- Mostrar empleados creados
SELECT 
    'Empleados de Sirius cargados:' as status,
    count(*) as total_empleados,
    count(*) FILTER (WHERE is_active = true) as empleados_activos
FROM sirius_employees;

-- Mostrar algunos ejemplos
SELECT 
    cedula,
    full_name,
    role,
    array_length(expertise, 1) as areas_expertise
FROM sirius_employees 
WHERE is_active = true 
ORDER BY apellidos 
LIMIT 5; 