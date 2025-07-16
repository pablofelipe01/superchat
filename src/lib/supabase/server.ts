/**
 * 🌿 Supabase Server Configuration for Server-Side Operations
 * This handles server-side database operations in our ecosystem
 */

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@/types/database'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}

/**
 * Server-side helper to get the current user
 */
export async function getCurrentUser() {
  const supabase = await createClient()
  
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error || !user) {
      return { user: null, error }
    }
    
    // Get the full profile with agricultural context
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()
    
    return { 
      user: { ...user, profile }, 
      error: profileError 
    }
  } catch (error) {
    return { user: null, error }
  }
}

/**
 * Server-side helper to check if user is authenticated
 */
export async function getSession() {
  const supabase = await createClient()
  
  try {
    const { data: { session }, error } = await supabase.auth.getSession()
    return { session, error }
  } catch (error) {
    return { session: null, error }
  }
}

/**
 * Server-side meeting operations with agricultural context
 */
export async function getMeetingWithDetails(roomId: string) {
  const supabase = await createClient()
  
  const { data: meeting, error } = await supabase
    .from('meetings')
    .select(`
      *,
      profiles!meetings_host_id_fkey(
        id,
        username,
        full_name,
        avatar_url,
        role,
        organization,
        expertise
      ),
      recordings(
        id,
        agora_sid,
        duration_seconds,
        file_size_mb,
        status,
        key_topics,
        action_items
      ),
      transcriptions(
        id,
        full_text,
        primary_language,
        agricultural_terms,
        crop_mentions,
        practice_mentions,
        gaia_summary
      ),
      carbon_analytics(
        carbon_saved_kg,
        trees_equivalent,
        total_distance_saved_km
      ),
      meeting_invites(
        invite_code,
        theme,
        expires_at
      )
    `)
    .eq('room_id', roomId)
    .single()

  return { data: meeting, error }
}

/**
 * Create a meeting invite with natural naming
 */
export async function createMeetingInvite(meetingId: string, theme = 'forest') {
  const supabase = await createClient()
  
  // Generate natural invite codes like "forest-stream-42"
  const naturalWords = {
    forest: ['oak', 'pine', 'cedar', 'birch', 'maple'],
    field: ['meadow', 'prairie', 'pasture', 'valley', 'hill'],
    garden: ['bloom', 'sprout', 'leaf', 'bud', 'root']
  }
  
  const themeWords = naturalWords[theme as keyof typeof naturalWords] || naturalWords.forest
  const word1 = themeWords[Math.floor(Math.random() * themeWords.length)]
  const word2 = ['stream', 'breeze', 'dawn', 'dew', 'glow'][Math.floor(Math.random() * 5)]
  const number = Math.floor(Math.random() * 99) + 1
  
  const invite_code = `${word1}-${word2}-${number}`
  
  const { data, error } = await supabase
    .from('meeting_invites')
    .insert({
      meeting_id: meetingId,
      invite_code,
      theme,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
      max_uses: 100,
      current_uses: 0
    })
    .select()
    .single()

  return { data, error }
}

/**
 * Server-side GAIA knowledge base operations
 */
export async function getRelevantKnowledge(
  topics: string[],
  categories?: string[]
) {
  const supabase = await createClient()
  
  let query = supabase
    .from('knowledge_base')
    .select('id, title, content, categories, tags, author')
    .limit(5)
  
  // Build search conditions for agricultural topics
  if (topics.length > 0) {
    const searchTerms = topics.join(' | ')
    query = query.textSearch('title,content', searchTerms)
  }
  
  if (categories && categories.length > 0) {
    query = query.overlaps('categories', categories)
  }
  
  const { data, error } = await query.order('access_count', { ascending: false })
  
  return { data, error }
}

/**
 * Server-side function to save GAIA interaction
 */
export async function saveGaiaInteraction(interaction: {
  meeting_id?: string
  user_id?: string
  interaction_type: string
  user_input?: string
  gaia_response?: string
  context?: Record<string, string | number | boolean>
  response_time_ms?: number
}) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('gaia_interactions')
    .insert({
      ...interaction,
      timestamp: new Date().toISOString()
    })
    .select()
    .single()

  return { data, error }
}

/**
 * Update knowledge base access count for analytics
 */
export async function trackKnowledgeAccess(knowledgeId: string) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .rpc('increment_knowledge_access', { knowledge_id: knowledgeId })

  return { error }
} 