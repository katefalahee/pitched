import { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native'
import { createLog } from './lib/api'

const MOODS = ['electric', 'emotional', 'tense', 'proud', 'heartbreak', 'joyful', 'dramatic', 'disappointing']

export default function LogMatch({ match, userId, onDone, onCancel }: {
  match: any
  userId: string
  onDone: () => void
  onCancel: () => void
}) {
  const [rating, setRating] = useState(0)
  const [review, setReview] = useState('')
  const [moods, setMoods] = useState<string[]>([])

  function toggleMood(m: string) {
    setMoods((current) => {
      if (current.includes(m)) return current.filter((x) => x !== m)
      if (current.length >= 3) {
        Alert.alert('Up to 3 moods', 'You can pick a maximum of three moods.')
        return current
      }
      return [...current, m]
    })
  }
  const [saving, setSaving] = useState(false)

  async function save() {
    if (rating === 0) {
      Alert.alert('Add a rating', 'Tap a star to rate the match first.')
      return
    }
    setSaving(true)
    try {
      await createLog({
        match_id: match.id,
        rating,
        review: review || undefined,
        moods: moods.length > 0 ? moods : undefined,
      })
      onDone()
    } catch (e: any) {
      Alert.alert('Hold on', e.message)
      setSaving(false)
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 60 }}>
      <TouchableOpacity onPress={onCancel}>
        <Text style={styles.cancel}>← Cancel</Text>
      </TouchableOpacity>

      <Text style={styles.teams}>{match.home_team.name} v {match.away_team.name}</Text>
      <Text style={styles.meta}>{match.venue.name}</Text>

      <Text style={styles.label}>Your rating</Text>
      <View style={styles.starRow}>
        {[1, 2, 3, 4, 5].map((n) => (
          <TouchableOpacity key={n} onPress={() => setRating(n)}>
            <Text style={[styles.star, n > rating && styles.starOff]}>★</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Review (optional)</Text>
      <TextInput
        style={styles.input}
        value={review}
        onChangeText={setReview}
        placeholder="What will you remember?"
        placeholderTextColor="#3F4354"
        multiline
      />

      <Text style={styles.label}>Moods (optional, up to 3)</Text>
      <View style={styles.moodWrap}>
        {MOODS.map((m) => (
          <TouchableOpacity
            key={m}
            style={[styles.moodChip, moods.includes(m) && styles.moodChipOn]}
            onPress={() => toggleMood(m)}
          >
            <Text style={[styles.moodText, moods.includes(m) && styles.moodTextOn]}>{m}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.button} onPress={save} disabled={saving}>
        {saving ? <ActivityIndicator color="#000" /> : <Text style={styles.buttonText}>Save to Diary</Text>}
      </TouchableOpacity>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#13151A', paddingHorizontal: 20, paddingTop: 70 },
  cancel: { color: '#A8AEBE', fontSize: 15, marginBottom: 20 },
  teams: { fontSize: 24, fontWeight: '700', color: '#F4F5F7' },
  meta: { fontSize: 13, color: '#6B7183', marginBottom: 24 },
  label: { fontSize: 12, color: '#6B7183', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10, marginTop: 8 },
  starRow: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  star: { fontSize: 40, color: '#F59E0B' },
  starOff: { color: '#2E3240' },
  input: { backgroundColor: '#1C1F27', borderWidth: 1, borderColor: '#2E3240', borderRadius: 12, padding: 14, color: '#F4F5F7', fontSize: 15, minHeight: 90, marginBottom: 20, textAlignVertical: 'top' },
  moodWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 32 },
  moodChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 50, borderWidth: 1, borderColor: '#2E3240' },
  moodChipOn: { backgroundColor: 'rgba(245,158,11,0.12)', borderColor: 'rgba(245,158,11,0.4)' },
  moodText: { color: '#A8AEBE', fontSize: 13 },
  moodTextOn: { color: '#F59E0B' },
  button: { backgroundColor: '#10B981', borderRadius: 13, padding: 16, alignItems: 'center' },
  buttonText: { color: '#000', fontSize: 16, fontWeight: '600' },
})