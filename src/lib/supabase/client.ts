/**
 * 🌱 Supabase Client Configuration for Browser-Side Operations
 * This is the main client for the living ecosystem of our data
 */

import { createBrowserClient } from '@supabase/ssr'
import type { Database, Meeting, RealtimePayload } from '@/types/database'

// Create a single instance of the Supabase client for the browser
export const createClient = () => {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// Default client instance for convenience
export const supabase = createClient()

// Helper functions for common agricultural queries

/**
 * Get user profile with agricultural context
 */
export async function getProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  
  return { data, error }
}

/**
 * Update user's agricultural expertise
 */
export async function updateUserExpertise(userId: string, expertise: string[]) {
  const { data, error } = await supabase
    .from('profiles')
    .update({ expertise })
    .eq('id', userId)
    .select()
    .single()
  
  return { data, error }
}

/**
 * Get meetings by season or type for agricultural planning
 */
export async function getMeetingsByContext(
  filters: {
    season?: string
    meeting_type?: string
    location_type?: string
    topics?: string[]
  }
) {
  let query = supabase
    .from('meetings')
    .select(`
      *,
      profiles!meetings_host_id_fkey(username, full_name, avatar_url),
      recordings(id, status, duration_seconds),
      carbon_analytics(carbon_saved_kg, trees_equivalent)
    `)
    .order('created_at', { ascending: false })

  if (filters.season) {
    query = query.eq('season', filters.season)
  }
  
  if (filters.meeting_type) {
    query = query.eq('meeting_type', filters.meeting_type)
  }
  
  if (filters.location_type) {
    query = query.eq('location_type', filters.location_type)
  }
  
  if (filters.topics && filters.topics.length > 0) {
    query = query.overlaps('topics', filters.topics)
  }

  const { data, error } = await query
  return { data, error }
}

/**
 * Search knowledge base for agricultural topics
 */
export async function searchKnowledgeBase(
  query: string,
  categories?: string[]
) {
  let searchQuery = supabase
    .from('knowledge_base')
    .select('*')
    .textSearch('title,content', query)
    .order('access_count', { ascending: false })
    .limit(10)

  if (categories && categories.length > 0) {
    searchQuery = searchQuery.overlaps('categories', categories)
  }

  const { data, error } = await searchQuery
  return { data, error }
}

/**
 * ==========================================
 * 🔐 SIRIUS EMPLOYEE AUTHENTICATION SYSTEM
 * ==========================================
 * Autenticación por cédula para empleados de Sirius
 */

/**
 * Validar empleado de Sirius por cédula
 */
export async function validateSiriusEmployee(cedula: string) {
  const { data, error } = await supabase
    .from('sirius_employees')
    .select('*')
    .eq('cedula', cedula)
    .eq('is_active', true)
    .single()
  
  return { data, error }
}

/**
 * Registrar login de empleado
 */
export async function recordEmployeeLogin(cedula: string) {
  const { data, error } = await supabase
    .from('sirius_employees')
    .update({ 
      last_login: new Date().toISOString() 
    })
    .eq('cedula', cedula)
    .select()
    .single()
  
  return { data, error }
}

/**
 * Obtener todos los empleados activos
 */
export async function getActiveSiriusEmployees() {
  const { data, error } = await supabase
    .from('sirius_employees')
    .select('*')
    .eq('is_active', true)
    .order('apellidos', { ascending: true })
  
  return { data, error }
}

/**
 * Buscar empleado por nombre o cédula
 */
export async function searchSiriusEmployees(searchTerm: string) {
  const { data, error } = await supabase
    .from('sirius_employees')
    .select('*')
    .or(`cedula.ilike.%${searchTerm}%,nombres.ilike.%${searchTerm}%,apellidos.ilike.%${searchTerm}%,full_name.ilike.%${searchTerm}%`)
    .eq('is_active', true)
    .order('apellidos', { ascending: true })
    .limit(20)
  
  return { data, error }
}

/**
 * Get GAIA interactions for a meeting
 */
export async function getGaiaInteractions(meetingId: string) {
  const { data, error } = await supabase
    .from('gaia_interactions')
    .select(`
      *,
      profiles!gaia_interactions_user_id_fkey(username, full_name)
    `)
    .eq('meeting_id', meetingId)
    .order('timestamp', { ascending: true })

  return { data, error }
}

/**
 * Create a new meeting with agricultural context
 */
