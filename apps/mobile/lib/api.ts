// The laptop's local network IP — the phone reaches the API here.
const API_URL = 'http://192.168.0.29:4000'

export async function getMatches() {
  const res = await fetch(`${API_URL}/v1/matches`)
  if (!res.ok) throw new Error('Failed to fetch matches')
  const data = await res.json()
  return data.matches
}