/**
 * 🌱 Agricultural Domain Types for Sirius Regenerative Solutions
 * These types represent the living ecosystem of our agricultural data
 */

// Core Agricultural Expertise Areas
export type ExpertiseArea = 
  | 'soil_health'
  | 'permaculture'
  | 'agroforestry'
  | 'water_management'
  | 'carbon_sequestration'
  | 'integrated_pest_management'
  | 'crop_rotation'
  | 'livestock_integration'
  | 'biodiversity'
  | 'climate_adaptation'

// Agricultural Seasons
export type Season = 'spring' | 'summer' | 'fall' | 'winter'

// Types of agricultural meetings
export type MeetingType = 
  | 'team'
  | 'field_day'
  | 'training'
  | 'partner'
  | 'research'
  | 'planning'
  | 'harvest_review'

// Location types for meetings
export type LocationType = 
  | 'office'
  | 'field'
  | 'greenhouse'
  | 'remote'
  | 'laboratory'
  | 'storage_facility'

// User roles in the agricultural context
export type UserRole = 
  | 'farmer'
  | 'agronomist'
  | 'researcher'
  | 'partner'
  | 'consultant'
  | 'student'
  | 'investor'

// Weather conditions that might affect field meetings
export interface WeatherConditions {
  temperature: number // Celsius
  humidity: number // Percentage
  windSpeed: number // km/h
  precipitation: number // mm
  cloudCover: number // Percentage
  uvIndex: number
  condition: 'sunny' | 'cloudy' | 'rainy' | 'windy' | 'stormy'
  visibility: number // km
}

// Crops commonly discussed in meetings
export type CropType = 
  | 'corn'
  | 'soybeans'
  | 'wheat'
  | 'barley'
  | 'oats'
  | 'rice'
  | 'vegetables'
  | 'fruits'
  | 'herbs'
  | 'cover_crops'
  | 'pasture'

// Agricultural practices that might be discussed
export type AgriculturalPractice = 
  | 'composting'
  | 'mulching'
  | 'companion_planting'
  | 'crop_rotation'
  | 'no_till'
  | 'silvopasture'
  | 'water_harvesting'
  | 'biological_control'
  | 'fermented_extracts'
  | 'biochar_application'

// Knowledge base categories
export type KnowledgeCategory = 
  | 'soil'
  | 'water'
  | 'crops'
  | 'livestock'
  | 'climate'
  | 'economics'
  | 'regulations'
  | 'technology'
  | 'research'
  | 'case_studies'

// Document types in our knowledge base
export type DocumentType = 
  | 'guide'
  | 'research'
  | 'case_study'
  | 'regulation'
  | 'protocol'
  | 'report'
  | 'presentation'

// GAIA interaction types
export type GaiaInteractionType = 
  | 'question'
  | 'command'
  | 'clarification'
  | 'translation'
  | 'summary_request'
  | 'recommendation_request'

// Carbon calculation methods
export type CarbonCalculationMethod = 
  | 'standard'
  | 'precise_location'
  | 'transport_mode_specific'
  | 'time_weighted'

// Natural themes for different seasons/contexts
export type NaturalTheme = 
  | 'forest'
  | 'field'
  | 'garden'
  | 'greenhouse'
  | 'dawn'
  | 'sunset'
  | 'rain'
  | 'harvest'

// Agora virtual backgrounds
export interface VirtualBackground {
  id: string
  name: string
  url: string
  description?: string
  season?: Season
  ecosystem: 'forest' | 'field' | 'greenhouse' | 'lab' | 'office'
}

// Meeting topics for better organization
export interface MeetingTopic {
  id: string
  name: string
  category: KnowledgeCategory
  keywords: string[]
  relatedPractices: AgriculturalPractice[]
}

// Extended profile for agricultural context
export interface AgriculturalProfile {
  userId: string
  expertise: ExpertiseArea[]
  primaryLocation: string // Farm/office location
  yearsExperience: number
  specializations: string[]
  certifications: string[]
  languagePreferences: string[]
  preferredMeetingTimes: string[]
  fieldSchedule?: {
    busySeasons: Season[]
    availableHours: string[]
  }
} 