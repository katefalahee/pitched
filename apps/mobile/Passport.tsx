import { useEffect, useState } from 'react'
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, RefreshControl } from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import Stamp from './Stamp'
import { getPassport } from './lib/api'

export default function Passport({ onOpenGround }: { onOpenGround: (venueId: string) => void }) {
  const [data, setData] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  function load() {
    return getPassport().then(setData).catch(() => {})
  }
  useEffect(() => { load().finally(() => setLoading(false)) }, [])
  async function onRefresh() { setRefreshing(true); await load(); setRefreshing(false) }

  if (loading) return <View style={styles.center}><ActivityIndicator color="#10B981" /></View>
  if (!data) return <View style={styles.center}><Text style={styles.err}>Couldn't load your passport.</Text></View>

  const { venues, stats } = data
  const pct = stats.total > 0 ? Math.round((stats.visited / stats.total) * 100) : 0

  return (
    <ScrollView
      contentContainerStyle={{ paddingBottom: 100 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#10B981" colors={['#10B981']} />}
    >
      {/* Passport "cover" header */}
      <View style={styles.cover}>
        <View style={styles.coverTop}>
          <MaterialCommunityIcons name="stadium" size={22} color="#C9A24B" />
          <Text style={styles.coverKicker}>GROUND PASSPORT</Text>
        </View>
        <Text style={styles.coverCount}>{stats.visited} <Text style={styles.coverOf}>of {stats.total}</Text></Text>
        <Text style={styles.coverSub}>grounds visited</Text>

        {/* progress bar */}
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${pct}%` }]} />
        </View>
        <Text style={styles.progressPct}>{pct}% collected</Text>
      </View>

      {/* Stamp grid */}
      <View style={styles.grid}>
        {venues.map((v: any) => (
          <TouchableOpacity key={v.id} style={styles.cell} activeOpacity={0.8} onPress={() => onOpenGround(v.id)}>
            <Stamp venue={v} visited={v.visited} />
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  center: { flex: 1, backgroundColor: '#13151A', justifyContent: 'center', alignItems: 'center', paddingTop: 40 },
  err: { color: '#EF4444' },

  cover: { backgroundColor: '#15171D', borderRadius: 18, borderWidth: 1, borderColor: '#2A2E38', padding: 22, marginTop: 8, marginBottom: 18, alignItems: 'center' },
  coverTop: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
  coverKicker: { color: '#C9A24B', fontSize: 12, fontWeight: '800', letterSpacing: 3 },
  coverCount: { color: '#F4F5F7', fontSize: 44, fontWeight: '800' },
  coverOf: { color: '#6B7183', fontSize: 22, fontWeight: '600' },
  coverSub: { color: '#A8AEBE', fontSize: 13, marginTop: 2, marginBottom: 18 },
  progressTrack: { width: '100%', height: 6, backgroundColor: '#2A2E38', borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#C9A24B', borderRadius: 3 },
  progressPct: { color: '#6B7183', fontSize: 11, marginTop: 8, letterSpacing: 1 },

  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: { width: '50%' },
})