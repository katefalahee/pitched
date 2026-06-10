import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { colors } from './lib/theme'

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
  wordmarkBig: { fontSize: 26, fontWeight: '800', color: colors.text, letterSpacing: 2 },
  dot: { color: colors.gold },
  tagline: { fontSize: 10, color: colors.textMuted, letterSpacing: 3, marginTop: 2 },
  menuButton: { padding: 8 },
  menuIcon: { color: colors.text, fontSize: 26 },
  title: { fontSize: 30, fontWeight: '800', color: colors.text, letterSpacing: 0.5, marginTop: 14 },
  subtitle: { fontSize: 13, color: colors.textMuted, marginTop: 4 },
})