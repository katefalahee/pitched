import { useEffect, useState } from 'react'
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity, Alert, Modal, RefreshControl } from 'react-native'
import { StatusBar } from 'expo-status-bar'
import { getMatches } from './lib/api'
import { supabase } from './lib/supabase'
import Login from './Login'
import Diary from './Diary'
import Feed from './Feed'
import FindPeople from './FindPeople'
import LogMatch from './LogMatch'
import Header from './Header'
import Profile from './Profile'
import UserProfile from './UserProfile'
import AddMatch from './AddMatch'
import CreateMatch from './CreateMatch'
import MatchStory from './MatchStory'
import MemoryDetail from './MemoryDetail'
import GroundDetail from './GroundDetail'
import { colors } from './lib/theme'
import type { Session } from '@supabase/supabase-js'
import { MaterialCommunityIcons } from '@expo/vector-icons'

type Screen = 'matches' | 'diary' | 'feed' | 'find' | 'profile' | 'user' | 'addmatch' | 'creatematch' | 'story' | 'memory' | 'ground'

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
  const [viewUserId, setViewUserId] = useState<string | null>(null)
  const [storyMatch, setStoryMatch] = useState<any | null>(null)
  const [editingLog, setEditingLog] = useState<any | null>(null)
  const [memoryEntry, setMemoryEntry] = useState<any | null>(null)
  const [logReturnTo, setLogReturnTo] = useState<Screen>('matches')
  const [groundId, setGroundId] = useState<string | null>(null)

  const openMenu = () => setMenuOpen(true)
  const go = (s: Screen) => { setMenuOpen(false); setScreen(s) }
  const [userBackTo, setUserBackTo] = useState<Screen>('find')
  const openUser = (id: string) => { setMenuOpen(false); setUserBackTo(screen); setViewUserId(id); setScreen('user') }
  const openStory = (match: any) => { setMenuOpen(false); setStoryMatch(match); setScreen('story') }
  const [profileTab, setProfileTab] = useState<'memories' | 'passport'>('memories')

  // The logging screen sits on top of everything when a match is selected
  if (selectedMatch) {
    return (
      <LogMatch
        match={selectedMatch}
        userId={session.user.id}
        existingLog={editingLog}
        onCancel={() => { setSelectedMatch(null); setEditingLog(null); setScreen(logReturnTo) }}
        onDone={() => {
          setSelectedMatch(null)
          setEditingLog(null)
          setScreen(logReturnTo)
          Alert.alert(editingLog ? 'Updated!' : 'Logged!', editingLog ? 'Your memory has been updated.' : 'Your match has been saved to your diary.')
        }}
      />
    )
  }

