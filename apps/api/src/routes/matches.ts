import type { FastifyInstance } from 'fastify'
import { supabase } from '../db/supabase'

export async function matchRoutes(app: FastifyInstance) {
  // GET /v1/matches — list matches with their related teams, venue, competition
  app.get('/', async (_req, reply) => {
    const { data, error } = await supabase
      .from('matches')
      .select(`
        *,
        home_team:teams!matches_home_team_id_fkey(*),
        away_team:teams!matches_away_team_id_fkey(*),
        venue:venues(*),
        competition:competitions(*)
      `)
      .order('kickoff_at', { ascending: false })

    if (error) {
      return reply.status(400).send({ error: error.message })
    }
    return { matches: data }
  })

  // GET /v1/matches/:id — single match with everything attached
  app.get('/:id', async (req, reply) => {
    const { id } = req.params as { id: string }
    const { data, error } = await supabase
      .from('matches')
      .select(`
        *,
        home_team:teams!matches_home_team_id_fkey(*),
        away_team:teams!matches_away_team_id_fkey(*),
        venue:venues(*),
        competition:competitions(*)
      `)
      .eq('id', id)
      .single()

    if (error || !data) {
      return reply.status(404).send({ error: 'Match not found' })
    }
    return data
  })
}