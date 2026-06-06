// The laptop's local network IP — the phone reaches the API here.
const API_URL = 'http://192.168.0.29:4000'

export async function getMatches() {
  const res = await fetch(`${API_URL}/v1/matches`)
  if (!res.ok) throw new Error('Failed to fetch matches')
  const data = await res.json()
  return data.matches
}

export async function createLog(log: {
  user_id: string
  match_id: string
  rating: number
  review?: string
  moods?: string[]
}) {
  const res = await fetch(`${API_URL}/v1/logs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
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