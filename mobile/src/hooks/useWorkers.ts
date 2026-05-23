import { useQuery } from '@tanstack/react-query';
import { api } from '../api';

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: api.categories.list,
  });
}

export function useNearbyWorkers(params: {
  lat?: number;
  lng?: number;
  radiusKm: number;
  categoryId?: string;
  onlyOnline?: boolean;
}) {
  return useQuery({
    queryKey: ['nearbyWorkers', params],
    queryFn: () => api.workers.nearby(params as any),
    enabled: !!params.lat && !!params.lng,
  });
}

export function useWorker(id?: string) {
  return useQuery({
    queryKey: ['worker', id],
    queryFn: () => api.workers.getById(id!),
    enabled: !!id,
  });
}
