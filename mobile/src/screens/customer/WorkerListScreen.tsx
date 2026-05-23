import React, { useState } from 'react';
import { View, Text, FlatList, Pressable, TextInput } from 'react-native';
import { ChevronLeft, Search, Filter, MapPin } from 'lucide-react-native';
import { useNearbyWorkers } from '../../hooks/useWorkers';
import { useLocation } from '../../hooks/useLocation';
import { WorkerCard } from '../../components/worker/WorkerCard';
import { EmptyState } from '../../components/ui/EmptyState';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn } from 'react-native-reanimated';

export function WorkerListScreen({ navigation, route }: any) {
  const categoryId = route.params?.categoryId;
  const categoryName = route.params?.categoryName || (categoryId ? categoryId.charAt(0).toUpperCase() + categoryId.slice(1) : 'Workers');
  
  const { coords } = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [radiusKm, setRadiusKm] = useState(10);
  
  const { data: workers = [], isLoading, isRefetching, refetch } = useNearbyWorkers({
    lat: coords?.lat,
    lng: coords?.lng,
    radiusKm,
    categoryId,
  });

  const filteredWorkers = workers.filter(w => 
    w.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    w.profession?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderHeader = () => (
    <View className="pt-14 px-6 pb-4">
      <View className="flex-row items-center justify-between mb-6">
        <Pressable 
          onPress={() => navigation.goBack()}
          className="w-12 h-12 bg-surface border border-white/5 rounded-2xl items-center justify-center"
        >
          <ChevronLeft size={24} color="#F5F5F7" />
        </Pressable>
        <View className="items-center">
          <Text className="text-textSecondary text-[10px] font-bold uppercase tracking-[2px]">Category</Text>
          <Text className="text-white text-xl font-black">{categoryName}</Text>
        </View>
        <Pressable 
          className="w-12 h-12 bg-surface border border-white/5 rounded-2xl items-center justify-center"
        >
          <Filter size={20} color="#F5F5F7" />
        </Pressable>
      </View>

      <View className="flex-row items-center bg-surface border border-white/5 h-14 rounded-2xl px-4 mb-2">
        <Search size={20} color="#8E8E93" />
        <TextInput
          placeholder={`Search ${categoryName}...`}
          placeholderTextColor="#8E8E93"
          className="flex-1 ml-3 text-textPrimary text-base"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>
      
      <View className="flex-row items-center gap-2 mt-2">
        <MapPin size={12} color="#E8294C" />
        <Text className="text-textSecondary text-xs">
          Showing workers within <Text className="text-textPrimary font-bold">{radiusKm}km</Text>
        </Text>
      </View>
    </View>
  );

  const renderSkeleton = () => (
    <View className="px-6 gap-y-4">
      {[1, 2, 3, 4].map(i => (
        <View key={i} className="bg-surface/50 border border-white/5 rounded-3xl h-44 animate-pulse" />
      ))}
    </View>
  );

  return (
    <View className="flex-1 bg-background">
      {/* Background Glow */}
      <View className="absolute top-0 left-0 right-0 h-80 opacity-10">
        <LinearGradient colors={['#E8294C', 'transparent']} className="flex-1" />
      </View>

      {renderHeader()}

      <FlatList
        data={filteredWorkers}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <View className="px-6">
            <WorkerCard 
              worker={item} 
              index={index}
              onPress={() => navigation.navigate('WorkerProfile', { workerId: item.id, worker: item })}
              onBook={() => navigation.navigate('WorkerProfile', { workerId: item.id, worker: item })}
            />
          </View>
        )}
        contentContainerStyle={{ paddingBottom: 40, paddingTop: 10 }}
        showsVerticalScrollIndicator={false}
        refreshing={isRefetching}
        onRefresh={refetch}
        ListEmptyComponent={() => (
          <View className="mt-20 px-10">
            {isLoading ? (
              renderSkeleton()
            ) : (
              <Animated.View entering={FadeIn}>
                <EmptyState 
                  title="No Professionals Found" 
                  description={`We couldn't find any ${categoryName.toLowerCase()} professionals in your area.`}
                  actionLabel="Broaden Search"
                  onAction={() => setRadiusKm(prev => prev + 10)}
                />
              </Animated.View>
            )}
          </View>
        )}
      />
    </View>
  );
}

