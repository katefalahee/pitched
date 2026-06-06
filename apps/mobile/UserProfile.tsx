import { useEffect, useState } from 'react'
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity, RefreshControl } from 'react-native'
import Header from './Header'
import { getUserProfile, followUser, unfollowUser } from './lib/api'

export default function UserProfile({ userId, onMenu, onBack }: {
  userId: string
  onMenu: () => void
  onBack: () => void
}) {
  const [data, setData] = useState<any | null>(null)
  const [following, setFollowing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function load() {
    return getUserProfile(userId)
      .then((d) => {
        setData(d)
        setFollowing(d.isFollowing)
      })
      .catch((e) => setError(e.message))
  }

  useEffect(() => {
    load().finally(() => setLoading(false))
  }, [userId])

  async function onRefresh() {
    setRefreshing(true)
    await load()
    setRefreshing(false)
  }

  async function toggleFollow() {
    const was = following
    setFollowing(!was)
    try {
      if (was) await unfollowUser(userId)
      else await followUser(userId)
      await load() // refresh logs + counts to reflect the new relationship
    } catch {
      setFollowing(was)
    }
  }

  return (
    <View style={{ flex: 1 }}>
      <Header onMenu={onMenu} subtitle="Viewing a profile" />

      <TouchableOpacity onPress={onBack}>
        <Text style={styles.back}>← Back</Text>
      </TouchableOpacity>

      {loading && <ActivityIndicator color="#10B981" style={{ marginTop: 40 }} />}
      {error && <Text style={styles.error}>Error: {error}</Text>}

      {data && (
        <>
          <View style={styles.card}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{data.profile.username.charAt(0).toUpperCase()}</Text>
            </View>
            <Text style={styles.username}>@{data.profile.username}</Text>
            {data.profile.display_name ? <Text style={styles.displayName}>{data.profile.display_name}</Text> : null}
            {data.profile.bio ? <Text style={styles.bio}>{data.profile.bio}</Text> : null}

            <View style={styles.statsRow}>
              <View style={styles.stat}><Text style={styles.statNum}>{data.stats.logs}</Text><Text style={styles.statLabel}>MATCHES</Text></View>
              <View style={styles.stat}><Text style={styles.statNum}>{data.stats.following}</Text><Text style={styles.statLabel}>FOLLOWING</Text></View>
              <View style={styles.stat}><Text style={styles.statNum}>{data.stats.followers}</Text><Text style={styles.statLabel}>FOLLOWERS</Text></View>
            </View>

            {!data.isMe && (
              <TouchableOpacity style={[styles.followBtn, following && styles.followingBtn]} onPress={toggleFollow}>
                <Text style={[styles.followText, following && styles.followingText]}>
                  {following ? 'Following' : 'Follow'}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          <Text style={styles.sectionTitle}>{following || data.isMe ? 'Reviews' : 'Public reviews'}</Text>
          <FlatList
            data={data.logs}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingBottom: 40 }}
            alwaysBounceVertical={true}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor="#10B981"
                colors={['#10B981']}
                progressViewOffset={60}
              />
            }
            ListEmptyComponent={<Text style={styles.empty}>No public reviews yet.</Text>}
            renderItem={({ item }) => (
              <View style={styles.logCard}>
                <Text style={styles.teams}>{item.match.home_team.name} v {item.match.away_team.name}</Text>
                <Text style={styles.meta}>{item.match.venue.name}</Text>
                <Text style={styles.stars}>
                  {'★'.repeat(Math.floor(item.rating))}
                  <Text style={styles.starsOff}>{'★'.repeat(5 - Math.floor(item.rating))}</Text>
                </Text>
                {item.review ? <Text style={styles.review}>"{item.review}"</Text> : null}
              </View>
            )}
          />
        </>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  back: { color: '#A8AEBE', fontSize: 15, marginBottom: 12 },
  error: { color: '#EF4444', marginTop: 20 },
  card: { backgroundColor: '#1C1F27', borderRadius: 16, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: '#2E3240', alignItems: 'center' },
  avatar: { width: 72, height: 72, borderRadius: 36, backgroundColor: '#10B981', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  avatarText: { color: '#000', fontWeight: '800', fontSize: 30 },
  username: { color: '#F4F5F7', fontSize: 20, fontWeight: '700' },
  displayName: { color: '#A8AEBE', fontSize: 14, marginTop: 2 },
  bio: { color: '#A8AEBE', fontSize: 13, marginTop: 8, textAlign: 'center' },
  statsRow: { flexDirection: 'row', marginTop: 20, gap: 28 },
  stat: { alignItems: 'center' },
  statNum: { color: '#10B981', fontSize: 22, fontWeight: '800' },
  statLabel: { color: '#6B7183', fontSize: 11, letterSpacing: 1, marginTop: 2 },
  followBtn: { backgroundColor: '#10B981', paddingHorizontal: 32, paddingVertical: 10, borderRadius: 50, marginTop: 18 },
  followingBtn: { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#2E3240' },
  followText: { color: '#000', fontWeight: '700', fontSize: 14 },
  followingText: { color: '#A8AEBE' },
  sectionTitle: { color: '#F4F5F7', fontSize: 16, fontWeight: '700', marginBottom: 12 },
  empty: { color: '#6B7183', fontSize: 14, marginTop: 10 },
  logCard: { backgroundColor: '#1C1F27', borderRadius: 12, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: '#2E3240' },
  teams: { fontSize: 16, fontWeight: '600', color: '#F4F5F7', marginBottom: 4 },
  meta: { fontSize: 12, color: '#6B7183', marginBottom: 6 },
  stars: { fontSize: 15, color: '#F59E0B', marginBottom: 6 },
  starsOff: { color: '#2E3240' },
  review: { fontSize: 13, color: '#A8AEBE', fontStyle: 'italic', lineHeight: 19 },
})