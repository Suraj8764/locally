import React from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { useUserBookings } from '../../hooks/useBooking';
import { useAuthStore } from '../../store/authStore';
import { EmptyState } from '../../components/ui/EmptyState';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { format } from 'date-fns';

export function JobsScreen({ navigation }: any) {
  const { user } = useAuthStore();
  const { data: bookings = [], isLoading } = useUserBookings(user?.id);

  const activeBookings = bookings.filter(b => !['completed', 'cancelled_by_customer', 'cancelled_by_worker'].includes(b.status));
  const pastBookings = bookings.filter(b => ['completed', 'cancelled_by_customer', 'cancelled_by_worker'].includes(b.status));

  return (
    <View className="flex-1 bg-background">
      <View className="pt-14 px-5 pb-4 border-b border-border bg-surface">
        <Text className="text-2xl font-extrabold text-white">Your Jobs</Text>
      </View>

      <ScrollView className="flex-1 p-5">
        {activeBookings.length > 0 && (
          <View className="mb-8">
            <Text className="text-white font-bold text-lg mb-4">Active Jobs</Text>
            {activeBookings.map(b => (
              <Pressable key={b.id} onPress={() => navigation.navigate('ActiveJob', { bookingId: b.id })}>
                <Card className="mb-4 border-accent/50 bg-accent/5">
                  <View className="flex-row justify-between mb-2">
                    <Text className="text-white font-bold">{b.categoryId}</Text>
                    <Badge label="In Progress" variant="warning" />
                  </View>
                  <Text className="text-textSecondary mb-2" numberOfLines={2}>{b.address}</Text>
                  <Text className="text-accent font-bold">Manage Job →</Text>
                </Card>
              </Pressable>
            ))}
          </View>
        )}

        <Text className="text-white font-bold text-lg mb-4">Past Jobs</Text>
        {isLoading ? (
          Array(3).fill(0).map((_, i) => (
             <Skeleton key={i} height={100} style={{ marginBottom: 16 }} />
          ))
        ) : pastBookings.length === 0 ? (
          <EmptyState 
            title="No Past Jobs" 
            description="You haven't completed any jobs yet."
          />
        ) : (
          pastBookings.map(b => (
            <Card key={b.id} className="mb-4 opacity-70">
              <View className="flex-row justify-between mb-2">
                <Text className="text-white font-bold">{b.categoryId}</Text>
                <Text className="text-textSecondary">{format(new Date(b.createdAtMs), 'MMM d, yyyy')}</Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-textSecondary flex-1 mr-4" numberOfLines={1}>{b.address}</Text>
                <Text className="text-white font-bold">₹{b.finalPrice || 0}</Text>
              </View>
            </Card>
          ))
        )}
      </ScrollView>
    </View>
  );
}
