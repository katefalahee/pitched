import { View, Text, StyleSheet, Pressable } from 'react-native'
import Svg, { Path, Defs, ClipPath, Rect } from 'react-native-svg'
import { colors, fonts } from '../lib/theme'

// A single heartbeat-spike mark. `fill` is 0 (empty), 0.5 (half), or 1 (full).
function PulseSpike({ size, fill, id }: { size: number; fill: number; id: string }) {
  const d = 'M1 12 H6 L8.5 5 L12 19 L15 9 L17 12 H23'
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {/* Empty (background) spike */}
      <Path d={d} stroke={colors.border} strokeWidth={2.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      {/* Gold spike, clipped horizontally to `fill` */}
      {fill > 0 && (
        <>
          <Defs>
            <ClipPath id={id}>
              <Rect x="0" y="0" width={24 * fill} height="24" />
            </ClipPath>
          </Defs>
          <Path d={d} stroke={colors.gold} strokeWidth={2.5} fill="none" strokeLinecap="round" strokeLinejoin="round" clipPath={`url(#${id})`} />
        </>
      )}
    </Svg>
  )
}

export default function MatchPulse({
  value,
  onChange,
  size = 40,
  showLabel = true,
}: {
  value: number
  onChange?: (v: number) => void
  size?: number
  showLabel?: boolean
}) {
  const interactive = !!onChange

  const spikeFill = (i: number) => {
    const full = i + 1
    const half = i + 0.5
    if (value >= full) return 1
    if (value >= half) return 0.5
    return 0
  }

  function handlePress(i: number, side: 'left' | 'right') {
    if (!onChange) return
    const v = side === 'left' ? i + 0.5 : i + 1
    onChange(v)
  }

  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        {[0, 1, 2, 3, 4].map((i) => {
          if (!interactive) {
            return (
              <View key={i} style={styles.spikeBox}>
                <PulseSpike size={size} fill={spikeFill(i)} id={`pulse-${size}-${i}-${value}`} />
              </View>
            )
          }
          return (
            <View key={i} style={styles.spikeBox}>
              <PulseSpike size={size} fill={spikeFill(i)} id={`pulse-i-${size}-${i}`} />
              <Pressable style={styles.halfLeft} onPress={() => handlePress(i, 'left')} />
              <Pressable style={styles.halfRight} onPress={() => handlePress(i, 'right')} />
            </View>
          )
        })}
      </View>
      {showLabel && value > 0 && (
        <Text style={styles.label}>{value} / 5</Text>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center' },
  row: { flexDirection: 'row', gap: 6 },
  spikeBox: { position: 'relative' },
  halfLeft: { position: 'absolute', left: 0, top: 0, bottom: 0, width: '50%' },
  halfRight: { position: 'absolute', right: 0, top: 0, bottom: 0, width: '50%' },
  label: { color: colors.gold, fontFamily: fonts.serif, fontSize: 18, marginTop: 8 },
})