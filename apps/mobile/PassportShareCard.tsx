import { View, Text, StyleSheet } from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'

// A purpose-built, branded card designed to look good when shared as an image.
export default function PassportShareCard({ stats, venues }: { stats: any; venues: any[] }) {
  const visited = venues.filter((v) => v.visited)
  const pct = stats.total > 0 ? Math.round((stats.visited / stats.total) * 100) : 0

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <MaterialCommunityIcons name="stadium" size={26} color="#C9A24B" />
        <Text style={styles.brand}>PITCHED</Text>
      </View>
      <Text style={styles.kicker}>GROUND PASSPORT</Text>

      {/* Big stat */}
      <Text style={styles.bigNum}>{stats.visited}</Text>
      <Text style={styles.bigLabel}>grounds visited of {stats.total}</Text>

      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${pct}%` }]} />
      </View>
      <Text style={styles.pct}>{pct}% collected</Text>

      {/* Visited grounds as little tags */}
      <View style={styles.tags}>
        {visited.slice(0, 12).map((v) => (
          <View key={v.id} style={styles.tag}>
            <Text style={styles.tagText}>{v.name}</Text>
          </View>
        ))}
        {visited.length > 12 && (
          <View style={styles.tag}>
            <Text style={styles.tagText}>+{visited.length - 12} more</Text>
          </View>
        )}
      </View>

      {visited.length === 0 && (
        <Text style={styles.empty}>The journey starts here.</Text>
      )}

      <Text style={styles.footer}>pitched.app</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  card: { width: 380, backgroundColor: '#15171D', padding: 32, alignItems: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  brand: { color: '#F4F5F7', fontSize: 24, fontWeight: '800', letterSpacing: 3 },
  kicker: { color: '#C9A24B', fontSize: 12, fontWeight: '800', letterSpacing: 4, marginTop: 6 },
  bigNum: { color: '#F4F5F7', fontSize: 84, fontWeight: '800', marginTop: 24, lineHeight: 88 },
  bigLabel: { color: '#A8AEBE', fontSize: 15, marginTop: 4 },
  progressTrack: { width: '100%', height: 8, backgroundColor: '#2A2E38', borderRadius: 4, overflow: 'hidden', marginTop: 24 },
  progressFill: { height: '100%', backgroundColor: '#C9A24B', borderRadius: 4 },
  pct: { color: '#6B7183', fontSize: 12, marginTop: 8, letterSpacing: 1 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 7, justifyContent: 'center', marginTop: 26 },
  tag: { backgroundColor: '#1C1F27', borderWidth: 1, borderColor: 'rgba(201,162,75,0.4)', borderRadius: 50, paddingHorizontal: 12, paddingVertical: 6 },
  tagText: { color: '#C9A24B', fontSize: 12, fontWeight: '600' },
  empty: { color: '#6B7183', fontSize: 15, marginTop: 30, fontStyle: 'italic' },
  footer: { color: '#3F4354', fontSize: 12, marginTop: 28, letterSpacing: 2 },
})