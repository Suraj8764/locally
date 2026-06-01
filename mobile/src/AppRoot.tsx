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
import { Phone, MessageCircle, Settings as SettingsIcon, MapPin, AlertTriangle, Send, Star, Clock, Briefcase, Calendar, CheckCircle2, XCircle, User } from 'lucide-react-native';
import i18n from './i18n';
import { Category, Worker, createLead, fetchCategories, fetchNearbyWorkers, api } from './api';
import { requestAndGetCurrentLocation, getLocationNameFromCoords } from './location';
import { AdminPanelScreen } from './screens/admin/AdminPanelScreen';

type RootStackParamList = {
  Home: undefined;
  Settings: undefined;
  Admin: undefined;
};

type BookingStatus = 'pending' | 'accepted' | 'rejected' | 'cancelled_by_customer' | 'cancelled_by_worker';

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

function BookingModal(props: {
  visible: boolean;
  worker: Worker;
  onClose: () => void;
  onConfirm: (bookingData: { address: string; description: string; preferredTime?: string }) => void;
}) {
  const { t } = useTranslation();
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  
  const [address, setAddress] = useState('');
  const [description, setDescription] = useState('');
  const [preferredTime, setPreferredTime] = useState('');
  
  return (
    <Modal visible={props.visible} animationType="slide" transparent onRequestClose={props.onClose}>
      <View style={styles.modalBackdrop}>
        <View style={[styles.bookingModalCard, isDark ? styles.bookingModalCardDark : styles.bookingModalCardLight]}>
          <View style={styles.bookingModalHeader}>
            <Text style={[styles.bookingModalTitle, { color: isDark ? '#FFFFFF' : '#0B0D10' }]}>{t('bookService')}</Text>
            <Pressable onPress={props.onClose} style={({ pressed }) => [styles.closeModalBtn, pressed && styles.pressed]}>
              <XCircle size={24} color={isDark ? '#9AA3B2' : '#6D7786'} />
            </Pressable>
          </View>
          
          <View style={[styles.workerSummary, isDark ? styles.workerSummaryDark : styles.workerSummaryLight]}>
            <View style={[styles.avatar, isDark ? styles.avatarDark : styles.avatarLight, styles.avatarSmall]}>
              <User size={20} color={isDark ? '#FFFFFF' : '#0B0D10'} />
            </View>
            <View style={styles.workerSummaryInfo}>
              <Text style={[styles.workerSummaryName, { color: isDark ? '#FFFFFF' : '#0B0D10' }]}>{props.worker.displayName}</Text>
              <Text style={styles.workerSummaryProfession}>{props.worker.profession || t('profession')}</Text>
            </View>
          </View>
          
          <View style={styles.bookingSection}>
            <Text style={[styles.bookingSectionLabel, { color: isDark ? '#E8ECF3' : '#0B0D10' }]}>{t('address')}</Text>
            <TextInput
              value={address}
              onChangeText={setAddress}
              placeholder="Enter your address"
              placeholderTextColor={isDark ? '#6D7786' : '#8B94A3'}
              style={[styles.bookingInput, isDark ? styles.bookingInputDark : styles.bookingInputLight, { color: isDark ? '#E8ECF3' : '#0B0D10' }]}
            />
          </View>
          
          <View style={styles.bookingSection}>
            <Text style={[styles.bookingSectionLabel, { color: isDark ? '#E8ECF3' : '#0B0D10' }]}>{t('problemDescription')}</Text>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="Describe your problem..."
              placeholderTextColor={isDark ? '#6D7786' : '#8B94A3'}
              style={[styles.bookingInput, styles.bookingInputTextarea, isDark ? styles.bookingInputDark : styles.bookingInputLight, { color: isDark ? '#E8ECF3' : '#0B0D10' }]}
              multiline
              numberOfLines={4}
            />
          </View>
          
          <View style={styles.bookingSection}>
            <Text style={[styles.bookingSectionLabel, { color: isDark ? '#E8ECF3' : '#0B0D10' }]}>Preferred Time (Optional)</Text>
            <TextInput
              value={preferredTime}
              onChangeText={setPreferredTime}
              placeholder="e.g., 2:00 PM"
              placeholderTextColor={isDark ? '#6D7786' : '#8B94A3'}
              style={[styles.bookingInput, isDark ? styles.bookingInputDark : styles.bookingInputLight, { color: isDark ? '#E8ECF3' : '#0B0D10' }]}
            />
          </View>
          
          <View style={styles.bookingModalActions}>
            <Pressable onPress={props.onClose} style={({ pressed }) => [styles.secondaryBtn, isDark ? styles.secondaryBtnDark : styles.secondaryBtnLight, pressed && styles.pressed]}>
              <Text style={[styles.secondaryBtnText, { color: isDark ? '#E8ECF3' : '#0B0D10' }]}>{t('close')}</Text>
            </Pressable>
            <Pressable
              onPress={() => {
                if (address && description) {
                  props.onConfirm({ address, description, preferredTime });
                }
              }}
              disabled={!address || !description}
              style={({ pressed }) => [
                styles.primaryBtn,
                (!address || !description) && styles.primaryBtnDisabled,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.primaryBtnText}>{t('sendRequest')}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function BookingStatusView(props: { status: BookingStatus; onClose: () => void; worker?: Worker | null }) {
  const { t } = useTranslation();
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  
  const statusConfig = {
    pending: {
      title: 'Request Sent',
      message: 'Your booking request has been sent to the worker. Waiting for response.',
      icon: Send,
      color: '#0B6E4F',
      showContact: false,
    },
    accepted: {
      title: 'Booking Accepted',
      message: 'The worker has accepted your request. You can now contact them directly.',
      icon: CheckCircle2,
      color: '#0B6E4F',
      showContact: true,
    },
    rejected: {
      title: 'Booking Rejected',
      message: 'The worker was unable to accept your request. Please try another worker.',
      icon: XCircle,
      color: '#FF453A',
      showContact: false,
    },
    cancelled_by_customer: {
      title: 'Booking Cancelled',
      message: 'You have cancelled this booking request.',
      icon: XCircle,
      color: '#FF453A',
      showContact: false,
    },
    cancelled_by_worker: {
      title: 'Booking Cancelled',
      message: 'The worker has cancelled this booking request.',
      icon: XCircle,
      color: '#FF453A',
      showContact: false,
    },
  };
  
  const config = statusConfig[props.status];
  const Icon = config.icon;
  
  return (
    <Modal visible={props.status !== null} animationType="slide" transparent onRequestClose={props.onClose}>
      <View style={styles.modalBackdrop}>
        <View style={[styles.bookingStatusCard, isDark ? styles.bookingStatusCardDark : styles.bookingStatusCardLight]}>
          <View style={styles.bookingStatusHeader}>
            <Text style={[styles.bookingStatusTitle, { color: isDark ? '#FFFFFF' : '#0B0D10' }]}>{config.title}</Text>
            <Pressable onPress={props.onClose} style={({ pressed }) => [styles.closeModalBtn, pressed && styles.pressed]}>
              <XCircle size={24} color={isDark ? '#9AA3B2' : '#6D7786'} />
            </Pressable>
          </View>
          
          <View style={styles.statusIconContainer}>
            <View style={[styles.statusIconCircle, { backgroundColor: `${config.color}20` }]}>
              <Icon size={48} color={config.color} />
            </View>
          </View>
          
          <View style={[styles.statusCurrentInfo, isDark ? styles.statusCurrentInfoDark : styles.statusCurrentInfoLight]}>
            <Text style={[styles.statusCurrentLabel, { color: isDark ? '#9AA3B2' : '#6D7786' }]}>Status</Text>
            <Text style={[styles.statusCurrentValue, { color: isDark ? '#FFFFFF' : '#0B0D10' }]}>
              {config.message}
            </Text>
          </View>
          
          {config.showContact && props.worker && (
            <View style={styles.contactActionsRow}>
              <Pressable 
                onPress={() => props.worker && openCall(props.worker.phoneE164)}
                style={({ pressed }) => [styles.contactActionBtn, isDark ? styles.contactActionBtnDark : styles.contactActionBtnLight, pressed && styles.pressed]}
              >
                <Phone size={20} color="#0B6E4F" />
                <Text style={[styles.contactActionBtnText, { color: isDark ? '#FFFFFF' : '#0B0D10' }]}>Call Now</Text>
              </Pressable>
              <Pressable
                onPress={() => props.worker && openWhatsApp(props.worker.whatsappE164)}
                style={({ pressed }) => [styles.contactActionBtn, isDark ? styles.contactActionBtnDark : styles.contactActionBtnLight, pressed && styles.pressed]}
              >
                <MessageCircle size={20} color="#0B6E4F" />
                <Text style={[styles.contactActionBtnText, { color: isDark ? '#FFFFFF' : '#0B0D10' }]}>WhatsApp</Text>
              </Pressable>
            </View>
          )}
          
          <Pressable onPress={props.onClose} style={({ pressed }) => [styles.primaryBtn, pressed && styles.pressed]}>
            <Text style={styles.primaryBtnText}>{t('close')}</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

function WorkerRequestPopup(props: {
  visible: boolean;
  customerName: string;
  location: string;
  issueDescription: string;
  requestedTime?: string;
  onAccept: () => void;
  onReject: () => void;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  
  return (
    <Modal visible={props.visible} animationType="slide" transparent onRequestClose={props.onClose}>
      <View style={styles.modalBackdrop}>
        <View style={[styles.workerRequestCard, isDark ? styles.workerRequestCardDark : styles.workerRequestCardLight]}>
          <View style={styles.workerRequestHeader}>
            <Text style={[styles.workerRequestTitle, { color: isDark ? '#FFFFFF' : '#0B0D10' }]}>New Service Request</Text>
            <Pressable onPress={props.onClose} style={({ pressed }) => [styles.closeModalBtn, pressed && styles.pressed]}>
              <XCircle size={24} color={isDark ? '#9AA3B2' : '#6D7786'} />
            </Pressable>
          </View>
          
          <View style={[styles.workerRequestInfo, isDark ? styles.workerRequestInfoDark : styles.workerRequestInfoLight]}>
            <View style={styles.workerRequestInfoRow}>
              <Text style={[styles.workerRequestInfoLabel, { color: isDark ? '#9AA3B2' : '#6D7786' }]}>Customer Name</Text>
              <Text style={[styles.workerRequestInfoValue, { color: isDark ? '#FFFFFF' : '#0B0D10' }]}>{props.customerName}</Text>
            </View>
            <View style={styles.workerRequestInfoRow}>
              <Text style={[styles.workerRequestInfoLabel, { color: isDark ? '#9AA3B2' : '#6D7786' }]}>Location</Text>
              <Text style={[styles.workerRequestInfoValue, { color: isDark ? '#FFFFFF' : '#0B0D10' }]}>{props.location}</Text>
            </View>
            <View style={styles.workerRequestInfoRow}>
              <Text style={[styles.workerRequestInfoLabel, { color: isDark ? '#9AA3B2' : '#6D7786' }]}>Issue Description</Text>
              <Text style={[styles.workerRequestInfoValue, { color: isDark ? '#FFFFFF' : '#0B0D10' }]}>{props.issueDescription}</Text>
            </View>
            {props.requestedTime && (
              <View style={styles.workerRequestInfoRow}>
                <Text style={[styles.workerRequestInfoLabel, { color: isDark ? '#9AA3B2' : '#6D7786' }]}>Requested Time</Text>
                <Text style={[styles.workerRequestInfoValue, { color: isDark ? '#FFFFFF' : '#0B0D10' }]}>{props.requestedTime}</Text>
              </View>
            )}
          </View>
          
          <View style={styles.workerRequestActions}>
            <Pressable
              onPress={props.onReject}
              style={({ pressed }) => [styles.workerRequestRejectBtn, pressed && styles.pressed]}
            >
              <Text style={styles.workerRequestRejectBtnText}>{t('reject')}</Text>
            </Pressable>
            <Pressable
              onPress={props.onAccept}
              style={({ pressed }) => [styles.workerRequestAcceptBtn, pressed && styles.pressed]}
            >
              <Text style={styles.workerRequestAcceptBtnText}>{t('accept')}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function NotificationBanner(props: {
  visible: boolean;
  type: 'success' | 'info' | 'warning';
  message: string;
  onClose: () => void;
}) {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  
  const config = {
    success: {
      icon: CheckCircle2,
      bgColor: 'rgba(11,110,79,0.15)',
      borderColor: 'rgba(11,110,79,0.3)',
      iconColor: '#0B6E4F',
    },
    info: {
      icon: Send,
      bgColor: 'rgba(11,110,79,0.1)',
      borderColor: 'rgba(11,110,79,0.25)',
      iconColor: '#0B6E4F',
    },
    warning: {
      icon: AlertTriangle,
      bgColor: 'rgba(200,29,37,0.1)',
      borderColor: 'rgba(200,29,37,0.25)',
      iconColor: '#C81D25',
    },
  };
  
  const { icon: Icon, bgColor, borderColor, iconColor } = config[props.type];
  
  return (
    <Modal visible={props.visible} animationType="fade" transparent onRequestClose={props.onClose}>
      <View style={styles.notificationOverlay}>
        <View style={[styles.notificationBanner, { backgroundColor: bgColor, borderColor }]}>
          <View style={[styles.notificationIcon, { backgroundColor: isDark ? '#2A3240' : '#FFFFFF' }]}>
            <Icon size={20} color={iconColor} />
          </View>
          <Text style={[styles.notificationMessage, { color: isDark ? '#FFFFFF' : '#0B0D10' }]}>{props.message}</Text>
          <Pressable onPress={props.onClose} style={({ pressed }) => [styles.notificationClose, pressed && styles.pressed]}>
            <XCircle size={20} color={isDark ? '#9AA3B2' : '#6D7786'} />
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

function WorkerCard(props: { worker: Worker; onPress?: () => void; onBookNow?: () => void }) {
  const { t } = useTranslation();
  const scheme = useColorScheme();
  const w = props.worker;
  const isDark = scheme === 'dark';
  
  return (
    <Pressable onPress={props.onPress} style={({ pressed }) => [styles.card, isDark ? styles.cardDark : styles.cardLight, pressed && styles.pressed]}>
      <View style={styles.cardHeader}>
        <View style={styles.profileSection}>
          <View style={[styles.avatar, isDark ? styles.avatarDark : styles.avatarLight]}>
            {w.profileImage ? (
              <View style={styles.avatarImage} />
            ) : (
              <User size={24} color={isDark ? '#FFFFFF' : '#0B0D10'} />
            )}
            {w.isOnline && <View style={[styles.onlineIndicator, styles.onlineIndicatorActive]} />}
          </View>
          <View style={styles.cardTitleWrap}>
            <Text numberOfLines={1} style={[styles.cardTitle, { color: isDark ? '#FFFFFF' : '#0B0D10' }]}>
              {w.displayName}
            </Text>
            <View style={styles.professionRow}>
              {w.profession && (
                <>
                  <Briefcase size={12} color="#6D7786" />
                  <Text style={styles.professionText}>{w.profession}</Text>
                </>
              )}
            </View>
            <Text style={styles.cardSubtitle}>
              {w.localityLabel}
              {typeof w.distanceKm === 'number' ? ` • ${formatDistance(w.distanceKm)}` : ''}
            </Text>
          </View>
        </View>
        {w.isOnline ? (
          <View style={[styles.availableBadge, isDark ? styles.availableBadgeDark : styles.availableBadgeLight]}>
            <CheckCircle2 size={12} color="#0B6E4F" />
            <Text style={styles.availableBadgeText}>{t('availableNow')}</Text>
          </View>
        ) : (
          <View style={[styles.offlineBadge, isDark ? styles.offlineBadgeDark : styles.offlineBadgeLight]}>
            <XCircle size={12} color="#6D7786" />
            <Text style={styles.offlineBadgeText}>{t('offline')}</Text>
          </View>
        )}
      </View>

      <View style={styles.metaRow}>
        <View style={styles.metaItem}>
          <Star size={14} color="#FFB800" fill="#FFB800" />
          <Text style={[styles.metaText, { color: isDark ? '#E8ECF3' : '#0B0D10' }]}>{`${w.ratingAvg.toFixed(1)} (${w.ratingCount})`}</Text>
        </View>
        <Text style={[styles.metaDot, { color: isDark ? '#3D4656' : '#C4CAD6' }]}>•</Text>
        <View style={styles.metaItem}>
          <Briefcase size={14} color="#6D7786" />
          <Text style={[styles.metaText, { color: isDark ? '#E8ECF3' : '#0B0D10' }]}>{`${w.completedJobs} ${t('jobs')}`}</Text>
        </View>
        <Text style={[styles.metaDot, { color: isDark ? '#3D4656' : '#C4CAD6' }]}>•</Text>
        {w.responseTimeMins && (
          <>
            <View style={styles.metaItem}>
              <Clock size={14} color="#6D7786" />
              <Text style={[styles.metaText, { color: isDark ? '#E8ECF3' : '#0B0D10' }]}>{`${w.responseTimeMins} ${t('mins')}`}</Text>
            </View>
            <Text style={[styles.metaDot, { color: isDark ? '#3D4656' : '#C4CAD6' }]}>•</Text>
          </>
        )}
        <View style={styles.metaItem}>
          <Text style={[styles.metaText, { color: isDark ? '#E8ECF3' : '#0B0D10' }]}>{w.isVerified ? t('verified') : t('unverified')}</Text>
        </View>
      </View>

      {w.description && (
        <Text style={[styles.descriptionText, { color: isDark ? '#9AA3B2' : '#6D7786' }]} numberOfLines={2}>
          {w.description}
        </Text>
      )}

      {Array.isArray(w.badges) && w.badges.length > 0 ? (
        <View style={styles.pillRow}>
          {w.badges.slice(0, 3).map((b: string) => (
            <View key={b} style={[styles.pill, isDark ? styles.pillDark : styles.pillLight]}>
              <Text style={[styles.pillText, { color: isDark ? '#E8ECF3' : '#0B0D10' }]}>{b}</Text>
            </View>
          ))}
          {w.emergencyAvailable && (
            <View style={[styles.pill, styles.pillEmergency]}>
              <AlertTriangle size={12} color="#C81D25" />
              <Text style={styles.pillTextEmergency}>{t('emergencyService')}</Text>
            </View>
          )}
        </View>
      ) : w.emergencyAvailable ? (
        <View style={styles.pillRow}>
          <View style={[styles.pill, styles.pillEmergency]}>
            <AlertTriangle size={12} color="#C81D25" />
            <Text style={styles.pillTextEmergency}>{t('emergencyService')}</Text>
          </View>
        </View>
      ) : null}

      <View style={styles.actionsRow}>
        <Pressable 
          onPress={props.onBookNow}
          style={({ pressed }) => [styles.bookNowBtn, pressed && styles.pressed]}
        >
          <Text style={styles.bookNowBtnText}>{t('bookNow')}</Text>
        </Pressable>
        <Pressable 
          onPress={() => {
            Alert.alert('Contact Disabled', 'Contact options will be available after the worker accepts your request');
          }}
          style={({ pressed }) => [styles.actionBtn, styles.actionBtnDisabled, pressed && styles.pressed]}
        >
          <Phone size={16} color="#6D7786" />
        </Pressable>
        <Pressable
          onPress={() => {
            Alert.alert('Contact Disabled', 'Contact options will be available after the worker accepts your request');
          }}
          style={({ pressed }) => [styles.actionBtn, styles.actionBtnDisabled, pressed && styles.pressed]}
        >
          <MessageCircle size={16} color="#6D7786" />
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
  const [locationName, setLocationName] = useState<string | null>(null);
  const [usingLastKnown, setUsingLastKnown] = useState(false);
  const [locStatus, setLocStatus] = useState<'idle' | 'loading' | 'granted' | 'denied' | 'error'>('idle');
  const [locError, setLocError] = useState<string | null>(null);

  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(false);
  const [requestOpen, setRequestOpen] = useState(false);
  const [requestText, setRequestText] = useState('');
  const [requestSending, setRequestSending] = useState(false);
  
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null);
  const [bookingStatus, setBookingStatus] = useState<BookingStatus | null>(null);

  const emergencyCategories = useMemo(() => categories.filter((c) => c.isEmergency), [categories]);

  async function refreshLocation() {
    setLocStatus('loading');
    setLocError(null);
    const res = await requestAndGetCurrentLocation();
    
    console.log('Location response:', res);
    
    if (res.status === 'granted') {
      setCoords(res.coords);
      const name = res.locationName || getLocationNameFromCoords(res.coords.lat, res.coords.lng);
      setLocationName(name);
      console.log('Setting location name:', name);
      setUsingLastKnown(false);
      setLocStatus('granted');
      return;
    }
    if (res.status === 'denied') {
      setCoords(res.lastKnown);
      const name = res.locationName || (res.lastKnown ? getLocationNameFromCoords(res.lastKnown.lat, res.lastKnown.lng) : null);
      setLocationName(name);
      console.log('Setting location name (denied):', name);
      setUsingLastKnown(Boolean(res.lastKnown));
      setLocStatus('denied');
      return;
    }
    setCoords(res.lastKnown);
    const name = res.locationName || (res.lastKnown ? getLocationNameFromCoords(res.lastKnown.lat, res.lastKnown.lng) : null);
    setLocationName(name);
    console.log('Setting location name (error):', name);
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
            {locationName || (coords ? `${coords.lat.toFixed(3)}, ${coords.lng.toFixed(3)}` : t('locationPermissionTitle'))}
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
            renderItem={({ item }) => (
              <WorkerCard 
                worker={item} 
                onBookNow={() => {
                  setSelectedWorker(item);
                  setBookingModalOpen(true);
                }}
              />
            )}
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
      
      {selectedWorker && (
        <BookingModal
          visible={bookingModalOpen}
          worker={selectedWorker}
          onClose={() => {
            setBookingModalOpen(false);
            setSelectedWorker(null);
          }}
          onConfirm={async (bookingData) => {
            setBookingModalOpen(false);
            setBookingStatus('pending');
            try {
              // Send booking request to the selected worker
              await api.bookings.create({
                workerId: selectedWorker.id,
                address: bookingData.address,
                problemDescription: bookingData.description,
                preferredTime: bookingData.preferredTime,
              });
              Alert.alert(t('bookingConfirmed'), 'Your request has been sent to the worker');
            } catch (e) {
              Alert.alert('Error', 'Failed to send booking request');
              setBookingStatus(null);
            }
          }}
        />
      )}
      
      {bookingStatus && (
        <BookingStatusView
          status={bookingStatus}
          worker={selectedWorker}
          onClose={() => setBookingStatus(null)}
        />
      )}
    </SafeAreaView>
  );
}

function SettingsScreen({ navigation }: any) {
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
                <Stack.Screen name="Admin" component={AdminPanelScreen as any} />
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
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
  },
  cardDark: {
    backgroundColor: '#151A22',
    borderColor: '#2A3240',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  cardLight: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E3E6EE',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  avatarDark: {
    backgroundColor: '#2A3240',
  },
  avatarLight: {
    backgroundColor: '#F1F3F8',
  },
  avatarImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#0B6E4F',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
  },
  onlineIndicatorActive: {
    backgroundColor: '#0B6E4F',
    borderColor: '#151A22',
  },
  professionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  professionText: {
    fontSize: 12,
    color: '#6D7786',
    fontWeight: '600',
  },
  availableBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  availableBadgeDark: {
    backgroundColor: 'rgba(11,110,79,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(11,110,79,0.3)',
  },
  availableBadgeLight: {
    backgroundColor: 'rgba(11,110,79,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(11,110,79,0.25)',
  },
  availableBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0B6E4F',
  },
  offlineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  offlineBadgeDark: {
    backgroundColor: 'rgba(109,119,134,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(109,119,134,0.2)',
  },
  offlineBadgeLight: {
    backgroundColor: 'rgba(109,119,134,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(109,119,134,0.15)',
  },
  offlineBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6D7786',
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
    marginTop: 12,
    gap: 6,
    flexWrap: 'wrap',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    fontWeight: '600',
  },
  metaDot: {
    fontSize: 12,
  },
  descriptionText: {
    fontSize: 13,
    marginTop: 10,
    lineHeight: 18,
    fontWeight: '500',
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
  },
  pillDark: {
    backgroundColor: '#2A3240',
  },
  pillLight: {
    backgroundColor: '#F1F3F8',
  },
  pillText: {
    fontSize: 12,
    fontWeight: '600',
  },
  pillEmergency: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(200,29,37,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(200,29,37,0.25)',
  },
  pillTextEmergency: {
    fontSize: 12,
    fontWeight: '700',
    color: '#C81D25',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 14,
  },
  priceSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#2A3240',
  },
  priceLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  priceValue: {
    fontSize: 16,
    fontWeight: '800',
  },
  bookNowBtn: {
    flex: 1,
    backgroundColor: '#0B6E4F',
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0B6E4F',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  bookNowBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
  },
  actionBtn: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnDark: {
    backgroundColor: 'rgba(11,110,79,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(11,110,79,0.25)',
  },
  actionBtnLight: {
    backgroundColor: 'rgba(11,110,79,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(11,110,79,0.2)',
  },
  actionBtnDisabled: {
    opacity: 0.4,
  },
  contactActionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  contactActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  contactActionBtnDark: {
    backgroundColor: 'rgba(11,110,79,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(11,110,79,0.25)',
  },
  contactActionBtnLight: {
    backgroundColor: 'rgba(11,110,79,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(11,110,79,0.2)',
  },
  contactActionBtnText: {
    fontSize: 14,
    fontWeight: '700',
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
  bookingModalCard: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '90%',
  },
  bookingModalCardDark: {
    backgroundColor: '#151A22',
  },
  bookingModalCardLight: {
    backgroundColor: '#FFFFFF',
  },
  bookingModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  bookingModalTitle: {
    fontSize: 20,
    fontWeight: '800',
  },
  closeModalBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  workerSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    marginBottom: 16,
  },
  workerSummaryDark: {
    backgroundColor: '#2A3240',
  },
  workerSummaryLight: {
    backgroundColor: '#F1F3F8',
  },
  avatarSmall: {
    width: 48,
    height: 48,
  },
  workerSummaryInfo: {
    flex: 1,
    marginLeft: 12,
  },
  workerSummaryName: {
    fontSize: 16,
    fontWeight: '800',
  },
  workerSummaryProfession: {
    fontSize: 13,
    color: '#6D7786',
    fontWeight: '600',
    marginTop: 2,
  },
  workerSummaryPrice: {
    alignItems: 'flex-end',
  },
  workerSummaryPriceLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  workerSummaryPriceValue: {
    fontSize: 16,
    fontWeight: '800',
  },
  bookingSection: {
    marginBottom: 16,
  },
  bookingSectionLast: {
    marginBottom: 0,
  },
  bookingSectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 8,
  },
  dateSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  dateSelectorDark: {
    backgroundColor: '#2A3240',
    borderColor: '#3D4656',
  },
  dateSelectorLight: {
    backgroundColor: '#F1F3F8',
    borderColor: '#E3E6EE',
  },
  dateSelectorText: {
    fontSize: 14,
    fontWeight: '600',
  },
  timeSlotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  timeSlot: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    minWidth: 80,
    alignItems: 'center',
  },
  timeSlotDark: {
    backgroundColor: '#2A3240',
    borderColor: '#3D4656',
  },
  timeSlotLight: {
    backgroundColor: '#F1F3F8',
    borderColor: '#E3E6EE',
  },
  timeSlotActive: {
    backgroundColor: '#0B6E4F',
    borderColor: '#0B6E4F',
  },
  timeSlotText: {
    fontSize: 13,
    fontWeight: '600',
  },
  timeSlotTextActive: {
    color: '#FFFFFF',
  },
  bookingInput: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 14,
    fontWeight: '600',
  },
  bookingInputDark: {
    backgroundColor: '#2A3240',
    borderColor: '#3D4656',
  },
  bookingInputLight: {
    backgroundColor: '#F1F3F8',
    borderColor: '#E3E6EE',
  },
  bookingInputTextarea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  imageUploadBtn: {
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    borderStyle: 'dashed',
  },
  imageUploadBtnDark: {
    backgroundColor: '#2A3240',
    borderColor: '#3D4656',
  },
  imageUploadBtnLight: {
    backgroundColor: '#F1F3F8',
    borderColor: '#E3E6EE',
  },
  imageUploadBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },
  bookingModalActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 20,
  },
  secondaryBtnDark: {
    backgroundColor: '#2A3240',
    borderColor: '#3D4656',
  },
  secondaryBtnLight: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E3E6EE',
  },
  bookingStatusCard: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
  },
  bookingStatusCardDark: {
    backgroundColor: '#151A22',
  },
  bookingStatusCardLight: {
    backgroundColor: '#FFFFFF',
  },
  bookingStatusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  bookingStatusTitle: {
    fontSize: 20,
    fontWeight: '800',
  },
  statusSteps: {
    marginBottom: 24,
  },
  statusStep: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusStepIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  statusStepIconDark: {
    backgroundColor: '#2A3240',
  },
  statusStepIconLight: {
    backgroundColor: '#F1F3F8',
  },
  statusStepIconCompleted: {
    backgroundColor: 'rgba(11,110,79,0.15)',
  },
  statusStepLabel: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  statusStepLabelCompleted: {
    color: '#0B6E4F',
    fontWeight: '700',
  },
  statusStepLine: {
    position: 'absolute',
    left: 19,
    top: 40,
    width: 2,
    height: 36,
  },
  statusStepLineDark: {
    backgroundColor: '#3D4656',
  },
  statusStepLineLight: {
    backgroundColor: '#E3E6EE',
  },
  statusStepLineCompleted: {
    backgroundColor: '#0B6E4F',
  },
  statusCurrentInfo: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 20,
  },
  statusCurrentInfoDark: {
    backgroundColor: '#2A3240',
  },
  statusCurrentInfoLight: {
    backgroundColor: '#F1F3F8',
  },
  statusCurrentLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  statusCurrentValue: {
    fontSize: 16,
    fontWeight: '800',
  },
  statusIconContainer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  statusIconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  workerRequestCard: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
  },
  workerRequestCardDark: {
    backgroundColor: '#151A22',
  },
  workerRequestCardLight: {
    backgroundColor: '#FFFFFF',
  },
  workerRequestHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  workerRequestTitle: {
    fontSize: 20,
    fontWeight: '800',
  },
  workerRequestInfo: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 20,
  },
  workerRequestInfoDark: {
    backgroundColor: '#2A3240',
  },
  workerRequestInfoLight: {
    backgroundColor: '#F1F3F8',
  },
  workerRequestInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  workerRequestInfoLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  workerRequestInfoValue: {
    fontSize: 14,
    fontWeight: '700',
  },
  workerRequestEarningValue: {
    fontSize: 16,
    fontWeight: '800',
  },
  workerRequestTimer: {
    marginBottom: 20,
  },
  workerRequestProgressBar: {
    height: 4,
    backgroundColor: '#2A3240',
    borderRadius: 2,
    marginBottom: 8,
    overflow: 'hidden',
  },
  workerRequestProgressFill: {
    height: '100%',
    backgroundColor: '#0B6E4F',
    borderRadius: 2,
  },
  workerRequestTimerText: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  workerRequestActions: {
    flexDirection: 'row',
    gap: 12,
  },
  workerRequestRejectBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#C81D25',
    backgroundColor: 'rgba(200,29,37,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  workerRequestRejectBtnText: {
    color: '#C81D25',
    fontWeight: '800',
    fontSize: 14,
  },
  workerRequestAcceptBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: '#0B6E4F',
    alignItems: 'center',
    justifyContent: 'center',
  },
  workerRequestAcceptBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
  },
  notificationOverlay: {
    flex: 1,
    justifyContent: 'flex-start',
    paddingTop: 60,
    paddingHorizontal: 16,
  },
  notificationBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
  },
  notificationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationMessage: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
  },
  notificationClose: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
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
