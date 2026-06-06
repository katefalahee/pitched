import type { FastifyRequest, FastifyReply } from 'fastify'
import { supabase } from '../db/supabase'

// Reads the Bearer token, asks Supabase who it belongs to, attaches the user id.
export async function requireUser(req: FastifyRequest, reply: FastifyReply) {
  const header = req.headers.authorization
  if (!header || !header.startsWith('Bearer ')) {
    return reply.status(401).send({ error: 'Missing auth token' })
  }

  const token = header.slice('Bearer '.length)
  const { data, error } = await supabase.auth.getUser(token)

  if (error || !data.user) {
    return reply.status(401).send({ error: 'Invalid auth token' })
  }

  // Attach the verified user id for the route to use
  ;(req as any).userId = data.user.id
}