
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
