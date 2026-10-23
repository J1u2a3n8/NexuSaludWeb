export type Role = 'ADMIN' | 'USER';
export type UserStatus = 'ACTIVE' | 'INACTIVE';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: Role;
  status: UserStatus;
  createdAt: string;
  lastLoginAt?: string;
}

export type SponsorshipTier = 'BASIC' | 'FEATURED' | 'PREMIUM';
export type SponsorshipStatus = 'ACTIVE' | 'PENDING' | 'CANCELLED' | 'EXPIRED';
export type DirectoryType = 'pharmacy' | 'clinic' | 'doctor' | 'ambulance-company';

export interface SponsorshipCampaign {
  id: string;
  targetId: string;
  targetName: string;
  targetType: DirectoryType;
  tier: SponsorshipTier;
  priority: number; // 1 - 10
  amountBob: number; // In Bolivianos (Bs.)
  startsAt: string; // ISO date YYYY-MM-DD
  endsAt: string; // ISO date YYYY-MM-DD
  status: SponsorshipStatus;
  notes?: string;
  createdAt: string;
}

export interface Pharmacy {
  id: string;
  name: string;
  city: string;
  address: string;
  latitude: number;
  longitude: number;
  phones: string[];
  hasOwnDelivery: boolean;
  isOpen24Hours: boolean;
  websiteUrl?: string;
  apiBaseUrl?: string;
  apiConfig?: string; // JSON string or key/value details
  status: 'ACTIVE' | 'INACTIVE';
  activeSponsorshipTier?: SponsorshipTier;
  createdAt: string;
}

export interface Clinic {
  id: string;
  name: string;
  city: string;
  address: string;
  latitude: number;
  longitude: number;
  phones: string[];
  isOpen24Hours: boolean;
  websiteUrl?: string;
  emergencyAvailable?: boolean;
  status: 'ACTIVE' | 'INACTIVE';
  activeSponsorshipTier?: SponsorshipTier;
  createdAt: string;
}

export interface Doctor {
  id: string;
  firstName: string;
  lastName: string;
  city: string;
  phones: string[];
  specialtyIds: string[];
  clinicIds: string[];
  status: 'ACTIVE' | 'INACTIVE';
  activeSponsorshipTier?: SponsorshipTier;
  licenseNumber?: string;
  createdAt: string;
}

export interface Specialty {
  id: string;
  name: string;
}

export interface AmbulanceCompany {
  id: string;
  name: string;
  city: string;
  address: string;
  latitude: number;
  longitude: number;
  phones: string[];
  status: 'ACTIVE' | 'INACTIVE';
  activeSponsorshipTier?: SponsorshipTier;
  createdAt: string;
}

export type AmbulanceOwnerType = 'COMPANY' | 'CLINIC';

export interface Ambulance {
  id: string;
  plate: string;
  ownerType: AmbulanceOwnerType;
  ambulanceCompanyId?: string;
  clinicId?: string;
  city: string;
  phones: string[];
  status: 'ACTIVE' | 'INACTIVE';
  vehicleModel?: string;
  equipmentLevel?: 'Básica' | 'Avanzada / UCI' | 'Rescate';
  createdAt: string;
}

export type ActiveNavTab =
  | 'overview'
  | 'users'
  | 'pharmacies'
  | 'clinics'
  | 'doctors'
  | 'ambulance-companies'
  | 'ambulances'
  | 'sponsorships';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
}


export const BOLIVIAN_CITIES = [
  'Cochabamba',
  'Santa Cruz de la Sierra',
  'La Paz',
  'El Alto',
  'Sucre',
  'Tarija',
  'Oruro',
  'Potosí',
  'Trinidad',
  'Cobija',
];
