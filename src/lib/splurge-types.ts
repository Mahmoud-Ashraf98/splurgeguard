export type Currency = "VND" | "USD";
export type VaultStatus = "cooling" | "ready" | "approved" | "discarded";

export interface UserState {
  userName: string;
  currentBalanceVND: number;
  essentialSpentVND: number;
  cycleStartDate: string;
  paydayDate: string;
  totalDP: number;
  lifetimeDP: number;
  currentLevel: number;
  ascensionXP: number;
  currentStreakDays: number;
  lastLoginDate: string;
  weeklyHabitLimitVND: number;
  targetHabit: string;
  usdExchangeRate: number;
  displayCurrency: Currency;
}

export interface Transaction {
  id: string;
  timestamp: string;
  amountVND: number;
  originalAmount?: number;
  originalCurrency: Currency;
  category: string;
  isEssential: boolean;
  justification: string;
  fromVault: boolean;
  amortizationDays?: number;
}

export interface VaultItem {
  id: string;
  itemName: string;
  estimatedAmountVND: number;
  category: string;
  createdAt: string;
  delayHours: number;
  justification: string;
  status: VaultStatus;
}

export interface Reward {
  id: string;
  archetypeId: string;
  emoji: string;
  title: string;
  costDP: number;
  createdAt: string;
  redeemedAt?: string;
  status: "active" | "redeemed";
}

export interface AppData {
  userState: UserState | null;
  transactions: Transaction[];
  vaultItems: VaultItem[];
  rewards: Reward[];
  _isMigrationLoad?: boolean;
}

export const ESSENTIAL_CATEGORIES = [
  "Meat and chicken",
  "Other essential home groceries",
  "Motorbike expenses",
  "Rent",
  "Visa and documents fees",
  "Utilities, Phone & Internet",
  "Medical & Pharmacy",
  "Other Essentials",
];

export const DISCRETIONARY_CATEGORIES = [
  "Diet soda and bottled cold tea soft drinks",
  "Clothes",
  "Travelling",
  "Dining Out & Street Food",
  "Software & Digital Subscriptions",
  "Tech & Hardware Upgrades",
  "Fitness & Supplements",
  "Other Splurges",
];

export const ALL_CATEGORIES = [...ESSENTIAL_CATEGORIES, ...DISCRETIONARY_CATEGORIES];

export const isEssentialCategory = (cat: string) => ESSENTIAL_CATEGORIES.includes(cat);

export const STORAGE_KEY = "splurgeGuardData_v1";

export interface LevelDef {
  level: number;
  title: string;
  threshold: number;
}

export const LEVELS: LevelDef[] = [
  { level: 1, title: "Initiate", threshold: 0 },
  { level: 2, title: "Sentinel", threshold: 300 },
  { level: 3, title: "Vanguard", threshold: 800 },
  { level: 4, title: "Architect", threshold: 1500 },
  { level: 5, title: "Praetorian", threshold: 2500 },
  { level: 6, title: "Luminary", threshold: 4000 },
  { level: 7, title: "Ascendant", threshold: 6000 },
  { level: 8, title: "Sovereign", threshold: 8500 },
  { level: 9, title: "Apex", threshold: 11500 },
  { level: 10, title: "Prime Operator", threshold: 15000 },
];

export const levelForLifetimeDP = (lifetimeDP: number): LevelDef => {
  let result = LEVELS[0];
  for (const l of LEVELS) {
    if (lifetimeDP >= l.threshold) result = l;
    else break;
  }
  return result;
};

export const getLevelDef = (level: number): LevelDef =>
  LEVELS.find((l) => l.level === level) ?? LEVELS[0];
