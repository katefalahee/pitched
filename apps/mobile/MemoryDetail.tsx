import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'

const MOOD_STYLE: Record<string, string> = {
  electric: '#F59E0B', emotional: '#EC4899', tense: '#EF4444', proud: '#10B981',
  heartbreak: '#6366F1', joyful: '#F59E0B', dramatic: '#8B5CF6', disappointing: '#6B7183',
}

const VIS_META: Record<string, { icon: string; label: string }> = {
  public: { icon: 'earth', label: 'Visible to everyone' },
  friends: { icon: 'account-group', label: 'Visible to followers' },
  private: { icon: 'lock', label: 'Only visible to you' },
}

export default function MemoryDetail({ entry, onBack, onEdit }: {
  entry: any
  onBack: () => void
  onEdit: () => void
}) {
  const match = entry.match
  const kickoff = new Date(match.kickoff_at)
  const logged = new Date(entry.logged_at)
  const vis = VIS_META[entry.visibility] ?? VIS_META.public
  const rating = Number(entry.rating)

  return (
    <View style={{ flex: 1 }}>
      {/* Top bar: back + subtle edit */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={onBack} style={styles.backRow}>
          <MaterialCommunityIcons name="chevron-left" size={22} color="#A8AEBE" />
          <Text style={styles.backText}>Diary</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onEdit} style={styles.editRow}>
          <MaterialCommunityIcons name="pencil-outline" size={16} color="#6B7183" />
          <Text style={styles.editText}>Edit</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 60 }}>
        {/* Hero / fixture */}
        <View style={styles.hero}>
          <Text style={styles.competition}>{match.competition?.name ?? ''}</Text>
          <View style={styles.fixtureRow}>
            <Text style={styles.team}>{match.home_team.name}</Text>
            {match.home_score && match.away_score ? <Text style={styles.score}>{match.home_score}</Text> : null}
          </View>
          <View style={styles.fixtureRow}>
            <Text style={styles.team}>{match.away_team.name}</Text>
            {match.home_score && match.away_score ? <Text style={styles.score}>{match.away_score}</Text> : null}
          </View>
          <View style={styles.metaRow}>
            <MaterialCommunityIcons name="map-marker-outline" size={15} color="#6B7183" />
            <Text style={styles.metaText}>{match.venue?.name ?? 'Unknown venue'}</Text>
          </View>
          <View style={styles.metaRow}>
            <MaterialCommunityIcons name="calendar-blank-outline" size={15} color="#6B7183" />
            <Text style={styles.metaText}>
              {kickoff.toLocaleDateString('en-IE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </Text>
          </View>
        </View>

        {/* Your rating */}
        <View style={styles.block}>
          <Text style={styles.blockLabel}>Your rating</Text>
          <Text style={styles.bigStars}>
            {'★'.repeat(Math.floor(rating))}
            <Text style={styles.bigStarsOff}>{'★'.repeat(5 - Math.floor(rating))}</Text>
            <Text style={styles.ratingNum}>  {rating.toFixed(1)}</Text>
          </Text>
        </View>

        {/* Your review — the centrepiece */}
        {entry.review ? (
          <View style={styles.block}>
            <Text style={styles.blockLabel}>Your memory</Text>
            <Text style={styles.review}>{entry.review}</Text>
          </View>
        ) : null}

        {/* Moods */}
        {entry.moods && entry.moods.length > 0 && (
          <View style={styles.block}>
            <Text style={styles.blockLabel}>How it felt</Text>
            <View style={styles.moodRow}>
              {entry.moods.map((m: string) => (
                <View key={m} style={styles.moodChip}>
                  <View style={[styles.moodDot, { backgroundColor: MOOD_STYLE[m] ?? '#6B7183' }]} />
                  <Text style={styles.moodText}>{m}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Footer meta: logged date + visibility */}
        <View style={styles.footer}>
          <View style={styles.footerRow}>
            <MaterialCommunityIcons name="bookmark-outline" size={14} color="#6B7183" />
            <Text style={styles.footerText}>
              Logged {logged.toLocaleDateString('en-IE', { day: 'numeric', month: 'short', year: 'numeric' })}
            </Text>
          </View>
          <View style={styles.footerRow}>
            <MaterialCommunityIcons name={vis.icon as any} size={14} color="#6B7183" />
            <Text style={styles.footerText}>{vis.label}</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 56, paddingHorizontal: 16, paddingBottom: 8 },
  backRow: { flexDirection: 'row', alignItems: 'center' },
  backText: { color: '#A8AEBE', fontSize: 15 },
  editRow: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingVertical: 4, paddingHorizontal: 6 },
  editText: { color: '#6B7183', fontSize: 14, fontWeight: '500' },

  hero: { paddingHorizontal: 16, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#1C1F27' },
  competition: { color: '#10B981', fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 16 },
  fixtureRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  team: { color: '#F4F5F7', fontSize: 26, fontWeight: '800', flex: 1 },
  score: { color: '#F4F5F7', fontSize: 26, fontWeight: '800' },
  vs: { color: '#6B7183', fontSize: 18 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: 10 },
  metaText: { color: '#6B7183', fontSize: 13 },

  block: { paddingHorizontal: 16, paddingTop: 24 },
  blockLabel: { color: '#6B7183', fontSize: 12, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 },
  bigStars: { fontSize: 26, color: '#F59E0B' },
  bigStarsOff: { color: '#2E3240' },
  ratingNum: { fontSize: 14, color: '#6B7183' },
  review: { color: '#E8EAED', fontSize: 17, lineHeight: 27 },
  moodRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  moodChip: { flexDirection: 'row', alignItems: 'center', gap: 7, backgroundColor: '#1C1F27', borderWidth: 1, borderColor: '#2E3240', borderRadius: 50, paddingHorizontal: 12, paddingVertical: 7 },
  moodDot: { width: 8, height: 8, borderRadius: 4 },
  moodText: { color: '#F4F5F7', fontSize: 13 },

  footer: { paddingHorizontal: 16, paddingTop: 32, gap: 8 },
  footerRow: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  footerText: { color: '#6B7183', fontSize: 13 },
})