import { useEffect, useState } from 'react'
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native'
import { StatusBar } from 'expo-status-bar'
import { getMatches } from './lib/api'

export default function App() {
  const [matches, setMatches] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getMatches()
      .then(setMatches)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <Text style={styles.heading}>Pitched</Text>
      <Text style={styles.subheading}>Recent Matches</Text>

      {loading && <ActivityIndicator color="#10B981" style={{ marginTop: 40 }} />}
      {error && <Text style={styles.error}>Error: {error}</Text>}

      <FlatList
        data={matches}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingTop: 16 }}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.teams}>
              {item.home_team.name} v {item.away_team.name}
            </Text>
            <Text style={styles.meta}>
              {item.venue.name} · {item.competition.name}
            </Text>
            {item.home_score ? (
              <Text style={styles.score}>{item.home_score} — {item.away_score}</Text>
            ) : (
              <Text style={styles.upcoming}>Upcoming</Text>
            )}
          </View>
        )}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#13151A', paddingHorizontal: 16, paddingTop: 70 },
  heading: { fontSize: 32, fontWeight: '700', color: '#F4F5F7' },
  subheading: { fontSize: 14, color: '#A8AEBE', marginTop: 4 },
  error: { color: '#EF4444', marginTop: 20 },
  card: { backgroundColor: '#1C1F27', borderRadius: 14, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#2E3240' },
  teams: { fontSize: 17, fontWeight: '600', color: '#F4F5F7', marginBottom: 4 },
  meta: { fontSize: 12, color: '#6B7183', marginBottom: 8 },
  score: { fontSize: 15, color: '#10B981', fontWeight: '600' },
  upcoming: { fontSize: 13, color: '#F59E0B' },
})