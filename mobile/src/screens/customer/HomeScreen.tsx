import React, { useState } from 'react';
import { View, Text, ScrollView, RefreshControl, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useLocation } from '../../hooks/useLocation';
import { useCategories, useNearbyWorkers } from '../../hooks/useWorkers';
import { WorkerCard } from '../../components/worker/WorkerCard';
import { Skeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { LocationHeader } from '../../components/home/LocationHeader';
import { PremiumSearchBar } from '../../components/home/PremiumSearchBar';
import { CategoryCard } from '../../components/home/CategoryCard';
import { EmergencyBanner } from '../../components/home/EmergencyBanner';
import { LinearGradient } from 'expo-linear-gradient';
import { LocationPickerModal } from '../../components/home/LocationPickerModal';

const REQUESTED_CATEGORIES = [
  { id: 'plumber', name: 'Plumber', icon: '🔧', color: ['#E8294C', '#FF453A'] },
  { id: 'electrician', name: 'Electrician', icon: '⚡', color: ['#FFD60A', '#FF9F0A'] },
  { id: 'carpenter', name: 'Carpenter', icon: '🪚', color: ['#8B5CF6', '#6366F1'] },
  { id: 'mechanic', name: 'Mechanic', icon: '🚗', color: ['#30D158', '#28CD41'] },
  { id: 'ac_repair', name: 'AC Repair', icon: '❄️', color: ['#0A84FF', '#007AFF'] },
  { id: 'cleaning', name: 'Cleaning', icon: '🧹', color: ['#FF375F', '#FF2D55'] },
  { id: 'tutor', name: 'Tutor', icon: '📚', color: ['#BF5AF2', '#AF52DE'] },
];

export function HomeScreen({ navigation }: any) {
  const { t, i18n } = useTranslation();
  const { coords, setCoords, status: locStatus, refresh: refreshLoc } = useLocation();
  const [radiusKm, setRadiusKm] = useState(5);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const { data: apiCategories = [], isLoading: catLoading } = useCategories();
  const { 
    data: workers = [], 
    isLoading: workersLoading,
    refetch: refetchWorkers,
    isRefetching
  } = useNearbyWorkers({
    lat: coords?.lat,
    lng: coords?.lng,
    radiusKm,
    onlyOnline: true
  });

  const onRefresh = () => {
    refreshLoc();
    if (coords) refetchWorkers();
  };

  const locationLabel = coords 
    ? `${coords.lat.toFixed(2)}, ${coords.lng.toFixed(2)}` 
    : 'Finding location...';

  // Live filter categories as user types
  const filteredCategories = REQUESTED_CATEGORIES.filter(cat => 
    cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cat.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Live filter nearby workers as user types
  const filteredWorkers = workers.filter(w => 
    w.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    w.categoryId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (w.profession && w.profession.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <View className="flex-1 bg-background">
      {/* Top Background Glow */}
      <View className="absolute top-0 left-0 right-0 h-96 opacity-20">
        <LinearGradient
          colors={['#E8294C', 'transparent']}
          className="flex-1"
        />
      </View>

      <View className="flex-1 pt-14">
        <LocationHeader 
          locationName={locationLabel}
          onProfilePress={() => navigation.navigate('ProfileTab')}
          onLocationPress={() => setShowLocationPicker(true)}
        />

        <LocationPickerModal 
          visible={showLocationPicker}
          onClose={() => setShowLocationPicker(false)}
          onLocationSelect={(address, newCoords) => {
            setCoords(newCoords);
          }}
          onUseCurrentLocation={refreshLoc}
        />

        <ScrollView 
          className="flex-1"
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl 
              refreshing={isRefetching} 
              onRefresh={onRefresh} 
              tintColor="#E8294C" 
              progressBackgroundColor="#13131A"
            />
          }
        >
          {/* Functional Real-Time Search Bar */}
          <PremiumSearchBar 
            placeholder="Search Plumber, Electrician..."
            value={searchQuery}
            onChangeText={(text) => setSearchQuery(text)}
            onClear={() => setSearchQuery('')}
          />

          <EmergencyBanner 
            onPress={() => navigation.navigate('Emergency')}
          />

          {/* Categories Section */}
          <View className="mb-10">
            <View className="px-6 flex-row items-center justify-between mb-5">
              <View>
                <Text className="text-textPrimary font-black text-2xl tracking-tight">
                  Categories
                </Text>
                <Text className="text-textSecondary text-[10px] uppercase tracking-widest font-bold">
                  What do you need today?
                </Text>
              </View>
              <Pressable 
                onPress={() => navigation.navigate('CategoriesTab')}
                className="bg-surface border border-border px-4 py-2 rounded-xl"
              >
                <Text className="text-accent font-bold text-xs">View All</Text>
              </Pressable>
            </View>
            
            {filteredCategories.length === 0 ? (
              <View className="px-6">
                <Text className="text-textSecondary text-xs italic">No matching categories found</Text>
              </View>
            ) : (
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false} 
                contentContainerStyle={{ paddingHorizontal: 24 }}
              >
                {filteredCategories.map(cat => (
                  <CategoryCard 
                    key={cat.id}
                    id={cat.id}
                    name={cat.name}
                    icon={cat.icon}
                    color={cat.color}
                    onPress={() => navigation.navigate('WorkerList', { categoryId: cat.id })}
                  />
                ))}
              </ScrollView>
            )}
          </View>

          {/* Nearby Workers Section */}
          <View className="px-6 mb-10">
            <View className="flex-row items-center justify-between mb-5">
              <View>
                <Text className="text-textPrimary font-black text-2xl tracking-tight">
                  Nearby Workers
                </Text>
                <Text className="text-textSecondary text-[10px] uppercase tracking-widest font-bold">
                  Top professionals near you
                </Text>
              </View>
              <View className="bg-accent/10 border border-accent/30 px-3 py-1.5 rounded-full">
                <Text className="text-accent text-[10px] font-black uppercase">{radiusKm}KM Radius</Text>
              </View>
            </View>

            {!coords ? (
              <EmptyState 
                title="Location Required" 
                description="We need your location to find nearby workers." 
                actionLabel="Enable Location"
                onAction={refreshLoc}
              />
            ) : workersLoading ? (
              Array(2).fill(0).map((_, i) => (
                <View key={i} className="mb-4 bg-surface/40 border border-white/5 rounded-3xl p-4 animate-pulse">
                  <View className="flex-row gap-4">
                    <View className="w-[76px] h-[76px] bg-white/5 rounded-2xl" />
                    <View className="flex-1 justify-center gap-2">
                      <View className="h-5 w-32 bg-white/10 rounded-lg" />
                      <View className="h-3.5 w-24 bg-[#E8294C]/10 rounded-md" />
                      <View className="flex-row gap-2 mt-1">
                        <View className="h-4 w-12 bg-white/5 rounded-md" />
                        <View className="h-4 w-12 bg-white/5 rounded-md" />
                      </View>
                    </View>
                  </View>
                  <View className="flex-row justify-between items-center mt-4 pt-4 border-t border-white/5">
                    <View className="h-8 w-20 bg-white/5 rounded-xl" />
                    <View className="h-4 w-24 bg-white/5 rounded-md" />
                  </View>
                </View>
              ))
            ) : filteredWorkers.length === 0 ? (
              <View className="bg-surface border border-border/50 p-8 rounded-3xl items-center">
                <Text className="text-textSecondary text-center font-medium">
                  {searchQuery.length > 0 
                    ? `No nearby professionals match "${searchQuery}"`
                    : "No active workers found in your area. Try increasing search radius."}
                </Text>
              </View>
            ) : (
              filteredWorkers.slice(0, 3).map(w => (
                 <WorkerCard 
                   key={w.id} 
                   worker={w} 
                   onPress={() => navigation.navigate('WorkerProfile', { workerId: w.id, worker: w })}
                   onBook={() => navigation.navigate('WorkerProfile', { workerId: w.id, worker: w })}
                 />
              ))
            )}
          </View>

          {/* Available Section */}
          <View className="px-6 pb-20">
            <View className="mb-5">
              <Text className="text-textPrimary font-black text-2xl tracking-tight">
                Available Now
              </Text>
              <Text className="text-textSecondary text-[10px] uppercase tracking-widest font-bold">
                Instantly bookable services
              </Text>
            </View>

            {filteredWorkers.length > 3 ? (
              filteredWorkers.slice(3).map(w => (
                <WorkerCard 
                  key={w.id} 
                  worker={w} 
                  onPress={() => navigation.navigate('WorkerProfile', { workerId: w.id, worker: w })}
                  onBook={() => navigation.navigate('WorkerProfile', { workerId: w.id, worker: w })}
                />
              ))
            ) : (
              filteredWorkers.length <= 3 && filteredWorkers.length > 0 ? (
                 <View className="bg-surface/50 border border-border/50 p-6 rounded-3xl items-center">
                    <Text className="text-textSecondary text-xs font-bold text-center uppercase tracking-widest">
                      Check back later for more updates
                    </Text>
                 </View>
              ) : null
            )}
          </View>
        </ScrollView>
      </View>
    </View>
  );
}
export default HomeScreen;
