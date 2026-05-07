export type Currency = "VND" | "USD";
export type VaultStatus = "cooling" | "ready" | "approved" | "discarded";

export interface UserState {
  userName: string;
  currentBalanceVND: number;
  essentialSpentVND: number;
  cycleStartDate: string;
  paydayDate: string;
  totalDP: number;
  currentStreakDays: number;
  lastLoginDate: string;
  weeklyWeedLimitVND: number;
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

export interface AppData {
  userState: UserState | null;
  transactions: Transaction[];
  vaultItems: VaultItem[];
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
  "Weed",
  "Dining Out & Street Food",
  "Software & Digital Subscriptions",
  "Tech & Hardware Upgrades",
  "Fitness & Supplements",
  "Other Splurges",
];

export const ALL_CATEGORIES = [...ESSENTIAL_CATEGORIES, ...DISCRETIONARY_CATEGORIES];

export const isEssentialCategory = (cat: string) => ESSENTIAL_CATEGORIES.includes(cat);

export const STORAGE_KEY = "splurgeGuardData_v1";
