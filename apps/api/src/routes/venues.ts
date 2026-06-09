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

    // The user's bucket-list venue ids
    const { data: bucket } = await supabase
      .from('bucket_list')
      .select('venue_id')
      .eq('user_id', me)
    const bucketed = new Set((bucket ?? []).map((b) => b.venue_id))

    const result = (venues ?? []).map((v) => ({
      ...v,
      visited: !!visited[v.id],
      first_visit: visited[v.id] ?? null,
      wishlist: bucketed.has(v.id),
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

    // Is it on my bucket-list?
    const { data: inBucket } = await supabase
      .from('bucket_list')
      .select('venue_id')
      .eq('user_id', me)
      .eq('venue_id', id)
      .maybeSingle()

    // Am I following this ground?
    const { data: following } = await supabase
      .from('ground_follows')
      .select('venue_id')
      .eq('user_id', me)
      .eq('venue_id', id)
      .maybeSingle()

    // How many people follow it?
    const { count: followerCount } = await supabase
      .from('ground_follows')
      .select('*', { count: 'exact', head: true })
      .eq('venue_id', id)

    return {
      venue,
      matches: matches ?? [],
      visited: (myVisit ?? []).length > 0,
      wishlist: !!inBucket,
      following: !!following,
      followerCount: followerCount ?? 0,
    }
  })

  // POST /v1/venues/:id/bucket — add a ground to my bucket-list
  app.post('/:id/bucket', { preHandler: requireUser }, async (req, reply) => {
    const me = (req as any).userId
    const { id } = req.params as { id: string }
    const { error } = await supabase
      .from('bucket_list')
      .insert({ user_id: me, venue_id: id })
    if (error && error.code !== '23505') {
      console.error('BUCKET ADD ERROR:', error)
      return reply.status(400).send({ error: error.message })
    }
    return { ok: true }
  })

  // DELETE /v1/venues/:id/bucket — remove from my bucket-list
  app.delete('/:id/bucket', { preHandler: requireUser }, async (req, reply) => {
    const me = (req as any).userId
    const { id } = req.params as { id: string }
    const { error } = await supabase
      .from('bucket_list')
      .delete()
      .eq('user_id', me)
      .eq('venue_id', id)
    if (error) {
      console.error('BUCKET REMOVE ERROR:', error)
      return reply.status(400).send({ error: error.message })
    }
    return { ok: true }
  })

  // POST /v1/venues/:id/follow — follow a ground
  app.post('/:id/follow', { preHandler: requireUser }, async (req, reply) => {
    const me = (req as any).userId
    const { id } = req.params as { id: string }
    const { error } = await supabase
      .from('ground_follows')
      .insert({ user_id: me, venue_id: id })
    if (error && error.code !== '23505') {
      console.error('GROUND FOLLOW ERROR:', error)
      return reply.status(400).send({ error: error.message })
    }
    return { ok: true }
  })

  // DELETE /v1/venues/:id/follow — unfollow a ground
  app.delete('/:id/follow', { preHandler: requireUser }, async (req, reply) => {
    const me = (req as any).userId
    const { id } = req.params as { id: string }
    const { error } = await supabase
      .from('ground_follows')
      .delete()
      .eq('user_id', me)
      .eq('venue_id', id)
    if (error) {
      console.error('GROUND UNFOLLOW ERROR:', error)
      return reply.status(400).send({ error: error.message })
    }
    return { ok: true }
  })
}