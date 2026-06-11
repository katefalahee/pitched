import { useEffect, useState } from 'react'
import { View, Text, FlatList, StyleSheet, ActivityIndicator, RefreshControl, TouchableOpacity } from 'react-native'
import { getUserLogs } from './lib/api'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import Header from './Header'
import MatchPulse from './components/MatchPulse'
import { colors, fonts } from './lib/theme'


export default function Diary({ userId, onMenu, onOpenEntry }: { userId: string; onMenu: () => void; onOpenEntry: (entry: any) => void }) {
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function load() {
    return getUserLogs(userId)
      .then(setLogs)
      .catch((e) => setError(e.message))
  }

  useEffect(() => {
    load().finally(() => setLoading(false))
  }, [])

  async function onRefresh() {
    setRefreshing(true)
    await load()
    setRefreshing(false)
  }

  return (
    <View style={styles.container}>
      <Header
        onMenu={onMenu}
        subtitle={`Your match diary — ${logs.length} logged so far`}
      />

      {loading && <ActivityIndicator color="#10B981" style={{ marginTop: 40 }} />}
      {error && <Text style={styles.error}>Error: {error}</Text>}
      {!loading && !error && logs.length === 0 && (
        <Text style={styles.empty}>No matches logged yet. Tap a match on the home screen to start your diary.</Text>
      )}

      <FlatList
        data={logs}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingTop: 16 }}
        alwaysBounceVertical={true}
        refreshControl={
          <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor="#10B981"
                colors={['#10B981']}
                progressViewOffset={60}
              />
        }
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => onOpenEntry(item)}>
            <View style={styles.cardTop}>
              <Text style={[styles.teams, { flex: 1 }]}>
                {item.match.home_team.name} v {item.match.away_team.name}
              </Text>
              <MaterialCommunityIcons
                name={item.visibility === 'private' ? 'lock' : item.visibility === 'friends' ? 'account-group' : 'earth'}
                size={15}
                color="#6B7183"
              />
            </View>
            <Text style={styles.meta}>{item.match.venue.name}</Text>
            <MatchPulse value={Number(item.rating)} size={22} showLabel={false} />
            {item.review ? <Text style={styles.review}>"{item.review}"</Text> : null}
            {item.moods && item.moods.length > 0 && (
              <View style={styles.moodRow}>
                {item.moods.map((m: string) => (
                  <Text key={m} style={styles.moodChip}>{m}</Text>
                ))}
              </View>
            )}
          </TouchableOpacity>
        )}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  back: { color: '#A8AEBE', fontSize: 15, marginBottom: 16 },
  heading: { fontSize: 32, fontWeight: '700', color: '#F4F5F7' },
  subheading: { fontSize: 13, color: '#A8AEBE', marginTop: 4 },
  error: { color: '#EF4444', marginTop: 20 },
  empty: { color: '#6B7183', marginTop: 40, fontSize: 14, lineHeight: 22 },
  card: { backgroundColor: '#1C1F27', borderRadius: 14, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#2E3240' },
  teams: { fontSize: 17, fontWeight: '600', color: '#F4F5F7', marginBottom: 4 },
  meta: { fontSize: 12, color: '#6B7183', marginBottom: 8 },
  stars: { fontSize: 16, color: '#F59E0B', marginBottom: 8 },
  starsOff: { color: '#2E3240' },
  ratingNum: { fontSize: 12, color: '#6B7183' },
  review: { fontSize: 14, color: '#A8AEBE', fontStyle: 'italic', lineHeight: 20, marginBottom: 8 },
  moodRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  moodChip: { fontSize: 11, color: '#F59E0B', backgroundColor: 'rgba(245,158,11,0.12)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 50, overflow: 'hidden' },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
})