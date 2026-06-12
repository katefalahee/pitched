import { View, Text, StyleSheet } from 'react-native'
import Svg, { Circle, Path, Text as SvgText, TextPath, Defs } from 'react-native-svg'
import { colors, fonts, radius } from '../lib/theme'

// The circular ink-stamp overlay ("LONDON · VISITED" style)
function InkStamp({ label, visited }: { label: string; visited: boolean }) {
  const ink = visited ? colors.terracotta : colors.textMuted
  return (
    <Svg width={120} height={120} viewBox="0 0 120 120" style={styles.stampSvg}>
      <Defs>
        <Path id="circlePath" d="M60,60 m-42,0 a42,42 0 1,1 84,0 a42,42 0 1,1 -84,0" fill="none" />
      </Defs>
      {/* double ring */}
      <Circle cx="60" cy="60" r="52" stroke={ink} strokeWidth="2" fill="none" opacity={0.85} />
      <Circle cx="60" cy="60" r="44" stroke={ink} strokeWidth="1" fill="none" opacity={0.6} />
      {/* curved label around the ring */}
      <SvgText fill={ink} fontSize="11" fontWeight="bold" letterSpacing="2" opacity={0.9}>
        <TextPath href="#circlePath" startOffset="6%">
          {label.toUpperCase()}
        </TextPath>
      </SvgText>
      {/* centre word */}
      <SvgText x="60" y="66" fill={ink} fontSize="15" fontWeight="bold" textAnchor="middle" letterSpacing="2" opacity={0.95}>
        {visited ? 'VISITED' : 'WISHLIST'}
      </SvgText>
    </Svg>
  )
}

// A row of perforation notches
function Perforations() {
  return (
    <View style={styles.perfRow}>
      {Array.from({ length: 14 }).map((_, i) => (
        <View key={i} style={styles.perfDot} />
      ))}
    </View>
  )
}

export default function PassportTicketCard({
  homeTeam,
  awayTeam,
  city,
  year,
  visited,
  visitCount,
}: {
  homeTeam: string
  awayTeam: string
  city?: string
  year?: number | string
  visited: boolean
  visitCount?: number
}) {
  return (
    <View style={[styles.ticket, !visited && styles.ticketFaded]}>
      {/* eyebrow */}
      <Text style={styles.eyebrow}>MATCH TICKET</Text>

      {/* teams */}
      <Text style={styles.team} numberOfLines={1}>{homeTeam.toUpperCase()}</Text>
      <Text style={styles.vs}>vs</Text>
      <Text style={styles.team} numberOfLines={1}>{awayTeam.toUpperCase()}</Text>

      {/* ink stamp overlaid */}
      <View style={styles.stampWrap} pointerEvents="none">
        <InkStamp label={city ?? 'GROUND'} visited={visited} />
      </View>

      {/* perforated divider */}
      <Perforations />

      {/* faux ticket metadata */}
      <View style={styles.metaRow}>
        <View style={styles.metaCol}>
          <Text style={styles.metaLabel}>YEAR</Text>
          <Text style={styles.metaValue}>{year ?? '—'}</Text>
        </View>
        <View style={styles.metaCol}>
          <Text style={styles.metaLabel}>VISITS</Text>
          <Text style={styles.metaValue}>{visited ? (visitCount ?? 1) : '—'}</Text>
        </View>
        <View style={styles.metaCol}>
          <Text style={styles.metaLabel}>STATUS</Text>
          <Text style={[styles.metaValue, { color: visited ? colors.gold : colors.textMuted }]}>
            {visited ? 'STAMPED' : 'OPEN'}
          </Text>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  ticket: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 22,
    paddingHorizontal: 20,
    alignItems: 'center',
    overflow: 'hidden',
  },
  ticketFaded: { opacity: 0.5 },
  eyebrow: { color: colors.gold, fontSize: 10, fontFamily: fonts.sansSemibold, letterSpacing: 3, marginBottom: 14 },
  team: { color: colors.text, fontSize: 20, fontFamily: fonts.serif, textAlign: 'center' },
  vs: { color: colors.textMuted, fontSize: 12, fontFamily: fonts.serifItalic, marginVertical: 2 },
  stampWrap: { position: 'absolute', top: 64, alignSelf: 'center', transform: [{ rotate: '-12deg' }] },
  stampSvg: {},
  perfRow: { flexDirection: 'row', justifyContent: 'space-between', alignSelf: 'stretch', marginTop: 22, marginBottom: 16, paddingHorizontal: 4 },
  perfDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.bg },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', alignSelf: 'stretch', paddingHorizontal: 8 },
  metaCol: { alignItems: 'center' },
  metaLabel: { color: colors.textMuted, fontSize: 9, fontFamily: fonts.sansMedium, letterSpacing: 1.5, marginBottom: 3 },
  metaValue: { color: colors.text, fontSize: 13, fontFamily: fonts.sansSemibold },
})