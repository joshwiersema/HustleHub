export type HustleType = 'lawn_care' | 'power_washing' | 'dog_walking' | 'tutoring' | 'car_detailing' | 'snow_removal';

export interface HustleTypeInfo {
  id: HustleType;
  name: string;
  icon: string;
  emoji: string;
  description: string;
  avgEarnings: string;
  startupCost: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

export interface UserProfile {
  id: string;
  name: string;
  businessName: string;
  hustleType: HustleType;
  level: number;
  xp: number;
  hustleBucks: number;
  totalEarnings: number;
  streak: number;
  joinedDate: string;
  badges: string[];
  onboardingComplete: boolean;
}

export interface Client {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  notes: string;
  createdAt: string;
}

export interface Job {
  id: string;
  clientId: string;
  clientName: string;
  title: string;
  date: string;
  time: string;
  duration: number; // minutes
  price: number;
  status: 'upcoming' | 'completed' | 'cancelled';
  recurring: boolean;
  recurringFrequency?: 'weekly' | 'biweekly' | 'monthly';
  notes: string;
  address: string;
}

export interface Payment {
  id: string;
  jobId?: string;
  clientName: string;
  amount: number;
  method: 'cash' | 'venmo' | 'zelle' | 'paypal' | 'other';
  date: string;
  notes: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt?: string;
  requirement: string;
}

export interface LevelInfo {
  level: number;
  title: string;
  xpRequired: number;
  icon: string;
}

export const HUSTLE_TYPES: HustleTypeInfo[] = [
  {
    id: 'lawn_care',
    name: 'Lawn Care',
    icon: 'leaf',
    emoji: '🌿',
    description: 'Mowing, trimming, edging, and yard cleanup',
    avgEarnings: '$25-50/yard',
    startupCost: '$200-500',
    difficulty: 'Easy',
  },
  {
    id: 'power_washing',
    name: 'Power Washing',
    icon: 'water',
    emoji: '💦',
    description: 'Driveways, decks, siding, and fences',
    avgEarnings: '$50-150/job',
    startupCost: '$300-800',
    difficulty: 'Medium',
  },
  {
    id: 'dog_walking',
    name: 'Dog Walking',
    icon: 'paw',
    emoji: '🐕',
    description: 'Daily walks, pet sitting, and feeding',
    avgEarnings: '$15-30/walk',
    startupCost: '$20-50',
    difficulty: 'Easy',
  },
  {
    id: 'tutoring',
    name: 'Tutoring',
    icon: 'book',
    emoji: '📚',
    description: 'Math, science, English, and test prep',
    avgEarnings: '$20-40/hour',
    startupCost: '$0-50',
    difficulty: 'Medium',
  },
  {
    id: 'car_detailing',
    name: 'Car Detailing',
    icon: 'car',
    emoji: '🚗',
    description: 'Interior/exterior cleaning and detailing',
    avgEarnings: '$50-150/car',
    startupCost: '$100-400',
    difficulty: 'Medium',
  },
  {
    id: 'snow_removal',
    name: 'Snow Removal',
    icon: 'snow',
    emoji: '❄️',
    description: 'Shoveling driveways, walkways, and salting',
    avgEarnings: '$25-75/job',
    startupCost: '$50-200',
    difficulty: 'Hard',
  },
];

export const LEVELS: LevelInfo[] = [
  { level: 1, title: 'Rookie Hustler', xpRequired: 0, icon: '🌱' },
  { level: 2, title: 'Go-Getter', xpRequired: 100, icon: '⚡' },
  { level: 3, title: 'Side Hustler', xpRequired: 300, icon: '🔥' },
  { level: 4, title: 'Grinder', xpRequired: 600, icon: '💪' },
  { level: 5, title: 'Hustler Pro', xpRequired: 1000, icon: '⭐' },
  { level: 6, title: 'Boss Mode', xpRequired: 1500, icon: '👑' },
  { level: 7, title: 'Entrepreneur', xpRequired: 2500, icon: '🚀' },
  { level: 8, title: 'Mogul', xpRequired: 4000, icon: '💎' },
  { level: 9, title: 'Tycoon', xpRequired: 6000, icon: '🏆' },
  { level: 10, title: 'CEO', xpRequired: 10000, icon: '👔' },
];

export const BADGES: Badge[] = [
  { id: 'first_client', name: 'First Client', description: 'Add your first client', icon: '🤝', requirement: 'Add 1 client' },
  { id: 'first_job', name: 'First Gig', description: 'Complete your first job', icon: '✅', requirement: 'Complete 1 job' },
  { id: 'first_100', name: 'Benjamin', description: 'Earn your first $100', icon: '💵', requirement: 'Earn $100 total' },
  { id: 'five_clients', name: 'Networker', description: 'Build a client base of 5', icon: '📱', requirement: 'Add 5 clients' },
  { id: 'ten_jobs', name: 'Reliable', description: 'Complete 10 jobs', icon: '🎯', requirement: 'Complete 10 jobs' },
  { id: 'streak_7', name: 'On Fire', description: '7-day activity streak', icon: '🔥', requirement: '7-day streak' },
  { id: 'earn_500', name: 'Half K', description: 'Earn $500 total', icon: '💰', requirement: 'Earn $500 total' },
  { id: 'earn_1000', name: 'Grand Hustler', description: 'Earn $1,000 total', icon: '🏦', requirement: 'Earn $1,000 total' },
  { id: 'twenty_jobs', name: 'Veteran', description: 'Complete 20 jobs', icon: '🎖️', requirement: 'Complete 20 jobs' },
  { id: 'streak_30', name: 'Unstoppable', description: '30-day activity streak', icon: '⚡', requirement: '30-day streak' },
];

export const PAYMENT_METHODS = [
  { id: 'cash', label: 'Cash', icon: 'cash', emoji: '💵' },
  { id: 'venmo', label: 'Venmo', icon: 'phone-portrait', emoji: '📲' },
  { id: 'zelle', label: 'Zelle', icon: 'send', emoji: '⚡' },
  { id: 'paypal', label: 'PayPal', icon: 'logo-paypal', emoji: '💳' },
  { id: 'other', label: 'Other', icon: 'ellipsis-horizontal', emoji: '📋' },
] as const;
