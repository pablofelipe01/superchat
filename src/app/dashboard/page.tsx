'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createSiriusMeeting, getEmployeeMeetings } from '@/lib/supabase/client'
import type { SiriusEmployee } from '@/types/database'

interface RecentMeeting {
  id: string
  room_id: string
  title: string
  created_at: string
  meeting_invites: { invite_code: string; current_uses: number; max_uses: number }[]
}

export default function Dashboard() {
  const [employee, setEmployee] = useState<SiriusEmployee | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isCreatingMeeting, setIsCreatingMeeting] = useState(false)
  const [recentMeetings, setRecentMeetings] = useState<RecentMeeting[]>([])
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [meetingTitle, setMeetingTitle] = useState('')
  const [lastCreatedMeeting, setLastCreatedMeeting] = useState<{
    room_id: string
    invite_code: string
    host_name: string
  } | null>(null)
  const router = useRouter()

  useEffect(() => {
    // Verificar sesión del empleado
    const employeeData = localStorage.getItem('sirius_employee')
    const sessionTime = localStorage.getItem('sirius_session')
    
    if (!employeeData || !sessionTime) {
      router.push('/login')
      return
    }

    // Verificar que la sesión no haya expirado (24 horas)
    const sessionAge = Date.now() - parseInt(sessionTime)
    const maxAge = 24 * 60 * 60 * 1000 // 24 horas en milisegundos
    
    if (sessionAge > maxAge) {
      localStorage.removeItem('sirius_employee')
      localStorage.removeItem('sirius_session')
      router.push('/login')
      return
    }

    const employeeInfo = JSON.parse(employeeData)
    setEmployee(employeeInfo)
    
    // Cargar reuniones recientes
    loadRecentMeetings(employeeInfo.cedula)
    setIsLoading(false)
  }, [router])

  const loadRecentMeetings = async (cedula: string) => {
    try {
      const { data: meetings, error } = await getEmployeeMeetings(cedula, 5)
      if (error) {
        console.error('Error cargando reuniones:', error)
        return
      }
      setRecentMeetings(meetings || [])
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('sirius_employee')
    localStorage.removeItem('sirius_session')
    router.push('/login')
  }

  const createMeetingWithDB = async () => {
    if (!employee) return
    
    setIsCreatingMeeting(true)
    
    try {
      const { meeting, invite, error } = await createSiriusMeeting({
        title: meetingTitle || `Reunión de ${employee.full_name}`,
        description: `Reunión creada desde el dashboard por ${employee.full_name}`,
        host_cedula: employee.cedula,
        meeting_type: 'team',
        topics: employee.expertise || [],
        location_type: 'remote'
      })

      if (error || !meeting || !invite) {
        alert(`Error creando reunión: ${error}`)
        return
      }

      // Mostrar información de la reunión creada
      setLastCreatedMeeting({
        room_id: meeting.room_id,
        invite_code: invite.invite_code,
        host_name: employee.full_name
      })

      // Recargar reuniones recientes
      await loadRecentMeetings(employee.cedula)
      
      // Limpiar formulario
      setMeetingTitle('')
      setShowCreateForm(false)

    } catch (error) {
      console.error('Error:', error)
      alert('Error inesperado creando reunión')
    } finally {
      setIsCreatingMeeting(false)
    }
  }

  const joinMeetingByCode = () => {
    const inviteCode = prompt('Ingrese el código de invitación:')
    if (inviteCode) {
      router.push(`/join/${inviteCode}`)
    }
  }

  const joinMyMeeting = (roomId: string) => {
    router.push(`/simple-meeting?room=${roomId}&host=${employee?.full_name}`)
  }

  const startMeetingFromDB = (roomId: string) => {
    router.push(`/simple-meeting?room=${roomId}&host=${employee?.full_name}`)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-teal-800 to-green-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white"></div>
      </div>
    )
  }

  if (!employee) {
    return null // El useEffect redirigirá al login
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
      
      <div className="relative z-10 min-h-screen">
        {/* Header */}
        <header className="bg-white/10 backdrop-blur-md border-b border-white/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div className="flex items-center">
                <span className="text-3xl mr-3">🌱</span>
                <div>
                  <h1 className="text-2xl font-bold text-white">Sirius Dashboard</h1>
                  <p className="text-emerald-200">Plataforma de Videoconferencia Agrícola</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-white font-medium">{employee.full_name}</p>
                  <p className="text-emerald-200 text-sm capitalize">{employee.role}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="bg-red-500/20 hover:bg-red-500/30 text-red-200 px-4 py-2 rounded-lg transition-colors"
                >
                  Cerrar Sesión
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Welcome Section */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 mb-8">
            <h2 className="text-3xl font-bold text-white mb-4">
              ¡Bienvenido, {employee.nombres}! 🌾
            </h2>
            <p className="text-emerald-200 text-lg">
              Conecta con agricultores y profesionales del ecosistema regenerativo
            </p>
            {employee.expertise && employee.expertise.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {employee.expertise.map((skill, index) => (
                  <span
                    key={index}
                    className="bg-emerald-500/20 text-emerald-200 px-3 py-1 rounded-full text-sm"
                  >
                    {skill.replace(/_/g, ' ')}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Información de reunión recién creada */}
          {lastCreatedMeeting && (
            <div className="bg-green-500/20 backdrop-blur-md rounded-2xl p-6 border border-green-400/30 mb-8">
              <h3 className="text-xl font-bold text-green-200 mb-4">🎉 ¡Reunión Creada Exitosamente!</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-green-100 mb-2">
                    <span className="font-semibold">Código de Invitación:</span>
                  </p>
                  <div className="bg-black/20 rounded-lg p-3 font-mono text-xl text-green-300">
                    {lastCreatedMeeting.invite_code}
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => startMeetingFromDB(lastCreatedMeeting.room_id)}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    🎥 Iniciar Reunión
                  </button>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(lastCreatedMeeting.invite_code)
                      alert('Código copiado al portapapeles!')
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    📋 Copiar Código
                  </button>
                  <button
                    onClick={() => setLastCreatedMeeting(null)}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors text-sm"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            {/* Crear Reunión */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
              <div className="text-center">
                <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">🎥</span>
                </div>
                <h3 className="text-xl font-semibold text-white mb-4">
                  Crear Nueva Reunión
                </h3>
                <p className="text-emerald-200 mb-6">
                  Crea una videollamada con código de invitación único
                </p>
                
                {!showCreateForm ? (
                  <button
                    onClick={() => setShowCreateForm(true)}
                    className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-emerald-700 hover:to-teal-700 transition-all duration-200"
                  >
                    Crear Reunión
                  </button>
                ) : (
                  <div className="space-y-4">
                    <input
                      type="text"
                      placeholder="Título de la reunión (opcional)"
                      value={meetingTitle}
                      onChange={(e) => setMeetingTitle(e.target.value)}
                      className="w-full px-4 py-2 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={createMeetingWithDB}
                        disabled={isCreatingMeeting}
                        className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-emerald-700 hover:to-teal-700 transition-all duration-200 disabled:opacity-50"
                      >
                        {isCreatingMeeting ? 'Creando...' : 'Crear'}
                      </button>
                      <button
                        onClick={() => setShowCreateForm(false)}
                        className="px-4 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Unirse a Reunión */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">📱</span>
                </div>
                <h3 className="text-xl font-semibold text-white mb-4">
                  Unirse a Reunión
                </h3>
                <p className="text-emerald-200 mb-6">
                  Ingresa con un código de invitación para participar
                </p>
                <button
                  onClick={joinMeetingByCode}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200"
                >
                  Ingresar Código
                </button>
              </div>
            </div>
          </div>

          {/* Reuniones Recientes */}
          {recentMeetings.length > 0 && (
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 mb-8">
              <h3 className="text-2xl font-bold text-white mb-6">📋 Mis Reuniones Recientes</h3>
              <div className="space-y-4">
                {recentMeetings.map((meeting) => (
                  <div key={meeting.id} className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="text-white font-semibold">{meeting.title}</h4>
                        <p className="text-emerald-200 text-sm">
                          {new Date(meeting.created_at).toLocaleDateString()} • 
                          Código: {meeting.meeting_invites[0]?.invite_code || 'N/A'}
                        </p>
                        {meeting.meeting_invites[0] && (
                          <p className="text-emerald-300 text-xs">
                            Usos: {meeting.meeting_invites[0].current_uses}/{meeting.meeting_invites[0].max_uses}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => joinMyMeeting(meeting.room_id)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg transition-colors"
                      >
                        Entrar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Stats Section */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mr-4">
                  <span className="text-2xl">🌱</span>
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">18</p>
                  <p className="text-emerald-200 text-sm">Empleados Activos</p>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mr-4">
                  <span className="text-2xl">🎥</span>
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{recentMeetings.length}</p>
                  <p className="text-emerald-200 text-sm">Mis Reuniones</p>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mr-4">
                  <span className="text-2xl">🔗</span>
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">∞</p>
                  <p className="text-emerald-200 text-sm">Invitaciones Disponibles</p>
                </div>
              </div>
            </div>
          </div>

          {/* Agricultural Context */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
            <h3 className="text-2xl font-bold text-white mb-6">🌾 Sistema Integrado</h3>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h4 className="text-lg font-semibold text-emerald-200 mb-4">✅ Funcionando Ahora</h4>
                <ul className="space-y-2 text-emerald-100">
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-emerald-400 rounded-full mr-3"></span>
                    Reuniones persistentes en base de datos
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-emerald-400 rounded-full mr-3"></span>
                    Códigos de invitación únicos naturales
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-emerald-400 rounded-full mr-3"></span>
                    Historial de reuniones por empleado
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-emerald-400 rounded-full mr-3"></span>
                    Autenticación por cédula simplificada
                  </li>
                </ul>
              </div>
              
              <div>
                <h4 className="text-lg font-semibold text-emerald-200 mb-4">🔄 Próximas Mejoras</h4>
                <ul className="space-y-2 text-emerald-100">
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-yellow-400 rounded-full mr-3"></span>
                    Acceso de invitados sin registro
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-yellow-400 rounded-full mr-3"></span>
                    Grabaciones automáticas
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-yellow-400 rounded-full mr-3"></span>
                    Transcripciones con IA agrícola
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-yellow-400 rounded-full mr-3"></span>
                    Sirius Assistant integrado
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
} 