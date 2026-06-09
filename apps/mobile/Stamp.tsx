import { View, Text, StyleSheet } from 'react-native'

// Deterministic pick so each ground always gets the same stamp colour + rotation
function hashString(s: string) {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0
  return Math.abs(h)
}

const STAMP_COLORS = ['#10B981', '#F59E0B', '#EC4899', '#6366F1', '#8B5CF6', '#EF4444', '#0EA5E9', '#14B8A6']
const ROTATIONS = [-8, -5, -3, 4, 6, 9, -6, 3]

export default function Stamp({ venue, visited }: { venue: any; visited: boolean }) {
  const h = hashString(venue.id ?? venue.name)
  const color = STAMP_COLORS[h % STAMP_COLORS.length]
  const rotation = ROTATIONS[h % ROTATIONS.length]

  if (!visited) {
    // Unvisited: a faded, dashed placeholder — waiting to be earned
    return (
      <View style={styles.slot}>
        <View style={[styles.stampOuter, styles.unvisitedOuter]}>
          <Text style={styles.unvisitedName} numberOfLines={2}>{venue.name}</Text>
          {venue.county ? <Text style={styles.unvisitedCounty}>{venue.county}</Text> : null}
        </View>
      </View>
    )
  }

  // Visited: a proper stamp — coloured, bordered, rotated, with date
  const year = venue.first_visit ? new Date(venue.first_visit).getFullYear() : ''
  return (
    <View style={styles.slot}>
      <View style={[styles.stampOuter, { transform: [{ rotate: `${rotation}deg` }] }]}>
        <View style={[styles.stampBorder, { borderColor: color }]}>
          <View style={[styles.stampInner, { borderColor: color }]}>
            <Text style={[styles.stampName, { color }]} numberOfLines={2}>{venue.name.toUpperCase()}</Text>
            <View style={[styles.stampLine, { backgroundColor: color }]} />
            {venue.county ? <Text style={[styles.stampCounty, { color }]}>{venue.county.toUpperCase()}</Text> : null}
            {year ? <Text style={[styles.stampYear, { color }]}>{year}</Text> : null}
          </View>
        </View>
        {/* a subtle "VISITED" arc-ish tag */}
        <View style={[styles.visitedTag, { backgroundColor: color }]}>
          <Text style={styles.visitedTagText}>VISITED</Text>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  slot: { width: '100%', height: 120, alignItems: 'center', justifyContent: 'center', paddingVertical: 8 },
  stampOuter: { width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' },

  // Visited stamp
  stampBorder: { width: '80%', height: '90%', borderWidth: 2, borderRadius: 14, padding: 5, opacity: 0.9 },
  stampInner: { flex: 1, borderWidth: 1, borderRadius: 10, borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 8 },
  stampName: { fontSize: 15, fontWeight: '800', textAlign: 'center', letterSpacing: 0.5 },
  stampLine: { width: 28, height: 2, marginVertical: 6, opacity: 0.7 },
  stampCounty: { fontSize: 9, fontWeight: '600', letterSpacing: 1.5 },
  stampYear: { fontSize: 11, fontWeight: '700', marginTop: 4, opacity: 0.8 },
  visitedTag: { position: 'absolute', bottom: 14, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4, transform: [{ rotate: '-2deg' }] },
  visitedTagText: { color: '#13151A', fontSize: 8, fontWeight: '800', letterSpacing: 1 },

  // Unvisited slot
  unvisitedOuter: { width: '80%', height: '90%', borderWidth: 1.5, borderColor: '#2A2E38', borderRadius: 14, borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 10, opacity: 0.55 },
  unvisitedName: { color: '#4B5160', fontSize: 13, fontWeight: '600', textAlign: 'center', lineHeight: 16 },
  unvisitedCounty: { color: '#3A3F4B', fontSize: 9, marginTop: 4, letterSpacing: 1 },
})