/**
 * 🌿 Agora Token Generation API for Sirius Ecosystem
 * This API securely generates tokens for entering our digital ecosystem
 */

import { NextRequest, NextResponse } from 'next/server'
import { RtcTokenBuilder, RtcRole } from 'agora-token'

// Token expiration time (24 hours for development)
const TOKEN_EXPIRATION_TIME = 24 * 60 * 60

export async function POST(request: NextRequest) {
  try {
    const { channelName, uid, role = 'host' } = await request.json()

    // Validate required parameters
    if (!channelName) {
      return NextResponse.json(
        { error: 'Channel name is required to enter the ecosystem' },
        { status: 400 }
      )
    }

    // Get Agora credentials from environment
    const appId = process.env.NEXT_PUBLIC_AGORA_APP_ID
    const appCertificate = process.env.AGORA_APP_CERTIFICATE

    if (!appId || !appCertificate) {
      console.error('🚨 Agora credentials not configured')
      return NextResponse.json(
        { error: 'Ecosystem not properly configured' },
        { status: 500 }
      )
    }

    // Calculate token expiration
    const currentTimestamp = Math.floor(Date.now() / 1000)
    const privilegeExpiredTs = currentTimestamp + TOKEN_EXPIRATION_TIME

    // Determine user role
    const agoraRole = role === 'host' ? RtcRole.PUBLISHER : RtcRole.SUBSCRIBER

    // Generate the token for ecosystem access
    const token = RtcTokenBuilder.buildTokenWithUid(
      appId,
      appCertificate,
      channelName,
      uid || 0,
      agoraRole,
      privilegeExpiredTs,
      privilegeExpiredTs
    )

    console.log(`🌱 Token generated for ecosystem: ${channelName}, participant: ${uid || 'auto'}`)

    return NextResponse.json({
      success: true,
      token,
      channelName,
      uid: uid || 0,
      role,
      expiresAt: privilegeExpiredTs,
      message: `Welcome to the ${channelName} ecosystem!`
    })

  } catch (error) {
    console.error('🚨 Token generation error:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to generate ecosystem access token',
        message: 'There was a disturbance in the ecosystem. Please try again.'
      },
      { status: 500 }
    )
  }
}

// Handle GET requests for token validation
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const channelName = searchParams.get('channel')
  
  if (!channelName) {
    return NextResponse.json(
      { error: 'Channel name required' },
      { status: 400 }
    )
  }

  return NextResponse.json({
    message: `Ecosystem ${channelName} is ready for connections`,
    timestamp: new Date().toISOString(),
    status: 'healthy'
  })
} 