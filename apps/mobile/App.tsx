import { useEffect, useState } from 'react'
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity, Alert, Modal } from 'react-native'
import { StatusBar } from 'expo-status-bar'
import { getMatches } from './lib/api'
import { supabase } from './lib/supabase'
import Login from './Login'
import Diary from './Diary'
import Feed from './Feed'
import FindPeople from './FindPeople'
import LogMatch from './LogMatch'
import Header from './Header'
import type { Session } from '@supabase/supabase-js'

type Screen = 'matches' | 'diary' | 'feed' | 'find'

export default function App() {
  const [session, setSession] = useState<Session | null>(null)
  const [authReady, setAuthReady] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setAuthReady(true)
    })
    const { data: listener } = supabase.auth.onAuthStateChange((_e, s) => setSession(s))
    return () => listener.subscription.unsubscribe()
  }, [])

  if (!authReady) {
    return <View style={styles.center}><ActivityIndicator color="#10B981" /></View>
  }
  if (!session) return <Login />

  return <Main session={session} />
}

function Main({ session }: { session: Session }) {
  const [screen, setScreen] = useState<Screen>('matches')
  const [menuOpen, setMenuOpen] = useState(false)
  const [selectedMatch, setSelectedMatch] = useState<any | null>(null)

  const openMenu = () => setMenuOpen(true)
  const go = (s: Screen) => { setMenuOpen(false); setScreen(s) }

  // The logging screen sits on top of everything when a match is selected
  if (selectedMatch) {
    return (
      <LogMatch
        match={selectedMatch}
        userId={session.user.id}
        onCancel={() => setSelectedMatch(null)}
        onDone={() => {
          setSelectedMatch(null)
          Alert.alert('Logged!', 'Your match has been saved to your diary.')
        }}
      />
    )
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {screen === 'matches' && <Matches session={session} onMenu={openMenu} onPick={setSelectedMatch} />}
      {screen === 'diary' && <Diary userId={session.user.id} onMenu={openMenu} />}
      {screen === 'feed' && <Feed onMenu={openMenu} />}
      {screen === 'find' && <FindPeople onMenu={openMenu} />}

      {/* Slide-over menu, available on every screen */}
      <Modal visible={menuOpen} transparent animationType="fade" onRequestClose={() => setMenuOpen(false)}>
        <TouchableOpacity style={styles.menuBackdrop} activeOpacity={1} onPress={() => setMenuOpen(false)}>
          <View style={styles.menuPanel}>
            <TouchableOpacity
              style={styles.menuUser}
              onPress={() => { setMenuOpen(false); Alert.alert('Profile', 'Profile screen coming soon.') }}
            >
              <View style={styles.menuAvatar}>
                <Text style={styles.menuAvatarText}>{(session.user.email ?? '?').charAt(0).toUpperCase()}</Text>
              </View>
              <View>
                <Text style={styles.menuUserLabel}>View profile</Text>
                <Text style={styles.menuUserEmail}>{session.user.email}</Text>
              </View>
            </TouchableOpacity>

            <View style={styles.menuDivider} />

            <TouchableOpacity style={styles.menuItem} onPress={() => go('matches')}><Text style={styles.menuItemText}>Matches</Text></TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={() => go('diary')}><Text style={styles.menuItemText}>My Diary</Text></TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={() => go('feed')}><Text style={styles.menuItemText}>Feed</Text></TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={() => go('find')}><Text style={styles.menuItemText}>Find People</Text></TouchableOpacity>

            <View style={styles.menuDivider} />

            <TouchableOpacity style={styles.menuItem} onPress={() => { setMenuOpen(false); supabase.auth.signOut() }}>
              <Text style={styles.menuSignOut}>Sign out</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  )
}

function Matches({ session, onMenu, onPick }: { session: Session; onMenu: () => void; onPick: (m: any) => void }) {
  const [matches, setMatches] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getMatches().then(setMatches).catch((e) => setError(e.message)).finally(() => setLoading(false))
  }, [])

  return (
    <>
      <Header big onMenu={onMenu} subtitle="All upcoming and recent matches — tap one to log it" />

      {loading && <ActivityIndicator color="#10B981" style={{ marginTop: 40 }} />}
      {error && <Text style={styles.error}>Error: {error}</Text>}

      <FlatList
        data={matches}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingTop: 16, paddingBottom: 40 }}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => onPick(item)}>
            <Text style={styles.teams}>{item.home_team.name} v {item.away_team.name}</Text>
            <Text style={styles.meta}>{item.venue.name} · {item.competition.name}</Text>
            {item.home_score ? (
              <Text style={styles.score}>{item.home_score} — {item.away_score}</Text>
            ) : (
              <Text style={styles.upcoming}>Upcoming</Text>
            )}
            <Text style={styles.tapHint}>Tap to log →</Text>
          </TouchableOpacity>
        )}
      />
    </>
  )
}

const styles = StyleSheet.create({
  center: { flex: 1, backgroundColor: '#13151A', justifyContent: 'center', alignItems: 'center' },
  container: { flex: 1, backgroundColor: '#13151A', paddingHorizontal: 16 },
  error: { color: '#EF4444', marginTop: 20 },
  card: { backgroundColor: '#1C1F27', borderRadius: 14, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#2E3240' },
  teams: { fontSize: 17, fontWeight: '600', color: '#F4F5F7', marginBottom: 4 },
  meta: { fontSize: 12, color: '#6B7183', marginBottom: 8 },
  score: { fontSize: 15, color: '#10B981', fontWeight: '600' },
  upcoming: { fontSize: 13, color: '#F59E0B' },
  tapHint: { color: '#10B981', fontSize: 12, marginTop: 8 },
  menuBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'flex-end' },
  menuPanel: { width: 260, backgroundColor: '#1C1F27', height: '100%', paddingTop: 70, paddingHorizontal: 20, borderLeftWidth: 1, borderLeftColor: '#2E3240' },
  menuUser: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  menuAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#10B981', alignItems: 'center', justifyContent: 'center' },
  menuAvatarText: { color: '#000', fontWeight: '700', fontSize: 18 },
  menuUserLabel: { color: '#6B7183', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1 },
  menuUserEmail: { color: '#F4F5F7', fontSize: 14, fontWeight: '600', marginTop: 2 },
  menuDivider: { height: 1, backgroundColor: '#2E3240', marginVertical: 12 },
  menuItem: { paddingVertical: 14 },
  menuItemText: { color: '#F4F5F7', fontSize: 16 },
  menuSignOut: { color: '#EF4444', fontSize: 16 },
})