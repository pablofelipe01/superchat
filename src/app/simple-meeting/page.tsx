/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useEffect, useRef, useState, useCallback, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { getMeetingByRoomId, addMeetingParticipant, startMeeting, recordParticipantLeave, getMeetingParticipants } from '@/lib/supabase/client'

interface MeetingData {
  id: string
  room_id: string
  title: string
  description: string
  sirius_employees: {
    full_name: string
    role: string
    organization: string
  }
}

interface ParticipantData {
  uid: string
  name: string
  participantId?: string
  isHost?: boolean
}

function SimpleMeetingContent() {
  const searchParams = useSearchParams()
  const roomId = searchParams.get('room') || `sirius-demo-${Date.now()}`
  const hostName = searchParams.get('host')
  const participantName = searchParams.get('participant')
  const participantOrg = searchParams.get('org')
  const fromInvite = searchParams.get('fromInvite') === 'true'
  
  // Estados básicos
  const [logs, setLogs] = useState<string[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const [participants, setParticipants] = useState<ParticipantData[]>([])
  const [isAudioMuted, setIsAudioMuted] = useState(false)
  const [isVideoMuted, setIsVideoMuted] = useState(false)
  const [isScreenSharing, setIsScreenSharing] = useState(false)
  
  // Estados de base de datos
  const [meetingData, setMeetingData] = useState<MeetingData | null>(null)
  const [isHost, setIsHost] = useState(false)
  const [participantId, setParticipantId] = useState<string | null>(null)
  const [meetingStartTime, setMeetingStartTime] = useState<Date | null>(null)
  
  // Referencias
  const clientRef = useRef<any>(null)
  const localVideoRef = useRef<HTMLDivElement>(null)
  const localFloatingVideoRef = useRef<HTMLDivElement>(null)
  const localTracksRef = useRef<{ audio: any; video: any }>({ audio: null, video: null })
  const remoteUsersRef = useRef<{ [key: string]: HTMLDivElement | null }>({})

  const log = useCallback((message: string) => {
    console.log(message)
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()} - ${message}`])
  }, [])

  // Cargar información de la reunión desde la base de datos
  useEffect(() => {
    const loadMeetingData = async () => {
      try {
        const { data: meeting, error } = await getMeetingByRoomId(roomId)
        
        if (error || !meeting) {
          log(`⚠️ Reunión no encontrada en DB: ${roomId}`)
          // Continuar sin datos de DB para reuniones de demo
          return
        }

        setMeetingData(meeting)
        log(`📋 Reunión cargada: ${meeting.title}`)

        // Determinar si es host
        const currentUser = hostName || participantName
        const isCurrentUserHost = hostName !== null && hostName === meeting.sirius_employees.full_name
        setIsHost(isCurrentUserHost)

        if (isCurrentUserHost) {
          log(`👑 Identificado como host: ${currentUser}`)
        } else {
          log(`👤 Identificado como participante: ${currentUser}`)
        }

      } catch (error) {
        console.error('Error cargando reunión:', error)
        log(`❌ Error cargando reunión: ${error}`)
      }
    }

    loadMeetingData()
  }, [roomId, hostName, participantName, log])

  useEffect(() => {
    const loadAgoraCDN = () => {
      if ((window as any).AgoraRTC) {
        initializeClient()
        return
      }

      const script = document.createElement('script')
      script.src = 'https://download.agora.io/sdk/release/AgoraRTC_N-4.20.0.js'
      script.onload = () => {
        log("✅ Agora loaded")
        initializeClient()
      }
      script.onerror = () => {
        log("❌ Failed to load Agora")
      }
      document.head.appendChild(script)
    }

    const initializeClient = () => {
      try {
        const AgoraRTC = (window as any).AgoraRTC
        AgoraRTC.setLogLevel(0)
        
        clientRef.current = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" })
        
        // Event listeners
        clientRef.current.on("user-published", (user: any, mediaType: string) => {
          log(`🎥 Usuario publicó contenido: ${user.uid} (${mediaType})`)
          log(`🔍 Detalles usuario: hasVideo=${!!user.videoTrack}, hasAudio=${!!user.audioTrack}`)
          subscribeToUser(user, mediaType)
        })

        clientRef.current.on("user-unpublished", (user: any, mediaType: string) => {
          log(`👋 Usuario dejó de publicar: ${user.uid} (${mediaType})`)
          if (mediaType === 'audio') {
            log(`🔇 Audio de ${user.uid} desconectado`)
          }
          setParticipants(prev => {
            const newParticipants = prev.filter(participant => participant.uid !== user.uid)
            log(`👥 Participantes actualizados: ${newParticipants.length} total`)
            return newParticipants
          })
        })

        clientRef.current.on("user-joined", (user: any) => {
          log(`👤 Usuario se unió al canal: ${user.uid}`)
        })

        clientRef.current.on("user-left", (user: any) => {
          log(`🚪 Usuario salió del canal: ${user.uid}`)
        })
        
        log("✅ Client ready")
        setIsLoaded(true)
      } catch (error) {
        log(`❌ Failed to create client: ${error}`)
      }
    }

    const subscribeToUser = async (user: any, mediaType: string) => {
      try {
        await clientRef.current.subscribe(user, mediaType)
        log(`✅ Subscrito a ${user.uid} para ${mediaType}`)
        
        if (mediaType === 'video' && user.videoTrack) {
          const remoteContainer = remoteUsersRef.current[user.uid]
          if (remoteContainer) {
            user.videoTrack.play(remoteContainer)
            log(`📹 Video de ${user.uid} renderizado`)
          }
        }
        
        if (mediaType === 'audio' && user.audioTrack) {
          // IMPORTANTE: Reproducir explícitamente el audio remoto
          try {
            user.audioTrack.play()
            log(`🎤 Audio de ${user.uid} REPRODUCIENDO - volumen: ${user.audioTrack.getVolumeLevel ? user.audioTrack.getVolumeLevel() : 'N/A'}`)
          } catch (audioError) {
            log(`❌ Error reproduciendo audio de ${user.uid}: ${audioError}`)
          }
        }
        
        setParticipants(prev => {
          const existingParticipant = prev.find(p => p.uid === user.uid)
          if (existingParticipant) {
            return prev
          }
          
          // Crear nuevo participante con nombre temporal
          const newParticipant: ParticipantData = {
            uid: user.uid,
            name: `UID: ${String(user.uid).substring(0, 8)}...` // Temporal hasta cargar nombre real
          }
          
          return [...prev, newParticipant]
        })
      } catch (error) {
        log(`❌ Error subscribing to ${user.uid} (${mediaType}): ${error}`)
      }
    }

    loadAgoraCDN()
  }, [log])

  // Efecto para asegurar que el video local se renderice correctamente
  useEffect(() => {
    if (isConnected && localTracksRef.current.video && localFloatingVideoRef.current) {
      try {
        localTracksRef.current.video.play(localFloatingVideoRef.current)
        log("🔄 Video local re-renderizado en elemento flotante")
      } catch (error) {
        log(`❌ Error re-renderizando video local: ${error}`)
      }
    }
  }, [isConnected, log])

  // Función para cargar nombres de participantes desde la BD
  const loadParticipantNames = useCallback(async () => {
    if (!meetingData) return

    try {
      const { data: dbParticipants, error } = await getMeetingParticipants(meetingData.id)
      
      if (error || !dbParticipants) {
        log(`⚠️ No se pudieron cargar nombres de participantes: ${error?.message}`)
        return
      }

      // Actualizar participantes con nombres reales
      setParticipants(prev => 
        prev.map(participant => {
          const dbParticipant = dbParticipants.find(db => 
            db.participant_name && participant.name.includes('UID:')
          )
          
          if (dbParticipant) {
            return {
              ...participant,
              name: dbParticipant.participant_name,
              participantId: dbParticipant.id,
              isHost: dbParticipant.is_host
            }
          }
          
          return participant
        })
      )

      log(`✅ Nombres de participantes cargados: ${dbParticipants.length} encontrados`)
    } catch (error) {
      log(`❌ Error cargando nombres: ${error}`)
    }
  }, [meetingData, log])

  // Cargar nombres cuando cambie meetingData o participants
  useEffect(() => {
    if (meetingData && participants.length > 0) {
      loadParticipantNames()
    }
  }, [meetingData, participants.length, loadParticipantNames])

  const registerParticipantInDB = async () => {
    if (!meetingData) {
      log("⚠️ No hay datos de reunión, participante no registrado en DB")
      return null
    }

    try {
      const userName = hostName || participantName || `Usuario-${Date.now()}`
      
      const { data: participant, error } = await addMeetingParticipant({
        meeting_id: meetingData.id,
        participant_name: userName,
        participant_org: participantOrg || undefined,
        is_host: isHost
      })

      if (error || !participant) {
        log(`❌ Error registrando participante: ${error?.message}`)
        return null
      }

      log(`✅ Participante registrado en DB: ${userName}`)
      return participant.id

    } catch (error) {
      log(`❌ Error inesperado registrando participante: ${error}`)
      return null
    }
  }

  // Función de diagnóstico completo de audio
  const diagnoseAudio = async () => {
    log("🔍 === DIAGNÓSTICO COMPLETO DE AUDIO ===")
    
    try {
      // 1. Verificar soporte de navegador
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        log("❌ El navegador no soporta getUserMedia")
        return false
      }
      log("✅ Navegador soporta getUserMedia")

      // 2. Verificar permisos
      try {
        const permissions = await navigator.permissions.query({ name: 'microphone' as PermissionName })
        log(`🎤 Permiso de micrófono: ${permissions.state}`)
        
        if (permissions.state === 'denied') {
          log("❌ PERMISOS DENEGADOS - El usuario debe permitir acceso al micrófono")
          alert("⚠️ Permisos de micrófono denegados. Por favor, permite el acceso al micrófono en la configuración del navegador.")
          return false
        }
      } catch (error) {
        log(`⚠️ No se pudo verificar permisos: ${error}`)
      }

      // 3. Enumerar dispositivos de audio
      const devices = await navigator.mediaDevices.enumerateDevices()
      const audioInputDevices = devices.filter(device => device.kind === 'audioinput')
      const audioOutputDevices = devices.filter(device => device.kind === 'audiooutput')
      
      log(`🎤 Dispositivos de entrada: ${audioInputDevices.length}`)
      audioInputDevices.forEach((device, index) => {
        log(`   ${index + 1}. ${device.label || 'Dispositivo sin nombre'} (${device.deviceId.substring(0, 8)}...)`)
      })
      
      log(`🔊 Dispositivos de salida: ${audioOutputDevices.length}`)
      audioOutputDevices.forEach((device, index) => {
        log(`   ${index + 1}. ${device.label || 'Dispositivo sin nombre'} (${device.deviceId.substring(0, 8)}...)`)
      })

      if (audioInputDevices.length === 0) {
        log("❌ NO HAY MICRÓFONOS DISPONIBLES")
        alert("❌ No se detectaron micrófonos. Verifica que tienes un micrófono conectado.")
        return false
      }

      // 4. Probar acceso directo al micrófono
      log("🔄 Probando acceso directo al micrófono...")
      try {
        const testStream = await navigator.mediaDevices.getUserMedia({ 
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          }
        })
        
        log("✅ Acceso directo al micrófono exitoso")
        
        // Verificar tracks del stream
        const audioTracks = testStream.getAudioTracks()
        log(`🎵 Audio tracks obtenidos: ${audioTracks.length}`)
        
        if (audioTracks.length > 0) {
          const track = audioTracks[0]
          log(`🎤 Track info: enabled=${track.enabled}, muted=${track.muted}, readyState=${track.readyState}`)
          log(`🎤 Configuración: ${JSON.stringify(track.getSettings())}`)
        }
        
        // Limpiar el stream de prueba
        testStream.getTracks().forEach(track => track.stop())
        log("🧹 Stream de prueba cerrado")
        
      } catch (error: any) {
        log(`❌ ERROR EN ACCESO AL MICRÓFONO: ${error}`)
        alert(`❌ Error accediendo al micrófono: ${error.message}`)
        return false
      }

      // 5. Probar creación con Agora
      if ((window as any).AgoraRTC) {
        log("🔄 Probando creación de audio track con Agora...")
        try {
          const AgoraRTC = (window as any).AgoraRTC
          const testAudioTrack = await AgoraRTC.createMicrophoneAudioTrack({
            AGC: true,
            ANS: true,
            AEC: true
          })
          
          log("✅ Audio track de Agora creado exitosamente")
          log(`🎤 Agora track: enabled=${testAudioTrack.enabled}, muted=${testAudioTrack.muted}`)
          
          // Probar nivel de volumen
          if (testAudioTrack.getVolumeLevel) {
            const volume = testAudioTrack.getVolumeLevel()
            log(`🔊 Nivel de volumen inicial: ${volume}`)
          }
          
          testAudioTrack.close()
          log("🧹 Agora test track cerrado")
          
                 } catch (error: any) {
           log(`❌ ERROR CREANDO TRACK AGORA: ${error}`)
           return false
         }
      }

      // 6. Probar reproducción de audio (test de altavoces)
      log("🔄 Probando reproducción de audio...")
      try {
        // Crear un tono de prueba para verificar altavoces
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
        const oscillator = audioContext.createOscillator()
        const gainNode = audioContext.createGain()
        
        oscillator.connect(gainNode)
        gainNode.connect(audioContext.destination)
        
        oscillator.frequency.setValueAtTime(440, audioContext.currentTime) // La nota A
        oscillator.type = 'sine'
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime) // Volumen bajo
        
        oscillator.start()
        oscillator.stop(audioContext.currentTime + 0.5) // Reproducir por 0.5 segundos
        
        log("✅ Test de reproducción de audio completado (deberías haber escuchado un tono)")
        
        // Esperar un poco antes de continuar
        await new Promise(resolve => setTimeout(resolve, 600))
        
      } catch (error) {
        log(`⚠️ Error en test de reproducción: ${error}`)
      }

      log("✅ === DIAGNÓSTICO COMPLETADO - AUDIO DEBERÍA FUNCIONAR ===")
      alert("✅ Diagnóstico completado. Revisa la consola para detalles. Si escuchaste un tono, los altavoces funcionan.")
      return true
      
         } catch (error: any) {
       log(`❌ ERROR EN DIAGNÓSTICO: ${error}`)
       return false
     }
  }

  const joinMeeting = async () => {
    if (!clientRef.current || !isLoaded) {
      log("❌ Client not ready")
      return
    }

    try {
      log("🔄 Iniciando reunión...")

      const APP_ID = "0e9bc15cc29e45ba9dabf5e3adc37503"
      const CHANNEL = roomId
      const UID = Math.floor(Math.random() * 100000)

      // Registrar participante en base de datos
      const newParticipantId = await registerParticipantInDB()
      if (newParticipantId) {
        setParticipantId(newParticipantId)
      }

      // Si es host y hay datos de reunión, marcar reunión como iniciada
      if (isHost && meetingData) {
        try {
          await startMeeting(meetingData.id)
          setMeetingStartTime(new Date())
          log("🚀 Reunión marcada como iniciada en DB")
        } catch (error) {
          log(`⚠️ Error marcando reunión como iniciada: ${error}`)
        }
      }

      log("🎥 Creando video y audio...")
      
      // Verificar permisos de media antes de crear tracks
      try {
        log("🔍 Verificando permisos de medios...")
        const permissions = await navigator.permissions.query({ name: 'microphone' as PermissionName })
        log(`🎤 Permiso de micrófono: ${permissions.state}`)
        
        if (permissions.state === 'denied') {
          log("❌ Permisos de micrófono denegados")
        }
      } catch (error) {
        log(`⚠️ No se pudo verificar permisos: ${error}`)
      }
      
      // Verificar disponibilidad de dispositivos
      try {
        const devices = await navigator.mediaDevices.enumerateDevices()
        const videoDevices = devices.filter(device => device.kind === 'videoinput')
        const audioDevices = devices.filter(device => device.kind === 'audioinput')
        log(`📹 Cámaras disponibles: ${videoDevices.length}`)
        log(`🎤 Micrófonos disponibles: ${audioDevices.length}`)
        
        if (audioDevices.length === 0) {
          log("❌ No se encontraron micrófonos disponibles")
        }
      } catch (error) {
        log(`⚠️ Error enumerando dispositivos: ${error}`)
      }

      const AgoraRTC = (window as any).AgoraRTC
      
      log("🎤 Creando tracks de audio y video con configuración mejorada...")
      const [localAudioTrack, localVideoTrack] = await AgoraRTC.createMicrophoneAndCameraTracks({
        // Configuración de audio para mejor compatibilidad
        audio: {
          AGC: true, // Control automático de ganancia
          ANS: true, // Supresión de ruido
          AEC: true  // Cancelación de eco
        },
        // Configuración de video para mejor compatibilidad
        video: {
          width: 320,
          height: 240,
          frameRate: 15
        }
      })
      
      localTracksRef.current.audio = localAudioTrack
      localTracksRef.current.video = localVideoTrack

      log(`📹 Video track creado: ${localVideoTrack ? 'SÍ' : 'NO'}`)
      log(`🎤 Audio track creado: ${localAudioTrack ? 'SÍ' : 'NO'}`)
      
      if (localAudioTrack) {
        log(`🎤 Audio track habilitado: ${localAudioTrack.enabled}`)
        log(`🎤 Audio track muted: ${localAudioTrack.muted}`)
        log(`🎤 Audio track estado: ${localAudioTrack.getMediaStreamTrack()?.readyState}`)
      }
      
      if (localVideoTrack) {
        log(`📹 Video track habilitado: ${localVideoTrack.enabled}`)
        log(`📹 Video track muted: ${localVideoTrack.muted}`)
      }

      // Mostrar video local en el elemento flotante
      if (localFloatingVideoRef.current && localVideoTrack) {
        try {
          localVideoTrack.play(localFloatingVideoRef.current)
          log("✅ Video local renderizado en elemento flotante")
        } catch (error) {
          log(`❌ Error renderizando video local: ${error}`)
        }
      } else {
        log(`❌ Video flotante ref: ${localFloatingVideoRef.current ? 'SÍ' : 'NO'}, Video track: ${localVideoTrack ? 'SÍ' : 'NO'}`)
      }

      // Unirse al canal
      log(`🌐 Conectando a canal: ${CHANNEL}`)
      await clientRef.current.join(APP_ID, CHANNEL, null, UID)
      log("✅ CONECTADO!")

      // Publicar
      log("🚀 Iniciando publicación de video y audio...")
      await clientRef.current.publish([localAudioTrack, localVideoTrack])
      log("✅ PUBLICADO!")
      
      // Verificar que los tracks se publicaron correctamente
      const publishedTracks = clientRef.current.localTracks
      log(`📊 Tracks publicados: ${publishedTracks ? publishedTracks.length : 0}`)
      
      if (localAudioTrack) {
        log(`🎤 Estado FINAL audio local: enabled=${localAudioTrack.enabled}, muted=${localAudioTrack.muted}`)
        log(`🎤 Audio está siendo enviado: ${localAudioTrack.isPlaying ? 'SÍ' : 'NO'}`)
      }
      
      if (localVideoTrack) {
        log(`📹 Estado FINAL video local: enabled=${localVideoTrack.enabled}, muted=${localVideoTrack.muted}`)
      }
      
      setIsConnected(true)
      
      // Iniciar monitoreo continuo del audio
      startAudioMonitoring()

    } catch (error: any) {
      log(`❌ ERROR: ${error.message}`)
      console.error(error)
    }
  }

  // Función para monitorear el estado del audio continuamente
  const startAudioMonitoring = () => {
    const monitorInterval = setInterval(() => {
      if (!isConnected || !localTracksRef.current.audio) {
        clearInterval(monitorInterval)
        return
      }

      const audioTrack = localTracksRef.current.audio
      const audioEnabled = audioTrack.enabled
      const audioMuted = audioTrack.muted
      const isPlaying = audioTrack.isPlaying

      // Solo logear si hay cambios o problemas
      if (!audioEnabled || audioMuted || !isPlaying) {
        log(`⚠️ PROBLEMA AUDIO: enabled=${audioEnabled}, muted=${audioMuted}, playing=${isPlaying}`)
        
        // Intentar reactivar audio si está deshabilitado
        if (!audioEnabled && !isAudioMuted) {
          try {
            audioTrack.setEnabled(true)
            log(`🔧 Audio reactivado automáticamente`)
          } catch (error) {
            log(`❌ Error reactivando audio: ${error}`)
          }
        }
      }
    }, 5000) // Verificar cada 5 segundos
  }

  const leaveMeeting = async () => {
    try {
      // Calcular duración si hay datos
      let durationMinutes = 0
      if (meetingStartTime) {
        durationMinutes = Math.round((Date.now() - meetingStartTime.getTime()) / 60000)
      }

      // Registrar salida del participante en DB
      if (participantId) {
        try {
          await recordParticipantLeave(participantId)
          log(`✅ Salida registrada en DB`)
        } catch (error) {
          log(`⚠️ Error registrando salida: ${error}`)
        }
      }

      // Limpiar tracks de Agora
      if (localTracksRef.current.audio) localTracksRef.current.audio.close()
      if (localTracksRef.current.video) localTracksRef.current.video.close()
      if (clientRef.current) await clientRef.current.leave()
      
      log(`👋 Desconectado (duración: ${durationMinutes} min)`)
      setIsConnected(false)
      setParticipants([])
      setIsAudioMuted(false)
      setIsVideoMuted(false)
      setIsScreenSharing(false)
      
    } catch (error) {
      log(`❌ Error desconectando: ${error}`)
    }
  }

  const toggleAudio = () => {
    if (localTracksRef.current.audio) {
      try {
        if (isAudioMuted) {
          localTracksRef.current.audio.setEnabled(true)
          log("🎤 Audio activado")
          log(`🎤 Estado audio track: habilitado=${localTracksRef.current.audio.enabled}, muted=${localTracksRef.current.audio.muted}`)
        } else {
          localTracksRef.current.audio.setEnabled(false)
          log("🔇 Audio silenciado")
          log(`🎤 Estado audio track: habilitado=${localTracksRef.current.audio.enabled}, muted=${localTracksRef.current.audio.muted}`)
        }
        setIsAudioMuted(!isAudioMuted)
      } catch (error) {
        log(`❌ Error controlando audio: ${error}`)
      }
    } else {
      log("❌ No hay track de audio disponible")
    }
  }

  const toggleVideo = () => {
    if (localTracksRef.current.video) {
      if (isVideoMuted) {
        localTracksRef.current.video.setEnabled(true)
        log("📹 Video activado")
      } else {
        localTracksRef.current.video.setEnabled(false)
        log("📹 Video desactivado")
      }
      setIsVideoMuted(!isVideoMuted)
    }
  }

  const toggleScreenShare = async () => {
    if (!clientRef.current || !isConnected) return
    
    try {
      if (isScreenSharing) {
        // Detener compartir pantalla y volver a cámara
        const AgoraRTC = (window as any).AgoraRTC
        const [localAudioTrack, localVideoTrack] = await AgoraRTC.createMicrophoneAndCameraTracks()
        
        await clientRef.current.unpublish()
        localTracksRef.current.audio = localAudioTrack
        localTracksRef.current.video = localVideoTrack
        
        if (localVideoRef.current) {
          localVideoTrack.play(localVideoRef.current)
        }
        
        await clientRef.current.publish([localAudioTrack, localVideoTrack])
        setIsScreenSharing(false)
        log("📹 Vuelto a cámara")
      } else {
        // Iniciar compartir pantalla
        const AgoraRTC = (window as any).AgoraRTC
        const screenTrack = await AgoraRTC.createScreenVideoTrack()
        
        await clientRef.current.unpublish()
        
        if (localVideoRef.current) {
          screenTrack.play(localVideoRef.current)
        }
        
        await clientRef.current.publish([localTracksRef.current.audio, screenTrack])
        setIsScreenSharing(true)
        log("🖥️ Compartiendo pantalla")
      }
    } catch (error) {
      log(`❌ Error con pantalla: ${error}`)
    }
  }

  const userName = hostName || participantName || "Usuario Anónimo"
  const userRole = isHost ? "🏠 Host" : fromInvite ? "🔗 Invitado" : "👤 Participante"

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-teal-800 to-green-900">
      {/* Fondo con imagen */}
      <div className="fixed inset-0 opacity-20 bg-cover bg-center" style={{ backgroundImage: "url('/foto2.jpg')", filter: 'brightness(0.3)' }} />
      
      <div className="relative z-10 min-h-screen p-4">
        {/* Header con información de la reunión */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 shadow-2xl mb-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl font-bold text-white">Reunión: {meetingData?.title || roomId}</h1>
              <div className="flex items-center gap-4 text-emerald-200 text-sm">
                <span>👤 {fromInvite ? `Invitado: ${participantName}` : `Host: ${hostName || 'Usuario Anónimo'}`}</span>
                <span>👥 {participants.length + 1} participantes</span>
                {meetingStartTime && (
                  <span>⏱️ {Math.floor((Date.now() - meetingStartTime.getTime()) / 60000)} min</span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* Botón para volver al dashboard */}
              <button
                onClick={() => window.location.href = '/dashboard'}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg font-medium transition-all duration-200 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                </svg>
                Dashboard
              </button>
              
              {/* Indicador de estado */}
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                isConnected 
                  ? 'bg-green-500/20 text-green-300 border border-green-400/30' 
                  : 'bg-yellow-500/20 text-yellow-300 border border-yellow-400/30'
              }`}>
                {isConnected ? '🟢 Conectado' : '🟡 Desconectado'}
              </div>
            </div>
          </div>
        </div>

        {/* Área principal de video */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-4">
          {/* Videos principales - Participantes remotos */}
          <div className="lg:col-span-3">
            {!isConnected ? (
              /* Panel de inicio cuando no está conectado */
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 shadow-2xl">
                <div className="text-center">
                  <div className="w-24 h-24 mx-auto mb-6 bg-white/20 rounded-full flex items-center justify-center">
                    <span className="text-4xl">🎥</span>
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-4">¿Listo para la reunión?</h2>
                  <p className="text-emerald-200 mb-8">Haga clic en el botón para conectarse con su cámara y micrófono</p>
                  
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <button
                      onClick={diagnoseAudio}
                      className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-full font-semibold transition-all duration-300 shadow-lg transform hover:scale-105 flex items-center gap-2 min-w-[180px] justify-center"
                    >
                      🔍 Diagnosticar Audio
                    </button>
                    <button
                      onClick={joinMeeting}
                      disabled={isConnected || !isLoaded}
                      className="px-8 py-4 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-full font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg transform hover:scale-105 flex items-center gap-2 min-w-[200px] justify-center"
                    >
                      {isLoaded ? (
                        <>
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                          </svg>
                          Iniciar Conexión
                        </>
                      ) : (
                        <>
                          <div className="animate-spin w-5 h-5 border-2 border-white/30 border-t-white rounded-full" />
                          Preparando...
                        </>
                      )}
                    </button>

                    {isConnected && (
                      <button 
                        onClick={leaveMeeting}
                        className="px-8 py-4 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-full font-semibold transition-all duration-300 shadow-lg transform hover:scale-105 flex items-center gap-2"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zM11 8a1 1 0 112 0v4a1 1 0 11-2 0V8z" clipRule="evenodd" />
                        </svg>
                        Salir
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              /* Grid de videos principales cuando está conectado */
              <div className="space-y-4">
                {participants.length === 0 ? (
                  /* No hay participantes remotos - mostrar mensaje */
                  <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-white/20 rounded-full flex items-center justify-center">
                      <span className="text-2xl">👥</span>
                    </div>
                    <h3 className="text-lg font-medium text-white mb-2">Esperando participantes...</h3>
                    <p className="text-emerald-200 text-sm">Comparta el código de la sala para que otros se unan</p>
                  </div>
                ) : (
                  /* Grid de participantes remotos */
                  <div className={`grid gap-4 ${
                    participants.length === 1 ? 'grid-cols-1' :
                    participants.length === 2 ? 'grid-cols-2' :
                    participants.length <= 4 ? 'grid-cols-2' : 
                    'grid-cols-3'
                  }`}>
                    {participants.map((participant, index) => (
                      <div key={participant.uid} className="relative bg-white/10 backdrop-blur-md rounded-2xl overflow-hidden border border-white/20 shadow-xl">
                        {/* Video del participante remoto */}
                        <div
                          ref={(el) => { remoteUsersRef.current[participant.uid] = el }}
                          className="w-full aspect-square bg-gray-900 flex items-center justify-center"
                        >
                          {/* Placeholder mientras carga el video */}
                          <div className="text-center text-white">
                            <div className="w-16 h-16 mx-auto mb-2 bg-white/20 rounded-full flex items-center justify-center">
                              <span className="text-2xl">👤</span>
                            </div>
                            <p className="text-sm text-emerald-200">{participant.name}</p>
                          </div>
                        </div>
                        
                                                 {/* Overlay con nombre del participante */}
                         <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                           <div className="text-white font-medium">{participant.name}</div>
                           <div className="text-emerald-200 text-sm">UID: {String(participant.uid).substring(0, 8)}...</div>
                         </div>
                        
                        {/* Indicadores de estado */}
                        <div className="absolute top-3 right-3 flex gap-2">
                          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Video local flotante (cuando está conectado) */}
                {isConnected && (
                  <div className="fixed bottom-6 right-6 z-50">
                    <div className="relative bg-white/10 backdrop-blur-md rounded-xl overflow-hidden border border-white/20 shadow-2xl w-48 h-48">
                      {/* Video local */}
                      <div
                        ref={localFloatingVideoRef}
                        className="w-full h-full bg-gray-900 flex items-center justify-center"
                      >
                        {/* Placeholder mientras carga el video */}
                        <div className="text-center text-white opacity-50">
                          <div className="w-8 h-8 mx-auto mb-1 bg-white/20 rounded-full flex items-center justify-center">
                            <span className="text-sm">👤</span>
                          </div>
                          <p className="text-xs">Tu video</p>
                        </div>
                      </div>
                      
                      {/* Overlay con nombre propio */}
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                        <div className="text-white text-sm font-medium">
                          {userName} {isHost && '👑'}
                        </div>
                      </div>
                      
                      {/* Indicadores de estado */}
                      <div className="absolute top-2 right-2 flex flex-col gap-1">
                        {isVideoMuted && (
                          <div className="bg-red-500/90 text-white px-2 py-1 rounded text-xs">
                            📹
                          </div>
                        )}
                        {isAudioMuted && (
                          <div className="bg-red-500/90 text-white px-2 py-1 rounded text-xs">
                            🔇
                          </div>
                        )}
                        {isScreenSharing && (
                          <div className="bg-blue-500/90 text-white px-2 py-1 rounded text-xs">
                            🖥️
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Panel de controles lateral */}
          <div className="space-y-4">
            {/* Controles principales */}
            {isConnected && (
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
                <h3 className="text-white font-medium mb-4 flex items-center gap-2">
                  🎛️ Controles
                </h3>
                <div className="space-y-3">
                  <button
                    onClick={toggleAudio}
                    className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all ${
                      isAudioMuted 
                        ? 'bg-red-500/20 text-red-300 border border-red-400/30 hover:bg-red-500/30' 
                        : 'bg-green-500/20 text-green-300 border border-green-400/30 hover:bg-green-500/30'
                    }`}
                  >
                    <span className="text-lg">{isAudioMuted ? '🔇' : '🎤'}</span>
                    {isAudioMuted ? 'Activar Audio' : 'Silenciar'}
                  </button>

                  <button
                    onClick={toggleVideo}
                    className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all ${
                      isVideoMuted 
                        ? 'bg-red-500/20 text-red-300 border border-red-400/30 hover:bg-red-500/30' 
                        : 'bg-green-500/20 text-green-300 border border-green-400/30 hover:bg-green-500/30'
                    }`}
                  >
                    <span className="text-lg">{isVideoMuted ? '📹' : '📷'}</span>
                    {isVideoMuted ? 'Activar Video' : 'Desactivar'}
                  </button>

                  <button
                    onClick={toggleScreenShare}
                    className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all ${
                      isScreenSharing 
                        ? 'bg-blue-500/20 text-blue-300 border border-blue-400/30 hover:bg-blue-500/30' 
                        : 'bg-purple-500/20 text-purple-300 border border-purple-400/30 hover:bg-purple-500/30'
                    }`}
                  >
                    <span className="text-lg">🖥️</span>
                    {isScreenSharing ? 'Detener Pantalla' : 'Compartir Pantalla'}
                  </button>

                  {/* Botón de salir */}
                  <button 
                    onClick={leaveMeeting}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-lg font-medium transition-all duration-300"
                  >
                    <span className="text-lg">📞</span>
                    Salir de la Reunión
                  </button>
                </div>
              </div>
            )}

            {/* Información de participantes */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
              <h3 className="text-white font-medium mb-4 flex items-center gap-2">
                👥 Participantes ({participants.length + 1})
              </h3>
              <div className="space-y-2">
                {/* Tú mismo */}
                <div className="flex items-center gap-3 p-2 bg-white/10 rounded-lg">
                  <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                    {userName?.charAt(0) || 'U'}
                  </div>
                  <div className="flex-1">
                    <div className="text-white text-sm font-medium">
                      {userName} {isHost && '👑'}
                    </div>
                    <div className="text-emerald-200 text-xs">Tú</div>
                  </div>
                  <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-gray-400'}`} />
                </div>
                
                {/* Otros participantes */}
                {participants.map((participant, index) => (
                  <div key={participant.uid} className="flex items-center gap-3 p-2 bg-white/5 rounded-lg">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                      {participant.name.charAt(0).toUpperCase()}
                    </div>
                                         <div className="flex-1">
                       <div className="text-white text-sm font-medium">{participant.name}</div>
                       <div className="text-emerald-200 text-xs">UID: {String(participant.uid).substring(0, 8)}...</div>
                     </div>
                    <div className="w-2 h-2 bg-green-400 rounded-full" />
                  </div>
                ))}
              </div>
            </div>

            {/* Registro de actividad */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
              <h3 className="text-white font-medium mb-4 flex items-center gap-2">
                📝 Registro
              </h3>
              <div className="h-32 overflow-y-auto space-y-1 scrollbar-thin scrollbar-thumb-white/20">
                {logs.slice(-10).map((logEntry, index) => (
                  <div key={index} className="text-xs text-emerald-200 font-mono leading-relaxed">
                    {logEntry}
                  </div>
                ))}
                {logs.length === 0 && (
                  <div className="text-xs text-emerald-300 italic">
                    No hay actividad registrada aún...
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Información adicional */}
        {meetingData && (
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
            <div className="grid md:grid-cols-3 gap-4 text-emerald-100 text-sm">
              <div>
                <span className="font-medium">Organizador:</span>
                <p className="text-white">{meetingData.sirius_employees.full_name}</p>
                <p className="text-emerald-300 text-xs">{meetingData.sirius_employees.role} - {meetingData.sirius_employees.organization}</p>
              </div>
              <div>
                <span className="font-medium">Código de Sala:</span>
                <p className="text-white font-mono">{roomId}</p>
              </div>
              <div>
                <span className="font-medium">Estado:</span>
                <p className="text-white">
                  {isConnected ? '🟢 En línea' : '🔴 Desconectado'} • 
                  {meetingData ? '📊 Registrado en DB' : '⚡ Demo directo'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Loading component para Suspense
function SimpleMeetingLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-teal-800 to-green-900 flex items-center justify-center">
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 shadow-2xl text-center">
        <div className="w-16 h-16 mx-auto mb-4 border-4 border-emerald-300 border-t-transparent rounded-full animate-spin"></div>
        <h2 className="text-xl font-bold text-white mb-2">Cargando Reunión</h2>
        <p className="text-emerald-200">Preparando la sala de videoconferencia...</p>
      </div>
    </div>
  )
}

// Componente principal con Suspense boundary
export default function SimpleMeeting() {
  return (
    <Suspense fallback={<SimpleMeetingLoading />}>
      <SimpleMeetingContent />
    </Suspense>
  )
}