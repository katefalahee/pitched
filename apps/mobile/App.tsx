import { useEffect, useState } from 'react'
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native'
import { StatusBar } from 'expo-status-bar'
import { getMatches } from './lib/api'
import { supabase } from './lib/supabase'
import Login from './Login'
import type { Session } from '@supabase/supabase-js'

export default function App() {
  const [session, setSession] = useState<Session | null>(null)
  const [authReady, setAuthReady] = useState(false)

  useEffect(() => {
    // Check for an existing session on launch
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setAuthReady(true)
    })

    // Listen for login / logout changes
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  if (!authReady) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#10B981" />
      </View>
    )
  }

  if (!session) {
    return <Login />
  }

  return <MatchList session={session} />
}

function MatchList({ session }: { session: Session }) {
  const [matches, setMatches] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getMatches()
      .then(setMatches)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <View>
          <Text style={styles.heading}>Pitched</Text>
          <Text style={styles.subheading}>{session.user.email}</Text>
        </View>
        <TouchableOpacity onPress={() => supabase.auth.signOut()}>
          <Text style={styles.signout}>Sign out</Text>
        </TouchableOpacity>
      </View>

      {loading && <ActivityIndicator color="#10B981" style={{ marginTop: 40 }} />}
      {error && <Text style={styles.error}>Error: {error}</Text>}

      <FlatList
        data={matches}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingTop: 16 }}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.teams}>
              {item.home_team.name} v {item.away_team.name}
            </Text>
            <Text style={styles.meta}>
              {item.venue.name} · {item.competition.name}
            </Text>
            {item.home_score ? (
              <Text style={styles.score}>{item.home_score} — {item.away_score}</Text>
            ) : (
              <Text style={styles.upcoming}>Upcoming</Text>
            )}
          </View>
        )}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  center: { flex: 1, backgroundColor: '#13151A', justifyContent: 'center', alignItems: 'center' },
  container: { flex: 1, backgroundColor: '#13151A', paddingHorizontal: 16, paddingTop: 70 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  heading: { fontSize: 32, fontWeight: '700', color: '#F4F5F7' },
  subheading: { fontSize: 13, color: '#A8AEBE', marginTop: 4 },
  signout: { color: '#EF4444', fontSize: 14, marginTop: 8 },
  error: { color: '#EF4444', marginTop: 20 },
  card: { backgroundColor: '#1C1F27', borderRadius: 14, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#2E3240' },
  teams: { fontSize: 17, fontWeight: '600', color: '#F4F5F7', marginBottom: 4 },
  meta: { fontSize: 12, color: '#6B7183', marginBottom: 8 },
  score: { fontSize: 15, color: '#10B981', fontWeight: '600' },
  upcoming: { fontSize: 13, color: '#F59E0B' },
})