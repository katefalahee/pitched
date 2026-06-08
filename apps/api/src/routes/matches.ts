import type { FastifyInstance } from 'fastify'
import { supabase } from '../db/supabase'
import { requireUser } from '../middleware/auth'

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

  // GET /v1/matches/search?q=... — search existing matches by team name
  app.get('/search', async (req, reply) => {
    const { q } = req.query as { q?: string }
    if (!q || q.length < 2) {
      return { matches: [] }
    }

    // Find teams whose name matches the query, then matches involving those teams
    const { data: teams, error: teamErr } = await supabase
      .from('teams')
      .select('id')
      .ilike('name', `%${q}%`)

    if (teamErr) {
      console.error('MATCH SEARCH TEAM ERROR:', teamErr)
      return reply.status(400).send({ error: teamErr.message })
    }

    const teamIds = (teams ?? []).map((t) => t.id)
    if (teamIds.length === 0) {
      return { matches: [] }
    }

    // Matches where either home or away team is one of the matched teams
    const { data, error } = await supabase
      .from('matches')
      .select(`
        *,
        home_team:teams!matches_home_team_id_fkey(*),
        away_team:teams!matches_away_team_id_fkey(*),
        venue:venues(*),
        competition:competitions(*)
      `)
      .or(`home_team_id.in.(${teamIds.join(',')}),away_team_id.in.(${teamIds.join(',')})`)
      .order('kickoff_at', { ascending: false })
      .limit(30)

    if (error) {
      console.error('MATCH SEARCH ERROR:', error)
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

  // POST /v1/matches — create a new match (with server-side duplicate check)
  app.post('/', { preHandler: requireUser }, async (req, reply) => {
    const b = req.body as any

    // Required fields per the agreed design
    if (!b.home_team_id || !b.away_team_id || !b.competition_id || !b.venue_id || !b.kickoff_at || !b.sport) {
      return reply.status(400).send({ error: 'Missing required fields' })
    }
    if (b.home_team_id === b.away_team_id) {
      return reply.status(400).send({ error: 'Home and away teams must be different' })
    }

    const { data, error } = await supabase
      .from('matches')
      .insert({
        home_team_id: b.home_team_id,
        away_team_id: b.away_team_id,
        competition_id: b.competition_id,
        venue_id: b.venue_id,
        kickoff_at: b.kickoff_at,
        sport: b.sport,
        home_score: b.home_score ?? null,
        away_score: b.away_score ?? null,
        status: b.status ?? 'upcoming',
      })
      .select('id')
      .single()

    if (error) {
      // 23505 = the uniqueness constraint fired → this match already exists
      if (error.code === '23505') {
        // Find the existing one so we can point the user to it
        const { data: existing } = await supabase
          .from('matches')
          .select('id')
          .eq('home_team_id', b.home_team_id)
          .eq('away_team_id', b.away_team_id)
          .eq('kickoff_at', b.kickoff_at)
          .single()
        return reply.status(409).send({ error: 'This match already exists', existingId: existing?.id })
      }
      console.error('CREATE MATCH ERROR:', error)
      return reply.status(400).send({ error: error.message })
    }
    return reply.status(201).send({ id: data.id })
  })
}