import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'

export default function Header({
  title,
  subtitle,
  onMenu,
  big = false,
}: {
  title?: string
  subtitle?: string
  onMenu: () => void
  big?: boolean
}) {
  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        <Text style={styles.wordmarkBig}>
          PITCHED<Text style={styles.dot}>.</Text>
        </Text>
        <TouchableOpacity style={styles.menuButton} onPress={onMenu}>
          <Text style={styles.menuIcon}>☰</Text>
        </TouchableOpacity>
      </View>

      {big && <Text style={styles.tagline}>YOUR MATCHES, REMEMBERED</Text>}
      {title && <Text style={styles.title}>{title}</Text>}
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: { paddingTop: 56, paddingBottom: 8, paddingHorizontal: 4 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  wordmarkBig: { fontSize: 26, fontWeight: '800', color: '#F4F5F7', letterSpacing: 2 },
  wordmarkSmall: { fontSize: 14, fontWeight: '800', color: '#6B7183', letterSpacing: 2 },
  dot: { color: '#10B981' },
  tagline: { fontSize: 10, color: '#6B7183', letterSpacing: 3, marginTop: 2 },
  menuButton: { padding: 8 },
  menuIcon: { color: '#F4F5F7', fontSize: 26 },
  title: { fontSize: 30, fontWeight: '800', color: '#F4F5F7', letterSpacing: 0.5, marginTop: 14 },
  subtitle: { fontSize: 13, color: '#6B7183', marginTop: 4 },
})