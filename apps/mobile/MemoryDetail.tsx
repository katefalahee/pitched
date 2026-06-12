import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { colors, fonts, radius } from './lib/theme'
import MatchPulse from './components/MatchPulse'

const FEELING_STYLE: Record<string, string> = {
  electric: '#CBA75C',      // gold
  tense: '#B5654A',         // terracotta
  joyful: '#E0A646',        // warm amber
  heartbreaking: '#8C5A6E', // muted plum
  loud: '#C77B3C',          // burnt orange
  historic: '#A88A4A',      // antique brass
  quiet: '#7C8579',         // sage grey
  relieved: '#6F8C7A',      // soft green
  frustrating: '#A6553F',   // rust
  euphoric: '#D08C4A',      // bright ochre
  proud: '#6F7B52',         // moss
  emotional: '#9B6A82',     // dusky rose
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
          <MaterialCommunityIcons name="chevron-left" size={22} color={colors.textSoft} />
          <Text style={styles.backText}>Diary</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onEdit} style={styles.editRow}>
          <MaterialCommunityIcons name="pencil-outline" size={16} color={colors.textMuted} />
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
            <MaterialCommunityIcons name="map-marker-outline" size={15} color={colors.textMuted} />
            <Text style={styles.metaText}>{match.venue?.name ?? 'Unknown venue'}</Text>
          </View>
          <View style={styles.metaRow}>
            <MaterialCommunityIcons name="calendar-blank-outline" size={15} color={colors.textMuted} />
            <Text style={styles.metaText}>
              {kickoff.toLocaleDateString('en-IE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </Text>
          </View>
        </View>

        {/* Your rating */}
        <View style={styles.block}>
          <Text style={styles.blockLabel}>Your rating</Text>
          <View style={{ alignItems: 'flex-start' }}>
            <MatchPulse value={rating} size={32} />
          </View>
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
                  <View style={[styles.moodDot, { backgroundColor: FEELING_STYLE[m] ?? '#6B7183' }]} />
                  <Text style={styles.moodText}>{m}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Footer meta: logged date + visibility */}
        <View style={styles.footer}>
          <View style={styles.footerRow}>
            <MaterialCommunityIcons name="bookmark-outline" size={14} color={colors.textMuted} />
            <Text style={styles.footerText}>
              Logged {logged.toLocaleDateString('en-IE', { day: 'numeric', month: 'short', year: 'numeric' })}
            </Text>
          </View>
          <View style={styles.footerRow}>
            <MaterialCommunityIcons name={vis.icon as any} size={14} color={colors.textMuted} />
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
  backText: { color: colors.textSoft, fontSize: 15 },
  editRow: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingVertical: 4, paddingHorizontal: 6 },
  editText: { color: colors.textMuted, fontSize: 14, fontFamily: fonts.sansMedium },

  hero: { paddingHorizontal: 16, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: colors.surface },
  competition: { color: colors.gold, fontSize: 12, fontFamily: fonts.sansSemibold, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 16 },
  fixtureRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  team: { color: colors.text, fontSize: 26, fontFamily: fonts.serif, flex: 1 },
  score: { color: colors.text, fontSize: 26, fontFamily: fonts.serif },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: 10 },
  metaText: { color: colors.textMuted, fontSize: 13 },

  block: { paddingHorizontal: 16, paddingTop: 24 },
  blockLabel: { color: colors.textMuted, fontSize: 12, fontFamily: fonts.sansMedium, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 },
  review: { color: colors.text, fontSize: 17, fontFamily: fonts.serif, lineHeight: 27 },
  moodRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  moodChip: { flexDirection: 'row', alignItems: 'center', gap: 7, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.pill, paddingHorizontal: 12, paddingVertical: 7 },
  moodDot: { width: 8, height: 8, borderRadius: 4 },
  moodText: { color: colors.text, fontSize: 13, textTransform: 'capitalize' },

  footer: { paddingHorizontal: 16, paddingTop: 32, gap: 8 },
  footerRow: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  footerText: { color: colors.textMuted, fontSize: 13 },
})