return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <View style={{ flex: 1 }}>
        {screen === 'matches' && <Matches session={session} onMenu={openMenu} onPick={openStory} />}
        {screen === 'diary' && (
        <Diary
          userId={session.user.id}
          onMenu={openMenu}
          onOpenEntry={(entry) => { setMemoryEntry(entry); setScreen('memory') }}
        />
      )}
        {screen === 'feed' && <Feed onMenu={openMenu} />}
        {screen === 'find' && <FindPeople onMenu={openMenu} onOpenUser={openUser} />}
        {screen === 'profile' && (
        <Profile
          onMenu={openMenu}
          onOpenDiary={() => setScreen('diary')}
          onOpenUser={openUser}
          onOpenGround={(venueId) => { setGroundId(venueId); setScreen('ground') }}
          activeTab={profileTab}
          onChangeTab={setProfileTab}
        />
      )}
        {screen === 'user' && viewUserId && (<UserProfile userId={viewUserId} onMenu={openMenu} onBack={() => setScreen(userBackTo)} />)}
        {screen === 'addmatch' && (
        <AddMatch
          onMenu={openMenu}
          onBack={() => setScreen('matches')}
          onPickMatch={(m) => openStory(m)}
          onCreateNew={() => setScreen('creatematch')}
        />
      )}
      {screen === 'creatematch' && (
        <CreateMatch
          onMenu={openMenu}
          onBack={() => setScreen('addmatch')}
          onCreated={(id) => { setScreen('matches'); Alert.alert('Match added!', 'It\'s now on Pitched. You can log your memory of it from search.') }}
          onExisting={(id) => setScreen('addmatch')}
        />
      )}
      {screen === 'story' && storyMatch && (
        <MatchStory
          matchId={storyMatch.id}
          onBack={() => setScreen('matches')}
          onLog={(match, existingLog) => { setSelectedMatch(match); setEditingLog(existingLog); setStoryMatch(null); setLogReturnTo('matches'); }}
        />
      )}
      {screen === 'memory' && memoryEntry && (
        <MemoryDetail
          entry={memoryEntry}
          onBack={() => setScreen('diary')}
          onEdit={() => { setSelectedMatch(memoryEntry.match); setEditingLog(memoryEntry); setLogReturnTo('memory'); }}
        />
      )}
      {screen === 'ground' && groundId && (
        <GroundDetail
          venueId={groundId}
          onBack={() => setScreen('profile')}
          onOpenMatch={(match) => openStory(match)}
        />
      )}
      </View>

      {/* Persistent bottom navigation */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.bottomItem} onPress={() => setScreen('matches')}>
         <MaterialCommunityIcons name="stadium-variant" size={26} color={screen === 'matches' ? colors.gold : colors.iconInactive} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.bottomItem} onPress={() => setScreen('diary')}>
          <MaterialCommunityIcons name="book-open-variant" size={26} color={screen === 'diary' ? colors.gold : colors.iconInactive} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.bottomItem} onPress={() => setScreen('addmatch')}>
          <View style={styles.addButton}>
            <MaterialCommunityIcons name="plus" size={26} color="#000" />
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.bottomItem} onPress={() => setScreen('feed')}>
          <MaterialCommunityIcons name="pulse" size={26} color={screen === 'feed' ? colors.gold : colors.iconInactive} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.bottomItem} onPress={() => setScreen('profile')}>
          <MaterialCommunityIcons name="account" size={26} color={screen === 'profile' ? colors.gold : colors.iconInactive} />
        </TouchableOpacity>
      </View>

      {/* Slide-over menu */}
      <Modal visible={menuOpen} transparent animationType="fade" onRequestClose={() => setMenuOpen(false)}>
        <TouchableOpacity style={styles.menuBackdrop} activeOpacity={1} onPress={() => setMenuOpen(false)}>
          <View style={styles.menuPanel}>
            <TouchableOpacity
              style={styles.menuUser}
              onPress={() => go('profile')}
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

            <TouchableOpacity style={[styles.menuItem, styles.menuItemRow]} onPress={() => go('find')}>
              <MaterialCommunityIcons name="magnify" size={20} color={colors.text} />
              <Text style={styles.menuItemText}>Find people</Text>
            </TouchableOpacity>

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
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [viewUserId, setViewUserId] = useState<string | null>(null)

    function load() {
    return getMatches().then(setMatches).catch((e) => setError(e.message))
  }

  useEffect(() => {
    load().finally(() => setLoading(false))
  }, [])

  async function onRefresh() {
    setRefreshing(true)
    await load()
    setRefreshing(false)
  }

  return (
    <>
      <Header big onMenu={onMenu} subtitle="All upcoming and recent matches — tap one to log it" />

      {loading && <ActivityIndicator color="#10B981" style={{ marginTop: 40 }} />}
      {error && <Text style={styles.error}>Error: {error}</Text>}

      <FlatList
        data={matches}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingTop: 16, paddingBottom: 40 }}
        alwaysBounceVertical={true}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#10B981" colors={['#10B981']} progressViewOffset={60}/>
        }
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
  center: { flex: 1, backgroundColor: colors.bg, justifyContent: 'center', alignItems: 'center' },
  container: { flex: 1, backgroundColor: colors.bg, paddingHorizontal: 16 },
  error: { color: colors.danger, marginTop: 20 },
  card: { backgroundColor: colors.surface, borderRadius: 14, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: colors.border },
  teams: { fontSize: 17, fontWeight: '600', color: colors.text, marginBottom: 4 },
  meta: { fontSize: 12, color: colors.textMuted, marginBottom: 8 },
  score: { fontSize: 15, color: colors.gold, fontWeight: '600' },
  upcoming: { fontSize: 13, color: colors.terracotta },
  tapHint: { color: colors.gold, fontSize: 12, marginTop: 8 },

  bottomBar: { flexDirection: 'row', backgroundColor: colors.surface, paddingVertical: 14, paddingBottom: 28, marginHorizontal: -16 },
  bottomItem: { flex: 1, alignItems: 'center' },
  addButton: { width: 46, height: 46, borderRadius: 23, backgroundColor: colors.gold, alignItems: 'center', justifyContent: 'center', marginTop: -4 },

  menuBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'flex-end' },
  menuPanel: { width: 260, backgroundColor: colors.surface, height: '100%', paddingTop: 70, paddingHorizontal: 20, borderLeftWidth: 1, borderLeftColor: colors.border },
  menuUser: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  menuAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.gold, alignItems: 'center', justifyContent: 'center' },
  menuAvatarText: { color: colors.onGold, fontWeight: '700', fontSize: 18 },
  menuUserLabel: { color: colors.textMuted, fontSize: 11, textTransform: 'uppercase', letterSpacing: 1 },
  menuUserEmail: { color: colors.text, fontSize: 14, fontWeight: '600', marginTop: 2 },
  menuDivider: { height: 1, backgroundColor: colors.border, marginVertical: 12 },
  menuItem: { paddingVertical: 14 },
  menuItemText: { color: colors.text, fontSize: 16 },
  menuItemRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  menuSignOut: { color: colors.danger, fontSize: 16 },
})