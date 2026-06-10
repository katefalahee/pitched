// ── Pitched design tokens ──────────────────────────
// Single source of truth: colour, type, spacing, radius.

export const colors = {
  // Warm espresso base (not cold black)
  bg: '#1A1614',            // app background — "Espresso Night"
  surface: '#241E1A',       // cards / raised surfaces — "Programme Brown"
  surfaceAlt: '#2C2521',    // inputs / lighter surface — "Aged Leather"
  border: '#3A322C',        // hairlines, card borders — "Burnt Border"

  // Antique gold — the hero accent
  gold: '#CBA75C',
  goldDark: '#B88F3E',
  goldSoft: 'rgba(203,167,92,0.14)',
  goldBorder: 'rgba(203,167,92,0.45)',

  // Cream text (warm, not stark white)
  text: '#F2EBDD',          // primary
  textSoft: '#C9BEAC',      // secondary — "Faded Programme"
  textMuted: '#8A7F70',     // tertiary / metadata — "Stub"
  iconInactive: '#7D7263',  // unselected nav icons

  // Emotional accents (used sparingly)
  terracotta: '#B5654A',
  terracottaSoft: 'rgba(181,101,74,0.16)',
  moss: '#6F7B52',
  blue: '#657C8C',

  // Paper (for scrapbook / printed memory cards)
  paper: '#EFE6D7',
  paperText: '#2A221D',
  paperMuted: '#7C6B5A',

  // Functional
  danger: '#8B4A3F',        // "Weathered Burgundy"
  success: '#6F7B52',
  onGold: '#1A1614',        // text/icons on a gold fill
}

// Font family names — these are the EXACT names the fonts load under (see App.tsx).
// Reference these everywhere instead of typing the strings.
export const fonts = {
  serif: 'PlayfairDisplay_600SemiBold',       // titles, wordmark, headings
  serifMedium: 'PlayfairDisplay_500Medium',   // lighter titles
  serifItalic: 'PlayfairDisplay_600SemiBold_Italic', // accent italics ("Archive.")
  sans: 'Inter_400Regular',                   // body
  sansMedium: 'Inter_500Medium',              // UI labels
  sansSemibold: 'Inter_600SemiBold',          // buttons, emphasis
  sansBold: 'Inter_700Bold',                  // strong emphasis
}

// Type scale (size + lineHeight). Pair with a fonts.* family at the call site.
export const type = {
  display:     { fontSize: 40, lineHeight: 46 },
  screenTitle: { fontSize: 30, lineHeight: 36 },
  sectionTitle:{ fontSize: 23, lineHeight: 29 },
  cardTitle:   { fontSize: 19, lineHeight: 24 },
  body:        { fontSize: 15, lineHeight: 22 },
  meta:        { fontSize: 12, lineHeight: 16 },
  eyebrow:     { fontSize: 11, lineHeight: 14, letterSpacing: 1.2, textTransform: 'uppercase' as const },
}

export const spacing = {
  xxs: 4, xs: 8, sm: 12, md: 16, lg: 20, xl: 24, xxl: 32, xxxl: 40,
  screen: 20, // default horizontal screen padding
}

export const radius = {
  sm: 12, md: 16, lg: 20, xl: 24, pill: 999,
}