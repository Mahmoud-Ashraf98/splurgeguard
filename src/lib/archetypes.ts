export interface RewardArchetype {
  id: string;
  emoji: string;
  title: string;
  subtext: string;
  baseDP: number;
  glow: string;
}

export const REWARD_ARCHETYPES: RewardArchetype[] = [
  { id: "banh-mi", emoji: "🥖", title: "Banh Mi Breakfast", subtext: "The OG start to any morning.", baseDP: 50, glow: "rgba(251,191,36,0.6)" },
  { id: "ca-phe", emoji: "☕", title: "Ca Phe / Boba Run", subtext: "That sweet caffeine hit.", baseDP: 150, glow: "rgba(251,191,36,0.6)" },
  { id: "street-food", emoji: "🍜", title: "Pho / Bun Bo / Hu Tieu", subtext: "A proper bowl of something real.", baseDP: 120, glow: "rgba(249,115,22,0.6)" },
  { id: "fast-food", emoji: "🍗", title: "Late-Night Fast Food", subtext: "Crunchy, spicy, guilt-free.", baseDP: 350, glow: "rgba(249,115,22,0.6)" },
  { id: "karaoke", emoji: "🎤", title: "Karaoke Session", subtext: "Belt it out. You deserve the room.", baseDP: 600, glow: "rgba(168,85,247,0.6)" },
  { id: "massage", emoji: "💆‍♀️", title: "Massage / Foot Spa", subtext: "Your body held the line. Reward it.", baseDP: 500, glow: "rgba(236,72,153,0.6)" },
  { id: "shopee", emoji: "📦", title: "The Shopee Checkout", subtext: "Clear that cart you've been staring at.", baseDP: 800, glow: "rgba(0,212,255,0.6)" },
  { id: "digital", emoji: "🎮", title: "Digital Splurge", subtext: "Games, subs, in-app loot.", baseDP: 500, glow: "rgba(0,212,255,0.6)" },
  { id: "clothes", emoji: "👟", title: "New Clothes / Sneakers", subtext: "Something fresh from the market.", baseDP: 800, glow: "rgba(0,212,255,0.6)" },
  { id: "motorbike", emoji: "🛵", title: "Motorbike TLC", subtext: "Wash, decals, grips, fresh oil.", baseDP: 1200, glow: "rgba(249,115,22,0.6)" },
  { id: "getaway", emoji: "✈️", title: "Weekend Getaway", subtext: "Da Nang, Mui Ne, Saigon.", baseDP: 5000, glow: "rgba(59,130,246,0.6)" },
  { id: "custom", emoji: "⭐", title: "My Own Reward", subtext: "Define your own treat.", baseDP: 500, glow: "rgba(0,255,135,0.6)" },
];