export async function createMeeting(meeting: {
  title: string
  description?: string
  meeting_type: string
  host_cedula: string  // Cédula del empleado de Sirius
  topics?: string[]
  season?: string
  location_type?: string
  scheduled_at?: string
}) {
  // Generate a natural room ID
  const room_id = `sirius-${meeting.meeting_type}-${Date.now()}`
  
  const { data, error } = await supabase
    .from('meetings')
    .insert({
      room_id,
      ...meeting,
      settings: {
        enableGaia: true,
        recordingEnabled: true,
        transcriptionEnabled: true,
        carbonTracking: true,
        virtualBackgrounds: true,
        spatialAudio: true,
        aiDenoiser: true,
        lowLightEnhancement: true,
        maxParticipants: 50,
        theme: 'forest'
      }
    })
    .select()
    .single()

  return { data, error }
}

/**
 * 🔗 CREAR REUNIÓN COMPLETA CON INVITACIÓN
 * Función integrada para empleados de Sirius
 */
export async function createSiriusMeeting(meetingData: {
  title: string
  description?: string
  host_cedula: string
  meeting_type?: string
  topics?: string[]
  season?: string
  location_type?: string
}) {
  try {
    // 1. Crear la reunión en la base de datos
    const { data: meeting, error: meetingError } = await createMeeting({
      title: meetingData.title,
      description: meetingData.description || `Reunión creada por empleado ${meetingData.host_cedula}`,
      meeting_type: meetingData.meeting_type || 'team',
      host_cedula: meetingData.host_cedula,
      topics: meetingData.topics || [],
      season: meetingData.season,
      location_type: meetingData.location_type || 'remote'
    })

    if (meetingError || !meeting) {
      throw new Error(`Error creando reunión: ${meetingError?.message}`)
    }

    // 2. Generar código de invitación único
    const { data: invite, error: inviteError } = await createMeetingInviteCode(
      meeting.id, 
      'forest'
    )

    if (inviteError || !invite) {
      throw new Error(`Error creando invitación: ${inviteError?.message}`)
    }

    return {
      meeting: meeting,
      invite: invite,
      error: null
    }

  } catch (error) {
    return {
      meeting: null,
      invite: null,
      error: error instanceof Error ? error.message : 'Error desconocido'
    }
  }
}

/**
 * 🎫 CREAR CÓDIGO DE INVITACIÓN ÚNICO
 * Genera códigos naturales como "oak-stream-42"
 */
export async function createMeetingInviteCode(meetingId: string, theme = 'forest') {
  // Generar códigos naturales agrícolas
  const naturalWords = {
    forest: ['roble', 'pino', 'cedro', 'sauce', 'nogal'],
    field: ['pradera', 'valle', 'colina', 'sierra', 'monte'],
    garden: ['brote', 'flor', 'hoja', 'raiz', 'semilla']
  }
  
  const themeWords = naturalWords[theme as keyof typeof naturalWords] || naturalWords.forest
  const word1 = themeWords[Math.floor(Math.random() * themeWords.length)]
  const word2 = ['rio', 'viento', 'amanecer', 'rocio', 'luz'][Math.floor(Math.random() * 5)]
  const number = Math.floor(Math.random() * 99) + 1
  
  const invite_code = `${word1}-${word2}-${number}`
  
  const { data, error } = await supabase
    .from('meeting_invites')
    .insert({
      meeting_id: meetingId,
      invite_code,
      theme,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 días
      max_uses: 100,
      current_uses: 0
    })
    .select()
    .single()

  return { data, error }
}

/**
 * 🔍 BUSCAR REUNIÓN POR CÓDIGO DE INVITACIÓN
 */
export async function getMeetingByInviteCode(inviteCode: string) {
  const { data, error } = await supabase
    .from('meeting_invites')
    .select(`
      *,
      meetings!inner(
        *,
        sirius_employees!meetings_host_cedula_fkey(
          cedula,
          full_name,
          role,
          organization
        )
      )
    `)
    .eq('invite_code', inviteCode)
    .single()

  return { data, error }
}

/**
 * 📋 OBTENER REUNIONES DEL EMPLEADO
 */
export async function getEmployeeMeetings(cedula: string, limit = 10) {
  const { data, error } = await supabase
    .from('meetings')
    .select(`
      *,
      meeting_invites(invite_code, current_uses, max_uses),
      recordings(id, status, duration_seconds)
    `)
    .eq('host_cedula', cedula)
    .order('created_at', { ascending: false })
    .limit(limit)

  return { data, error }
}

/**
 * ✅ INCREMENTAR USO DE INVITACIÓN
 */
