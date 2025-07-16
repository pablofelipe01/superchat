/**
 * 🌿 Database Types for Sirius Regenerative Video Platform
 * These types mirror our Supabase schema and represent the data ecosystem
 */

import type {
  ExpertiseArea,
  Season,
  MeetingType,
  LocationType,
  UserRole,
  WeatherConditions,
  GaiaInteractionType,
  CarbonCalculationMethod,
  KnowledgeCategory,
  DocumentType
} from './agriculture'

// Core database types from Supabase
export interface Database {
  public: {
    Tables: {
      // Empleados de Sirius para autenticación por cédula
      sirius_employees: {
        Row: SiriusEmployee
        Insert: Omit<SiriusEmployee, 'id' | 'created_at' | 'last_login'>
        Update: Partial<Omit<SiriusEmployee, 'id' | 'created_at'>>
      }
      profiles: {
        Row: Profile
        Insert: Omit<Profile, 'id' | 'created_at'>
        Update: Partial<Omit<Profile, 'id' | 'created_at'>>
      }
      meetings: {
        Row: Meeting
        Insert: Omit<Meeting, 'id' | 'created_at'>
        Update: Partial<Omit<Meeting, 'id' | 'created_at'>>
      }
      recordings: {
        Row: Recording
        Insert: Omit<Recording, 'id' | 'created_at'>
        Update: Partial<Omit<Recording, 'id' | 'created_at'>>
      }
      transcriptions: {
        Row: Transcription
        Insert: Omit<Transcription, 'id' | 'created_at'>
        Update: Partial<Omit<Transcription, 'id' | 'created_at'>>
      }
      gaia_interactions: {
        Row: GaiaInteraction
        Insert: Omit<GaiaInteraction, 'id' | 'timestamp'>
        Update: Partial<Omit<GaiaInteraction, 'id' | 'timestamp'>>
      }
      knowledge_base: {
        Row: KnowledgeBase
        Insert: Omit<KnowledgeBase, 'id' | 'created_at'>
        Update: Partial<Omit<KnowledgeBase, 'id' | 'created_at'>>
      }
      carbon_analytics: {
        Row: CarbonAnalytics
        Insert: Omit<CarbonAnalytics, 'id' | 'created_at'>
        Update: Partial<Omit<CarbonAnalytics, 'id' | 'created_at'>>
      }
      meeting_invites: {
        Row: MeetingInvite
        Insert: Omit<MeetingInvite, 'id' | 'created_at'>
        Update: Partial<Omit<MeetingInvite, 'id' | 'created_at'>>
      }
    }
  }
}

// User profiles extended for agricultural context
export interface Profile {
  id: string // References auth.users(id)
  username: string
  full_name: string | null
  avatar_url: string | null
  role: UserRole | null
  organization: string
  location: string | null // Farm/office location
  expertise: ExpertiseArea[] | null
  bio: string | null
  created_at: string
}

// Empleados de Sirius - Pre-cargados para autenticación por cédula
export interface SiriusEmployee {
  id: string
  cedula: string // Documento de identidad único
  nombres: string
  apellidos: string
  full_name: string // nombres + apellidos concatenados
  role: UserRole
  organization: 'Sirius Regenerative Solutions'
  avatar_url: string | null
  location: string | null
  expertise: ExpertiseArea[] | null
  bio: string | null
  is_active: boolean
  last_login: string | null
  created_at: string
}

// Meeting settings for Agora configuration
export interface MeetingSettings {
  enableGaia: boolean
  recordingEnabled: boolean
  transcriptionEnabled: boolean
  carbonTracking: boolean
  virtualBackgrounds: boolean
  spatialAudio: boolean
  aiDenoiser: boolean
  lowLightEnhancement: boolean
  maxParticipants: number
  theme: string
}

// Main meeting entity
export interface Meeting {
  id: string
  room_id: string
  title: string
  description: string | null
  meeting_type: MeetingType | null
  host_id: string | null // References profiles(id)
  scheduled_at: string | null
  started_at: string | null
  ended_at: string | null
  duration_minutes: number | null
  participants_count: number | null
  
  // Agricultural metadata
  topics: string[] | null
  season: Season | null
  weather_conditions: WeatherConditions | null
  location_type: LocationType | null
  
  // Configuration
  settings: MeetingSettings
  
  // Environmental impact
  carbon_saved_kg: number | null
  
  created_at: string
}

// Recording metadata
export interface Recording {
  id: string
  meeting_id: string // References meetings(id)
  agora_sid: string | null // Agora Session ID
  resource_id: string | null
  storage_path: string | null
  duration_seconds: number | null
  file_size_mb: number | null
  status: 'uploading' | 'processing' | 'ready' | 'failed'
  
