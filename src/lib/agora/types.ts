/**
 * 🌿 Simplified Types for Sirius Agora Implementation
 * Basic types that match our working implementation
 */

// Basic Agora types for what we actually use
export type AgoraClient = any
export type LocalVideoTrack = any
export type LocalAudioTrack = any
export type RemoteUser = any

// Simple state for our video platform
export interface SimpleMeetingState {
  isConnected: boolean
  isLoaded: boolean
  participants: string[]
  isAudioMuted: boolean
  isVideoMuted: boolean
  isScreenSharing: boolean
  logs: string[]
}

// Hook return type
export interface UseAgoraReturn extends SimpleMeetingState {
  connectToEcosystem: () => Promise<void>
  toggleAudio: () => void
  toggleVideo: () => void
  toggleScreenShare: () => Promise<void>
  leaveEcosystem: () => Promise<void>
  localVideoRef: React.RefObject<HTMLDivElement>
}

// Configuration for Agora
export interface AgoraConfig {
  APP_ID: string
  CHANNEL_PREFIX: string
  USE_TOKEN: boolean
  SDK_VERSION: string
}

// Participant info
export interface Participant {
  uid: string
  hasVideo: boolean
  hasAudio: boolean
  joinedAt: Date
} 