import { useEffect, useState } from 'react'
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native'
import { searchUsers, followUser, unfollowUser, getFollowing } from './lib/api'

export default function FindPeople({ onBack }: { onBack: () => void }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<any[]>([])
  const [following, setFollowing] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  // Load who I already follow, so buttons show the right state
  useEffect(() => {
    getFollowing().then(setFollowing).catch(() => {})
  }, [])

  // Search as you type (with a small debounce)
  useEffect(() => {
    if (query.length < 2) {
      setResults([])
      return
    }
    setLoading(true)
    const timer = setTimeout(() => {
      searchUsers(query)
        .then(setResults)
        .catch(() => setResults([]))
        .finally(() => setLoading(false))
    }, 350)
    return () => clearTimeout(timer)
  }, [query])

  async function toggleFollow(userId: string) {
    const isFollowing = following.includes(userId)
    // Optimistic update
    setFollowing((cur) => (isFollowing ? cur.filter((x) => x !== userId) : [...cur, userId]))
    try {
      if (isFollowing) await unfollowUser(userId)
      else await followUser(userId)
    } catch {
      // Revert on failure
      setFollowing((cur) => (isFollowing ? [...cur, userId] : cur.filter((x) => x !== userId)))
    }
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={onBack}>
        <Text style={styles.back}>← Back</Text>
      </TouchableOpacity>
      <Text style={styles.heading}>Find People</Text>

      <TextInput
        style={styles.input}
        value={query}
        onChangeText={setQuery}
        placeholder="Search by username…"
        placeholderTextColor="#3F4354"
        autoCapitalize="none"
        autoCorrect={false}
      />

      {loading && <ActivityIndicator color="#10B981" style={{ marginTop: 20 }} />}
      {!loading && query.length >= 2 && results.length === 0 && (
        <Text style={styles.empty}>No users found.</Text>
      )}

      <FlatList
        data={results}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingTop: 16 }}
        renderItem={({ item }) => {
          const isFollowing = following.includes(item.id)
          return (
            <View style={styles.row}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{item.username.charAt(0).toUpperCase()}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.username}>@{item.username}</Text>
                {item.display_name ? <Text style={styles.displayName}>{item.display_name}</Text> : null}
              </View>
              <TouchableOpacity
                style={[styles.followBtn, isFollowing && styles.followingBtn]}
                onPress={() => toggleFollow(item.id)}
              >
                <Text style={[styles.followText, isFollowing && styles.followingText]}>
                  {isFollowing ? 'Following' : 'Follow'}
                </Text>
              </TouchableOpacity>
            </View>
          )
        }}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#13151A', paddingHorizontal: 16, paddingTop: 70 },
  back: { color: '#A8AEBE', fontSize: 15, marginBottom: 16 },
  heading: { fontSize: 32, fontWeight: '700', color: '#F4F5F7', marginBottom: 16 },
  input: { backgroundColor: '#1C1F27', borderWidth: 1, borderColor: '#2E3240', borderRadius: 12, padding: 14, color: '#F4F5F7', fontSize: 16 },
  empty: { color: '#6B7183', marginTop: 30, fontSize: 14 },
  row: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1C1F27', borderRadius: 12, padding: 12, marginBottom: 10, borderWidth: 1, borderColor: '#2E3240' },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#10B981', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  avatarText: { color: '#000', fontWeight: '700', fontSize: 16 },
  username: { color: '#F4F5F7', fontSize: 15, fontWeight: '600' },
  displayName: { color: '#6B7183', fontSize: 12, marginTop: 2 },
  followBtn: { backgroundColor: '#10B981', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 50 },
  followingBtn: { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#2E3240' },
  followText: { color: '#000', fontWeight: '600', fontSize: 13 },
  followingText: { color: '#A8AEBE' },
})