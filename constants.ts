
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
export const MIN_GAP = 60;
export const MAX_GAP = 350;
export const MIN_PLATFORM_WIDTH = 35; // Minimum width for hardest platforms (very thin)
export const MAX_PLATFORM_WIDTH = 90; // Starting width (smaller now)
export const INITIAL_PLATFORM_WIDTH = 80; // First platform width (reduced from 130)
export const PLATFORM_HEIGHT = 280; // Platform height

// Difficulty Scaling
export const DIFFICULTY_STEP = 5; // Every 5 points, increase difficulty
export const GAP_VARIANCE_INCREASE = 20;

// Progressive Difficulty Settings
export const WIDTH_REDUCTION_PER_LEVEL = 6; // How much narrower platforms get per difficulty level
export const GAP_INCREASE_PER_LEVEL = 18; // How much gap increases per difficulty level
export const DIFFICULTY_PHASES = {
  EASY: { maxScore: 5, minWidth: 70, maxGap: 130 },       // Thinner blocks from start
  MEDIUM: { maxScore: 15, minWidth: 55, maxGap: 200 },   // Even thinner, bigger gaps
  HARD: { maxScore: 30, minWidth: 45, maxGap: 280 },     // Thin blocks, large gaps
  EXTREME: { maxScore: Infinity, minWidth: 35, maxGap: 350 } // Very thin, maximum gaps
};

// Dimensions
export const PLAYER_SIZE = 30;
export const STICK_WIDTH = 6; // Thicker stick to match bigger blocks
export const GAME_HEIGHT_OFFSET = 300; // Where the ground line is from bottom
export const MAX_STICK_LENGTH = 800; // Maximum stick length before auto-rotation

// Game Logic Constants
export const FALLING_DEATH_THRESHOLD = 600; // Y position where player dies
export const PERFECT_LANDING_TOLERANCE = 8; // Pixels from center for perfect landing
export const PLAYER_PLATFORM_OFFSET = 5; // Offset from platform edge for player positioning
export const COMBO_FEVER_THRESHOLD = 3; // Combo count needed for fever mode
export const PLATFORM_FINDING_MARGIN = 20; // Margin for finding platforms ahead of stick
export const ICE_PLATFORM_SIZE_REDUCTION = 10; // How much smaller ice platforms are
export const NARROW_PLATFORM_SIZE_REDUCTION = 20; // Size reduction for narrow platforms
export const MIN_PLATFORM_SIZE = 60; // Minimum platform size after reductions
export const PERFECT_BONUS_BASE = 1; // Base bonus coins for perfect landing
export const PERFECT_BONUS_FEVER = 2; // Bonus coins for perfect during fever
export const MAGNET_TOLERANCE_BOOST = 10; // Additional tolerance when magnet is active
export const MAGNET_SPEED_BOOST = 1.2; // Speed multiplier when magnet is active
export const BOUNCY_PLATFORM_BOOST = 200; // Vertical velocity boost from bouncy platform
export const PARTICLE_OFFSCREEN_MARGIN = 100; // Margin for particle cleanup
export const FLOATING_TEXT_OFFSCREEN_MARGIN = 100; // Margin for floating text cleanup
export const DOUBLE_TAP_WINDOW = 300; // Milliseconds for double tap detection
export const STICK_ROTATION_SAFETY_TIME = 1.2; // Seconds before force-stopping stick rotation

// Monetization
export const AD_COIN_REWARD = 40;
export const INITIAL_COINS = 0;

// External links - These work both in-app and when hosted
export const PRIVACY_POLICY_URL = '/privacy-policy.html';
export const TERMS_URL = '/terms.html';
export const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.stickstretch.game';

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
