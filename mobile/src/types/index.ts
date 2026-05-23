export type UserRole = 'customer' | 'worker';

export type User = {
  id: string;
  phoneE164: string;
  displayName?: string;
  profileImage?: string;
  createdAtMs: number;
};

export type Category = {
  id: string;
  nameEn: string;
  nameHi: string;
  nameOr: string;
  isEmergency: boolean;
};

export type Worker = {
  id: string;
  displayName: string;
  phoneE164: string;
  whatsappE164: string;
  categoryId: string;
  languages: Array<'or' | 'hi' | 'en'>;
  experienceYears: number;
  isOnline: boolean;
  isVerified: boolean;
  trustScore: number;
  ratingAvg: number;
  ratingCount: number;
  completedJobs: number;
  localityLabel: string;
  areaCoverageKm: number;
  location: { lat: number; lng: number };
  workingHoursLabel: string;
  emergencyAvailable: boolean;
  distanceKm?: number;
  badges?: string[];
  profileImage?: string;
  profession?: string;
  description?: string;
  estimatedStartingPrice?: number;
  responseTimeMins?: number;
};

export type BookingStatus = 
  | 'pending'
  | 'accepted'
  | 'on_the_way'
  | 'started'
  | 'completed'
  | 'cancelled_by_customer'
  | 'cancelled_by_worker';

export type Booking = {
  id: string;
  customerId: string;
  workerId: string;
  categoryId: string;
  status: BookingStatus;
  createdAtMs: number;
  scheduledAtMs?: number;
  address: string;
  location: { lat: number; lng: number };
  problemDescription: string;
  issueImageUrl?: string;
  isEmergency: boolean;
  estimatedPrice?: number;
  finalPrice?: number;
  paymentMethod?: PaymentMethod;
  paymentStatus?: 'pending' | 'completed';
  worker?: Worker;
};

export type PaymentMethod = 'cash' | 'upi' | 'razorpay';

export type LeadRequest = {
  id: string;
  createdAtMs: number;
  categoryId: string;
  requirement: string;
  userPhone?: string;
  location: { lat: number; lng: number };
};
