export const Colors = {
  // App backgrounds
  background:   '#1A1A1A', // main screen background
  surface:      '#1E1E1E', // cards, inputs, modals
  surfaceDeep:  '#0A0A0A', // bottom tab bar
  eggshell:     '#F2EEE8', // unused — reserved

  // Borders
  border:       '#2E2E2E', // all card/input borders

  // Brand (Temple red)
  primary:      '#9D2235', // buttons, active tabs, highlights
  primaryLight: '#BE2A40', // hover/pressed state of primary
  primaryFaded: '#9D223520', // tinted backgrounds (e.g. selected row)

  // Text
  text:         '#FFFFFF', // primary text
  textMuted:    '#8A8A8A', // secondary text, labels, leaderboard ranks 11-20

  // Tier colors — used in leaderboard rank colors and AppNavigator tier tint
  champion:     '#FF4500', // rank 1 / tier >= 2801 pts (orange-red)
  masters:      '#C084FC', // rank 2 / tier >= 2001 pts (purple)
  diamond:      '#67E8F9', // rank 3 / tier >= 1401 pts (cyan)
  platinum:     '#94A3B8', // tier >= 901 pts (slate)
  gold:         '#F0C040', // tier >= 501 pts
  silver:       '#CBD5E1', // tier >= 201 pts
  bronze:       '#CD7F32', // tier >= 1 pts
  unranked:     '#6B7280', // tier = 0 pts

  // Status
  success:      '#4CAF50', // GPS verified indicator
  error:        '#E05C70', // error messages, discard button
} as const;
