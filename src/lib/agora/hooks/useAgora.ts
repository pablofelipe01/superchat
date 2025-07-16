/**
 * 🌿 Simplified Agora Hook for Sirius Video Platform
 * Simple implementation based on what actually works
 */

'use client'

import { useState, useEffect, useRef } from 'react'

type AgoraClient = any
type LocalTrack = any

interface UseAgoraReturn {
  isConnected: boolean
  isLoaded: boolean
  participants: string[]
  isAudioMuted: boolean
  isVideoMuted: boolean
  isScreenSharing: boolean
  connectToEcosystem: () => Promise<void>
  toggleAudio: () => void
  toggleVideo: () => void
  toggleScreenShare: () => Promise<void>
  leaveEcosystem: () => Promise<void>
  localVideoRef: React.RefObject<HTMLDivElement>
  logs: string[]
}

/**
 * Simplified Agora hook that works based on proven implementation
 */
export function useAgora(): UseAgoraReturn {
  const [isConnected, setIsConnected] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const [participants, setParticipants] = useState<string[]>([])
  const [isAudioMuted, setIsAudioMuted] = useState(false)
  const [isVideoMuted, setIsVideoMuted] = useState(false)
  const [isScreenSharing, setIsScreenSharing] = useState(false)
  const [logs, setLogs] = useState<string[]>([])
  
  const clientRef = useRef<AgoraClient | null>(null)
  const localVideoRef = useRef<HTMLDivElement>(null)
  const localTracksRef = useRef<{ audio: LocalTrack | null; video: LocalTrack | null }>({ 
    audio: null, 
    video: null 
  })
  const remoteUsersRef = useRef<{ [key: string]: HTMLDivElement | null }>({})

  const log = (message: string) => {
    console.log(message)
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()} - ${message}`])
  }

  // Load Agora SDK on mount
  useEffect(() => {
    const loadAgoraCDN = () => {
      if ((window as any).AgoraRTC) {
        setIsLoaded(true)
        return
      }

      const script = document.createElement('script')
      script.src = 'https://download.agora.io/sdk/release/AgoraRTC_N-4.20.0.js'
      script.onload = () => {
        log("✅ Agora loaded")
        setIsLoaded(true)
      }
      script.onerror = () => {
        log("❌ Failed to load Agora")
      }
      document.head.appendChild(script)
    }

    loadAgoraCDN()
  }, [])

  const connectToEcosystem = async () => {
    if (!isLoaded || isConnected) return

    try {
      const AgoraRTC = (window as any).AgoraRTC
      AgoraRTC.setLogLevel(0)
      
      clientRef.current = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" })
      
      // Event listeners
      clientRef.current.on("user-joined", (user: any) => {
        log(`🌱 Usuario ${user.uid} se unió al ecosistema`)
        setParticipants(prev => [...prev, user.uid])
      })
      
      clientRef.current.on("user-left", (user: any) => {
        log(`🍃 Usuario ${user.uid} dejó el ecosistema`)
        setParticipants(prev => prev.filter(p => p !== user.uid))
        
        const remoteContainer = document.getElementById(`user-${user.uid}`)
        if (remoteContainer) {
          remoteContainer.remove()
        }
      })
      
      clientRef.current.on("user-published", async (user: any, mediaType: string) => {
        log(`📡 ${mediaType} publicado por ${user.uid}`)
        await clientRef.current.subscribe(user, mediaType)
        
        if (mediaType === "video") {
          const remoteVideoTrack = user.videoTrack
          const remoteContainer = document.getElementById(`user-${user.uid}`) || 
            (() => {
              const container = document.createElement('div')
              container.id = `user-${user.uid}`
              container.className = 'w-full h-48 rounded-lg overflow-hidden bg-black'
              const participantsGrid = document.querySelector('.participants-grid')
              if (participantsGrid) {
                participantsGrid.appendChild(container)
              }
              return container
            })()
          
          remoteVideoTrack.play(remoteContainer)
        }
      })

      // Connect
      await clientRef.current.join(
        process.env.NEXT_PUBLIC_AGORA_APP_ID || "0e9bc15cc29e45ba9dabf5e3adc37503",
        "sirius-ecosystem",
        null,
        null
      )
      
      log("✅ CONECTADO al ecosistema")
      setIsConnected(true)

      // Create and publish tracks
      const [audioTrack, videoTrack] = await AgoraRTC.createMicrophoneAndCameraTracks()
      localTracksRef.current = { audio: audioTrack, video: videoTrack }

      if (localVideoRef.current) {
        videoTrack.play(localVideoRef.current)
      }

      await clientRef.current.publish([audioTrack, videoTrack])
      log("✅ PUBLICADO en el ecosistema")

    } catch (error) {
      log(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const toggleAudio = () => {
    if (localTracksRef.current.audio) {
      if (isAudioMuted) {
        localTracksRef.current.audio.setEnabled(true)
        log("🔊 Audio activado")
      } else {
        localTracksRef.current.audio.setEnabled(false)
        log("🔇 Audio silenciado")
      }
      setIsAudioMuted(!isAudioMuted)
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
    if (!clientRef.current) return

    try {
      if (isScreenSharing) {
        // Stop screen sharing
        log("🖥️ Deteniendo compartir pantalla...")
        setIsScreenSharing(false)
      } else {
        // Start screen sharing
        const AgoraRTC = (window as any).AgoraRTC
        const screenTrack = await AgoraRTC.createScreenVideoTrack()
        await clientRef.current.unpublish(localTracksRef.current.video)
        await clientRef.current.publish(screenTrack)
        log("🖥️ Compartiendo pantalla")
        setIsScreenSharing(true)
      }
    } catch (error) {
      log(`❌ Error compartiendo pantalla: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const leaveEcosystem = async () => {
    if (!clientRef.current) return

    try {
      // Stop tracks
      if (localTracksRef.current.audio) {
        localTracksRef.current.audio.stop()
        localTracksRef.current.audio.close()
      }
      if (localTracksRef.current.video) {
        localTracksRef.current.video.stop()
        localTracksRef.current.video.close()
      }

      // Leave channel
      await clientRef.current.leave()
      log("🍃 Desconectado del ecosistema")
      
      setIsConnected(false)
      setParticipants([])
      setIsAudioMuted(false)
      setIsVideoMuted(false)
      setIsScreenSharing(false)
      
    } catch (error) {
      log(`❌ Error desconectando: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  return {
    isConnected,
    isLoaded,
    participants,
    isAudioMuted,
    isVideoMuted,
    isScreenSharing,
    connectToEcosystem,
    toggleAudio,
    toggleVideo,
    toggleScreenShare,
    leaveEcosystem,
    localVideoRef,
    logs
  }
} 