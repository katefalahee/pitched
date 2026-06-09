import { useEffect, useState } from 'react'
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { getGroundDetail } from './lib/api'
import { addToBucket, removeFromBucket } from './lib/api'
import { followGround, unfollowGround } from './lib/api'

export default function GroundDetail({ venueId, onBack, onOpenMatch }: {
  venueId: string
  onBack: () => void
  onOpenMatch: (match: any) => void
}) {
  const [data, setData] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [wishlist, setWishlist] = useState(false)
  const [following, setFollowing] = useState(false)
  const [followerCount, setFollowerCount] = useState(0)

  useEffect(() => {
    getGroundDetail(venueId)
      .then((d) => {
        setData(d)
        setWishlist(d.wishlist)
        setFollowing(d.following)
        setFollowerCount(d.followerCount ?? 0)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [venueId])

  async function toggleFollow() {
    const was = following
    setFollowing(!was)
    setFollowerCount((c) => c + (was ? -1 : 1)) // optimistic count update
    try {
      if (was) await unfollowGround(venueId)
      else await followGround(venueId)
    } catch {
      setFollowing(was)
      setFollowerCount((c) => c + (was ? 1 : -1))
    }
  }

  async function toggleBucket() {
    const was = wishlist
    setWishlist(!was) // optimistic
    try {
      if (was) await removeFromBucket(venueId)
      else await addToBucket(venueId)
    } catch {
      setWishlist(was) // revert on failure
    }
  }

  if (loading) return <View style={styles.center}><ActivityIndicator color="#10B981" /></View>
  if (!data) return <View style={styles.center}><Text style={styles.err}>Couldn't load this ground.</Text></View>

  const { venue, matches, visited } = data

  return (
    <View style={{ flex: 1 }}>
      <TouchableOpacity onPress={onBack} style={styles.backRow}>
        <MaterialCommunityIcons name="chevron-left" size={22} color="#A8AEBE" />
        <Text style={styles.backText}>Passport</Text>
      </TouchableOpacity>

      <ScrollView contentContainerStyle={{ paddingBottom: 60 }}>
        {/* Hero */}
        <View style={styles.hero}>
          <MaterialCommunityIcons name="stadium" size={32} color="#C9A24B" />
          <Text style={styles.name}>{venue.name}</Text>
          {venue.county ? <Text style={styles.county}>{venue.county}{venue.country ? `, ${venue.country}` : ''}</Text> : null}

          {visited ? (
            <View style={styles.visitedBadge}>
              <MaterialCommunityIcons name="check-decagram" size={16} color="#10B981" />
              <Text style={styles.visitedText}>Visited — stamped in your passport</Text>
            </View>
          ) : (
            <>
              <View style={styles.notVisitedBadge}>
                <MaterialCommunityIcons name="map-marker-outline" size={16} color="#6B7183" />
                <Text style={styles.notVisitedText}>Not yet visited</Text>
              </View>
              <TouchableOpacity
                style={[styles.bucketBtn, wishlist && styles.bucketBtnOn]}
                onPress={toggleBucket}
              >
                <MaterialCommunityIcons
                  name={wishlist ? 'bookmark-check' : 'bookmark-plus-outline'}
                  size={18}
                  color={wishlist ? '#13151A' : '#C9A24B'}
                />
                <Text style={[styles.bucketText, wishlist && styles.bucketTextOn]}>
                  {wishlist ? 'On your bucket list' : 'Add to bucket list'}
                </Text>
              </TouchableOpacity>
            </>
          )}
          <TouchableOpacity
            style={[styles.followBtn, following && styles.followBtnOn]}
            onPress={toggleFollow}
          >
            <MaterialCommunityIcons
              name={following ? 'bell' : 'bell-outline'}
              size={18}
              color={following ? '#13151A' : '#10B981'}
            />
            <Text style={[styles.followText, following && styles.followTextOn]}>
              {following ? 'Following' : 'Follow ground'}
            </Text>
          </TouchableOpacity>

          {followerCount > 0 && (
            <Text style={styles.followerCount}>
              {followerCount} {followerCount === 1 ? 'follower' : 'followers'}
            </Text>
          )}
        </View>

        {/* Facts */}
        <View style={styles.facts}>
          {venue.capacity ? (
            <View style={styles.factRow}>
              <MaterialCommunityIcons name="account-group-outline" size={18} color="#6B7183" />
              <Text style={styles.factText}>Capacity {venue.capacity.toLocaleString()}</Text>
            </View>
          ) : null}
          <View style={styles.factRow}>
            <MaterialCommunityIcons name="soccer" size={18} color="#6B7183" />
            <Text style={styles.factText}>{matches.length} {matches.length === 1 ? 'match' : 'matches'} on Pitched</Text>
          </View>
        </View>

        {/* Matches here */}
        {matches.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Matches at this ground</Text>
            {matches.map((m: any) => (
              <TouchableOpacity key={m.id} style={styles.matchRow} onPress={() => onOpenMatch(m)}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.matchTeams}>{m.home_team.name} v {m.away_team.name}</Text>
                  <Text style={styles.matchDate}>
                    {new Date(m.kickoff_at).toLocaleDateString('en-IE', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </Text>
                </View>
                <MaterialCommunityIcons name="chevron-right" size={20} color="#6B7183" />
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  center: { flex: 1, backgroundColor: '#13151A', justifyContent: 'center', alignItems: 'center' },
  err: { color: '#EF4444' },
  backRow: { flexDirection: 'row', alignItems: 'center', paddingTop: 56, paddingHorizontal: 16, paddingBottom: 8 },
  backText: { color: '#A8AEBE', fontSize: 15 },
  hero: { alignItems: 'center', paddingVertical: 20, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: '#1C1F27' },
  name: { color: '#F4F5F7', fontSize: 26, fontWeight: '800', marginTop: 12, textAlign: 'center' },
  county: { color: '#6B7183', fontSize: 14, marginTop: 4 },
  visitedBadge: { flexDirection: 'row', alignItems: 'center', gap: 7, backgroundColor: 'rgba(16,185,129,0.1)', borderRadius: 50, paddingHorizontal: 14, paddingVertical: 8, marginTop: 16 },
  visitedText: { color: '#10B981', fontSize: 13, fontWeight: '600' },
  notVisitedBadge: { flexDirection: 'row', alignItems: 'center', gap: 7, backgroundColor: '#1C1F27', borderRadius: 50, paddingHorizontal: 14, paddingVertical: 8, marginTop: 16 },
  notVisitedText: { color: '#6B7183', fontSize: 13, fontWeight: '600' },
  facts: { paddingHorizontal: 16, paddingTop: 20, gap: 12 },
  factRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  factText: { color: '#A8AEBE', fontSize: 14 },
  section: { paddingHorizontal: 16, paddingTop: 28 },
  sectionTitle: { color: '#F4F5F7', fontSize: 16, fontWeight: '700', marginBottom: 12 },
  matchRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1C1F27', borderRadius: 12, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: '#2E3240' },
  matchTeams: { color: '#F4F5F7', fontSize: 15, fontWeight: '600' },
  matchDate: { color: '#6B7183', fontSize: 12, marginTop: 3 },
  bucketBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1, borderColor: 'rgba(201,162,75,0.5)', borderRadius: 50, paddingHorizontal: 18, paddingVertical: 10, marginTop: 12 },
  bucketBtnOn: { backgroundColor: '#C9A24B', borderColor: '#C9A24B' },
  bucketText: { color: '#C9A24B', fontSize: 14, fontWeight: '600' },
  bucketTextOn: { color: '#13151A', fontWeight: '700' },
  followBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1, borderColor: 'rgba(16,185,129,0.5)', borderRadius: 50, paddingHorizontal: 20, paddingVertical: 10, marginTop: 12 },
  followBtnOn: { backgroundColor: '#10B981', borderColor: '#10B981' },
  followText: { color: '#10B981', fontSize: 14, fontWeight: '600' },
  followTextOn: { color: '#13151A', fontWeight: '700' },
  followerCount: { color: '#6B7183', fontSize: 12, marginTop: 10 },
})