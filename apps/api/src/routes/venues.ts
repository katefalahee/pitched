import type { FastifyInstance } from 'fastify'
import { supabase } from '../db/supabase'
import { requireUser } from '../middleware/auth'

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

  // GET /v1/venues/passport — all venues, flagged with whether the user has visited
  app.get('/passport', { preHandler: requireUser }, async (req, reply) => {
    const me = (req as any).userId

    // All venues
    const { data: venues, error: vErr } = await supabase
      .from('venues')
      .select('*')
      .order('name')

    if (vErr) {
      console.error('PASSPORT VENUES ERROR:', vErr)
      return reply.status(400).send({ error: vErr.message })
    }

    // Venue ids the user has logged a match at (their visited grounds)
    const { data: myLogs, error: lErr } = await supabase
      .from('match_logs')
      .select('match:matches(venue_id, kickoff_at)')
      .eq('user_id', me)

    if (lErr) {
      console.error('PASSPORT LOGS ERROR:', lErr)
      return reply.status(400).send({ error: lErr.message })
    }

    // Build a map of venue_id -> earliest visit date
    const visited: Record<string, string> = {}
    for (const log of (myLogs ?? [])) {
      const v = (log as any).match?.venue_id
      const when = (log as any).match?.kickoff_at
      if (v) {
        if (!visited[v] || when < visited[v]) visited[v] = when
      }
    }

    const result = (venues ?? []).map((v) => ({
      ...v,
      visited: !!visited[v.id],
      first_visit: visited[v.id] ?? null,
    }))

    const visitedCount = result.filter((v) => v.visited).length

    return {
      venues: result,
      stats: { total: result.length, visited: visitedCount },
    }
  })

  // GET /v1/venues/:id/detail — a ground's detail: info, who's visited, matches there
  app.get('/:id/detail', { preHandler: requireUser }, async (req, reply) => {
    const me = (req as any).userId
    const { id } = req.params as { id: string }

    const { data: venue, error: vErr } = await supabase
      .from('venues')
      .select('*')
      .eq('id', id)
      .single()

    if (vErr || !venue) {
      return reply.status(404).send({ error: 'Ground not found' })
    }

    // Matches played at this ground
    const { data: matches } = await supabase
      .from('matches')
      .select(`
        *,
        home_team:teams!matches_home_team_id_fkey(name),
        away_team:teams!matches_away_team_id_fkey(name)
      `)
      .eq('venue_id', id)
      .order('kickoff_at', { ascending: false })
      .limit(20)

    // Have I visited (logged a match here)?
    const { data: myVisit } = await supabase
      .from('match_logs')
      .select('id, match:matches!inner(venue_id)')
      .eq('user_id', me)
      .eq('match.venue_id', id)
      .limit(1)

    return {
      venue,
      matches: matches ?? [],
      visited: (myVisit ?? []).length > 0,
    }
  })
}