// The laptop's local network IP — the phone reaches the API here.
import { API_URL } from './config'
import { supabase } from './supabase'

export async function getMatches() {
  const res = await fetch(`${API_URL}/v1/matches`)
  if (!res.ok) throw new Error('Failed to fetch matches')
  const data = await res.json()
  return data.matches
}

export async function createLog(log: {
  match_id: string
  rating: number
  review?: string
  moods?: string[]
  visibility?: string
}) {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) throw new Error('Not signed in')

  const res = await fetch(`${API_URL}/v1/logs`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify(log),
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error || 'Failed to save log')
  }
  return res.json()
}

export async function getUserLogs(userId: string) {
  const res = await fetch(`${API_URL}/v1/logs/user/${userId}`)
  if (!res.ok) throw new Error('Failed to fetch logs')
  const data = await res.json()
  return data.logs
}

async function authHeader() {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) throw new Error('Not signed in')
  return { Authorization: `Bearer ${session.access_token}` }
}

export async function searchUsers(q: string) {
  const res = await fetch(`${API_URL}/v1/users/search?q=${encodeURIComponent(q)}`, {
    headers: await authHeader(),
  })
  if (!res.ok) throw new Error('Search failed')
  const data = await res.json()
  return data.users
}

export async function followUser(userId: string) {
  const res = await fetch(`${API_URL}/v1/users/${userId}/follow`, {
    method: 'POST',
    headers: await authHeader(),
  })
  if (!res.ok) throw new Error('Follow failed')
  return res.json()
}

export async function unfollowUser(userId: string) {
  const res = await fetch(`${API_URL}/v1/users/${userId}/follow`, {
    method: 'DELETE',
    headers: await authHeader(),
  })
  if (!res.ok) throw new Error('Unfollow failed')
  return res.json()
}

export async function getFollowing() {
  const res = await fetch(`${API_URL}/v1/users/following`, {
    headers: await authHeader(),
  })
  if (!res.ok) throw new Error('Failed to load following')
  const data = await res.json()
  return data.following
}

export async function getFeed() {
  const res = await fetch(`${API_URL}/v1/logs/feed`, {
    headers: await authHeader(),
  })
  if (!res.ok) throw new Error('Failed to load feed')
  const data = await res.json()
  return data.logs
}

export async function getMyProfile() {
  const res = await fetch(`${API_URL}/v1/users/me`, { headers: await authHeader() })
  if (!res.ok) throw new Error('Failed to load profile')
  return res.json()
}

export async function getFollowers() {
  const res = await fetch(`${API_URL}/v1/users/followers`, { headers: await authHeader() })
  if (!res.ok) throw new Error('Failed to load followers')
  const data = await res.json()
  return data.followers
}

export async function getFollowingList() {
  const res = await fetch(`${API_URL}/v1/users/following-list`, { headers: await authHeader() })
  if (!res.ok) throw new Error('Failed to load following')
  const data = await res.json()
  return data.following
}

export async function getUserProfile(userId: string) {
  const res = await fetch(`${API_URL}/v1/users/${userId}/profile`, { headers: await authHeader() })
  if (!res.ok) throw new Error('Failed to load profile')
  return res.json()
}

export async function searchMatches(q: string) {
  const res = await fetch(`${API_URL}/v1/matches/search?q=${encodeURIComponent(q)}`, {
    headers: await authHeader(),
  })
  if (!res.ok) throw new Error('Search failed')
  const data = await res.json()
  return data.matches
}

export async function getTeams(sport: string) {
  const res = await fetch(`${API_URL}/v1/teams?sport=${sport}`, { headers: await authHeader() })
  if (!res.ok) throw new Error('Failed to load teams')
  const data = await res.json()
  return data.teams
}

export async function getCompetitions(sport: string) {
  const res = await fetch(`${API_URL}/v1/competitions?sport=${sport}`, { headers: await authHeader() })
  if (!res.ok) throw new Error('Failed to load competitions')
  const data = await res.json()
  return data.competitions
}

export async function getVenues() {
  const res = await fetch(`${API_URL}/v1/venues`, { headers: await authHeader() })
  if (!res.ok) throw new Error('Failed to load venues')
  const data = await res.json()
  return data.venues
}

export async function createMatch(match: {
  home_team_id: string
  away_team_id: string
  competition_id: string
  venue_id: string
  kickoff_at: string
  sport: string
  home_score?: string
  away_score?: string
  status?: string
}) {
  const res = await fetch(`${API_URL}/v1/matches`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(await authHeader()) },
    body: JSON.stringify(match),
  })
  const data = await res.json()
  if (!res.ok) {
    // 409 = already exists; pass back the existing id so we can redirect
    const err: any = new Error(data.error || 'Failed to create match')
    err.existingId = data.existingId
    err.status = res.status
    throw err
  }
  return data
}

export async function getMatchStory(matchId: string) {
  const res = await fetch(`${API_URL}/v1/matches/${matchId}/story`, { headers: await authHeader() })
  if (!res.ok) throw new Error('Failed to load match story')
  return res.json()
}

export async function updateLog(logId: string, log: {
  rating: number
  review?: string
  moods?: string[]
  visibility?: string
}) {
  const res = await fetch(`${API_URL}/v1/logs/${logId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...(await authHeader()) },
    body: JSON.stringify(log),
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error || 'Failed to update log')
  }
  return res.json()
}