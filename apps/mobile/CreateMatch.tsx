import { useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput, Platform, ActivityIndicator, Alert, Modal } from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import DateTimePicker from '@react-native-community/datetimepicker'
import Header from './Header'
import Picker from './Picker'
import { getTeams, getCompetitions, getVenues, createMatch } from './lib/api'

const SPORTS = [
  { id: 'lgfa', label: 'Ladies Football (LGFA)' },
  { id: 'camogie', label: 'Camogie' },
  { id: 'gaa_football', label: 'GAA Football' },
  { id: 'hurling', label: 'Hurling' },
  { id: 'womens_soccer', label: "Women's Soccer" },
  { id: 'mens_soccer', label: "Men's Soccer" },
  { id: 'womens_rugby', label: "Women's Rugby" },
  { id: 'mens_rugby', label: "Men's Rugby" },
  { id: 'aflw', label: 'AFLW' },
  { id: 'afl', label: 'AFL' },
]

export default function CreateMatch({ onMenu, onBack, onCreated, onExisting }: {
  onMenu: () => void
  onBack: () => void
  onCreated: (matchId: string) => void
  onExisting: (matchId: string) => void
}) {
  const [sport, setSport] = useState<any>(null)
  const [homeTeam, setHomeTeam] = useState<any>(null)
  const [awayTeam, setAwayTeam] = useState<any>(null)
  const [competition, setCompetition] = useState<any>(null)
  const [venue, setVenue] = useState<any>(null)
  const [kickoff, setKickoff] = useState<Date>(new Date())
  const [showDate, setShowDate] = useState(false)
  const [showTime, setShowTime] = useState(false)
  const [homeScore, setHomeScore] = useState('')
  const [awayScore, setAwayScore] = useState('')
  const [saving, setSaving] = useState(false)

  // Changing sport resets the sport-dependent picks
  function pickSport(s: any) {
    setSport(s)
    setHomeTeam(null)
    setAwayTeam(null)
    setCompetition(null)
  }

  const canSubmit = sport && homeTeam && awayTeam && competition && venue && homeTeam.id !== awayTeam.id

  async function submit() {
    if (homeTeam?.id === awayTeam?.id) {
      Alert.alert('Pick two different teams', 'Home and away must be different.')
      return
    }
    setSaving(true)
    try {
      const result = await createMatch({
        home_team_id: homeTeam.id,
        away_team_id: awayTeam.id,
        competition_id: competition.id,
        venue_id: venue.id,
        kickoff_at: kickoff.toISOString(),
        sport: sport.id,
        home_score: homeScore || undefined,
        away_score: awayScore || undefined,
        status: homeScore && awayScore ? 'completed' : 'upcoming',
      })
      onCreated(result.id)
    } catch (e: any) {
      setSaving(false)
      if (e.status === 409 && e.existingId) {
        Alert.alert(
          'This match already exists',
          'Someone has already added it. Want to log your memory of it instead?',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Log it', onPress: () => onExisting(e.existingId) },
          ]
        )
      } else {
        Alert.alert('Could not add match', e.message)
      }
    }
  }

  return (
    <View style={{ flex: 1 }}>
      <Header onMenu={onMenu} subtitle="Add a match to Pitched" />

      <TouchableOpacity onPress={onBack} style={styles.backRow}>
        <MaterialCommunityIcons name="chevron-left" size={20} color="#A8AEBE" />
        <Text style={styles.back}>Back</Text>
      </TouchableOpacity>

      <ScrollView contentContainerStyle={{ paddingBottom: 60 }} keyboardShouldPersistTaps="handled">
        <Picker
          label="Sport"
          placeholder="Choose a sport"
          value={sport}
          loadItems={async () => SPORTS}
          onSelect={pickSport}
        />

        <Picker
          label="Home Team"
          placeholder={sport ? 'Choose home team' : 'Choose a sport first'}
          value={homeTeam}
          disabled={!sport}
          loadItems={async () => (await getTeams(sport.id)).map((t: any) => ({ id: t.id, label: t.name, sublabel: t.county }))}
          onSelect={setHomeTeam}
        />

        <Picker
          label="Away Team"
          placeholder={sport ? 'Choose away team' : 'Choose a sport first'}
          value={awayTeam}
          disabled={!sport}
          loadItems={async () => (await getTeams(sport.id)).map((t: any) => ({ id: t.id, label: t.name, sublabel: t.county }))}
          onSelect={setAwayTeam}
        />

        <Picker
          label="Competition"
          placeholder={sport ? 'Choose competition' : 'Choose a sport first'}
          value={competition}
          disabled={!sport}
          loadItems={async () => (await getCompetitions(sport.id)).map((c: any) => ({ id: c.id, label: c.name }))}
          onSelect={setCompetition}
        />

        <Picker
          label="Venue"
          placeholder="Choose venue"
          value={venue}
          loadItems={async () => (await getVenues()).map((v: any) => ({ id: v.id, label: v.name, sublabel: v.county }))}
          onSelect={setVenue}
        />

        {/* Date & time */}
        <Text style={styles.label}>Date & Kick-off</Text>
        <View style={styles.dateRow}>
          <TouchableOpacity style={styles.dateField} onPress={() => { setShowTime(false); setShowDate(true) }}>
            <MaterialCommunityIcons name="calendar" size={18} color="#6B7183" />
            <Text style={styles.dateText}>
              {kickoff.toLocaleDateString('en-IE', { day: 'numeric', month: 'short', year: 'numeric' })}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.dateField} onPress={() => { setShowDate(false); setShowTime(true) }}>
            <MaterialCommunityIcons name="clock-outline" size={18} color="#6B7183" />
            <Text style={styles.dateText}>
              {kickoff.toLocaleTimeString('en-IE', { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </TouchableOpacity>
        </View>

        <Modal visible={showDate || showTime} transparent animationType="slide" onRequestClose={() => { setShowDate(false); setShowTime(false) }}>
          <View style={styles.pickerBackdrop}>
            <View style={styles.pickerSheet}>
              <View style={styles.pickerHeader}>
                <Text style={styles.pickerTitle}>{showDate ? 'Select date' : 'Select kick-off time'}</Text>
                <TouchableOpacity onPress={() => { setShowDate(false); setShowTime(false) }}>
                  <Text style={styles.pickerDone}>Done</Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={kickoff}
                mode={showDate ? 'date' : 'time'}
                display="spinner"
                themeVariant="dark"
                textColor="#F4F5F7"
                onChange={(_e, d) => { if (d) setKickoff(d) }}
                style={{ height: 200 }}
              />
            </View>
          </View>
        </Modal>

        {/* Optional score */}
        <Text style={styles.label}>Score (optional)</Text>
        <View style={styles.scoreRow}>
          <TextInput
            style={styles.scoreInput}
            value={homeScore}
            onChangeText={setHomeScore}
            placeholder="Home"
            placeholderTextColor="#3F4354"
          />
          <Text style={styles.scoreDash}>–</Text>
          <TextInput
            style={styles.scoreInput}
            value={awayScore}
            onChangeText={setAwayScore}
            placeholder="Away"
            placeholderTextColor="#3F4354"
          />
        </View>
        <Text style={styles.hint}>Leave blank for upcoming matches. GAA scores like "2-14" are fine.</Text>

        <TouchableOpacity
          style={[styles.submit, !canSubmit && styles.submitDisabled]}
          onPress={submit}
          disabled={!canSubmit || saving}
        >
          {saving ? <ActivityIndicator color="#000" /> : <Text style={styles.submitText}>Add Match</Text>}
        </TouchableOpacity>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  backRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  back: { color: '#A8AEBE', fontSize: 15 },
  label: { fontSize: 12, color: '#6B7183', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8, marginTop: 16 },
  dateRow: { flexDirection: 'row', gap: 10 },
  dateField: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#1C1F27', borderWidth: 1, borderColor: '#2E3240', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 14 },
  dateText: { color: '#F4F5F7', fontSize: 15 },
  scoreRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  scoreInput: { flex: 1, backgroundColor: '#1C1F27', borderWidth: 1, borderColor: '#2E3240', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 14, color: '#F4F5F7', fontSize: 15, textAlign: 'center' },
  scoreDash: { color: '#6B7183', fontSize: 18 },
  hint: { color: '#6B7183', fontSize: 12, marginTop: 8, lineHeight: 18 },
  submit: { backgroundColor: '#10B981', borderRadius: 13, padding: 16, alignItems: 'center', marginTop: 28 },
  submitDisabled: { opacity: 0.4 },
  submitText: { color: '#000', fontSize: 16, fontWeight: '600' },
  pickerBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  pickerSheet: { backgroundColor: '#1C1F27', borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingHorizontal: 20, paddingTop: 16, paddingBottom: 30, borderTopWidth: 1, borderColor: '#2E3240' },
  pickerHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  pickerTitle: { fontSize: 16, fontWeight: '700', color: '#F4F5F7' },
  pickerDone: { fontSize: 16, fontWeight: '600', color: '#10B981' },
})