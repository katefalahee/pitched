import { useEffect, useState } from 'react'
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity, RefreshControl } from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { getMatchStory } from './lib/api'

// Map each mood to a friendly label + colour for the pulse chips
const MOOD_STYLE: Record<string, string> = {
  electric: '#F59E0B', emotional: '#EC4899', tense: '#EF4444', proud: '#10B981',
  heartbreak: '#6366F1', joyful: '#F59E0B', dramatic: '#8B5CF6', disappointing: '#6B7183',
}

export default function MatchStory({ matchId, onBack, onLog }: {
  matchId: string
  onBack: () => void
  onLog: (match: any, existingLog: any | null) => void
}) {
  const [data, setData] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function load() {
    return getMatchStory(matchId).then(setData).catch((e) => setError(e.message))
  }
  useEffect(() => { load().finally(() => setLoading(false)) }, [matchId])
  async function onRefresh() { setRefreshing(true); await load(); setRefreshing(false) }

  if (loading) {
    return <View style={styles.center}><ActivityIndicator color="#10B981" /></View>
  }
  if (error || !data) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>{error ?? 'Something went wrong'}</Text>
        <TouchableOpacity onPress={onBack}><Text style={styles.backLink}>← Back</Text></TouchableOpacity>
      </View>
    )
  }

  const { match, pulse, logs, hasLogged } = data
  const kickoff = new Date(match.kickoff_at)

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={logs}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 120 }}
        alwaysBounceVertical
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#10B981" colors={['#10B981']} />}
        ListHeaderComponent={
          <View>
            {/* Back */}
            <TouchableOpacity onPress={onBack} style={styles.backRow}>
              <MaterialCommunityIcons name="chevron-left" size={22} color="#A8AEBE" />
              <Text style={styles.backText}>Back</Text>
            </TouchableOpacity>

            {/* ── LAYER 1: HERO / FACTS ───────────── */}
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

            {/* ── LAYER 2: COLLECTIVE PULSE ───────── */}
            {pulse.count > 0 ? (
              <View style={styles.pulse}>
                <View style={styles.pulseStats}>
                  <View style={styles.pulseStat}>
                    <Text style={styles.pulseNum}>{pulse.count}</Text>
                    <Text style={styles.pulseLabel}>{pulse.count === 1 ? 'memory' : 'memories'}</Text>
                  </View>
                  <View style={styles.pulseDivider} />
                  <View style={styles.pulseStat}>
                    <Text style={styles.pulseNum}>{pulse.avgRating?.toFixed(1) ?? '–'}</Text>
                    <Text style={styles.pulseLabel}>avg rating</Text>
                  </View>
                </View>

                {pulse.topMoods.length > 0 && (
                  <View style={styles.moodSection}>
                    <Text style={styles.moodHeading}>The mood in the ground</Text>
                    <View style={styles.moodChips}>
                      {pulse.topMoods.map((m: any) => (
                        <View key={m.mood} style={[styles.moodChip, { borderColor: (MOOD_STYLE[m.mood] ?? '#6B7183') + '66' }]}>
                          <View style={[styles.moodDot, { backgroundColor: MOOD_STYLE[m.mood] ?? '#6B7183' }]} />
                          <Text style={styles.moodChipText}>{m.mood}</Text>
                          <Text style={styles.moodCount}>{m.count}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}
              </View>
            ) : (
              <View style={styles.emptyPulse}>
                <MaterialCommunityIcons name="star-outline" size={28} color="#3F4354" />
                <Text style={styles.emptyPulseText}>No memories yet.{'\n'}Be the first to log this match.</Text>
              </View>
            )}

            {/* Memories section heading */}
            {logs.length > 0 && <Text style={styles.sectionTitle}>Memories</Text>}
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.logCard}>
            <View style={styles.logHeader}>
              <View style={styles.logAvatar}>
                <Text style={styles.logAvatarText}>{(item.user?.username ?? '?').charAt(0).toUpperCase()}</Text>
              </View>
              <Text style={styles.logUser}>@{item.user?.username}</Text>
              <Text style={styles.logRating}>{'★'.repeat(Math.floor(item.rating))}<Text style={styles.logRatingOff}>{'★'.repeat(5 - Math.floor(item.rating))}</Text></Text>
            </View>
            {item.review ? <Text style={styles.logReview}>{item.review}</Text> : null}
            {item.moods && item.moods.length > 0 && (
              <View style={styles.logMoods}>
                {item.moods.map((m: string) => (
                  <View key={m} style={styles.logMoodChip}>
                    <View style={[styles.moodDotSmall, { backgroundColor: MOOD_STYLE[m] ?? '#6B7183' }]} />
                    <Text style={styles.logMoodText}>{m}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}
      />

      {/* ── PINNED ACTION: Log / Edit ────────── */}
      <View style={styles.actionBar}>
        <TouchableOpacity style={styles.logButton} onPress={() => onLog(match, data.myLog)}>
          <MaterialCommunityIcons name={hasLogged ? 'pencil' : 'plus'} size={20} color="#000" />
          <Text style={styles.logButtonText}>{hasLogged ? 'Edit your memory' : 'Log this match'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  center: { flex: 1, backgroundColor: '#13151A', justifyContent: 'center', alignItems: 'center', gap: 16 },
  error: { color: '#EF4444', fontSize: 14 },
  backLink: { color: '#10B981', fontSize: 15 },
  backRow: { flexDirection: 'row', alignItems: 'center', paddingTop: 56, paddingBottom: 8 },
  backText: { color: '#A8AEBE', fontSize: 15 },

  hero: { paddingVertical: 20, borderBottomWidth: 1, borderBottomColor: '#1C1F27' },
  competition: { color: '#10B981', fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 16 },
  fixtureRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  team: { color: '#F4F5F7', fontSize: 26, fontWeight: '800', flex: 1 },
  score: { color: '#F4F5F7', fontSize: 26, fontWeight: '800' },
  vs: { color: '#6B7183', fontSize: 18 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: 10 },
  metaText: { color: '#6B7183', fontSize: 13 },

  pulse: { paddingVertical: 24, borderBottomWidth: 1, borderBottomColor: '#1C1F27' },
  pulseStats: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 28 },
  pulseStat: { alignItems: 'center' },
  pulseNum: { color: '#F4F5F7', fontSize: 32, fontWeight: '800' },
  pulseLabel: { color: '#6B7183', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, marginTop: 2 },
  pulseDivider: { width: 1, height: 40, backgroundColor: '#2E3240' },
  moodSection: { marginTop: 24, alignItems: 'center' },
  moodHeading: { color: '#A8AEBE', fontSize: 13, marginBottom: 12 },
  moodChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' },
  moodChip: { flexDirection: 'row', alignItems: 'center', gap: 7, borderWidth: 1, borderRadius: 50, paddingHorizontal: 12, paddingVertical: 7 },
  moodDot: { width: 8, height: 8, borderRadius: 4 },
  moodChipText: { color: '#F4F5F7', fontSize: 13, fontWeight: '500' },
  moodCount: { color: '#6B7183', fontSize: 12, fontWeight: '600' },

  emptyPulse: { alignItems: 'center', paddingVertical: 36, gap: 12, borderBottomWidth: 1, borderBottomColor: '#1C1F27' },
  emptyPulseText: { color: '#6B7183', fontSize: 14, textAlign: 'center', lineHeight: 21 },

  sectionTitle: { color: '#F4F5F7', fontSize: 16, fontWeight: '700', marginTop: 24, marginBottom: 4 },

  logCard: { backgroundColor: '#1C1F27', borderRadius: 14, padding: 16, marginTop: 12, borderWidth: 1, borderColor: '#2E3240' },
  logHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logAvatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#10B981', alignItems: 'center', justifyContent: 'center' },
  logAvatarText: { color: '#000', fontWeight: '700', fontSize: 14 },
  logUser: { color: '#F4F5F7', fontSize: 14, fontWeight: '600', flex: 1 },
  logRating: { color: '#F59E0B', fontSize: 14 },
  logRatingOff: { color: '#2E3240' },
  logReview: { color: '#A8AEBE', fontSize: 14, lineHeight: 21, marginTop: 12 },
  logMoods: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 12 },
  logMoodChip: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#13151A', borderRadius: 50, paddingHorizontal: 10, paddingVertical: 4 },
  moodDotSmall: { width: 6, height: 6, borderRadius: 3 },
  logMoodText: { color: '#A8AEBE', fontSize: 12 },

  actionBar: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: 16, paddingTop: 12, paddingBottom: 28, backgroundColor: '#13151A', borderTopWidth: 1, borderTopColor: '#1C1F27' },
  logButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#10B981', borderRadius: 13, paddingVertical: 16 },
  logButtonText: { color: '#000', fontSize: 16, fontWeight: '700' },
})