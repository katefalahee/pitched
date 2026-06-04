import type { FastifyInstance } from 'fastify'
import { supabase } from '../db/supabase'

export async function venueRoutes(app: FastifyInstance) {
  // GET /v1/venues — list all venues
  app.get('/', async (_req, reply) => {
    const { data, error } = await supabase
      .from('venues')
      .select('*')
      .order('name')

    if (error) {
      return reply.status(400).send({ error: error.message })
    }
    return { venues: data }
  })
}