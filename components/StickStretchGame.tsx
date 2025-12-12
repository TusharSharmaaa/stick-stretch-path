
import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { PlayerState, Platform, Stick, Player, Particle, FloatingText, PowerUpType, PlatformType } from '../types';
import { useGameLoop } from '../hooks/useGameLoop';
import { 
  INITIAL_GROWTH_RATE, 
  PLAYER_WALK_SPEED, 
  GRAVITY, 
  PLAYER_SIZE, 
  STICK_WIDTH, 
  PLATFORM_HEIGHT, 
  MIN_GAP, 
  MAX_GAP, 
  MIN_PLATFORM_WIDTH, 
  MAX_PLATFORM_WIDTH,
  INITIAL_PLATFORM_WIDTH,
  STICK_FALL_ACCEL,
  STICK_BOUNCE_DAMPING,
  STOP_BOUNCE_THRESHOLD,
  PARTICLE_GRAVITY,
  PARTICLE_DRAG,
  POWER_UP_DURATIONS,
  PLATFORM_VARIETY_CHANCE,
  MAX_PARTICLES,
  MAX_FLOATING_TEXTS,
  MAX_STICK_LENGTH,
  FALLING_DEATH_THRESHOLD,
  PERFECT_LANDING_TOLERANCE,
  PLAYER_PLATFORM_OFFSET,
  COMBO_FEVER_THRESHOLD,
  PLATFORM_FINDING_MARGIN,
  ICE_PLATFORM_SIZE_REDUCTION,
  NARROW_PLATFORM_SIZE_REDUCTION,
  MIN_PLATFORM_SIZE,
  PERFECT_BONUS_BASE,
  PERFECT_BONUS_FEVER,
  MAGNET_TOLERANCE_BOOST,
  MAGNET_SPEED_BOOST,
  BOUNCY_PLATFORM_BOOST,
  PARTICLE_OFFSCREEN_MARGIN,
  FLOATING_TEXT_OFFSCREEN_MARGIN,
  DOUBLE_TAP_WINDOW,
  STICK_ROTATION_SAFETY_TIME
} from '../constants';
import { startGrowSound, stopGrowSound, playStickHit, playSuccess, playFail, playCoin } from '../utils/audio';

// Mobile device detection
const isMobileDevice = () => {
  if (typeof window === 'undefined') return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
         (window.innerWidth <= 768) ||
         ('ontouchstart' in window);
};

// Performance settings based on device
const getPerformanceSettings = () => {
  const isMobile = isMobileDevice();
  return {
    isMobile,
    maxParticles: isMobile ? Math.floor(MAX_PARTICLES * 0.4) : MAX_PARTICLES, // 60% reduction on mobile
    maxFloatingTexts: isMobile ? Math.floor(MAX_FLOATING_TEXTS * 0.6) : MAX_FLOATING_TEXTS, // 40% reduction
    particleSpawnMultiplier: isMobile ? 0.3 : 0.5, // 70% reduction on mobile
    decorPillars: isMobile ? 3 : 8,
    decorFlux: isMobile ? 3 : 8,
    decorGeo: isMobile ? 1 : 3,
    decorDust: isMobile ? 4 : 10,
    playerTrailMax: isMobile ? 3 : 5,
    playerTrailSpawnChance: isMobile ? 0.3 : 0.5,
    enablePlayerTrail: !isMobile, // Disable trail on mobile for better performance
    verticalLines: isMobile ? 4 : 8,
  };
};

interface StickStretchGameProps {
  skinColor: string;
  onScore: (score: number) => void;
  onGameOver: (finalScore: number) => void;
  onCoinCollected: (amount: number) => void;
  isReviving?: boolean;
  onReviveComplete?: () => void;
  onGameEvent?: (event: { type: 'perfect' | 'combo'; value: number }) => void;
  settings?: { soundEnabled: boolean; musicEnabled: boolean; hapticsEnabled: boolean };
}

interface DecorObject {
  id: number;
  x: number;
  y: number;
  size: number; // width/height
  height?: number; // optional fixed height for pillars
  speed: number;
  rotation: number;
  type: 'dust' | 'geo' | 'flux' | 'pillar';
  opacity: number;
  color: string;
}

