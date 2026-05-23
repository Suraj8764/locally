import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useBookingStore } from '../store/bookingStore';
import { api } from '../api';

export function useCreateBooking() {
  const { setActiveBooking } = useBookingStore();

  return useMutation({
    mutationFn: api.bookings.create,
    onSuccess: (data: any) => {
      setActiveBooking(data);
    },
  });
}

export function useUpdateBookingStatus() {
  const { updateBookingStatus } = useBookingStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api.bookings.updateStatus(id, status),
    onSuccess: (data: any) => {
      updateBookingStatus(data.status);
      queryClient.invalidateQueries({ queryKey: ['userBookings'] });
    },
  });
}

export function useUserBookings(userId?: string) {
  return useQuery({
    queryKey: ['userBookings', userId],
    queryFn: () => api.bookings.getUserBookings(userId!),
    enabled: !!userId,
  });
}
