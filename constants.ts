
import { Skin } from './types';

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

// Monetization
export const AD_COIN_REWARD = 50;
export const INITIAL_COINS = 0;

// Shop / Skins
export const SKINS: Skin[] = [
  { id: 'default', name: 'Classic Red', color: 'bg-red-500', cost: 0 },
  { id: 'neon', name: 'Neon Blue', color: 'bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.8)]', cost: 100 },
  { id: 'gold', name: 'Midas Gold', color: 'bg-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.8)]', cost: 250 },
  { id: 'purple', name: 'Void Purple', color: 'bg-purple-600 border-2 border-white', cost: 500 },
];
