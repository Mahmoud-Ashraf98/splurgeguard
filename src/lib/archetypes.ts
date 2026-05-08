export interface RewardArchetype {
  id: string;
  emoji: string;
  title: string;
  subtext: string;
  baseDP: number;
  glow: string;
}

export const REWARD_ARCHETYPES: RewardArchetype[] = [
  { id: "banh-mi", emoji: "🥖", title: "Banh Mi Run", subtext: "Crispy bread, pâté, the works.", baseDP: 200, glow: "rgba(249,115,22,0.6)" },
  { id: "tra-da", emoji: "🧊", title: "Trà Đá Break", subtext: "Sit, sip, watch the street go by.", baseDP: 50, glow: "rgba(34,197,94,0.6)" },
  { id: "ca-phe", emoji: "☕", title: "Cà Phê Sữa Đá", subtext: "Strong, sweet, ice-cold focus.", baseDP: 350, glow: "rgba(180,83,9,0.6)" },
  { id: "street-food", emoji: "🍜", title: "Street Food Feast", subtext: "Plastic stool, big flavor.", baseDP: 500, glow: "rgba(249,115,22,0.6)" },
  { id: "goi-cuon", emoji: "🥬", title: "Gỏi Cuốn / Light Bites", subtext: "Fresh rolls, peanut sauce, vibe.", baseDP: 300, glow: "rgba(34,197,94,0.6)" },
  { id: "convenience", emoji: "🏪", title: "Circle K Run", subtext: "Snacks, slushies, no judgment.", baseDP: 1000, glow: "rgba(0,212,255,0.6)" },
  { id: "beer-friends", emoji: "🍺", title: "Bia Hơi w/ Friends", subtext: "Cold beer, loud table, late night.", baseDP: 2500, glow: "rgba(251,191,36,0.6)" },
  { id: "fast-food", emoji: "🍗", title: "Late-Night Fast Food", subtext: "Crunchy, spicy, fully sanctioned.", baseDP: 1500, glow: "rgba(249,115,22,0.6)" },
  { id: "cinema", emoji: "🎬", title: "Cinema / Movie Night", subtext: "Big screen, big popcorn.", baseDP: 2000, glow: "rgba(168,85,247,0.6)" },
  { id: "karaoke", emoji: "🎤", title: "Karaoke Session", subtext: "Belt it out. You earned the room.", baseDP: 5000, glow: "rgba(168,85,247,0.6)" },
  { id: "gaming-cafe", emoji: "🎮", title: "Gaming Café Hours", subtext: "RGB chairs and high ping rage.", baseDP: 1000, glow: "rgba(0,212,255,0.6)" },
  { id: "massage", emoji: "💆‍♀️", title: "Massage Session", subtext: "Your body held the line. Reward it.", baseDP: 3500, glow: "rgba(236,72,153,0.6)" },
  { id: "haircut", emoji: "💈", title: "Fresh Haircut", subtext: "New cut, new energy.", baseDP: 1500, glow: "rgba(59,130,246,0.6)" },
  { id: "skincare", emoji: "🧴", title: "Skincare Haul", subtext: "Glow up, toxin out.", baseDP: 6000, glow: "rgba(236,72,153,0.6)" },
  { id: "gym", emoji: "🏋️", title: "Gym Day Pass / Class", subtext: "Pay to suffer. On purpose.", baseDP: 1000, glow: "rgba(34,197,94,0.6)" },
  { id: "shopee", emoji: "📦", title: "The Shopee Checkout", subtext: "Clear that cart you've been staring at.", baseDP: 3000, glow: "rgba(0,212,255,0.6)" },
  { id: "digital", emoji: "🕹️", title: "Digital Splurge", subtext: "Games, subs, in-app loot.", baseDP: 5000, glow: "rgba(0,212,255,0.6)" },
  { id: "clothes", emoji: "👕", title: "New Clothes", subtext: "Something fresh in the rotation.", baseDP: 5000, glow: "rgba(168,85,247,0.6)" },
  { id: "accessories", emoji: "🕶️", title: "Accessories Drop", subtext: "Watch, shades, chain — pick one.", baseDP: 2000, glow: "rgba(251,191,36,0.6)" },
  { id: "tech", emoji: "💻", title: "Tech Upgrade", subtext: "New gear, faster workflow.", baseDP: 15000, glow: "rgba(0,212,255,0.6)" },
  { id: "motorbike", emoji: "🛵", title: "Motorbike TLC", subtext: "Wash, mods, that fresh tank feeling.", baseDP: 2000, glow: "rgba(59,130,246,0.6)" },
  { id: "da-lat", emoji: "🌲", title: "Đà Lạt Trip", subtext: "Cool air, coffee hills, escape.", baseDP: 25000, glow: "rgba(34,197,94,0.6)" },
  { id: "getaway", emoji: "✈️", title: "Weekend Getaway", subtext: "Hoi An, Mui Ne, somewhere blue.", baseDP: 40000, glow: "rgba(59,130,246,0.6)" },
  { id: "phu-quoc", emoji: "🏝️", title: "Phú Quốc Escape", subtext: "Beach, seafood, full reset.", baseDP: 60000, glow: "rgba(0,212,255,0.6)" },
  { id: "tattoo", emoji: "🖋️", title: "Tattoo Session", subtext: "Mark the milestone. Permanently.", baseDP: 15000, glow: "rgba(168,85,247,0.6)" },
  { id: "custom", emoji: "⭐", title: "My Own Reward", subtext: "Define your own treat.", baseDP: 500, glow: "rgba(0,255,135,0.6)" },
];
