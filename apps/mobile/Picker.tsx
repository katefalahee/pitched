import { useEffect, useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, FlatList, ActivityIndicator } from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'

type Item = { id: string; label: string; sublabel?: string }

export default function Picker({
  label,
  placeholder,
  value,
  disabled,
  loadItems,
  onSelect,
}: {
  label: string
  placeholder: string
  value: Item | null
  disabled?: boolean
  loadItems: () => Promise<Item[]>
  onSelect: (item: Item) => void
}) {
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState<Item[]>([])
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)

  // Load the list when the picker opens
  useEffect(() => {
    if (!open) return
    setLoading(true)
    setQuery('')
    loadItems()
      .then(setItems)
      .catch(() => setItems([]))
      .finally(() => setLoading(false))
  }, [open])

  const filtered = query.trim()
    ? items.filter((i) => i.label.toLowerCase().includes(query.trim().toLowerCase()))
    : items

  return (
    <>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity
        style={[styles.field, disabled && styles.fieldDisabled]}
        onPress={() => !disabled && setOpen(true)}
        activeOpacity={disabled ? 1 : 0.7}
      >
        <Text style={[styles.fieldText, !value && styles.fieldPlaceholder]}>
          {value ? value.label : placeholder}
        </Text>
        <MaterialCommunityIcons name="chevron-down" size={20} color={disabled ? '#3F4354' : '#6B7183'} />
      </TouchableOpacity>

      <Modal visible={open} animationType="slide" transparent onRequestClose={() => setOpen(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{label}</Text>
              <TouchableOpacity onPress={() => setOpen(false)}>
                <MaterialCommunityIcons name="close" size={24} color="#A8AEBE" />
              </TouchableOpacity>
            </View>

            <View style={styles.searchBar}>
              <MaterialCommunityIcons name="magnify" size={18} color="#6B7183" />
              <TextInput
                style={styles.searchInput}
                value={query}
                onChangeText={setQuery}
                placeholder="Search…"
                placeholderTextColor="#3F4354"
                autoCapitalize="none"
              />
            </View>

            {loading ? (
              <ActivityIndicator color="#10B981" style={{ marginTop: 30 }} />
            ) : (
              <FlatList
                data={filtered}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ paddingBottom: 30 }}
                keyboardShouldPersistTaps="handled"
                ListEmptyComponent={<Text style={styles.empty}>Nothing found.</Text>}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.row}
                    onPress={() => { onSelect(item); setOpen(false) }}
                  >
                    <View>
                      <Text style={styles.rowLabel}>{item.label}</Text>
                      {item.sublabel ? <Text style={styles.rowSub}>{item.sublabel}</Text> : null}
                    </View>
                    {value?.id === item.id && (
                      <MaterialCommunityIcons name="check" size={20} color="#10B981" />
                    )}
                  </TouchableOpacity>
                )}
              />
            )}
          </View>
        </View>
      </Modal>
    </>
  )
}

const styles = StyleSheet.create({
  label: { fontSize: 12, color: '#6B7183', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8, marginTop: 16 },
  field: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#1C1F27', borderWidth: 1, borderColor: '#2E3240', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 14 },
  fieldDisabled: { opacity: 0.5 },
  fieldText: { fontSize: 15, color: '#F4F5F7' },
  fieldPlaceholder: { color: '#3F4354' },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalSheet: { backgroundColor: '#13151A', borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingHorizontal: 20, paddingTop: 16, height: '75%', borderTopWidth: 1, borderColor: '#2E3240' },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#F4F5F7' },
  searchBar: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#1C1F27', borderWidth: 1, borderColor: '#2E3240', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 11, marginBottom: 12 },
  searchInput: { flex: 1, color: '#F4F5F7', fontSize: 15 },
  empty: { color: '#6B7183', fontSize: 14, textAlign: 'center', marginTop: 30 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#1C1F27' },
  rowLabel: { fontSize: 16, color: '#F4F5F7' },
  rowSub: { fontSize: 12, color: '#6B7183', marginTop: 2 },
})