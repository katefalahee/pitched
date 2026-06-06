import type { FastifyInstance } from 'fastify'
import { supabase } from '../db/supabase'
import { requireUser } from '../middleware/auth'

export async function userRoutes(app: FastifyInstance) {
  // GET /v1/users/search?q=... — find users by username
  app.get('/search', { preHandler: requireUser }, async (req, reply) => {
    const { q } = req.query as { q?: string }
    if (!q || q.length < 2) {
      return { users: [] }
    }

    const me = (req as any).userId
    const { data, error } = await supabase
      .from('users')
      .select('id, username, display_name, avatar_url')
      .ilike('username', `%${q}%`)
      .neq('id', me) // don't show myself in results
      .limit(20)

    if (error) return reply.status(400).send({ error: error.message })
    return { users: data }
  })

  // POST /v1/users/:id/follow — follow a user
  app.post('/:id/follow', { preHandler: requireUser }, async (req, reply) => {
    const me = (req as any).userId
    const { id } = req.params as { id: string }

    if (me === id) {
      return reply.status(400).send({ error: 'You cannot follow yourself' })
    }

    const { error } = await supabase
      .from('follows')
      .insert({ follower_id: me, following_id: id })

    if (error) {
      // Ignore duplicate (already following), surface anything else
      if (error.code === '23505') return { ok: true, already: true }
      return reply.status(400).send({ error: error.message })
    }
    return { ok: true }
  })

  // DELETE /v1/users/:id/follow — unfollow a user
  app.delete('/:id/follow', { preHandler: requireUser }, async (req, reply) => {
    const me = (req as any).userId
    const { id } = req.params as { id: string }

    const { error } = await supabase
      .from('follows')
      .delete()
      .eq('follower_id', me)
      .eq('following_id', id)

    if (error) return reply.status(400).send({ error: error.message })
    return { ok: true }
  })

  // GET /v1/users/following — ids of everyone I follow
  app.get('/following', { preHandler: requireUser }, async (req, reply) => {
    const me = (req as any).userId
    const { data, error } = await supabase
      .from('follows')
      .select('following_id')
      .eq('follower_id', me)

    if (error) return reply.status(400).send({ error: error.message })
    return { following: data.map((r) => r.following_id) }
  })

  // GET /v1/users/me — my own profile with counts
  app.get('/me', { preHandler: requireUser }, async (req, reply) => {
    const me = (req as any).userId

    const { data: profile, error } = await supabase
      .from('users')
      .select('id, username, display_name, bio, avatar_url, location')
      .eq('id', me)
      .single()

    if (error) {
      console.error('PROFILE ERROR:', error)
      return reply.status(400).send({ error: error.message })
    }

    // Counts: logs, following, followers
    const [{ count: logCount }, { count: followingCount }, { count: followerCount }] = await Promise.all([
      supabase.from('match_logs').select('*', { count: 'exact', head: true }).eq('user_id', me),
      supabase.from('follows').select('*', { count: 'exact', head: true }).eq('follower_id', me),
      supabase.from('follows').select('*', { count: 'exact', head: true }).eq('following_id', me),
    ])

    return {
      profile,
      stats: {
        logs: logCount ?? 0,
        following: followingCount ?? 0,
        followers: followerCount ?? 0,
      },
    }
  })

  // GET /v1/users/followers — people who follow me
  app.get('/followers', { preHandler: requireUser }, async (req, reply) => {
    const me = (req as any).userId
    const { data, error } = await supabase
      .from('follows')
      .select('follower:users!follows_follower_id_fkey(id, username, display_name)')
      .eq('following_id', me)

    if (error) {
      console.error('FOLLOWERS ERROR:', error)
      return reply.status(400).send({ error: error.message })
    }
    return { followers: data.map((r: any) => r.follower) }
  })

  // GET /v1/users/following-list — full info on people I follow
  app.get('/following-list', { preHandler: requireUser }, async (req, reply) => {
    const me = (req as any).userId
    const { data, error } = await supabase
      .from('follows')
      .select('followed:users!follows_following_id_fkey(id, username, display_name)')
      .eq('follower_id', me)

    if (error) {
      console.error('FOLLOWING-LIST ERROR:', error)
      return reply.status(400).send({ error: error.message })
    }
    return { following: data.map((r: any) => r.followed) }
  })

  // GET /v1/users/:id/profile — any user's public profile
  app.get('/:id/profile', { preHandler: requireUser }, async (req, reply) => {
    const me = (req as any).userId
    const { id } = req.params as { id: string }

    const { data: profile, error } = await supabase
      .from('users')
      .select('id, username, display_name, bio, location')
      .eq('id', id)
      .single()

    if (error || !profile) {
      return reply.status(404).send({ error: 'User not found' })
    }

    // Counts
    const [{ count: logCount }, { count: followingCount }, { count: followerCount }] = await Promise.all([
      supabase.from('match_logs').select('*', { count: 'exact', head: true }).eq('user_id', id).eq('visibility', 'public'),
      supabase.from('follows').select('*', { count: 'exact', head: true }).eq('follower_id', id),
      supabase.from('follows').select('*', { count: 'exact', head: true }).eq('following_id', id),
    ])

    // Am I following them?
    const { data: rel } = await supabase
      .from('follows')
      .select('follower_id')
      .eq('follower_id', me)
      .eq('following_id', id)
      .maybeSingle()

    // Decide which visibilities this viewer is allowed to see
    const canSeeFriends = me === id || !!rel
    const allowedVisibilities = canSeeFriends ? ['public', 'friends'] : ['public']

    // Their logs, filtered by what the viewer is allowed to see
    const { data: logs, error: logErr } = await supabase
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
      .eq('user_id', id)
      .in('visibility', allowedVisibilities)
      .order('logged_at', { ascending: false })
      .limit(50)

    if (logErr) {
      console.error('USER PROFILE LOGS ERROR:', logErr)
      return reply.status(400).send({ error: logErr.message })
    }

    return {
      profile,
      stats: { logs: logCount ?? 0, following: followingCount ?? 0, followers: followerCount ?? 0 },
      isFollowing: !!rel,
      isMe: me === id,
      logs,
    }
  })
}