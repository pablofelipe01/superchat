'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getMeetingByInviteCode, incrementInviteUsage } from '@/lib/supabase/client'

interface MeetingInviteData {
  invite_code: string
  expires_at: string
  max_uses: number
  current_uses: number
  meetings: {
    id: string
    room_id: string
    title: string
    description: string
    meeting_type: string
    sirius_employees: {
      full_name: string
      role: string
      organization: string
    }
  }
}

export default function JoinMeetingPage() {
  const params = useParams()
  const router = useRouter()
  const inviteCode = params.code as string

  const [isLoading, setIsLoading] = useState(true)
  const [meetingData, setMeetingData] = useState<MeetingInviteData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isJoining, setIsJoining] = useState(false)
  
  // Formulario para el invitado
  const [guestName, setGuestName] = useState('')
  const [guestOrganization, setGuestOrganization] = useState('')

  useEffect(() => {
    if (!inviteCode) {
      setError('Código de invitación inválido')
      setIsLoading(false)
      return
    }

    loadMeetingInfo()
  }, [inviteCode])

  const loadMeetingInfo = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const { data, error: fetchError } = await getMeetingByInviteCode(inviteCode)
      
      if (fetchError || !data) {
        setError('Código de invitación no encontrado o inválido')
        return
      }

      // Verificar si la invitación ha expirado
      const now = new Date()
      const expiresAt = new Date(data.expires_at)
      
      if (now > expiresAt) {
        setError('Esta invitación ha expirado')
        return
      }

      // Verificar si se han alcanzado los usos máximos
      if (data.current_uses >= data.max_uses) {
        setError('Esta invitación ha alcanzado el máximo de usos permitidos')
        return
      }

      setMeetingData(data)

    } catch (err) {
      console.error('Error cargando reunión:', err)
      setError('Error de conexión. Intente nuevamente.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleJoinMeeting = async () => {
    if (!meetingData || !guestName.trim()) {
      alert('Por favor ingrese su nombre')
      return
    }

    setIsJoining(true)

    try {
      // Incrementar el contador de usos de la invitación
      const { error: incrementError } = await incrementInviteUsage(inviteCode)
      
      if (incrementError) {
        console.error('Error incrementando uso:', incrementError)
        // Continuamos de todas formas, no es crítico
      }

      // Generar URL de la reunión con información del invitado
      const meetingUrl = `/simple-meeting?room=${meetingData.meetings.room_id}&participant=${encodeURIComponent(guestName)}&org=${encodeURIComponent(guestOrganization)}&fromInvite=true`
      
      // Redirigir a la reunión
      router.push(meetingUrl)

    } catch (error) {
      console.error('Error uniendo a reunión:', error)
      alert('Error inesperado. Intente nuevamente.')
      setIsJoining(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-teal-800 to-green-900 flex items-center justify-center">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Verificando invitación...</p>
          <p className="text-emerald-200 text-sm mt-2">Código: {inviteCode}</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-teal-800 to-green-900 flex items-center justify-center">
        {/* Background */}
        <div 
          className="fixed inset-0 opacity-20 bg-cover bg-center"
          style={{
            backgroundImage: "url('/foto2.jpg')",
            filter: 'brightness(0.3)'
          }}
        />
        
        <div className="relative z-10 max-w-md w-full mx-4">
          <div className="bg-red-500/20 backdrop-blur-md rounded-2xl p-8 border border-red-400/30 text-center">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">❌</span>
            </div>
            <h2 className="text-xl font-bold text-red-200 mb-4">Invitación Inválida</h2>
            <p className="text-red-300 mb-6">{error}</p>
            <p className="text-red-400 text-sm mb-6">Código: {inviteCode}</p>
            <button
              onClick={() => router.push('/')}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg transition-colors"
            >
              Volver al Inicio
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!meetingData) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-teal-800 to-green-900">
      {/* Background */}
      <div 
        className="fixed inset-0 opacity-20 bg-cover bg-center"
        style={{
          backgroundImage: "url('/foto2.jpg')",
          filter: 'brightness(0.3)'
        }}
      />
      
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Logo y título */}
          <div className="text-center mb-8">
            <div className="mx-auto w-20 h-20 mb-4 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center">
              <span className="text-3xl">🌱</span>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Unirse a Reunión
            </h1>
            <p className="text-emerald-200">
              Sirius Regenerative Video Platform
            </p>
          </div>

          {/* Información de la reunión */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 mb-6">
            <h3 className="text-lg font-semibold text-white mb-4">📋 Información de la Reunión</h3>
            <div className="space-y-3 text-emerald-100">
              <div>
                <span className="font-medium">Título:</span>
                <p className="text-white">{meetingData.meetings.title}</p>
              </div>
              {meetingData.meetings.description && (
                <div>
                  <span className="font-medium">Descripción:</span>
                  <p className="text-white text-sm">{meetingData.meetings.description}</p>
                </div>
              )}
              <div>
                <span className="font-medium">Organizador:</span>
                <p className="text-white">
                  {meetingData.meetings.sirius_employees.full_name}
                  <span className="text-emerald-200 text-sm ml-2">
                    ({meetingData.meetings.sirius_employees.role} - {meetingData.meetings.sirius_employees.organization})
                  </span>
                </p>
              </div>
              <div>
                <span className="font-medium">Código:</span>
                <span className="font-mono text-emerald-300 ml-2">{meetingData.invite_code}</span>
              </div>
              <div className="text-xs text-emerald-300">
                Usos: {meetingData.current_uses}/{meetingData.max_uses} • 
                Expira: {new Date(meetingData.expires_at).toLocaleDateString()}
              </div>
            </div>
          </div>

          {/* Formulario de invitado */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
            <h3 className="text-xl font-semibold text-white mb-6 text-center">
              Sus Datos
            </h3>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="guestName" className="block text-sm font-medium text-emerald-100 mb-2">
                  Nombre Completo *
                </label>
                <input
                  id="guestName"
                  type="text"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder="Ej: Juan Pérez"
                  className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent"
                  required
                  disabled={isJoining}
                />
              </div>

              <div>
                <label htmlFor="guestOrganization" className="block text-sm font-medium text-emerald-100 mb-2">
                  Organización (opcional)
                </label>
                <input
                  id="guestOrganization"
                  type="text"
                  value={guestOrganization}
                  onChange={(e) => setGuestOrganization(e.target.value)}
                  placeholder="Ej: Cooperativa San José"
                  className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent"
                  disabled={isJoining}
                />
              </div>

              <button
                onClick={handleJoinMeeting}
                disabled={isJoining || !guestName.trim()}
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold py-3 px-4 rounded-lg hover:from-emerald-700 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {isJoining ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Uniendo a reunión...
                  </div>
                ) : (
                  '🎥 Unirse a la Reunión'
                )}
              </button>
            </div>

            {/* Información adicional */}
            <div className="mt-6 pt-6 border-t border-white/20">
              <div className="bg-emerald-500/10 border border-emerald-400/30 rounded-lg p-4">
                <p className="text-emerald-200 text-sm">
                  ✅ <strong>Acceso directo:</strong> No necesita crear cuenta ni descargar aplicaciones.
                </p>
                <p className="text-emerald-300 text-xs mt-2">
                  🌱 Plataforma ecológica para agricultura regenerativa
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 