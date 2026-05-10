import { DailyContract } from './splurge-types';

const CONTRACT_POOL: Omit<DailyContract, 'status'>[] = [
  { id: '1', title: 'The Grab Boycott', subtitle: 'Drive your own bike or walk. No ride-hailing.', reward: 15, penalty: -15, iconType: 'Bike' },
  { id: '2', title: 'Caffeine Fast', subtitle: 'Skip the cafe walk-in. Drink G7 or water.', reward: 10, penalty: -10, iconType: 'Coffee' },
  { id: '3', title: 'The Shopee Shield', subtitle: 'Zero flash-sale checkouts today.', reward: 20, penalty: -20, iconType: 'ShoppingCart' },
  { id: '4', title: 'Hawker Reserve', subtitle: 'Cook eggs at home instead of ordering in.', reward: 15, penalty: -15, iconType: 'Utensils' },
  { id: '5', title: 'Boba Defiance', subtitle: 'Pass the tea shop without buying.', reward: 10, penalty: -10, iconType: 'CupSoda' },
];

export function generateDailyContracts(): DailyContract[] {
  const shuffled = [...CONTRACT_POOL].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, 4).map((c) => ({ ...c, status: 'available' as const }));
}