const StickStretchGame: React.FC<StickStretchGameProps> = ({ 
  skinColor, 
  onScore, 
  onGameOver,
  onCoinCollected,
  isReviving = false,
  onReviveComplete,
  onGameEvent,
  settings = { soundEnabled: true, musicEnabled: true, hapticsEnabled: true }
}) => {
  // Performance settings (memoized to avoid recalculation)
  const perfSettings = useMemo(() => getPerformanceSettings(), []);
  
  // Game Logic State
  const playerRef = useRef<Player>({ x: 0, y: 0 });
  const stickRef = useRef<Stick>({ x: 0, length: 0, rotation: 0 });
  const cameraXRef = useRef<number>(0);
  const platformsRef = useRef<Platform[]>([]);
  const scoreRef = useRef<number>(0);
  const stateRef = useRef<PlayerState>(PlayerState.IDLE);
  const velocityYRef = useRef<number>(0);
  const timeRef = useRef<number>(0);
  const particlesRef = useRef<Particle[]>([]);
  const floatingTextsRef = useRef<FloatingText[]>([]);
  const comboRef = useRef<number>(0);
  const avgFpsRef = useRef<number>(60);
  const lowPerfModeRef = useRef<boolean>(false);
  const viewportWidthRef = useRef<number>(typeof window !== 'undefined' ? window.innerWidth : 800);
  
  // Decor Refs
  const bgDecorRef = useRef<DecorObject[]>([]);
  
  // Physics Refs
  const stickRotationVelocityRef = useRef<number>(0);
  const hueRotationRef = useRef<number>(0);
  const rotationPhaseTimeRef = useRef<number>(0);
  
  // New Features Refs
  const powerUpsRef = useRef<Map<PowerUpType, { active: boolean; timeLeft: number }>>(new Map());
  const isPausedRef = useRef<boolean>(false);
  const perfectCountRef = useRef<number>(0);
  const playerTrailRef = useRef<Array<{ x: number; y: number; life: number }>>([]);

  // Animation Refs
  const playerScaleYRef = useRef<number>(1);
  const playerScaleXRef = useRef<number>(1);
  const cameraZoomRef = useRef<number>(1);
  
  // Performance optimization: Track last rendered values to avoid unnecessary updates
  const lastRenderedStateRef = useRef({
    playerX: 0,
    playerY: 0,
    stickX: 0,
    stickLength: 0,
    stickRotation: 0,
    cameraX: 0,
  });
  
  // Throttle state updates for better performance (but keep responsive during critical states)
  const stateUpdateFrameSkipRef = useRef<number>(0);
  // State update interval - kept at 1 for smoothness (optimization happens elsewhere)
  const STATE_UPDATE_INTERVAL = 1;

  // React State for rendering
  const [viewState, setViewState] = useState({
    playerX: 0,
    playerY: 0,
    stickX: 0,
    stickLength: 0,
    stickRotation: 0,
    cameraX: 0,
    cameraZoom: 1,
    platforms: [] as Platform[],
    isPerfect: false, 
    perfectX: 0,
    combo: 0,
    isShaking: false,
    particles: [] as Particle[],
    floatingTexts: [] as FloatingText[],
    backgroundHue: 0,
    playerScaleX: 1,
    playerScaleY: 1,
    bgDecor: [] as DecorObject[],
    isFever: false,
    isPaused: false,
    activePowerUps: [] as PowerUpType[],
    playerTrail: [] as Array<{ x: number; y: number; life: number }>,
  });
  const [viewportWidth, setViewportWidth] = useState<number>(viewportWidthRef.current);

  const triggerHaptic = (pattern: number | number[]) => {
    if (settings.hapticsEnabled && typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(pattern);
    }
  };
  
  const activatePowerUp = (type: PowerUpType) => {
    // Shield is one-time use (not time-based), but we store it in the same system for consistency
    // It will be deleted immediately when consumed
    powerUpsRef.current.set(type, {
      active: true,
      timeLeft: type === 'shield' ? 1 : POWER_UP_DURATIONS[type], // Shield uses 1 as placeholder
    });
    spawnFloatingText(playerRef.current.x, 150, type.toUpperCase(), '#fcd34d');
  };
  
  const togglePause = () => {
    isPausedRef.current = !isPausedRef.current;
    setViewState(prev => ({ ...prev, isPaused: isPausedRef.current }));
  };

  const spawnFloatingText = (x: number, y: number, text: string, color: string) => {
    if (lowPerfModeRef.current) return;
    // Performance: Limit floating texts based on device
    const maxTexts = perfSettings.maxFloatingTexts;
    if (floatingTextsRef.current.length >= maxTexts) {
      floatingTextsRef.current.shift();
    }
    floatingTextsRef.current.push({
      id: Math.random(),
      x,
      y,
      text,
      color,
      life: 1.0,
      velocityY: 50
    });
  };

  const spawnParticles = (x: number, y: number, type: 'spark' | 'dust' | 'confetti', count: number) => {
    if (lowPerfModeRef.current) return;
    // Performance: Limit particles and reduce count on mobile
    const currentCount = particlesRef.current.length;
    const maxToAdd = Math.max(0, perfSettings.maxParticles - currentCount);
    // Aggressive reduction on mobile for better performance
    const reducedCount = Math.floor(count * perfSettings.particleSpawnMultiplier);
    const actualCount = Math.min(reducedCount, maxToAdd);
    
    for (let i = 0; i < actualCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = type === 'spark' ? Math.random() * 300 + 100 : Math.random() * 100 + 50;
      
      let color = '#fff';
      if (type === 'spark') color = Math.random() > 0.5 ? '#facc15' : '#fb923c'; 
      if (type === 'confetti') {
          color = comboRef.current >= 3 ? '#fcd34d' : `hsl(${Math.random() * 360}, 100%, 70%)`;
      }
      if (type === 'dust') color = '#e2e8f0'; 

      particlesRef.current.push({
        id: Math.random(),
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: type === 'dust' ? -Math.random() * 50 : Math.sin(angle) * speed,
        life: 1.0,
        color,
        size: type === 'confetti' ? Math.random() * 4 + 2 : Math.random() * 2 + 1,
        type
      });
    }
  };

  const initDecor = () => {
    const bg: DecorObject[] = [];
    
    // Background Pillars (device-optimized count)
    for(let i=0; i<perfSettings.decorPillars; i++) {
      bg.push({
        id: i + 500,
        x: Math.random() * 2500,
        y: 0,
        height: Math.random() * 200 + 300,
        size: Math.random() * 60 + 40,
        speed: Math.random() * 0.15 + 0.05,
        rotation: 0,
        type: 'pillar',
        opacity: Math.random() * 0.3 + 0.1,
        color: '#1e293b'
      });
    }

    // Surreal Flux Lines (device-optimized count)
    for(let i=0; i<perfSettings.decorFlux; i++) {
        bg.push({
            id: i,
            x: Math.random() * 2000,
            y: Math.random() * 400 + 50,
            size: Math.random() * 100 + 100,
            speed: Math.random() * 0.3 + 0.1,
            rotation: Math.random() * 40 - 20,
            type: 'flux',
            opacity: Math.random() * 0.4 + 0.1,
            color: Math.random() > 0.5 ? '#60a5fa' : '#c084fc'
        });
    }

    // Geometric Shapes (device-optimized count)
    for(let i=0; i<perfSettings.decorGeo; i++) {
        bg.push({
            id: i + 100,
            x: Math.random() * 2000,
            y: Math.random() * 200 + 50,
            size: Math.random() * 40 + 20,
            speed: Math.random() * 0.1 + 0.05,
            rotation: Math.random() * 360,
            type: 'geo',
            opacity: 0.1,
            color: '#94a3b8'
        });
    }

    // Dust Particles (device-optimized count)
    for(let i=0; i<perfSettings.decorDust; i++) {
        bg.push({
            id: i + 200,
            x: Math.random() * 2000,
            y: Math.random() * 800, 
            size: Math.random() * 3 + 1,
            speed: Math.random() * 0.05 + 0.02, 
            rotation: 0,
            type: 'dust',
            opacity: Math.random() * 0.3 + 0.1, 
            color: '#cbd5e1' 
        });
    }
    bgDecorRef.current = bg;
  };

  useEffect(() => {
    const handleResize = () => {
      if (typeof window !== 'undefined') {
        viewportWidthRef.current = window.innerWidth;
        setViewportWidth(window.innerWidth);
      }
    };
    window.addEventListener('resize', handleResize);
    initDecor();

    const handleContextMenu = (e: MouseEvent) => e.preventDefault();
    document.addEventListener('contextmenu', handleContextMenu);

    if (isReviving && platformsRef.current.length > 0) {
      // Safe Revive - use second-to-last platform if available, otherwise use first
      // Add bounds checking to prevent array access errors
      const safeIndex = platformsRef.current.length >= 2 
        ? platformsRef.current.length - 2 
        : 0;
      const lastSafePlat = platformsRef.current[safeIndex];
      
      if (!lastSafePlat) {
        console.error('No platforms available for revive');
        return () => document.removeEventListener('contextmenu', handleContextMenu);
      }
      
      const targetX = lastSafePlat.x + lastSafePlat.width - PLAYER_SIZE - PLAYER_PLATFORM_OFFSET;
      
      playerRef.current = { x: targetX, y: 0 };
      stickRef.current = { x: lastSafePlat.x + lastSafePlat.width, length: 0, rotation: 0 };
      stateRef.current = PlayerState.IDLE;
      velocityYRef.current = 0;
      stickRotationVelocityRef.current = 0;
      rotationPhaseTimeRef.current = 0;
      
      // Reset last rendered state
      lastRenderedStateRef.current = {
        playerX: targetX,
        playerY: 0,
        stickX: stickRef.current.x,
        stickLength: 0,
        stickRotation: 0,
        cameraX: cameraXRef.current,
      };
      
      spawnParticles(targetX, 0, 'confetti', 30);
      triggerHaptic([100, 50, 100]);
      
      if (onReviveComplete) onReviveComplete();
      updateViewState();
      return () => {
        document.removeEventListener('contextmenu', handleContextMenu);
        window.removeEventListener('resize', handleResize);
      };
    }

    // Standard Init
    const startX = 50;
    const firstPlatform: Platform = {
      id: 1,
      x: startX,
      width: INITIAL_PLATFORM_WIDTH,
      isTarget: false,
    };
    const secondPlatform: Platform = {
      id: 2,
      x: startX + INITIAL_PLATFORM_WIDTH + 100,
      width: INITIAL_PLATFORM_WIDTH,
      isTarget: true,
    };

    platformsRef.current = [firstPlatform, secondPlatform];
    playerRef.current = { x: startX + INITIAL_PLATFORM_WIDTH - PLAYER_SIZE - PLAYER_PLATFORM_OFFSET, y: 0 };
    stickRef.current = { x: startX + INITIAL_PLATFORM_WIDTH, length: 0, rotation: 0 };
    cameraXRef.current = 0;
    scoreRef.current = 0;
    comboRef.current = 0;
    stateRef.current = PlayerState.IDLE;
    velocityYRef.current = 0;
    timeRef.current = 0;
    stickRotationVelocityRef.current = 0;
    particlesRef.current = [];
    floatingTextsRef.current = [];
    rotationPhaseTimeRef.current = 0;
    cameraZoomRef.current = 1;
    playerScaleXRef.current = 1;
    playerScaleYRef.current = 1;
    powerUpsRef.current.clear();
    playerTrailRef.current = [];
    
    // Reset last rendered state
    lastRenderedStateRef.current = {
      playerX: playerRef.current.x,
      playerY: playerRef.current.y,
      stickX: stickRef.current.x,
      stickLength: 0,
      stickRotation: 0,
      cameraX: 0,
    };

    updateViewState();
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('resize', handleResize);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReviving]);

  const updateViewState = () => {
    setViewState(prev => ({
      ...prev,
      playerX: playerRef.current.x,
      playerY: playerRef.current.y,
      stickX: stickRef.current.x,
      stickLength: stickRef.current.length,
      stickRotation: stickRef.current.rotation,
      cameraX: cameraXRef.current,
      cameraZoom: cameraZoomRef.current,
      platforms: platformsRef.current,
      particles: particlesRef.current,
      floatingTexts: floatingTextsRef.current,
      backgroundHue: hueRotationRef.current,
      playerScaleX: playerScaleXRef.current,
      playerScaleY: playerScaleYRef.current,
      combo: comboRef.current,
      bgDecor: bgDecorRef.current,
      isFever: comboRef.current >= 3,
    }));
  };

  const spawnNextPlatform = () => {
    const lastPlatform = platformsRef.current[platformsRef.current.length - 1];
    const difficulty = Math.floor(scoreRef.current / 5);
    
    // Better gap calculation - prevent impossible gaps
    const gapBase = Math.min(MAX_GAP, MIN_GAP + Math.random() * 80 + (difficulty * 8));
    const gap = Math.max(MIN_GAP, Math.min(MAX_GAP, gapBase + (Math.random() * 30 - 15)));
    
    let width = Math.max(MIN_PLATFORM_WIDTH, MAX_PLATFORM_WIDTH - (difficulty * 4));
    let isMoving = false;
    let moveSpeed = 0;
    let moveAmplitude = 0;
    let platformType: PlatformType = 'normal';
    let coins = 0;

    // Platform variety
    if (scoreRef.current >= 5 && Math.random() < PLATFORM_VARIETY_CHANCE.coin) {
      platformType = 'coin';
      coins = Math.floor(Math.random() * 3) + 1;
    } else if (scoreRef.current >= 10 && Math.random() < PLATFORM_VARIETY_CHANCE.ice) {
      platformType = 'ice';
      width = Math.max(MIN_PLATFORM_SIZE, width - ICE_PLATFORM_SIZE_REDUCTION); // Ice platforms are smaller
    } else if (scoreRef.current >= 15 && Math.random() < PLATFORM_VARIETY_CHANCE.bouncy) {
      platformType = 'bouncy';
    } else if (scoreRef.current >= 20 && Math.random() < PLATFORM_VARIETY_CHANCE.breakable) {
      platformType = 'breakable';
    }

    if (scoreRef.current >= 5 && Math.random() < 0.3) {
      width = Math.max(MIN_PLATFORM_SIZE, width - NARROW_PLATFORM_SIZE_REDUCTION);
    } else {
      width = Math.max(MIN_PLATFORM_WIDTH, width + (Math.random() * 15 - 7.5));
    }

    if (scoreRef.current >= 20 && Math.random() < 0.2) {
      isMoving = true;
      moveSpeed = 40;
      moveAmplitude = 35;
    }

    const baseX = lastPlatform.x + lastPlatform.width + gap;

    const newPlatform: Platform = {
      id: lastPlatform.id + 1,
      x: baseX,
      width: width,
      isTarget: true,
      isMoving,
      baseX,
      moveSpeed,
      moveAmplitude,
      movePhase: Math.random() * Math.PI * 2,
      type: platformType,
      coins: platformType === 'coin' ? coins : undefined,
    };

    // Keep only 4 platforms for better performance (reduced from 5)
    if (platformsRef.current.length > 4) {
      platformsRef.current.shift();
    }
    
    platformsRef.current.forEach(p => p.isTarget = false);
    newPlatform.isTarget = true;
    
    platformsRef.current.push(newPlatform);
  };

  const getDynamicTolerance = (platform?: Platform) => {
    let baseReduction = Math.floor(scoreRef.current / 10) * 0.5;
    
    // Ice platforms have smaller tolerance
    if (platform?.type === 'ice') {
      baseReduction += 2;
    }
    
    return Math.max(3, 6 - baseReduction);
  };

  const checkSuccess = () => {
    const stickLen = stickRef.current.length;
    const stickX = stickRef.current.x;
    
    // Find the target platform - prefer isTarget flag, fallback to position-based finding
    let targetPlatform = platformsRef.current.find(p => p.isTarget);
    if (!targetPlatform) {
      // Fallback: find first platform ahead of stick
      targetPlatform = platformsRef.current.find(p => p.x > stickX || (p.x + p.width > stickX + 10));
    }

    if (!targetPlatform) return false;

    // Don't stop moving platform immediately - let it continue until player actually lands
    // The platform will stop naturally when player reaches it in WALKING state

    const stickTipX = stickX + stickLen;
    const tolerance = getDynamicTolerance(); 
    
    const landed = stickTipX >= targetPlatform.x - tolerance && stickTipX <= (targetPlatform.x + targetPlatform.width + tolerance);
    const perfect = Math.abs(stickTipX - (targetPlatform.x + targetPlatform.width / 2)) < PERFECT_LANDING_TOLERANCE;

    return { success: landed, perfect, target: targetPlatform };
  };

  const gameLoop = useCallback((dt: number) => {
    // Pause check
    if (isPausedRef.current) {
      return;
    }
    
    const safeDt = Math.min(dt, 0.05);
    const currentFps = 1 / safeDt;
    // Track average FPS to toggle lightweight mode dynamically
    avgFpsRef.current = avgFpsRef.current * 0.9 + currentFps * 0.1;
    if (avgFpsRef.current < 45) {
      lowPerfModeRef.current = true;
    } else if (avgFpsRef.current > 55) {
      lowPerfModeRef.current = false;
    }
    timeRef.current += safeDt;
    hueRotationRef.current = (hueRotationRef.current + 5 * safeDt) % 360;
    
    // Update power-ups (shield is one-time use, so skip time-based updates for it)
    powerUpsRef.current.forEach((powerUp, type) => {
      if (powerUp.active && type !== 'shield') {
        powerUp.timeLeft -= safeDt;
        if (powerUp.timeLeft <= 0) {
          powerUpsRef.current.delete(type);
        }
      }
      // Shield is consumed immediately when used, not time-based
    });
    
    // Update player trail (disabled on mobile for performance)
    if (perfSettings.enablePlayerTrail) {
      playerTrailRef.current = playerTrailRef.current
        .map(t => ({ ...t, life: t.life - safeDt * 2 }))
        .filter(t => t.life > 0);
      
      // Add to trail (reduced frequency for performance)
      if ((stateRef.current === PlayerState.WALKING || stateRef.current === PlayerState.IDLE) && Math.random() < perfSettings.playerTrailSpawnChance) {
        playerTrailRef.current.push({
          x: playerRef.current.x,
          y: playerRef.current.y,
          life: 0.5,
        });
        // Limit trail length (device-optimized)
        if (playerTrailRef.current.length > perfSettings.playerTrailMax) {
          playerTrailRef.current.shift();
        }
      }
    } else {
      playerTrailRef.current = [];
    }

    const state = stateRef.current;
    let needsUpdate = false;

    // Optimize player scale interpolation - only update if needed
    const scaleXDiff = Math.abs(1 - playerScaleXRef.current);
    const scaleYDiff = Math.abs(1 - playerScaleYRef.current);
    if (scaleXDiff > 0.01) {
      playerScaleXRef.current = playerScaleXRef.current + (1 - playerScaleXRef.current) * 10 * safeDt;
      needsUpdate = true;
    }
    if (scaleYDiff > 0.01) {
      playerScaleYRef.current = playerScaleYRef.current + (1 - playerScaleYRef.current) * 10 * safeDt;
      needsUpdate = true;
    }

    // --- Cinematic Camera Zoom (optimized for performance) ---
    let targetZoom = 1.0;
    if (state === PlayerState.GROWING) targetZoom = 0.95; 
    else if (state === PlayerState.WALKING) targetZoom = 1.05; 
    else targetZoom = 1.0;
    
    // Only update zoom if there's a significant change to reduce calculations
    const zoomDiff = Math.abs(targetZoom - cameraZoomRef.current);
    if (zoomDiff > 0.01) {
      cameraZoomRef.current = cameraZoomRef.current + (targetZoom - cameraZoomRef.current) * 2 * safeDt;
      needsUpdate = true;
    }

    platformsRef.current.forEach(p => {
      if (p.isMoving && p.baseX !== undefined && p.moveSpeed && p.moveAmplitude) {
        const omega = p.moveSpeed / p.moveAmplitude;
        const offset = Math.sin(timeRef.current * omega + (p.movePhase || 0)) * p.moveAmplitude;
        p.x = p.baseX + offset;
        needsUpdate = true;
      }
    });

    if (particlesRef.current.length > 0) {
      // More efficient particle update with early exit
      const beforeLength = particlesRef.current.length;
      particlesRef.current = particlesRef.current.filter(p => {
        p.x += p.vx * safeDt;
        p.y += p.vy * safeDt;
        p.vy += PARTICLE_GRAVITY * safeDt;
        p.vx -= p.vx * PARTICLE_DRAG * safeDt;
        p.life -= safeDt * 1.5;
        // Remove if dead or off-screen
        return p.life > 0 && p.y > -PARTICLE_OFFSCREEN_MARGIN && p.y < FALLING_DEATH_THRESHOLD;
      });
      // Only update if particles changed
      if (particlesRef.current.length !== beforeLength) {
        needsUpdate = true;
      }
    }

    if (floatingTextsRef.current.length > 0) {
      const beforeLength = floatingTextsRef.current.length;
      floatingTextsRef.current = floatingTextsRef.current.filter(t => {
        t.y += t.velocityY * safeDt;
        t.life -= safeDt * 0.8;
        // Remove if dead or off-screen
        return t.life > 0 && t.y < FALLING_DEATH_THRESHOLD;
      });
      // Only update if texts changed
      if (floatingTextsRef.current.length !== beforeLength) {
        needsUpdate = true;
      }
    }

    if (state === PlayerState.GROWING) {
      // Slow motion power-up
      const slowmoActive = powerUpsRef.current.get('slowmo')?.active;
      const growthRate = slowmoActive ? INITIAL_GROWTH_RATE * 0.5 : INITIAL_GROWTH_RATE;
      
      stickRef.current.length += growthRate * safeDt;
      
      // Cap stick length and auto-rotate if limit reached
      if (stickRef.current.length >= MAX_STICK_LENGTH) {
        stickRef.current.length = MAX_STICK_LENGTH;
        stateRef.current = PlayerState.ROTATING;
        if (settings.soundEnabled) stopGrowSound();
        stickRotationVelocityRef.current = 0;
        rotationPhaseTimeRef.current = 0;
      }
      
      // Stick grows straight and simple - no jitter
      playerScaleYRef.current = 0.95;
      playerScaleXRef.current = 1.05;
      needsUpdate = true;
    } 
    else if (state === PlayerState.ROTATING) {
      rotationPhaseTimeRef.current += safeDt;
      stickRotationVelocityRef.current += STICK_FALL_ACCEL * safeDt;
      stickRef.current.rotation += stickRotationVelocityRef.current * safeDt;

      const isSafetyStop = rotationPhaseTimeRef.current > STICK_ROTATION_SAFETY_TIME;

      if (stickRef.current.rotation >= 90 || isSafetyStop) {
        stickRef.current.rotation = 90;
        
        if (!isSafetyStop && Math.abs(stickRotationVelocityRef.current) > STOP_BOUNCE_THRESHOLD) {
           if (Math.abs(stickRotationVelocityRef.current) > 200) {
              playStickHit();
              triggerHaptic(15); 
              setViewState(prev => ({ ...prev, isShaking: true }));
              spawnParticles(stickRef.current.x + stickRef.current.length, 0, 'spark', 10);
              setTimeout(() => setViewState(prev => ({ ...prev, isShaking: false })), 200);
           }
           stickRotationVelocityRef.current = -stickRotationVelocityRef.current * STICK_BOUNCE_DAMPING;
        } else {
           stickRotationVelocityRef.current = 0;
           rotationPhaseTimeRef.current = 0;
           
          const result = checkSuccess();
          if (result && result.success) {
            const targetPlatform = result.target;
            
            // Handle platform types
            if (targetPlatform.type === 'breakable') {
              targetPlatform.breakCountdown = 1.0; // Will break after player walks off
            } else if (targetPlatform.type === 'coin' && targetPlatform.coins) {
              const doubleCoins = powerUpsRef.current.get('doubleCoins')?.active;
              const coinAmount = doubleCoins ? targetPlatform.coins * 2 : targetPlatform.coins;
              onCoinCollected(coinAmount);
              spawnFloatingText(targetPlatform.x + targetPlatform.width / 2, 100, `+${coinAmount}`, '#fcd34d');
              playCoin();
            }
            
            stateRef.current = PlayerState.WALKING;
            if (result.perfect) {
               perfectCountRef.current += 1;
               comboRef.current += 1;
               const bonus = comboRef.current >= COMBO_FEVER_THRESHOLD ? PERFECT_BONUS_FEVER : PERFECT_BONUS_BASE;
               const doubleCoins = powerUpsRef.current.get('doubleCoins')?.active;
               const finalBonus = doubleCoins ? bonus * 2 : bonus;
               
               const perfectLoc = result.target.x + result.target.width / 2;
               spawnFloatingText(perfectLoc, 100, comboRef.current >= COMBO_FEVER_THRESHOLD ? 'FEVER!' : 'PERFECT!', comboRef.current >= COMBO_FEVER_THRESHOLD ? '#fcd34d' : '#bef264');
               
               onCoinCollected(finalBonus);
               onGameEvent?.({ type: 'perfect', value: perfectCountRef.current });
               playCoin();
               triggerHaptic([20, 30, 20]);
               spawnParticles(perfectLoc, 0, 'confetti', 20 + (comboRef.current * 5));
               
               // Random power-up chance on perfect (5%)
               if (Math.random() < 0.05) {
                 const powerUpTypes: PowerUpType[] = ['slowmo', 'doubleCoins', 'magnet'];
                 const randomType = powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)];
                 activatePowerUp(randomType);
               }
             } else {
                const landingLoc = stickRef.current.x + stickRef.current.length;
                spawnFloatingText(landingLoc, 50, 'NICE', '#fff');
                comboRef.current = 0;
                onGameEvent?.({ type: 'combo', value: 0 });
             }
           } else {
             // Shield power-up protection
             const shieldActive = powerUpsRef.current.get('shield')?.active;
             if (shieldActive) {
               powerUpsRef.current.delete('shield');
               spawnFloatingText(playerRef.current.x, 150, 'SHIELD!', '#60a5fa');
               
               // Find target platform and position player/stick correctly for walking
               const targetPlatform = platformsRef.current.find(p => p.isTarget);
               if (targetPlatform) {
                 // Position stick tip at target platform center (simulate successful landing)
                 const targetCenter = targetPlatform.x + targetPlatform.width / 2;
                 stickRef.current.length = targetCenter - stickRef.current.x;
                 stickRef.current.rotation = 90;
                 
                 // Set player destination to target platform
                 const destinationX = targetPlatform.x + targetPlatform.width - PLAYER_SIZE - 5;
                 playerRef.current.x = Math.min(playerRef.current.x, destinationX);
               }
               
               // Continue as if successful - WALKING state will handle movement to target platform
               stateRef.current = PlayerState.WALKING;
             } else {
               stateRef.current = PlayerState.FALLING;
               comboRef.current = 0;
               onGameEvent?.({ type: 'combo', value: 0 });
             }
           }
        }
      }
      needsUpdate = true;
    } 
    else if (state === PlayerState.WALKING) {
      // Magnet power-up: pull player slightly toward target platform
      const magnetActive = powerUpsRef.current.get('magnet')?.active;
      const walkSpeed = magnetActive ? PLAYER_WALK_SPEED * MAGNET_SPEED_BOOST : PLAYER_WALK_SPEED;
      
      playerRef.current.x += walkSpeed * safeDt;
      
      playerScaleYRef.current = 1 + Math.sin(timeRef.current * 20) * 0.1;
      playerScaleXRef.current = 1 - Math.sin(timeRef.current * 20) * 0.05;

      // Reduced particle spawn frequency for performance (even more on mobile)
      const dustSpawnChance = perfSettings.isMobile ? 0.02 : 0.05;
      if (Math.random() < dustSpawnChance) spawnParticles(playerRef.current.x, 0, 'dust', 1);

      const stickX = stickRef.current.x;
      const stickLen = stickRef.current.length;
      // Find target platform - prefer isTarget flag, fallback to position-based finding
      let targetPlatform = platformsRef.current.find(p => p.isTarget);
      if (!targetPlatform) {
        // Fallback: find first platform ahead of stick
        targetPlatform = platformsRef.current.find(p => p.x > stickX - 20 && p.id > 1);
      }
      
      let destinationX = 0;
      let success = false;
      let failReason = '';

      if (targetPlatform) {
        const stickTipX = stickX + stickLen;
        let tolerance = getDynamicTolerance(targetPlatform);
        
        // Magnet power-up increases tolerance
        if (magnetActive) {
          tolerance += MAGNET_TOLERANCE_BOOST;
        }
        
        const landed = stickTipX >= targetPlatform.x - tolerance && stickTipX <= (targetPlatform.x + targetPlatform.width + tolerance);
        
        if (landed) {
          // Bouncy platform gives extra boost
          if (targetPlatform.type === 'bouncy') {
            velocityYRef.current = -BOUNCY_PLATFORM_BOOST; // Small bounce
            spawnParticles(targetPlatform.x + targetPlatform.width / 2, 0, 'spark', 15);
          }
          
          destinationX = targetPlatform.x + targetPlatform.width - PLAYER_SIZE - PLAYER_PLATFORM_OFFSET;
          success = true;
        } else {
          destinationX = stickX + stickLen + PLAYER_SIZE; 
          failReason = stickTipX < targetPlatform.x ? 'TOO SHORT' : 'TOO LONG';
        }
      } else {
        destinationX = stickX + stickLen + PLAYER_SIZE;
        failReason = 'OOPS';
      }

      if (playerRef.current.x >= destinationX) {
        playerRef.current.x = destinationX;
        
        if (success) {
          stateRef.current = PlayerState.IDLE;
          scoreRef.current += 1;
          onScore(scoreRef.current);
          spawnNextPlatform();
          playSuccess();
          
          playerScaleYRef.current = 0.7;
          playerScaleXRef.current = 1.3;

          const currentPlat = platformsRef.current.find(p => p.x + p.width > playerRef.current.x);
          if (currentPlat) {
             stickRef.current.x = currentPlat.x + currentPlat.width;
             
             // Break breakable platform
             if (currentPlat.type === 'breakable' && currentPlat.breakCountdown !== undefined) {
               currentPlat.breakCountdown -= safeDt;
               if (currentPlat.breakCountdown <= 0) {
                 spawnParticles(currentPlat.x + currentPlat.width / 2, 0, 'dust', 20);
                 // Mark as broken for rendering
                 currentPlat.type = 'normal';
                 currentPlat.breakCountdown = -1;
               }
             }
          }
          stickRef.current.length = 0;
          stickRef.current.rotation = 0;
          
          // Update combo event
          if (comboRef.current > 0) {
            onGameEvent?.({ type: 'combo', value: comboRef.current });
          }
        } else {
           stateRef.current = PlayerState.FALLING;
           spawnFloatingText(playerRef.current.x, 80, failReason, '#f87171');
           playFail();
           triggerHaptic(200);
        }
      }
      needsUpdate = true;
    }
    else if (state === PlayerState.FALLING) {
      velocityYRef.current += GRAVITY * safeDt;
      playerRef.current.y += velocityYRef.current * safeDt;
      playerRef.current.x += (PLAYER_WALK_SPEED * 0.5) * safeDt;
      // Removed duplicate Y increment - was causing player to fall too fast 

      if (playerRef.current.y > FALLING_DEATH_THRESHOLD) {
        stateRef.current = PlayerState.GAME_OVER; 
        onGameOver(scoreRef.current);
      }
      needsUpdate = true;
    }
    
    if (state !== PlayerState.GAME_OVER) {
        const screenW = viewportWidthRef.current;
        const playerScreenTarget = Math.max(40, Math.min(screenW * 0.2, 150));
        const targetCamX = playerRef.current.x - playerScreenTarget;
        const damping = 3.0; 
        const t = Math.min(1, safeDt * damping);
        
        const dist = targetCamX - cameraXRef.current;
        if (Math.abs(dist) > 0.1) {
            cameraXRef.current = cameraXRef.current + (dist * t);
            needsUpdate = true;
        }
    }

    // Performance optimization: Only update state if values changed significantly or forced update
    const currentState = {
      playerX: playerRef.current.x,
      playerY: playerRef.current.y,
      stickX: stickRef.current.x,
      stickLength: stickRef.current.length,
      stickRotation: stickRef.current.rotation,
      cameraX: cameraXRef.current,
    };
    
    // More sensitive change detection during GROWING for smooth stick growth
    // On mobile, use slightly higher thresholds to reduce update frequency while maintaining smoothness
    const isGrowing = state === PlayerState.GROWING;
    const baseThreshold = perfSettings.isMobile ? 0.15 : 0.1;
    const positionThreshold = isGrowing ? baseThreshold : (perfSettings.isMobile ? 0.6 : 0.5);
    const stickLengthThreshold = isGrowing ? baseThreshold : (perfSettings.isMobile ? 0.6 : 0.5);
    
    const hasSignificantChange = 
      needsUpdate ||
      Math.abs(currentState.playerX - lastRenderedStateRef.current.playerX) > positionThreshold ||
      Math.abs(currentState.playerY - lastRenderedStateRef.current.playerY) > positionThreshold ||
      Math.abs(currentState.stickX - lastRenderedStateRef.current.stickX) > positionThreshold ||
      Math.abs(currentState.stickLength - lastRenderedStateRef.current.stickLength) > stickLengthThreshold ||
      Math.abs(currentState.stickRotation - lastRenderedStateRef.current.stickRotation) > 0.1 ||
      Math.abs(currentState.cameraX - lastRenderedStateRef.current.cameraX) > positionThreshold;
    
    // Update state more frequently during critical states (GROWING, ROTATING) for smoothness
    const isCriticalState = state === PlayerState.GROWING || state === PlayerState.ROTATING || state === PlayerState.WALKING;
    const updateInterval = isCriticalState ? 1 : STATE_UPDATE_INTERVAL;
    
    stateUpdateFrameSkipRef.current++;
    const shouldUpdateState = hasSignificantChange && (stateUpdateFrameSkipRef.current >= updateInterval || needsUpdate);
    
    if (shouldUpdateState) {
      stateUpdateFrameSkipRef.current = 0;
      lastRenderedStateRef.current = currentState;
      
      const activePowerUps = Array.from(powerUpsRef.current.entries())
        .filter(([_, p]) => p.active)
        .map(([type, _]) => type);
      
      setViewState(prev => ({
        ...prev,
        playerX: currentState.playerX,
        playerY: currentState.playerY,
        stickX: currentState.stickX,
        stickLength: currentState.stickLength,
        stickRotation: currentState.stickRotation,
        cameraX: currentState.cameraX,
        cameraZoom: cameraZoomRef.current,
        platforms: platformsRef.current,
        particles: lowPerfModeRef.current ? [] : particlesRef.current,
        floatingTexts: lowPerfModeRef.current ? floatingTextsRef.current.slice(-3) : floatingTextsRef.current,
        combo: comboRef.current,
        bgDecor: lowPerfModeRef.current ? [] : bgDecorRef.current,
        isFever: comboRef.current >= 3,
        isPaused: isPausedRef.current,
        activePowerUps,
        playerTrail: lowPerfModeRef.current ? [] : playerTrailRef.current,
      }));
    }
  }, [onScore, onGameOver, onCoinCollected, onGameEvent]); 

  useGameLoop(gameLoop, stateRef.current !== PlayerState.GAME_OVER && !isPausedRef.current);

  const lastTapRef = useRef<number>(0);
  
  const handlePointerDown = (e: React.SyntheticEvent) => {
    if (e.cancelable) {
      e.preventDefault();
    }
    
    // Double tap to pause (when not in IDLE or GROWING state)
    if (stateRef.current !== PlayerState.IDLE && stateRef.current !== PlayerState.GROWING && !isPausedRef.current) {
      const now = Date.now();
      if (now - lastTapRef.current < DOUBLE_TAP_WINDOW) {
        togglePause();
        lastTapRef.current = 0;
        return;
      }
      lastTapRef.current = now;
    }
    
    if (stateRef.current === PlayerState.IDLE && !isPausedRef.current) {
      stateRef.current = PlayerState.GROWING;
      if (settings.soundEnabled) startGrowSound();
      triggerHaptic(10);
    }
  };

  const handlePointerUp = (e: React.SyntheticEvent) => {
    if (e.cancelable) {
      e.preventDefault();
    }
    if (stateRef.current === PlayerState.GROWING && !isPausedRef.current) {
      stateRef.current = PlayerState.ROTATING;
      if (settings.soundEnabled) stopGrowSound();
      triggerHaptic(15);
      stickRotationVelocityRef.current = 0; 
      rotationPhaseTimeRef.current = 0;
    }
  };

  const getRenderX = (worldX: number) => worldX - viewState.cameraX;

  return (
    <div 
      className={`relative w-full h-full overflow-hidden cursor-pointer select-none touch-none ${viewState.isShaking ? 'shake-effect' : ''} ${viewState.isFever ? 'ring-4 ring-inset ring-yellow-400' : ''}`}
      onMouseDown={handlePointerDown}
      onMouseUp={handlePointerUp}
      onTouchStart={handlePointerDown}
      onTouchEnd={handlePointerUp}
      style={{
        perspective: '1000px', 
      }}
    >
      {/* Dynamic Background Pulse */}
      <div 
        className={`absolute inset-0 bg-indigo-500 transition-opacity duration-300 ${stateRef.current === PlayerState.GROWING ? 'opacity-10' : 'opacity-0'} pointer-events-none z-0`} 
        style={{ mixBlendMode: 'overlay' }}
      />

      {/* Main Scaled Game Container for Camera Zoom */}
      <div 
        className="absolute inset-0"
        style={{ 
          transform: `translate3d(0, 0, 0) scale(${viewState.cameraZoom})`, 
          transformOrigin: 'center center',
          willChange: 'transform',
          backfaceVisibility: 'hidden', // GPU optimization
          perspective: '1000px' // GPU optimization
        }}
      >
        {/* Background Decor Layer - Surreal 3D Flux */}
        <div 
          className="absolute inset-0 pointer-events-none" 
          style={{ 
            transformStyle: 'preserve-3d',
            contain: 'layout style paint', // CSS containment for better performance
            willChange: 'transform'
          }}
        >
            {viewState.bgDecor.map(d => {
                if (lowPerfModeRef.current) return null;
                const parallaxX = (d.x - viewState.cameraX * d.speed) % 2000;
                const renderX = parallaxX < 0 ? parallaxX + 2000 : parallaxX;
                
                // Skip rendering if off-screen for performance (more aggressive on mobile)
                const margin = perfSettings.isMobile ? 50 : 100;
                if (renderX < -margin || renderX > viewportWidth + margin) {
                  return null;
                }
                
                if (d.type === 'flux') {
                    return (
                        <div 
                            key={d.id}
                            className="cyber-flux"
                            style={{
                                left: `${renderX}px`,
                                top: `${d.y}px`,
                                height: `${d.size}px`,
                                color: d.color,
                                // 3D Transform with GPU acceleration
                                transform: `translate3d(0, 0, 0) rotateX(45deg) rotateZ(${d.rotation}deg) scaleY(${stateRef.current === PlayerState.GROWING ? 1.5 : 1})`,
                                willChange: 'transform, left',
                                boxShadow: `0 0 15px ${d.color}`
                            }}
                        />
                    );
                }

                if (d.type === 'pillar') {
                    // Background City Pillars
                    return (
                        <div
                            key={d.id}
                            className="bg-pillar"
                            style={{
                                left: `${renderX}px`,
                                width: `${d.size}px`,
                                height: `${d.height ?? 400}px`,
                                bottom: 0,
                                opacity: d.opacity,
                                transform: `translate3d(0, 0, -500px)`, // Push back with GPU acceleration
                                willChange: 'transform, left'
                            }}
                        />
                    );
                }

                return (
                    <div 
                        key={d.id}
                        className={`absolute ${d.type === 'geo' ? 'border border-cyan-500/20' : 'rounded-full'}`}
                        style={{
                            left: `${renderX}px`,
                            top: `${d.y}px`,
                            width: `${d.size}px`,
                            height: `${d.size}px`,
                            backgroundColor: d.type === 'geo' ? 'transparent' : d.color,
                            opacity: d.opacity,
                            boxShadow: d.type === 'geo' ? 'none' : `0 0 ${d.size}px ${d.color}`,
                            transform: d.type === 'geo' ? `translate3d(0, 0, 0) rotate(${d.rotation}deg)` : 'translate3d(0, 0, 0)',
                            willChange: 'transform, left'
                        }}
                    />
                );
            })}
        </div>

        <div 
            className="cyber-ceiling" 
            style={{ 
              backgroundPositionX: `${-viewState.cameraX * 0.5}px`,
              willChange: 'background-position',
              backfaceVisibility: 'hidden' // GPU optimization
            }}
        />
        <div 
            className="cyber-grid" 
            style={{ 
              backgroundPositionX: `${-viewState.cameraX * 0.5}px`,
              willChange: 'background-position',
              backfaceVisibility: 'hidden' // GPU optimization
            }}
        />

        {/* Dynamic Vertical Lines for Depth Perception (device-optimized count) */}
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            contain: 'layout style paint', // CSS containment for better performance
            willChange: 'transform'
          }}
        >
            {Array.from({ length: perfSettings.verticalLines }).map((_, i) => {
               const spacing = 300;
               const totalWidth = spacing * perfSettings.verticalLines;
               // Parallax factor 0.5 to match grid
               const xPos = ((i * spacing) - (viewState.cameraX * 0.5)) % totalWidth;
               const renderX = xPos < 0 ? xPos + totalWidth : xPos;
               
               // Skip rendering if off-screen (more aggressive on mobile)
               const margin = perfSettings.isMobile ? 30 : 50;
               if (renderX < -margin || renderX > viewportWidth + margin) {
                 return null;
               }
               
               return (
                 <div 
                    key={`v-depth-${i}`}
                    className="vertical-depth-marker"
                    style={{ 
                      left: `${renderX}px`,
                      willChange: 'left',
                      transform: 'translate3d(0, 0, 0)',
                      backfaceVisibility: 'hidden' // GPU optimization
                    }}
                 />
               );
            })}
        </div>

        <div className="scanlines" />

        {/* Game Layer */}
        <div 
            className="absolute top-0 left-0 w-full h-full pointer-events-none"
            style={{ 
              transformStyle: 'preserve-3d',
              contain: 'layout style paint', // CSS containment for better performance
              willChange: 'transform'
            }}
        >
            {viewState.platforms.map(platform => {
            const isOffScreen = getRenderX(platform.x + platform.width) < -200;
            if (isOffScreen) return null;
            
            // Skip rendering if breakable and broken
            if (platform.type === 'breakable' && platform.breakCountdown !== undefined && platform.breakCountdown < 0) {
              return null;
            }
            
            const platformType = platform.type || 'normal';
            const isIce = platformType === 'ice';
            const isBouncy = platformType === 'bouncy';
            const isCoin = platformType === 'coin';
            const isBreakable = platformType === 'breakable';
            
            return (
                <div
                key={platform.id}
                className={`absolute box-border group ${
                  isBreakable && platform.breakCountdown !== undefined && platform.breakCountdown < 0.5 ? 'opacity-50' : ''
                }`}
                style={{
                    left: `${getRenderX(platform.x)}px`,
                    bottom: '0px',
                    width: `${platform.width}px`,
                    height: `${PLATFORM_HEIGHT}px`,
                    willChange: 'transform',
                    transform: 'translate3d(0, 0, 0)',
                    backfaceVisibility: 'hidden', // GPU optimization
                    WebkitTransform: 'translateZ(0)' // Force GPU acceleration on WebKit
                }}
                >
                {/* 3D Side Face */}
                <div 
                    className={`absolute top-0 -right-[20px] w-[20px] h-full origin-left transform skew-y-[-45deg]
                    ${platform.isTarget 
                      ? isIce ? 'bg-blue-800' : isBouncy ? 'bg-green-800' : isCoin ? 'bg-yellow-800' : isBreakable ? 'bg-orange-800' : 'bg-pink-800'
                      : 'bg-cyan-800'}`}
                />
                
                {/* Main Front Face */}
                <div className={`w-full h-full relative z-10 border-t-2 platform-texture shadow-lg
                    ${platform.isTarget 
                        ? isIce 
                          ? 'bg-gradient-to-b from-blue-500 via-blue-700 to-black border-blue-300 shadow-[0_0_50px_rgba(59,130,246,0.5)]' 
                          : isBouncy
                          ? 'bg-gradient-to-b from-green-500 via-green-700 to-black border-green-300 shadow-[0_0_50px_rgba(34,197,94,0.5)]'
                          : isCoin
                          ? 'bg-gradient-to-b from-yellow-500 via-yellow-700 to-black border-yellow-300 shadow-[0_0_50px_rgba(234,179,8,0.5)]'
                          : isBreakable
                          ? 'bg-gradient-to-b from-orange-500 via-orange-700 to-black border-orange-300 shadow-[0_0_50px_rgba(249,115,22,0.5)]'
                          : 'bg-gradient-to-b from-pink-600 via-pink-900 to-black border-pink-400 shadow-[0_0_50px_rgba(236,72,153,0.5)]' 
                        : 'bg-gradient-to-b from-cyan-600 via-cyan-900 to-black border-cyan-400 shadow-[0_0_50px_rgba(34,211,238,0.5)]'}
                `}>
                        <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent opacity-20" />
                        {platform.isTarget && (
                            <>
                              <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-8 h-1 animate-pulse shadow-[0_0_20px_currentColor] ${
                                isIce ? 'bg-blue-300' : isBouncy ? 'bg-green-300' : isCoin ? 'bg-yellow-300' : isBreakable ? 'bg-orange-300' : 'bg-pink-300'
                              }`} />
                              {isCoin && platform.coins && (
                                <div className="absolute top-2 left-1/2 -translate-x-1/2 text-yellow-300 font-black text-xs">
                                  {platform.coins} <span className="text-[8px]">●</span>
                                </div>
                              )}
                            </>
                        )}
                </div>
                </div>
            );
            })}

            {viewState.particles.map(p => {
              const renderX = getRenderX(p.x);
              // Skip rendering if off-screen for performance (more aggressive on mobile)
              const margin = perfSettings.isMobile ? 30 : 50;
              if (renderX < -margin || renderX > viewportWidth + margin || p.y < -PARTICLE_OFFSCREEN_MARGIN || p.y > FALLING_DEATH_THRESHOLD) {
                return null;
              }
              return (
                <div 
                    key={p.id}
                    className="absolute rounded-full z-20"
                    style={{
                    left: `${renderX}px`,
                    bottom: `${PLATFORM_HEIGHT + p.y}px`,
                    width: `${p.size}px`,
                    height: `${p.size}px`,
                    backgroundColor: p.color,
                    opacity: p.life,
                    boxShadow: perfSettings.isMobile ? 'none' : `0 0 ${p.size * 2}px ${p.color}`, // Disable shadows on mobile for performance
                    willChange: 'transform, opacity',
                    transform: 'translate3d(0, 0, 0)',
                    backfaceVisibility: 'hidden' // GPU optimization
                    }}
                />
              );
            })}

            {/* Floating Text Overlay */}
            {viewState.floatingTexts.map(t => {
              const renderX = getRenderX(t.x);
              // Skip rendering if off-screen or too faded (more aggressive on mobile)
              const margin = perfSettings.isMobile ? 50 : 100;
              const minLife = perfSettings.isMobile ? 0.2 : 0.1;
              if (renderX < -margin || renderX > viewportWidth + margin || t.life < minLife) {
                return null;
              }
              return (
                <div
                    key={t.id}
                    className="absolute z-50 font-black italic whitespace-nowrap text-outline"
                    style={{
                        left: `${renderX}px`,
                        bottom: `${PLATFORM_HEIGHT + t.y}px`,
                        transform: 'translate3d(-50%, 0, 0)',
                        fontSize: '24px',
                        color: t.color,
                        opacity: t.life,
                        textShadow: `0 0 5px ${t.color}`,
                        willChange: 'transform, opacity'
                    }}
                >
                    {t.text}
                </div>
              );
            })}

            {/* 3D Stick - Straight and simple, no jitter */}
            <div
            className="absolute origin-bottom-left z-10 rounded-full overflow-hidden"
            style={{
                left: `${getRenderX(viewState.stickX)}px`, 
                bottom: `${PLATFORM_HEIGHT}px`,
                width: `${STICK_WIDTH}px`,
                height: `${viewState.stickLength}px`,
                transform: `translate3d(0, 0, 0) rotate(${viewState.stickRotation}deg)`,
                willChange: 'transform, height',
                boxShadow: `0 0 ${stateRef.current === PlayerState.GROWING ? '30px' : '15px'} rgba(253,224,71,0.8)`,
                background: '#facc15',
                backfaceVisibility: 'hidden', // GPU optimization
                WebkitTransform: 'translateZ(0)' // Force GPU acceleration on WebKit
            }}
            >
                <div className={`w-full h-full bg-white`} />
            </div>

            {/* Player Trail (device-optimized, disabled on mobile) */}
            {perfSettings.enablePlayerTrail && viewState.playerTrail.slice(-perfSettings.playerTrailMax).map((trail, i) => (
              <div
                key={`trail-${i}`}
                className={`absolute rounded-sm z-15 ${skinColor}`}
                style={{
                  left: `${getRenderX(trail.x)}px`,
                  bottom: `${PLATFORM_HEIGHT - trail.y}px`,
                  width: `${PLAYER_SIZE * 0.6}px`,
                  height: `${PLAYER_SIZE * 0.6}px`,
                  opacity: trail.life * 0.3,
                  transform: 'translate3d(0, 0, 0)',
                  transformOrigin: 'bottom center',
                  willChange: 'transform, opacity'
                }}
              />
            ))}
            
            <div
            className={`absolute rounded-sm shadow-[0_0_20px_rgba(255,255,255,0.8)] z-20 ${skinColor}`}
            style={{
                left: `${getRenderX(viewState.playerX)}px`,
                bottom: `${PLATFORM_HEIGHT - viewState.playerY}px`,
                width: `${PLAYER_SIZE}px`,
                height: `${PLAYER_SIZE}px`,
                transform: `
                    translate3d(0, ${viewState.playerY > 0 ? 0 : 0}px, 0)
                    rotate(${viewState.playerY > 0 ? viewState.playerY : 0}deg) 
                    scale(${viewState.playerScaleX}, ${viewState.playerScaleY})
                `,
                transformOrigin: 'bottom center',
                willChange: 'transform',
                backfaceVisibility: 'hidden', // GPU optimization
                WebkitTransform: 'translateZ(0)' // Force GPU acceleration on WebKit
            }}
            >
            <div className="absolute top-1 right-1 w-2.5 h-2.5 bg-white rounded-full shadow-[0_0_5px_white]" />
            <div className="absolute top-2 -left-2 w-5 h-2 bg-inherit opacity-80 rounded-l-full animate-pulse" />
            </div>
        </div>
      </div>

      <div className="absolute bottom-[max(3rem,env(safe-area-inset-bottom))] left-0 w-full text-center pointer-events-none z-40 origin-bottom"
           style={{ 
             transform: `translate3d(0, 0, 0) scale(${stateRef.current === PlayerState.GROWING ? 1.2 : 1})`,
             willChange: 'transform'
           }}>
        {stateRef.current === PlayerState.IDLE && (
            <span className="text-cyan-200 font-bold text-sm bg-black/40 backdrop-blur-md px-6 py-2 rounded-full border border-cyan-400/50 animate-pulse tracking-widest shadow-[0_0_20px_rgba(34,211,238,0.3)]">
                HOLD TO GROW
            </span>
        )}
      </div>

      {viewState.isFever && (
          <div className="absolute top-[max(6rem,env(safe-area-inset-top))] left-1/2 -translate-x-1/2 text-yellow-300 font-black text-xl bg-black/50 px-4 py-1 rounded-lg border border-yellow-400 animate-bounce pointer-events-none z-50">
              FEVER MODE x2
          </div>
      )}
      
      {/* Pause Overlay */}
      {viewState.isPaused && (
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-slate-900/95 border border-cyan-500/50 rounded-2xl p-8 text-center">
            <h3 className="text-3xl font-black text-cyan-400 mb-4">PAUSED</h3>
            <p className="text-white/60 text-sm mb-6">Tap to resume</p>
            <button
              onClick={togglePause}
              className="px-6 py-2 bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded-lg"
            >
              RESUME
            </button>
          </div>
        </div>
      )}
      
      {/* Power-up Indicators */}
      {viewState.activePowerUps.length > 0 && (
        <div className="absolute top-[max(8rem,env(safe-area-inset-top))] left-1/2 -translate-x-1/2 flex gap-2 pointer-events-none z-50">
          {viewState.activePowerUps.map(powerUp => (
            <div
              key={powerUp}
              className="bg-black/60 backdrop-blur-md px-3 py-1 rounded-lg border border-cyan-400/50 text-cyan-300 text-xs font-bold uppercase"
            >
              {powerUp === 'slowmo' ? 'SLOW MO' : powerUp === 'doubleCoins' ? '2X COINS' : powerUp === 'magnet' ? 'MAGNET' : 'SHIELD'}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StickStretchGame;
