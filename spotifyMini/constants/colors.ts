/**
 * SpotifyMini global color palette
 * Import: import { Colors, Spotify } from '@/constants/colors';
 */

export const Spotify = {
  /** Main green - active states and playing indicators */
  green: '#1DB954',
  /** Brighter green for links and badges */
  greenLight: '#47E06F',
  /** Green used for currently playing icons */
  greenGlow: '#53E076',
  /** Main dark background */
  black: '#121212',
  /** Darker card and sheet background */
  darkCard: '#1C1B1B',
  /** Deepest background */
  deepBlack: '#050605',
  /** Primary text */
  white: '#E5E2E1',
  /** Secondary text for subtitles and artists */
  gray: '#BCCBB9',
  /** Muted text for placeholders and time */
  muted: '#6B7280',
} as const;

export const Colors = {
  light: {
    text: '#11181C',
    background: '#fff',
    tint: Spotify.green,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: Spotify.green,
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: Spotify.green,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: Spotify.green,
  },
} as const;
