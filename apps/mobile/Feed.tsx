import { useEffect, useState } from 'react'
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native'
import { getFeed } from './lib/api'

export default function Feed({ onBack }: { onBack: () => void }) {
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getFeed()
      .then(setLogs)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={onBack}>
        <Text style={styles.back}>← Back</Text>
      </TouchableOpacity>
      <Text style={styles.heading}>Feed</Text>
      <Text style={styles.subheading}>From people you follow</Text>

      {loading && <ActivityIndicator color="#10B981" style={{ marginTop: 40 }} />}
      {error && <Text style={styles.error}>Error: {error}</Text>}
      {!loading && !error && logs.length === 0 && (
        <Text style={styles.empty}>Nothing here yet. Follow people who log matches, and their entries will appear here.</Text>
      )}

      <FlatList
        data={logs}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingTop: 16 }}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.byline}>@{item.user.username}</Text>
            <Text style={styles.teams}>
              {item.match.home_team.name} v {item.match.away_team.name}
            </Text>
            <Text style={styles.meta}>{item.match.venue.name}</Text>
            <Text style={styles.stars}>
              {'★'.repeat(Math.floor(item.rating))}
              <Text style={styles.starsOff}>{'★'.repeat(5 - Math.floor(item.rating))}</Text>
            </Text>
            {item.review ? <Text style={styles.review}>"{item.review}"</Text> : null}
            {item.moods && item.moods.length > 0 && (
              <View style={styles.moodRow}>
                {item.moods.map((m: string) => (
                  <Text key={m} style={styles.moodChip}>{m}</Text>
                ))}
              </View>
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
  subheading: { fontSize: 13, color: '#A8AEBE', marginTop: 4 },
  error: { color: '#EF4444', marginTop: 20 },
  empty: { color: '#6B7183', marginTop: 40, fontSize: 14, lineHeight: 22 },
  card: { backgroundColor: '#1C1F27', borderRadius: 14, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#2E3240' },
  byline: { color: '#10B981', fontSize: 13, fontWeight: '600', marginBottom: 6 },
  teams: { fontSize: 17, fontWeight: '600', color: '#F4F5F7', marginBottom: 4 },
  meta: { fontSize: 12, color: '#6B7183', marginBottom: 8 },
  stars: { fontSize: 16, color: '#F59E0B', marginBottom: 8 },
  starsOff: { color: '#2E3240' },
  review: { fontSize: 14, color: '#A8AEBE', fontStyle: 'italic', lineHeight: 20, marginBottom: 8 },
  moodRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  moodChip: { fontSize: 11, color: '#F59E0B', backgroundColor: 'rgba(245,158,11,0.12)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 50, overflow: 'hidden' },
  back: { color: '#A8AEBE', fontSize: 15, marginBottom: 16 },
})