import { useEffect, useState } from 'react'
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native'
import Header from './Header'
import { getMyProfile, getFollowers, getFollowingList } from './lib/api'

export default function Profile({ onMenu, onOpenDiary, onOpenUser }: { onMenu: () => void; onOpenDiary: () => void; onOpenUser: (id: string) => void }) {
  const [data, setData] = useState<any | null>(null)
  const [following, setFollowing] = useState<any[]>([])
  const [followers, setFollowers] = useState<any[]>([])
  const [tab, setTab] = useState<'following' | 'followers'>('following')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([getMyProfile(), getFollowingList(), getFollowers()])
      .then(([p, fl, fr]) => {
        setData(p)
        setFollowing(fl)
        setFollowers(fr)
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  const list = tab === 'following' ? following : followers

  return (
    <View style={{ flex: 1 }}>
      <Header onMenu={onMenu} subtitle="Your profile and connections" />

      {loading && <ActivityIndicator color="#10B981" style={{ marginTop: 40 }} />}
      {error && <Text style={styles.error}>Error: {error}</Text>}

      {data && (
        <>
          <View style={styles.profileCard}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {(data.profile.username ?? '?').charAt(0).toUpperCase()}
              </Text>
            </View>
            <Text style={styles.username}>@{data.profile.username}</Text>
            {data.profile.display_name ? (
              <Text style={styles.displayName}>{data.profile.display_name}</Text>
            ) : null}
            {data.profile.bio ? <Text style={styles.bio}>{data.profile.bio}</Text> : null}

            <View style={styles.statsRow}>
              <Text style={styles.stat} onPress={onOpenDiary}>
                <Text style={styles.statNum}>{data.stats.logs}</Text>
                {'\n'}
                <Text style={styles.statLabel}>MATCHES</Text>
              </Text>
              <Text
                style={[styles.stat, tab === 'following' && styles.statOn]}
                onPress={() => setTab('following')}
              >
                <Text style={styles.statNum}>{data.stats.following}</Text>
                {'\n'}
                <Text style={styles.statLabel}>FOLLOWING</Text>
              </Text>
              <Text
                style={[styles.stat, tab === 'followers' && styles.statOn]}
                onPress={() => setTab('followers')}
              >
                <Text style={styles.statNum}>{data.stats.followers}</Text>
                {'\n'}
                <Text style={styles.statLabel}>FOLLOWERS</Text>
              </Text>
            </View>
          </View>

          <FlatList
            data={list}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingBottom: 40 }}
            ListEmptyComponent={
              <Text style={styles.empty}>
                {tab === 'following' ? 'You aren\'t following anyone yet.' : 'No followers yet.'}
              </Text>
            }
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.personRow} onPress={() => onOpenUser(item.id)}>
                <View style={styles.smallAvatar}>
                  <Text style={styles.smallAvatarText}>{item.username.charAt(0).toUpperCase()}</Text>
                </View>
                <View>
                  <Text style={styles.personName}>@{item.username}</Text>
                  {item.display_name ? <Text style={styles.personSub}>{item.display_name}</Text> : null}
                </View>
              </TouchableOpacity>
            )}
          />
        </>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  error: { color: '#EF4444', marginTop: 20 },
  profileCard: { backgroundColor: '#1C1F27', borderRadius: 16, padding: 20, marginTop: 16, marginBottom: 16, borderWidth: 1, borderColor: '#2E3240', alignItems: 'center' },
  avatar: { width: 72, height: 72, borderRadius: 36, backgroundColor: '#10B981', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  avatarText: { color: '#000', fontWeight: '800', fontSize: 30 },
  username: { color: '#F4F5F7', fontSize: 20, fontWeight: '700' },
  displayName: { color: '#A8AEBE', fontSize: 14, marginTop: 2 },
  bio: { color: '#A8AEBE', fontSize: 13, marginTop: 8, textAlign: 'center' },
  statsRow: { flexDirection: 'row', marginTop: 20, gap: 28 },
  stat: { textAlign: 'center', paddingBottom: 6 },
  statOn: { borderBottomWidth: 2, borderBottomColor: '#10B981' },
  statNum: { color: '#10B981', fontSize: 22, fontWeight: '800' },
  statLabel: { color: '#6B7183', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, marginTop: 2 },
  tabs: { flexDirection: 'row', gap: 24, marginBottom: 12, paddingHorizontal: 4 },
  tab: { color: '#6B7183', fontSize: 15, fontWeight: '600', paddingBottom: 6 },
  tabOn: { color: '#F4F5F7', borderBottomWidth: 2, borderBottomColor: '#10B981' },
  empty: { color: '#6B7183', fontSize: 14, marginTop: 20 },
  personRow: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#1C1F27', borderRadius: 12, padding: 12, marginBottom: 10, borderWidth: 1, borderColor: '#2E3240' },
  smallAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#10B981', alignItems: 'center', justifyContent: 'center' },
  smallAvatarText: { color: '#000', fontWeight: '700', fontSize: 16 },
  personName: { color: '#F4F5F7', fontSize: 15, fontWeight: '600' },
  personSub: { color: '#6B7183', fontSize: 12, marginTop: 2 },
})