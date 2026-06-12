import { Text, StyleSheet, Pressable } from 'react-native'
import { colors, fonts, radius } from '../lib/theme'

export default function FeelingChip({
  label,
  selected,
  disabled,
  onPress,
}: {
  label: string
  selected: boolean
  disabled?: boolean
  onPress: () => void
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.chip,
        selected && styles.chipOn,
        disabled && !selected && styles.chipDisabled,
      ]}
    >
      <Text style={[styles.text, selected && styles.textOn, disabled && !selected && styles.textDisabled]}>
        {label}
      </Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  chip: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.pill, paddingHorizontal: 16, paddingVertical: 9, backgroundColor: colors.surface },
  chipOn: { backgroundColor: colors.gold, borderColor: colors.gold },
  chipDisabled: { opacity: 0.4 },
  text: { color: colors.textSoft, fontSize: 14, fontFamily: fonts.sansMedium },
  textOn: { color: colors.onGold, fontFamily: fonts.sansSemibold },
  textDisabled: { color: colors.textMuted },
})