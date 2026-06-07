import { useEffect, useState } from 'react'
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import Header from './Header'
import { searchMatches } from './lib/api'

export default function AddMatch({ onMenu, onBack, onPickMatch, onCreateNew }: {
  onMenu: () => void
  onBack: () => void
  onPickMatch: (match: any) => void
  onCreateNew: () => void
}) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([])
      setSearched(false)
      return
    }
    setLoading(true)
    const timer = setTimeout(() => {
      searchMatches(query.trim())
        .then((m) => { setResults(m); setSearched(true) })
        .catch(() => { setResults([]); setSearched(true) })
        .finally(() => setLoading(false))
    }, 350)
    return () => clearTimeout(timer)
  }, [query])

  return (
    <View style={{ flex: 1 }}>
      <Header onMenu={onMenu} subtitle="Find the match you attended, or add it" />

      <TouchableOpacity onPress={onBack} style={styles.backRow}>
        <MaterialCommunityIcons name="chevron-left" size={20} color="#A8AEBE" />
        <Text style={styles.back}>Back</Text>
      </TouchableOpacity>

      {/* Search field */}
      <View style={styles.searchBar}>
        <MaterialCommunityIcons name="magnify" size={20} color="#6B7183" />
        <TextInput
          style={styles.searchInput}
          value={query}
          onChangeText={setQuery}
          placeholder="Search by team, e.g. Dublin"
          placeholderTextColor="#3F4354"
          autoCapitalize="none"
          autoCorrect={false}
          autoFocus
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => setQuery('')}>
            <MaterialCommunityIcons name="close-circle" size={18} color="#3F4354" />
          </TouchableOpacity>
        )}
      </View>

      {/* Prompt before searching */}
      {query.trim().length < 2 && (
        <View style={styles.hint}>
          <MaterialCommunityIcons name="information-outline" size={18} color="#6B7183" />
          <Text style={styles.hintText}>
            Search for the match first. If it's not already here, you'll be able to add it.
          </Text>
        </View>
      )}

      {loading && <ActivityIndicator color="#10B981" style={{ marginTop: 24 }} />}

      <FlatList
        data={results}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingTop: 8, paddingBottom: 40 }}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.matchCard} onPress={() => onPickMatch(item)}>
            <Text style={styles.matchTeams}>{item.home_team.name} v {item.away_team.name}</Text>
            <Text style={styles.matchMeta}>
              {item.venue?.name ?? 'Unknown venue'} · {item.competition?.name ?? ''}
            </Text>
            <View style={styles.matchFooter}>
              <Text style={styles.matchDate}>
                {new Date(item.kickoff_at).toLocaleDateString('en-IE', { day: 'numeric', month: 'short', year: 'numeric' })}
              </Text>
              <View style={styles.logTag}>
                <MaterialCommunityIcons name="pencil" size={12} color="#10B981" />
                <Text style={styles.logTagText}>Log this</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
        ListFooterComponent={
          searched ? (
            <TouchableOpacity style={styles.addCard} onPress={onCreateNew}>
              <View style={styles.addIcon}>
                <MaterialCommunityIcons name="plus" size={22} color="#10B981" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.addTitle}>
                  {results.length > 0 ? "Can't see your match?" : 'No match found'}
                </Text>
                <Text style={styles.addSub}>Add it to Pitched so you — and others — can log it</Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={22} color="#6B7183" />
            </TouchableOpacity>
          ) : null
        }
      />
    </View>
  )
}

const styles = StyleSheet.create({
  backRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  back: { color: '#A8AEBE', fontSize: 15 },
  searchBar: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#1C1F27', borderWidth: 1, borderColor: '#2E3240', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12 },
  searchInput: { flex: 1, color: '#F4F5F7', fontSize: 16 },
  hint: { flexDirection: 'row', gap: 8, alignItems: 'flex-start', marginTop: 16, paddingHorizontal: 4 },
  hintText: { flex: 1, color: '#6B7183', fontSize: 13, lineHeight: 19 },
  matchCard: { backgroundColor: '#1C1F27', borderRadius: 12, padding: 16, marginTop: 10, borderWidth: 1, borderColor: '#2E3240' },
  matchTeams: { fontSize: 16, fontWeight: '600', color: '#F4F5F7', marginBottom: 4 },
  matchMeta: { fontSize: 12, color: '#6B7183', marginBottom: 10 },
  matchFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  matchDate: { fontSize: 12, color: '#A8AEBE' },
  logTag: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(16,185,129,0.12)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 50 },
  logTagText: { color: '#10B981', fontSize: 12, fontWeight: '600' },
  addCard: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: '#1C1F27', borderRadius: 12, padding: 16, marginTop: 16, borderWidth: 1, borderColor: 'rgba(16,185,129,0.3)', borderStyle: 'dashed' },
  addIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(16,185,129,0.12)', alignItems: 'center', justifyContent: 'center' },
  addTitle: { color: '#F4F5F7', fontSize: 15, fontWeight: '600' },
  addSub: { color: '#6B7183', fontSize: 12, marginTop: 2 },
})