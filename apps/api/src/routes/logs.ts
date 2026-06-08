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
      // 23505 = unique constraint violation → they've already logged this match
      if (error.code === '23505') {
        return reply.status(409).send({ error: "You've already logged this match." })
      }
      console.error('CREATE LOG ERROR:', error)
      return reply.status(400).send({ error: error.message })
    }
    return reply.status(201).send(data)
  })

  // PATCH /v1/logs/:id — edit your own log
  app.patch('/:id', { preHandler: requireUser }, async (req, reply) => {
    const me = (req as any).userId
    const { id } = req.params as { id: string }
    const b = req.body as any

    // Only allow editing your own log
    const { data: existing, error: findErr } = await supabase
      .from('match_logs')
      .select('user_id')
      .eq('id', id)
      .single()

    if (findErr || !existing) {
      return reply.status(404).send({ error: 'Log not found' })
    }
    if (existing.user_id !== me) {
      return reply.status(403).send({ error: 'You can only edit your own log' })
    }

    const { data, error } = await supabase
      .from('match_logs')
      .update({
        rating: b.rating,
        review: b.review ?? null,
        moods: b.moods ?? [],
        visibility: b.visibility ?? 'public',
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('UPDATE LOG ERROR:', error)
      return reply.status(400).send({ error: error.message })
    }
    return data
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