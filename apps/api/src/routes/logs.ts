import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { supabase } from '../db/supabase'
import { requireUser } from '../middleware/auth'

const CreateLogSchema = z.object({
  match_id: z.string().uuid(),
  rating: z.number().min(0.5).max(5).multipleOf(0.5),
  review: z.string().max(2000).optional(),
  moods: z.array(z.enum([
    'electric', 'emotional', 'tense', 'proud',
    'heartbreak', 'joyful', 'dramatic', 'disappointing'
  ])).max(3).optional(),
})

export async function logRoutes(app: FastifyInstance) {
  // POST /v1/logs — create a new match log
  // POST /v1/logs — create a new match log
  app.post('/', { preHandler: requireUser }, async (req, reply) => {
    const parsed = CreateLogSchema.safeParse(req.body)
    if (!parsed.success) {
      return reply.status(400).send({ error: 'Invalid data', details: parsed.error.issues })
    }

    const userId = (req as any).userId
    const { data, error } = await supabase
      .from('match_logs')
      .insert({ ...parsed.data, user_id: userId })
      .select()
      .single()

    if (error) {
      return reply.status(400).send({ error: error.message })
    }
    return reply.status(201).send(data)
  })

  // GET /v1/logs/user/:userId — all logs for one user (their diary)
  app.get('/user/:userId', async (req, reply) => {
    const { userId } = req.params as { userId: string }
    const { data, error } = await supabase
      .from('match_logs')
      .select(`
        *,
        match:matches(
          *,
          home_team:teams!matches_home_team_id_fkey(*),
          away_team:teams!matches_away_team_id_fkey(*),
          venue:venues(*)
        )
      `)
      .eq('user_id', userId)
      .order('logged_at', { ascending: false })

    if (error) {
      return reply.status(400).send({ error: error.message })
    }
    return { logs: data }
  })

  // GET /v1/logs/feed — logs from people the user follows
  app.get('/feed', { preHandler: requireUser }, async (req, reply) => {
    const me = (req as any).userId

    // Who do I follow?
    const { data: follows, error: followErr } = await supabase
      .from('follows')
      .select('following_id')
      .eq('follower_id', me)

    if (followErr) return reply.status(400).send({ error: followErr.message })

    const followingIds = follows.map((f) => f.following_id)
    if (followingIds.length === 0) {
      return { logs: [] } // not following anyone yet
    }

    // Their public logs, newest first, with match + user details attached
    const { data, error } = await supabase
      .from('match_logs')
      .select(`
        *,
        user:users!match_logs_user_id_fkey(id, username, display_name),
        match:matches(
          *,
          home_team:teams!matches_home_team_id_fkey(*),
          away_team:teams!matches_away_team_id_fkey(*),
          venue:venues(*)
        )
      `)
      .in('user_id', followingIds)
      .eq('visibility', 'public')
      .order('logged_at', { ascending: false })
      .limit(50)

    if (error) {
      console.error('FEED ERROR:', error)
      return reply.status(400).send({ error: error.message })
    }
    return { logs: data }
  })
}