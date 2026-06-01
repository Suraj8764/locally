import React, { useEffect } from 'react';
import { View, Text, ScrollView, Pressable, Image, Dimensions, Linking, ActivityIndicator, Alert } from 'react-native';
import { ChevronLeft, Star, MapPin, Clock, ShieldCheck, Briefcase, Languages, BadgeCheck, Phone, MessageCircle, Image as ImageIcon, Award } from 'lucide-react-native';
import { useWorker } from '../../hooks/useWorkers';
import { LinearGradient } from 'expo-linear-gradient';
import { ProfileSection } from '../../components/worker/ProfileSection';
import { ReviewCard } from '../../components/worker/ReviewCard';
import { Avatar } from '../../components/ui/Avatar';

const { width } = Dimensions.get('window');
const HEADER_HEIGHT = 380;

export function WorkerProfileScreen({ navigation, route }: any) {
  // 5. Temporary debug logs
  console.log('Route Params:', route?.params);

  // 1 & 2. Safely read route parameters with robust fallbacks
  const workerParam = route?.params?.worker;
  const workerId = route?.params?.workerId || workerParam?.id;

  const { data: fetchedWorker, isLoading } = useWorker(workerId);
  
  // Use passed worker data immediately for instantaneous rendering, fallback to fetched worker
  const worker = workerParam || fetchedWorker;

  console.log('Active Worker Data:', worker);

  // 2. Beautiful Loading State
  if (isLoading && !worker) {
    return (
      <View className="flex-1 bg-[#0A0A0F] items-center justify-center">
        <ActivityIndicator size="large" color="#E8294C" />
        <Text className="text-textSecondary text-xs font-black uppercase tracking-widest mt-4">
          Loading Professional Profile...
        </Text>
      </View>
    );
  }

  // 3. Defensive Fallback if worker data remains missing
  if (!worker) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0A0A0F' }}>
        <Text style={{ color: '#FFF', fontSize: 16, fontWeight: 'bold', marginBottom: 10 }}>Worker data not found</Text>
        <Pressable 
          onPress={() => navigation.goBack()}
          className="bg-accent px-6 py-3 rounded-2xl"
        >
          <Text className="text-white font-black text-xs uppercase tracking-widest">Go Back</Text>
        </Pressable>
      </View>
    );
  }

  const dummyReviews = [
    { id: '1', name: 'Rahul Sharma', rating: 5, date: '2 days ago', comment: 'Excellent service! Professional and arrived on time. Highly recommended.' },
    { id: '2', name: 'Sonia Verma', rating: 4.5, date: '1 week ago', comment: 'Very skilled and polite. Fixed the issue quickly. Pricing is fair.' },
  ];

  return (
    <View className="flex-1 bg-[#0A0A0F]">
      {/* 4. Safe image rendering using static banner background */}
      <View style={{ height: HEADER_HEIGHT }} className="absolute top-0 left-0 right-0 z-0">
        <Image 
          source={{ 
            uri: worker?.profileImage || worker?.image || 'https://via.placeholder.com/300' 
          }} 
          className="w-full h-full" 
          resizeMode="cover" 
        />
        <LinearGradient
          colors={['transparent', 'rgba(10, 10, 15, 0.8)', '#0A0A0F']}
          className="absolute bottom-0 left-0 right-0 h-64"
        />
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
      >
        <View style={{ height: HEADER_HEIGHT - 60 }} />

        {/* 6. Main Worker Profile Info */}
        <View className="bg-[#0A0A0F] rounded-t-[40px] px-6 pt-8 pb-32">
          <View>
            {/* Name and Verification Badge */}
            <View className="flex-row justify-between items-start mb-2">
              <View className="flex-1">
                <View className="flex-row items-center gap-2 mb-1 flex-wrap">
                  <Text className="text-white text-3xl font-black tracking-tight">{worker?.displayName || 'Professional'}</Text>
                  {worker?.isVerified && <BadgeCheck size={24} color="#30D158" fill="rgba(48, 209, 88, 0.1)" />}
                </View>
                <Text className="text-accent font-black uppercase tracking-widest text-xs">
                  {worker?.profession || worker?.categoryId || 'Expert Service'}
                </Text>
              </View>
              {worker?.isOnline && (
                 <View className="bg-onlineGreen/10 border border-onlineGreen/30 px-3 py-1.5 rounded-full">
                    <Text className="text-onlineGreen text-[10px] font-black uppercase">Online</Text>
                 </View>
              )}
            </View>

            {/* Availability and Locality */}
            <View className="flex-row items-center gap-2 mb-8 mt-2 flex-wrap">
              <MapPin size={14} color="#8E8E93" />
              <Text className="text-textSecondary font-medium">{worker?.localityLabel || 'Nearby Area'}</Text>
              {worker?.distanceKm !== undefined && (
                <>
                  <View className="w-1.5 h-1.5 bg-white/20 rounded-full mx-1" />
                  <Text className="text-accent font-bold text-xs">{worker.distanceKm.toFixed(1)} km away</Text>
                </>
              )}
              <View className="w-1.5 h-1.5 bg-white/20 rounded-full mx-1" />
              <Clock size={14} color="#8E8E93" />
              <Text className="text-textSecondary font-medium">
                {worker?.workingHoursLabel ? `Available ${worker.workingHoursLabel}` : 'Available Now'}
              </Text>
            </View>

            {/* Stats Bar */}
            <View className="flex-row bg-surface border border-white/5 rounded-3xl p-6 mb-10 shadow-2xl shadow-black/50">
              <View className="flex-1 items-center border-r border-white/10">
                <View className="flex-row items-center mb-1">
                  <Star size={18} color="#FF9F0A" fill="#FF9F0A" />
                  <Text className="text-white font-black text-lg ml-1.5">
                    {worker?.ratingAvg ? worker.ratingAvg.toFixed(1) : '5.0'}
                  </Text>
                </View>
                <Text className="text-textSecondary text-[10px] uppercase font-bold tracking-widest">
                  {worker?.ratingCount || 0} reviews
                </Text>
              </View>
              <View className="flex-1 items-center border-r border-white/10">
                <Text className="text-white font-black text-lg mb-1">{worker?.completedJobs || 0}</Text>
                <Text className="text-textSecondary text-[10px] uppercase font-bold tracking-widest">Jobs Done</Text>
              </View>
              <View className="flex-1 items-center">
                <Text className="text-white font-black text-lg mb-1">{worker?.experienceYears || 0}y</Text>
                <Text className="text-textSecondary text-[10px] uppercase font-bold tracking-widest">Experience</Text>
              </View>
            </View>

            {/* About Section */}
            <ProfileSection title="About">
              <Text className="text-textSecondary leading-6 text-sm font-medium">
                {worker?.description || `Hi, I'm ${worker?.displayName || 'your professional'}, a highly skilled ${worker?.profession || worker?.categoryId || 'service partner'} dedicated to providing top-quality work. I handle every request with precision and care.`}
              </Text>
            </ProfileSection>

            {/* Skills chips */}
            {worker?.skills && worker.skills.length > 0 && (
              <ProfileSection title="Expertise">
                <View className="flex-row flex-wrap gap-2">
                  {worker.skills.map((skill: string) => (
                    <View key={skill} className="bg-surface border border-white/5 px-4 py-2 rounded-xl">
                      <Text className="text-textPrimary font-bold text-xs uppercase">{skill}</Text>
                    </View>
                  ))}
                </View>
              </ProfileSection>
            )}

            {/* Gallery */}
            <ProfileSection title="Gallery">
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="-mx-6 px-6">
                {[1, 2, 3].map(i => (
                  <View key={i} className="mr-3 overflow-hidden rounded-3xl bg-surface border border-white/5">
                    <LinearGradient
                      colors={['#13131A', '#0A0A0F']}
                      className="w-48 h-32 items-center justify-center"
                    >
                      <ImageIcon size={32} color="#8E8E93" opacity={0.5} />
                    </LinearGradient>
                  </View>
                ))}
              </ScrollView>
            </ProfileSection>

            {/* Certifications */}
            <ProfileSection title="Certifications">
              <View className="gap-3">
                {[
                  { id: '1', title: 'Certified Professional', issuer: 'National Skill Registry' },
                  { id: '2', title: 'Top Rated Expert 2024', issuer: 'Locally Community' },
                ].map(cert => (
                  <View key={cert.id} className="bg-surface border border-white/5 p-4 rounded-2xl flex-row items-center gap-4">
                    <View className="w-10 h-10 bg-accent/10 rounded-full items-center justify-center">
                      <Award size={20} color="#E8294C" />
                    </View>
                    <View>
                      <Text className="text-white font-bold text-sm">{cert.title}</Text>
                      <Text className="text-textSecondary text-[10px] uppercase font-bold tracking-widest">{cert.issuer}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </ProfileSection>

            {/* Languages */}
            {worker?.languages && worker.languages.length > 0 && (
              <ProfileSection title="Languages">
                <View className="flex-row flex-wrap gap-2">
                  {worker.languages.map((lang: string) => (
                    <View key={lang} className="bg-surface border border-white/5 px-4 py-2 rounded-xl flex-row items-center gap-2">
                      <Languages size={14} color="#F5F5F7" />
                      <Text className="text-textPrimary font-bold text-xs uppercase">{lang}</Text>
                    </View>
                  ))}
                </View>
              </ProfileSection>
            )}

            {/* Reviews Preview */}
            <ProfileSection title="Reviews">
              {dummyReviews.map(review => (
                <ReviewCard 
                  key={review.id}
                  name={review.name}
                  rating={review.rating}
                  date={review.date}
                  comment={review.comment}
                />
              ))}
              <Pressable className="mt-2">
                <Text className="text-accent font-black text-xs uppercase tracking-widest text-center">See all reviews</Text>
              </Pressable>
            </ProfileSection>

            {/* Service Area */}
            <ProfileSection title="Service Area">
              <View className="bg-surface border border-white/5 p-5 rounded-3xl flex-row items-center justify-between">
                <View className="flex-1">
                   <Text className="text-white font-bold text-sm mb-1">{worker?.localityLabel || 'Service Area'}</Text>
                   <Text className="text-textSecondary text-[10px] uppercase font-medium">
                     Covers {worker?.areaCoverageKm || 5}km radius
                   </Text>
                </View>
                <View className="w-12 h-12 bg-[#0A0A0F] rounded-2xl items-center justify-center">
                   <MapPin size={24} color="#E8294C" />
                </View>
              </View>
            </ProfileSection>
          </View>
        </View>
      </ScrollView>

      {/* Sticky Header with Call and Chat Actions */}
      <View className="absolute top-0 left-0 right-0 pt-14 px-6 flex-row items-center justify-between z-10">
        <Pressable 
          onPress={() => navigation.goBack()}
          className="w-12 h-12 bg-black/30 backdrop-blur-md rounded-2xl items-center justify-center"
        >
          <ChevronLeft size={24} color="#FFF" />
        </Pressable>
        <View className="flex-row gap-2">
           <Pressable 
             onPress={() => {
               Alert.alert('Contact Disabled', 'Contact options will be available after the worker accepts your request');
             }}
             className="w-12 h-12 bg-black/30 backdrop-blur-md rounded-2xl items-center justify-center opacity-40"
           >
             <Phone size={20} color="#8E8E93" />
           </Pressable>
           <Pressable 
             onPress={() => {
               Alert.alert('Contact Disabled', 'Contact options will be available after the worker accepts your request');
             }}
             className="w-12 h-12 bg-black/30 backdrop-blur-md rounded-2xl items-center justify-center opacity-40"
           >
             <MessageCircle size={20} color="#8E8E93" />
           </Pressable>
        </View>
      </View>

      {/* Sticky Bottom Booking Section */}
      <LinearGradient
        colors={['transparent', 'rgba(10, 10, 15, 0.95)', '#0A0A0F']}
        className="absolute bottom-0 left-0 right-0 p-6 pb-10"
      >
        <View className="bg-surface border border-white/10 rounded-[32px] p-5 shadow-2xl shadow-black/50">
          <Pressable 
            onPress={() => navigation.navigate('BookingSheet', { workerId: worker?.id, categoryId: worker?.categoryId })}
            className="w-full"
          >
            <LinearGradient
              colors={['#E8294C', '#FF453A']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              className="h-14 rounded-2xl items-center justify-center"
            >
              <Text className="text-white font-black text-sm uppercase tracking-[2px]">Book Now</Text>
            </LinearGradient>
          </Pressable>
        </View>
      </LinearGradient>
    </View>
  );
}
export default WorkerProfileScreen;
