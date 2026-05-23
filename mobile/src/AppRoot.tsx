import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Linking,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  useColorScheme,
  View,
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Phone, MessageCircle, Settings as SettingsIcon, MapPin, AlertTriangle, Send } from 'lucide-react-native';
import i18n from './i18n';
import { Category, Worker, createLead, fetchCategories, fetchNearbyWorkers } from './api';
import { requestAndGetCurrentLocation } from './location';

type RootStackParamList = {
  Home: undefined;
  Settings: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

function normalizeWa(phoneE164: string) {
  const digits = phoneE164.replace(/[^\d]/g, '');
  if (digits.startsWith('91')) return digits;
  if (digits.length === 10) return `91${digits}`;
  return digits;
}

function openCall(phoneE164: string) {
  Linking.openURL(`tel:${phoneE164}`).catch(() => undefined);
}

function openWhatsApp(phoneE164: string) {
  const wa = normalizeWa(phoneE164);
  Linking.openURL(`https://wa.me/${wa}`).catch(() => undefined);
}

function categoryLabel(cat: Category, lng: string) {
  if (lng === 'or') return cat.nameOr;
  if (lng === 'hi') return cat.nameHi;
  return cat.nameEn;
}

function formatDistance(km: number | undefined) {
  if (typeof km !== 'number') return '';
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1)} km`;
}

function Chip(props: { label: string; active?: boolean; onPress?: () => void }) {
  return (
    <Pressable
      onPress={props.onPress}
      style={({ pressed }) => [
        styles.chip,
        props.active ? styles.chipActive : styles.chipIdle,
        pressed && styles.pressed,
      ]}
    >
      <Text style={[styles.chipText, props.active ? styles.chipTextActive : styles.chipTextIdle]}>{props.label}</Text>
    </Pressable>
  );
}

function WorkerCard(props: { worker: Worker; onPress?: () => void }) {
  const { t } = useTranslation();
  const w = props.worker;
  return (
    <Pressable onPress={props.onPress} style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      <View style={styles.cardHeader}>
        <View style={styles.cardTitleWrap}>
          <Text numberOfLines={1} style={styles.cardTitle}>
            {w.displayName}
          </Text>
          <Text style={styles.cardSubtitle}>
            {w.localityLabel}
            {typeof w.distanceKm === 'number' ? ` • ${formatDistance(w.distanceKm)}` : ''}
          </Text>
        </View>
        <View style={styles.badgeRow}>
          {w.isOnline ? <Text style={[styles.badge, styles.badgeGood]}>●</Text> : <Text style={styles.badge}>●</Text>}
          <Text style={styles.badgeText}>{w.isOnline ? t('availableNow') : t('offline')}</Text>
        </View>
      </View>

      <View style={styles.metaRow}>
        <Text style={styles.metaText}>{`${w.ratingAvg.toFixed(1)} (${w.ratingCount})`}</Text>
        <Text style={styles.metaDot}>•</Text>
        <Text style={styles.metaText}>{`${w.experienceYears}y`}</Text>
        <Text style={styles.metaDot}>•</Text>
        <Text style={styles.metaText}>{`${t('trust')} ${w.trustScore}`}</Text>
        <Text style={styles.metaDot}>•</Text>
        <Text style={styles.metaText}>{w.isVerified ? t('verified') : t('unverified')}</Text>
      </View>

      {Array.isArray(w.badges) && w.badges.length > 0 ? (
        <View style={styles.pillRow}>
          {w.badges.slice(0, 3).map((b: string) => (
            <View key={b} style={styles.pill}>
              <Text style={styles.pillText}>{b}</Text>
            </View>
          ))}
        </View>
      ) : null}

      <View style={styles.actionsRow}>
        <Pressable onPress={() => openCall(w.phoneE164)} style={({ pressed }) => [styles.actionBtn, pressed && styles.pressed]}>
          <Phone size={18} color="#0B6E4F" />
          <Text style={styles.actionText}>{t('call')}</Text>
        </Pressable>
        <Pressable
          onPress={() => openWhatsApp(w.whatsappE164)}
          style={({ pressed }) => [styles.actionBtn, pressed && styles.pressed]}
        >
          <MessageCircle size={18} color="#0B6E4F" />
          <Text style={styles.actionText}>{t('whatsapp')}</Text>
        </Pressable>
      </View>
    </Pressable>
  );
}

function HomeScreen({ navigation }: { navigation: { navigate: (s: 'Settings') => void } }) {
  const { t } = useTranslation();
  const lng = i18n.language;
  const scheme = useColorScheme();
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | undefined>(undefined);
  const [radiusKm, setRadiusKm] = useState(3);
  const [onlyOnline, setOnlyOnline] = useState(true);

  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [usingLastKnown, setUsingLastKnown] = useState(false);
  const [locStatus, setLocStatus] = useState<'idle' | 'loading' | 'granted' | 'denied' | 'error'>('idle');
  const [locError, setLocError] = useState<string | null>(null);

  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(false);
  const [requestOpen, setRequestOpen] = useState(false);
  const [requestText, setRequestText] = useState('');
  const [requestSending, setRequestSending] = useState(false);

  const emergencyCategories = useMemo(() => categories.filter((c) => c.isEmergency), [categories]);

  async function refreshLocation() {
    setLocStatus('loading');
    setLocError(null);
    const res = await requestAndGetCurrentLocation();
    if (res.status === 'granted') {
      setCoords(res.coords);
      setUsingLastKnown(false);
      setLocStatus('granted');
      return;
    }
    if (res.status === 'denied') {
      setCoords(res.lastKnown);
      setUsingLastKnown(Boolean(res.lastKnown));
      setLocStatus('denied');
      return;
    }
    setCoords(res.lastKnown);
    setUsingLastKnown(Boolean(res.lastKnown));
    setLocStatus('error');
    setLocError(res.message);
  }

  async function refreshWorkers(next?: { categoryId?: string; radiusKm?: number; onlyOnline?: boolean }) {
    if (!coords) return;
    setLoading(true);
    try {
      const list = await fetchNearbyWorkers({
        lat: coords.lat,
        lng: coords.lng,
        radiusKm: next?.radiusKm ?? radiusKm,
        categoryId: next?.categoryId ?? selectedCategoryId,
        onlyOnline: next?.onlyOnline ?? onlyOnline,
      });
      setWorkers(list);
    } catch (e) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchCategories()
      .then(setCategories)
      .catch(() => setCategories([]));
    refreshLocation();
  }, []);

  useEffect(() => {
    if (!coords) return;
    refreshWorkers();
  }, [coords, selectedCategoryId, radiusKm, onlyOnline]);

  const radiusOptions: Array<{ value: number; label: string }> = [
    { value: 1, label: t('km1') },
    { value: 3, label: t('km3') },
    { value: 5, label: t('km5') },
    { value: 10, label: t('km10') },
  ];

  const bg = scheme === 'dark' ? '#0B0D10' : '#F6F7FB';
  const fg = scheme === 'dark' ? '#FFFFFF' : '#0B0D10';

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: bg }]}>
      <View style={styles.topBar}>
        <View style={styles.brandWrap}>
          <View style={styles.brandIcon}>
            <MapPin size={18} color="#0B6E4F" />
          </View>
          <View>
            <Text style={[styles.brandTitle, { color: fg }]}>{t('appName')}</Text>
            <Text style={styles.brandSubtitle}>{t('nearbyTrusted')}</Text>
          </View>
        </View>
        <Pressable onPress={() => navigation.navigate('Settings')} style={({ pressed }) => [styles.iconBtn, pressed && styles.pressed]}>
          <SettingsIcon size={20} color={fg} />
        </Pressable>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <AlertTriangle size={18} color="#C81D25" />
            <Text style={[styles.sectionTitle, { color: fg }]}>{t('emergency')}</Text>
          </View>
          <Pressable
            onPress={() => setRequestOpen(true)}
            style={({ pressed }) => [styles.requestBtn, pressed && styles.pressed]}
          >
            <Text style={styles.requestBtnText}>{t('submitRequest')}</Text>
          </Pressable>
        </View>
        <FlatList
          data={emergencyCategories}
          keyExtractor={(c) => c.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.emergencyRow}
          renderItem={({ item }) => (
            <Chip
              label={categoryLabel(item, lng)}
              active={selectedCategoryId === item.id}
              onPress={() => setSelectedCategoryId(item.id)}
            />
          )}
        />
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: fg }]}>{t('categories')}</Text>
        <FlatList
          data={categories}
          keyExtractor={(c) => c.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryRow}
          renderItem={({ item }) => (
            <Chip
              label={categoryLabel(item, lng)}
              active={selectedCategoryId === item.id}
              onPress={() => setSelectedCategoryId(selectedCategoryId === item.id ? undefined : item.id)}
            />
          )}
        />
      </View>

      <View style={styles.controlsRow}>
        <View style={styles.controlGroup}>
          <Text style={[styles.controlLabel, { color: fg }]}>{t('radius')}</Text>
          <FlatList
            data={radiusOptions}
            keyExtractor={(x) => String(x.value)}
            horizontal
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => (
              <Chip label={item.label} active={radiusKm === item.value} onPress={() => setRadiusKm(item.value)} />
            )}
          />
        </View>
        <View style={styles.toggleWrap}>
          <Text style={[styles.controlLabel, { color: fg }]}>{t('showOffline')}</Text>
          <Switch value={!onlyOnline} onValueChange={(v) => setOnlyOnline(!v)} />
        </View>
      </View>

      <View style={styles.locationRow}>
        <View style={styles.locationLeft}>
          {locStatus === 'loading' ? <ActivityIndicator /> : <Text style={styles.locationDot}>●</Text>}
          <Text style={styles.locationText}>
            {coords ? `${coords.lat.toFixed(3)}, ${coords.lng.toFixed(3)}` : t('locationPermissionTitle')}
          </Text>
          {usingLastKnown ? <Text style={styles.locationHint}>{t('usingLastKnownLocation')}</Text> : null}
        </View>
        <Pressable onPress={refreshLocation} style={({ pressed }) => [styles.smallBtn, pressed && styles.pressed]}>
          <Text style={styles.smallBtnText}>{t('retry')}</Text>
        </Pressable>
      </View>

      <View style={styles.listWrap}>
        {loading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator />
          </View>
        ) : workers.length === 0 ? (
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyText}>{t('noResults')}</Text>
            {locStatus === 'denied' ? (
              <Pressable
                onPress={() => Alert.alert(t('locationPermissionTitle'), t('locationPermissionBody'))}
                style={({ pressed }) => [styles.primaryBtn, pressed && styles.pressed]}
              >
                <Text style={styles.primaryBtnText}>{t('enableLocation')}</Text>
              </Pressable>
            ) : null}
            {locStatus === 'error' && locError ? <Text style={styles.errorText}>{locError}</Text> : null}
          </View>
        ) : (
          <FlatList
            data={workers}
            keyExtractor={(w) => w.id}
            contentContainerStyle={styles.list}
            renderItem={({ item }) => <WorkerCard worker={item} />}
          />
        )}
      </View>

      <Modal visible={requestOpen} animationType="slide" transparent onRequestClose={() => setRequestOpen(false)}>
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, { backgroundColor: scheme === 'dark' ? '#151A22' : '#FFFFFF' }]}>
            <Text style={[styles.modalTitle, { color: fg }]}>{t('submitRequest')}</Text>
            <TextInput
              value={requestText}
              onChangeText={setRequestText}
              placeholder={t('describeNeed')}
              placeholderTextColor={scheme === 'dark' ? '#6D7786' : '#8B94A3'}
              style={[styles.input, { color: fg, borderColor: scheme === 'dark' ? '#2A3240' : '#E3E6EE' }]}
              multiline
            />
            <View style={styles.modalActions}>
              <Pressable onPress={() => setRequestOpen(false)} style={({ pressed }) => [styles.secondaryBtn, pressed && styles.pressed]}>
                <Text style={styles.secondaryBtnText}>{t('close')}</Text>
              </Pressable>
              <Pressable
                disabled={requestSending || !coords || !requestText.trim() || !selectedCategoryId}
                onPress={async () => {
                  if (!coords || !selectedCategoryId) return;
                  setRequestSending(true);
                  try {
                    await createLead({
                      categoryId: selectedCategoryId,
                      requirement: requestText.trim(),
                      lat: coords.lat,
                      lng: coords.lng,
                    });
                    setRequestText('');
                    setRequestOpen(false);
                    Alert.alert(t('sent'));
                  } finally {
                    setRequestSending(false);
                  }
                }}
                style={({ pressed }) => [
                  styles.primaryBtn,
                  (requestSending || !coords || !requestText.trim() || !selectedCategoryId) && styles.primaryBtnDisabled,
                  pressed && styles.pressed,
                ]}
              >
                <Send size={18} color="#FFFFFF" />
                <Text style={styles.primaryBtnText}>{t('send')}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function SettingsScreen() {
  const { t } = useTranslation();
  const scheme = useColorScheme();
  const fg = scheme === 'dark' ? '#FFFFFF' : '#0B0D10';

  const options: Array<{ lng: 'or' | 'hi' | 'en'; label: string }> = [
    { lng: 'or', label: t('odia') },
    { lng: 'hi', label: t('hindi') },
    { lng: 'en', label: t('english') },
  ];

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: scheme === 'dark' ? '#0B0D10' : '#F6F7FB' }]}>
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: fg }]}>{t('language')}</Text>
        <View style={styles.langList}>
          {options.map((o) => (
            <Pressable
              key={o.lng}
              onPress={() => i18n.changeLanguage(o.lng)}
              style={({ pressed }) => [styles.langRow, pressed && styles.pressed]}
            >
              <Text style={[styles.langText, { color: fg }]}>{o.label}</Text>
              <Text style={styles.langCheck}>{i18n.language === o.lng ? '✓' : ''}</Text>
            </Pressable>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}

export function AppRoot() {
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? DarkTheme : DefaultTheme;
  const isWeb = Platform.OS === 'web';

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <View style={isWeb ? styles.webShell : styles.nativeShell}>
          <View style={isWeb ? styles.webPhoneFrame : styles.nativeFrame}>
            <NavigationContainer theme={theme}>
              <Stack.Navigator
                screenOptions={{
                  headerShown: false,
                }}
              >
                <Stack.Screen name="Home" component={HomeScreen as any} />
                <Stack.Screen name="Settings" component={SettingsScreen as any} />
              </Stack.Navigator>
            </NavigationContainer>
          </View>
        </View>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  nativeShell: {
    flex: 1,
  },
  nativeFrame: {
    flex: 1,
  },
  webShell: {
    flex: 1,
    backgroundColor: '#E8ECF3',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  webPhoneFrame: {
    flex: 1,
    width: '100%',
    maxWidth: 430,
    maxHeight: 920,
    overflow: 'hidden',
    borderRadius: 28,
    borderWidth: 1,
    borderColor: '#D5DCE8',
    backgroundColor: '#FFFFFF',
    boxShadow: '0px 12px 40px rgba(16, 24, 40, 0.12)',
  },
  screen: {
    flex: 1,
  },
  topBar: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brandWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  brandIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: 'rgba(11,110,79,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  brandSubtitle: {
    fontSize: 12,
    color: '#6D7786',
    marginTop: 2,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  section: {
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  emergencyRow: {
    paddingTop: 10,
    paddingBottom: 4,
    gap: 8,
  },
  categoryRow: {
    paddingTop: 10,
    paddingBottom: 4,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
  },
  chipIdle: {
    borderColor: '#D6DCE8',
    backgroundColor: '#FFFFFF',
  },
  chipActive: {
    borderColor: '#0B6E4F',
    backgroundColor: 'rgba(11,110,79,0.12)',
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  chipTextIdle: {
    color: '#0B0D10',
  },
  chipTextActive: {
    color: '#0B6E4F',
  },
  controlsRow: {
    paddingHorizontal: 16,
    paddingTop: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 10,
  },
  controlGroup: {
    flex: 1,
    gap: 8,
  },
  controlLabel: {
    fontSize: 12,
    fontWeight: '700',
  },
  toggleWrap: {
    width: 120,
    alignItems: 'flex-end',
    gap: 6,
  },
  locationRow: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  locationLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  locationDot: {
    color: '#0B6E4F',
  },
  locationText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6D7786',
  },
  locationHint: {
    fontSize: 11,
    color: '#8B94A3',
  },
  smallBtn: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E3E6EE',
  },
  smallBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0B0D10',
  },
  listWrap: {
    flex: 1,
    paddingTop: 6,
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 12,
  },
  card: {
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E3E6EE',
    padding: 14,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  cardTitleWrap: {
    flex: 1,
    gap: 2,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0B0D10',
  },
  cardSubtitle: {
    fontSize: 12,
    color: '#6D7786',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  badge: {
    fontSize: 12,
    color: '#9AA3B2',
  },
  badgeGood: {
    color: '#0B6E4F',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6D7786',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    gap: 6,
    flexWrap: 'wrap',
  },
  metaText: {
    fontSize: 12,
    color: '#6D7786',
    fontWeight: '600',
  },
  metaDot: {
    color: '#C4CAD6',
  },
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10,
  },
  pill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#F1F3F8',
  },
  pillText: {
    fontSize: 12,
    color: '#0B0D10',
    fontWeight: '600',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  actionBtn: {
    flex: 1,
    borderRadius: 14,
    backgroundColor: 'rgba(11,110,79,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(11,110,79,0.24)',
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0B6E4F',
  },
  pressed: {
    opacity: 0.7,
  },
  loadingWrap: {
    paddingTop: 20,
  },
  emptyWrap: {
    paddingHorizontal: 16,
    paddingTop: 24,
    alignItems: 'center',
    gap: 12,
  },
  emptyText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#6D7786',
    textAlign: 'center',
  },
  errorText: {
    fontSize: 12,
    color: '#C81D25',
    fontWeight: '600',
    textAlign: 'center',
  },
  primaryBtn: {
    backgroundColor: '#0B6E4F',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  primaryBtnDisabled: {
    opacity: 0.5,
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
  },
  requestBtn: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: 'rgba(200,29,37,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(200,29,37,0.22)',
  },
  requestBtnText: {
    color: '#C81D25',
    fontSize: 12,
    fontWeight: '800',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    padding: 16,
    gap: 12,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  input: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 12,
    minHeight: 90,
    fontSize: 14,
    fontWeight: '600',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'flex-end',
  },
  secondaryBtn: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E3E6EE',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryBtnText: {
    color: '#0B0D10',
    fontWeight: '800',
    fontSize: 14,
  },
  langList: {
    marginTop: 10,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E3E6EE',
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },
  langRow: {
    paddingHorizontal: 14,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#EEF1F6',
  },
  langText: {
    fontSize: 14,
    fontWeight: '700',
  },
  langCheck: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0B6E4F',
  },
});
