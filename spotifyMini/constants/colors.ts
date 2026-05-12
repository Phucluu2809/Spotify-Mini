/**
 * SpotifyMini – màu sắc toàn cục của ứng dụng
 * Import: import { Colors, Spotify } from '@/constants/colors';
 */

export const Spotify = {
  /** Màu xanh chính – active, playing indicator */
  green: '#1DB954',
  /** Xanh sáng hơn dùng cho text link, badge */
  greenLight: '#47E06F',
  /** Xanh dùng cho icon đang phát */
  greenGlow: '#53E076',
  /** Nền tối chính */
  black: '#121212',
  /** Nền tối hơn cho card, sheet */
  darkCard: '#1C1B1B',
  /** Nền tối nhất */
  deepBlack: '#050605',
  /** Text chính */
  white: '#E5E2E1',
  /** Text phụ (subtitle, artist) */
  gray: '#BCCBB9',
  /** Text mờ (placeholder, time) */
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