export async function incrementInviteUsage(inviteCode: string) {
  // Primero obtener el valor actual
  const { data: currentInvite, error: getError } = await supabase
    .from('meeting_invites')
    .select('current_uses')
    .eq('invite_code', inviteCode)
    .single()

  if (getError || !currentInvite) {
    return { data: null, error: getError }
  }

  // Incrementar el uso
  const { data, error } = await supabase
    .from('meeting_invites')
    .update({ 
      current_uses: (currentInvite.current_uses || 0) + 1
    })
    .eq('invite_code', inviteCode)
    .select()
    .single()

  return { data, error }
}

/**
 * ==========================================
 * 👥 GESTIÓN DE PARTICIPANTES EN REUNIONES
 * ==========================================
 */

/**
 * 👤 AGREGAR PARTICIPANTE A REUNIÓN
 */
export async function addMeetingParticipant(participantData: {
  meeting_id: string
  participant_name: string
  participant_email?: string
  participant_org?: string
  is_host?: boolean
}) {
  const { data, error } = await supabase
    .from('meeting_participants')
    .insert({
      meeting_id: participantData.meeting_id,
      participant_name: participantData.participant_name,
      participant_email: participantData.participant_email || null,
      participant_org: participantData.participant_org || null,
      is_host: participantData.is_host || false,
      joined_at: new Date().toISOString(),
      connection_quality: 'good'
    })
    .select()
    .single()

  return { data, error }
}

/**
 * 🚪 REGISTRAR SALIDA DE PARTICIPANTE
 */
export async function recordParticipantLeave(participantId: string) {
  const { data, error } = await supabase
    .from('meeting_participants')
    .update({ 
      left_at: new Date().toISOString()
    })
    .eq('id', participantId)
    .select()
    .single()

  return { data, error }
}

/**
 * 📊 OBTENER PARTICIPANTES DE REUNIÓN
 */
export async function getMeetingParticipants(meetingId: string) {
  const { data, error } = await supabase
    .from('meeting_participants')
    .select('*')
    .eq('meeting_id', meetingId)
    .order('joined_at', { ascending: true })

  return { data, error }
}

/**
 * 🔄 ACTUALIZAR INFORMACIÓN DE PARTICIPANTE
 */
export async function updateParticipantInfo(participantId: string, updates: {
  connection_quality?: string
  left_at?: string | null
}) {
  const { data, error } = await supabase
    .from('meeting_participants')
    .update(updates)
    .eq('id', participantId)
    .select()
    .single()

  return { data, error }
}

/**
 * 🔍 BUSCAR REUNIÓN POR ROOM_ID
 */
export async function getMeetingByRoomId(roomId: string) {
  const { data, error } = await supabase
    .from('meetings')
    .select(`
      *,
      sirius_employees!meetings_host_cedula_fkey(
        cedula,
        full_name,
        role,
        organization
      ),
      meeting_invites(invite_code, current_uses, max_uses)
    `)
    .eq('room_id', roomId)
    .single()

  return { data, error }
}

/**
 * ⏰ ACTUALIZAR DURACIÓN DE REUNIÓN
 */
export async function updateMeetingDuration(meetingId: string, durationMinutes: number) {
  const { data, error } = await supabase
    .from('meetings')
    .update({ 
      duration_minutes: durationMinutes,
      ended_at: new Date().toISOString()
    })
    .eq('id', meetingId)
    .select()
    .single()

  return { data, error }
}

/**
 * 🎬 INICIAR REUNIÓN (marcar como iniciada)
 */
export async function startMeeting(meetingId: string) {
  const { data, error } = await supabase
    .from('meetings')
    .update({ 
      started_at: new Date().toISOString()
    })
    .eq('id', meetingId)
    .select()
    .single()

  return { data, error }
}

/**
 * Calculate and save carbon impact
 */
export async function saveCarbonImpact(
  meetingId: string,
  participantLocations: Array<{
    user_id: string
    city: string
    country: string
  }>
) {
  // This would integrate with a carbon calculation service
  // For now, we'll use a simple estimate
  const estimatedCarbonSaved = participantLocations.length * 5.2 // kg CO2 per participant
  const treesEquivalent = estimatedCarbonSaved / 22 // 1 tree absorbs ~22kg CO2/year

  const { data, error } = await supabase
    .from('carbon_analytics')
    .insert({
      meeting_id: meetingId,
      participant_locations: participantLocations,
      carbon_saved_kg: estimatedCarbonSaved,
      trees_equivalent: treesEquivalent,
      calculation_method: 'standard'
    })
    .select()
    .single()

  return { data, error }
}

/**
 * Real-time subscription for meeting updates
 */
export function subscribeMeetingUpdates(
  meetingId: string,
  callback: (payload: unknown) => void
) {
  return supabase
    .channel(`meeting-${meetingId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'meetings',
        filter: `id=eq.${meetingId}`
      },
      callback
    )
    .subscribe()
} 