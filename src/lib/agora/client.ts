/**
 * 🌿 Simplified Agora Client for Sirius Video Platform
 * Simple, working implementation without unnecessary complexity
 */

// Simple client creation that matches what actually works
export async function createSiriusClient() {
  if (typeof window === 'undefined') {
    throw new Error('Agora can only be used on the client side')
  }

  // Load Agora SDK dynamically
  const AgoraRTC = (await import('agora-rtc-sdk-ng')).default
  
  // Set minimal logging
  AgoraRTC.setLogLevel(0)
  
  // Create client with working configuration
  const client = AgoraRTC.createClient({
    mode: 'rtc',
    codec: 'vp8'
  })

  return client
}

// Export configuration that works
export const AGORA_CONFIG = {
  APP_ID: process.env.NEXT_PUBLIC_AGORA_APP_ID || "0e9bc15cc29e45ba9dabf5e3adc37503",
  CHANNEL_PREFIX: "sirius-",
  USE_TOKEN: false, // Testing mode
  SDK_VERSION: "4.20.0"
}

// Helper for generating ecosystem channel names
export function generateEcosystemChannel(roomId?: string): string {
  return `${AGORA_CONFIG.CHANNEL_PREFIX}${roomId || 'ecosystem'}`
} 