  // Content metadata detected by AI
  key_topics: string[] | null
  action_items: ActionItem[] | null
  decisions: Decision[] | null
  
  created_at: string
}

// Action items extracted from meetings
export interface ActionItem {
  id: string
  description: string
  assignee: string | null
  due_date: string | null
  status: 'pending' | 'in_progress' | 'completed'
  priority: 'low' | 'medium' | 'high'
  agricultural_context?: string
}

// Decisions made during meetings
export interface Decision {
  id: string
  description: string
  context: string
  participants: string[]
  timestamp: string
  impact_level: 'low' | 'medium' | 'high'
  category: string
}

// Language segments for multilingual transcriptions
export interface LanguageSegment {
  language: string
  start_time: number
  end_time: number
  text: string
  confidence: number
}

// Transcription segments
export interface TranscriptionSegment {
  speaker: string
  start: number
  end: number
  text: string
  confidence: number
  language?: string
}

// Main transcription entity
export interface Transcription {
  id: string
  recording_id: string // References recordings(id)
  full_text: string | null
  segments: TranscriptionSegment[] | null
  
  // Language detection
  primary_language: string | null
  language_segments: LanguageSegment[] | null
  
  // Agricultural analysis
  agricultural_terms: Record<string, string[]> | null
  crop_mentions: string[] | null
  practice_mentions: string[] | null
  
  // AI insights from GAIA
  gaia_summary: string | null
  gaia_recommendations: Record<string, string | number | boolean> | null
  
  created_at: string
}

// GAIA AI assistant interactions
export interface GaiaInteraction {
  id: string
  meeting_id: string | null // References meetings(id)
  user_id: string | null // References profiles(id)
  
  interaction_type: GaiaInteractionType
  user_input: string | null
  gaia_response: string | null
  
  // Context and references
  context: Record<string, string | number | boolean> | null
  references: Record<string, string | number> | null
  
  // Performance metrics
  response_time_ms: number | null
  satisfaction_rating: number | null // 1-5
  
  timestamp: string
}

// Knowledge base for GAIA
export interface KnowledgeBase {
  id: string
  title: string
  content: string | null
  document_type: DocumentType | null
  
  // Categorization
  categories: KnowledgeCategory[] | null
  tags: string[] | null
  
  // Metadata
  author: string | null
  source_url: string | null
  file_url: string | null
  
  // Semantic search (vector embeddings)
  embedding: number[] | null
  
  // Usage tracking
  access_count: number
  last_accessed_at: string | null
  
  created_at: string
}

// Participant location for carbon calculations
export interface ParticipantLocation {
  user_id: string
  city: string
  country: string
  latitude?: number
  longitude?: number
}

// Carbon impact analytics
export interface CarbonAnalytics {
  id: string
  meeting_id: string | null // References meetings(id)
  
  // Participant data
  participant_locations: ParticipantLocation[] | null
  
  // Calculations
  total_distance_saved_km: number | null
  carbon_saved_kg: number | null
  trees_equivalent: number | null
  
  // Comparisons
  vs_car_kg: number | null
  vs_plane_kg: number | null
  
  calculation_method: CarbonCalculationMethod
  created_at: string
}

// Meeting invitations with natural codes
export interface MeetingInvite {
  id: string
  meeting_id: string // References meetings(id)
  invite_code: string // e.g., 'forest-stream-42'
  
  // Customization
  custom_message: string | null
  theme: string // 'forest', 'field', 'garden'
  
  // Access control
  expires_at: string | null
  max_uses: number | null
  current_uses: number
  
  created_at: string
}

// Extended types for client-side usage
export type ProfileWithMeetings = Profile & {
  hosted_meetings?: Meeting[]
  total_meetings_hosted?: number
  total_carbon_saved?: number
}

export type MeetingWithDetails = Meeting & {
  host?: Profile
  recording?: Recording
  transcription?: Transcription
  carbon_analytics?: CarbonAnalytics
  invite?: MeetingInvite
  participant_count_live?: number
}

export type RecordingWithTranscription = Recording & {
  transcription?: Transcription
  meeting?: Meeting
}

// Client-side state types
export interface MeetingState {
  isConnected: boolean
  isHost: boolean
  isRecording: boolean
  participantCount: number
  currentSpeaker: string | null
  gaiaActive: boolean
  carbonSaved: number
  duration: number
}

// Error types for better error handling
export interface DatabaseError {
  code: string
  message: string
  details?: string
  hint?: string
}

// API response types
export interface ApiResponse<T> {
  data: T | null
  error: DatabaseError | null
  success: boolean
}

// Supabase real-time subscription types
export interface RealtimePayload<T> {
  schema: string
  table: string
  commit_timestamp: string
  eventType: 'INSERT' | 'UPDATE' | 'DELETE'
  new: T
  old: T
} 