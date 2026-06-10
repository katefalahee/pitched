// ── Pitched design tokens ──────────────────────────
// The single source of truth for colour. Change here, ripples everywhere.

export const colors = {
  // Warm espresso-dark base (not cold black)
  bg: '#1A1614',           // app background
  surface: '#241E1A',      // cards, raised surfaces
  surfaceAlt: '#2C2521',   // slightly lighter surface / inputs
  border: '#3A322C',       // hairlines, card borders

  // Antique gold — the hero accent
  gold: '#CBA75C',
  goldSoft: 'rgba(203,167,92,0.14)',  // gold tint backgrounds
  goldBorder: 'rgba(203,167,92,0.45)',

  // Cream text (warm, not stark white)
  text: '#F2EBDD',         // primary text
  textSoft: '#C9BEAC',     // secondary text
  textMuted: '#8A7F70',    // tertiary / metadata

  // Muted terracotta — emotional secondary, used sparingly
  terracotta: '#B5654A',
  terracottaSoft: 'rgba(181,101,74,0.16)',

  // Functional
  danger: '#C5564A',
  onGold: '#1A1614',       // text/icons on a gold fill
}