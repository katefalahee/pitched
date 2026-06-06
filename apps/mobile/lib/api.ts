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