
import { ShopBoost, Skin } from './types';

// Gameplay Balance
export const INITIAL_GROWTH_RATE = 400; // px/sec
export const PLAYER_WALK_SPEED = 300; // px/sec
export const GRAVITY = 2000; // px/sec^2
// Rotation Physics
export const STICK_FALL_ACCEL = 3500; // deg/sec^2 (Slightly reduced from 4000 to prevent snapping issues)
export const STICK_BOUNCE_DAMPING = 0.25; // Less energy kept on bounce
export const STOP_BOUNCE_THRESHOLD = 250; // CRITICAL FIX: Increased from 20 to 250. Must be > (ACCEL * dt).

// Particle Physics
export const PARTICLE_GRAVITY = 800;
export const PARTICLE_DRAG = 2.0;

// Level Generation
export const MIN_GAP = 40;
export const MAX_GAP = 300;
export const MIN_PLATFORM_WIDTH = 70; // Increased from 60
export const MAX_PLATFORM_WIDTH = 150; // Increased from 120
export const INITIAL_PLATFORM_WIDTH = 110; // Increased from 100
export const PLATFORM_HEIGHT = 280; // Increased from 220 for bigger blocks

// Difficulty Scaling
export const DIFFICULTY_STEP = 5; // Every 5 points, increase difficulty
export const GAP_VARIANCE_INCREASE = 20;

// Dimensions
export const PLAYER_SIZE = 30;
export const STICK_WIDTH = 6; // Thicker stick to match bigger blocks
export const GAME_HEIGHT_OFFSET = 300; // Where the ground line is from bottom
export const MAX_STICK_LENGTH = 800; // Maximum stick length before auto-rotation

// Monetization
export const AD_COIN_REWARD = 40;
export const INITIAL_COINS = 0;

// Shop / Skins
export const SKINS: Skin[] = [
  { id: 'default', name: 'Classic Red', color: 'bg-red-500', cost: 0 },
  { id: 'neon', name: 'Neon Blue', color: 'bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.8)]', cost: 100 },
  { id: 'gold', name: 'Midas Gold', color: 'bg-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.8)]', cost: 250 },
  { id: 'purple', name: 'Void Purple', color: 'bg-purple-600 border-2 border-white', cost: 500 },
  { id: 'green', name: 'Emerald', color: 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.8)]', cost: 300 },
  { id: 'orange', name: 'Fire Orange', color: 'bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.8)]', cost: 400 },
  { id: 'rainbow', name: 'Rainbow', color: 'bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500', cost: 1000 },
  { id: 'midnight', name: 'Midnight Pulse', color: 'bg-gradient-to-r from-slate-900 via-purple-900 to-black shadow-[0_0_20px_rgba(139,92,246,0.6)]', cost: 650, rarity: 'rare' },
  { id: 'aurora', name: 'Aurora Drift', color: 'bg-gradient-to-r from-cyan-400 via-indigo-500 to-pink-500 shadow-[0_0_30px_rgba(59,130,246,0.9)]', cost: 900, rarity: 'legendary' },
  { id: 'sakura', name: 'Sakura Bloom', color: 'bg-gradient-to-r from-rose-400 to-pink-600 shadow-[0_0_20px_rgba(244,114,182,0.7)]', cost: 1200, rarity: 'legendary' },
  { id: 'chrono', name: 'Chrono Rift', color: 'bg-gradient-to-r from-amber-500 via-slate-900 to-cyan-500 shadow-[0_0_35px_rgba(14,165,233,0.8)]', cost: 1500, rarity: 'mythic', badge: 'HOT' },
  { id: 'achievement_perfect10', name: 'Perfect Master', color: 'bg-yellow-300 shadow-[0_0_20px_rgba(253,224,71,1)]', cost: 0 }, // Unlock via achievement
  { id: 'achievement_100games', name: 'Veteran', color: 'bg-slate-400 shadow-[0_0_15px_rgba(148,163,184,0.8)]', cost: 0 },
];

// Power-ups
export const POWER_UP_DURATIONS = {
  slowmo: 5, // seconds
  doubleCoins: 10, // seconds
  magnet: 8, // seconds
  shield: 1, // uses (not time-based)
};

// Platform variety spawn rates
export const PLATFORM_VARIETY_CHANCE = {
  ice: 0.15, // 15% chance after score 10
  bouncy: 0.1, // 10% chance after score 15
  breakable: 0.12, // 12% chance after score 20
  coin: 0.2, // 20% chance after score 5
};

// Achievement definitions
export const ACHIEVEMENTS = [
  { id: 'first_perfect', name: 'First Perfect', description: 'Land your first perfect landing', target: 1 },
  { id: 'perfect_10', name: 'Perfect 10', description: 'Get 10 perfect landings in one game', target: 10 },
  { id: 'combo_5', name: 'Combo Master', description: 'Reach a 5 combo', target: 5 },
  { id: 'score_50', name: 'Half Century', description: 'Reach score 50', target: 50 },
  { id: 'score_100', name: 'Century', description: 'Reach score 100', target: 100 },
  { id: 'coins_1000', name: 'Rich', description: 'Earn 1000 coins total', target: 1000 },
  { id: 'games_100', name: 'Dedicated', description: 'Play 100 games', target: 100 },
  { id: 'perfect_100', name: 'Perfectionist', description: 'Get 100 perfect landings total', target: 100 },
];

// Particle limits for performance (reduced for mobile optimization)
export const MAX_PARTICLES = 50; // Reduced from 100 for better mobile performance
export const MAX_FLOATING_TEXTS = 10; // Reduced from 20 for better mobile performance

// Boost shop
export const SHOP_BOOSTS: ShopBoost[] = [
  {
    id: 'double_coins',
    name: 'Coin Frenzy',
    description: 'Earn 2x coins on your next full run.',
    cost: 250,
    durationLabel: 'Single Run',
    effect: 'coinMultiplier',
    modifier: 2,
    icon: 'Coins'
  },
  {
    id: 'perfect_bank',
    name: 'Perfect Vault',
    description: 'Adds +150 bonus coins when the run ends.',
    cost: 300,
    durationLabel: 'Single Run',
    effect: 'flatBonus',
    modifier: 150,
    icon: 'Sparkles'
  },
  {
    id: 'safety_net',
    name: 'Safety Drone',
    description: 'Auto-revive once without watching an ad.',
    cost: 400,
    durationLabel: 'Single Run',
    effect: 'freeRevive',
    modifier: 1,
    icon: 'Shield'
  }
];
