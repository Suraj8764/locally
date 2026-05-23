import { create } from 'zustand';
import { Booking } from '../types';

interface WorkerState {
  isOnline: boolean;
  activeJob: Booking | null;
  todayEarnings: number;
  setOnline: (isOnline: boolean) => void;
  setActiveJob: (job: Booking | null) => void;
  setTodayEarnings: (amount: number) => void;
}

export const useWorkerStore = create<WorkerState>((set) => ({
  isOnline: false,
  activeJob: null,
  todayEarnings: 0,
  setOnline: (isOnline) => set({ isOnline }),
  setActiveJob: (activeJob) => set({ activeJob }),
  setTodayEarnings: (todayEarnings) => set({ todayEarnings }),
}));
