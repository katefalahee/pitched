import type { FastifyInstance } from 'fastify'
import { supabase } from '../db/supabase'

export async function competitionRoutes(app: FastifyInstance) {
  // GET /v1/competitions?sport=lgfa — competitions, optionally filtered by sport
  app.get('/', async (req, reply) => {
    const { sport } = req.query as { sport?: string }
    let query = supabase.from('competitions').select('*').order('name')
    if (sport) query = query.eq('sport', sport)
    const { data, error } = await query
    if (error) {
      console.error('COMPETITIONS LIST ERROR:', error)
      return reply.status(400).send({ error: error.message })
    }
    return { competitions: data }
  })
}