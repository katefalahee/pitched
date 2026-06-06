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
}