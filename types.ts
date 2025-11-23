
export enum GameState {
  MENU = 'MENU',
  PLAYING = 'PLAYING',
  GAME_OVER = 'GAME_OVER',
}

export enum PlayerState {
  IDLE = 'IDLE',
  GROWING = 'GROWING',
  ROTATING = 'ROTATING',
  WALKING = 'WALKING',
  FALLING = 'FALLING',
  GAME_OVER = 'GAME_OVER',
}

export type PlatformType = 'normal' | 'ice' | 'bouncy' | 'breakable' | 'coin';

export interface Platform {
  id: number;
  x: number;
  width: number;
  isTarget: boolean; // True if this is the immediate next target
  // Movement properties
  isMoving?: boolean;
  baseX?: number;
  moveSpeed?: number;
  moveAmplitude?: number;
  movePhase?: number;
  // Platform variety
  type?: PlatformType;
  breakCountdown?: number; // For breakable platforms
  coins?: number; // For coin platforms
}

export interface Stick {
  x: number;
  length: number;
  rotation: number; // Degrees, 0 is vertical up, 90 is horizontal right
}

export interface Player {
  x: number; // Relative to the world
  y: number; // Vertical offset (for falling)
}

export interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
  size: number;
  type: 'spark' | 'dust' | 'confetti';
}

export interface FloatingText {
  id: number;
  x: number;
  y: number;
  text: string;
  color: string;
  life: number;
  velocityY: number;
}

export interface Skin {
  id: string;
  name: string;
  color: string;
  cost: number;
}

export interface GameConfig {
  growthRate: number; // pixels per second
  walkSpeed: number; // pixels per second
  tolerance: number; // pixels +/-
}

export type PowerUpType = 'slowmo' | 'doubleCoins' | 'magnet' | 'shield';

export interface PowerUp {
  type: PowerUpType;
  duration: number; // seconds
  active: boolean;
  timeLeft: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  unlocked: boolean;
  unlockedAt?: number; // timestamp
  progress?: number;
  target?: number;
}

export interface GameStats {
  gamesPlayed: number;
  totalPerfects: number;
  totalCoinsEarned: number;
  averageScore: number;
  bestCombo: number;
  totalDistance: number;
  achievementsUnlocked: number;
}

export interface DailyChallenge {
  id: string;
  description: string;
  target: number;
  progress: number;
  reward: number;
  completed: boolean;
  expiresAt: number; // timestamp
}
