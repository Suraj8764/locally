import Constants from 'expo-constants';

export const COLORS = {
  background: '#0A0A0F',
  surface: '#13131A',
  card: 'rgba(255,255,255,0.04)',
  accentPrimary: '#E8294C',
  accentSecondary: '#8B5CF6',
  textPrimary: '#F5F5F7',
  textSecondary: '#8E8E93',
  onlineGreen: '#30D158',
  border: 'rgba(255,255,255,0.08)',
  error: '#FF453A',
  warning: '#FF9F0A',
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const RADII = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

function getDevHost() {
  const hostUri = Constants.expoConfig?.hostUri ?? Constants.expoGoConfig?.debuggerHost;
  if (!hostUri) return undefined;
  const host = hostUri.split(':')[0];
  return host || undefined;
}

export function getApiBaseUrl() {
  const devHost = getDevHost();
  if (devHost) return `http://${devHost}:5001`;
  return 'http://localhost:5001';
}

export const API_BASE_URL = getApiBaseUrl();

export const GOOGLE_MAPS_API_KEY = 'DUMMY_KEY';

