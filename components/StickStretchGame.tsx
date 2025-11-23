
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { PlayerState, Platform, Stick, Player, Particle, FloatingText } from '../types';
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
  PARTICLE_DRAG
} from '../constants';
import { startGrowSound, stopGrowSound, playStickHit, playSuccess, playFail, playCoin } from '../utils/audio';

interface StickStretchGameProps {
  skinColor: string;
  onScore: (score: number) => void;
  onGameOver: (finalScore: number) => void;
  onCoinCollected: (amount: number) => void;
  isReviving?: boolean;
  onReviveComplete?: () => void;
}

interface DecorObject {
  id: number;
  x: number;
  y: number;
  size: number; // width/height
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
  onReviveComplete
}) => {
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
  
  // Decor Refs
  const bgDecorRef = useRef<DecorObject[]>([]);
  
  // Physics Refs
  const stickRotationVelocityRef = useRef<number>(0);
  const hueRotationRef = useRef<number>(0);
  const rotationPhaseTimeRef = useRef<number>(0);

  // Animation Refs
  const playerScaleYRef = useRef<number>(1);
  const playerScaleXRef = useRef<number>(1);
  const cameraZoomRef = useRef<number>(1);

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
    stickJitter: 0,
    bgDecor: [] as DecorObject[],
    isFever: false,
  });

  const triggerHaptic = (pattern: number | number[]) => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(pattern);
    }
  };

  const spawnFloatingText = (x: number, y: number, text: string, color: string) => {
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
    for (let i = 0; i < count; i++) {
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
    
    // Background Pillars
    for(let i=0; i<15; i++) {
      bg.push({
        id: i + 500,
        x: Math.random() * 2500,
        y: 0,
        size: Math.random() * 60 + 40,
        speed: Math.random() * 0.15 + 0.05,
        rotation: 0,
        type: 'pillar',
        opacity: Math.random() * 0.3 + 0.1,
        color: '#1e293b'
      });
    }

    // Surreal Flux Lines
    for(let i=0; i<15; i++) {
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

    // Geometric Shapes
    for(let i=0; i<5; i++) {
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

    // Dust Particles
    for(let i=0; i<20; i++) {
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
    initDecor();

    const handleContextMenu = (e: MouseEvent) => e.preventDefault();
    document.addEventListener('contextmenu', handleContextMenu);

    if (isReviving && platformsRef.current.length > 0) {
      // Safe Revive
      const lastSafePlat = platformsRef.current[platformsRef.current.length - 2] || platformsRef.current[0];
      const targetX = lastSafePlat.x + lastSafePlat.width - PLAYER_SIZE - 5;
      
      playerRef.current = { x: targetX, y: 0 };
      stickRef.current = { x: lastSafePlat.x + lastSafePlat.width, length: 0, rotation: 0 };
      stateRef.current = PlayerState.IDLE;
      velocityYRef.current = 0;
      stickRotationVelocityRef.current = 0;
      rotationPhaseTimeRef.current = 0;
      
      spawnParticles(targetX, 0, 'confetti', 30);
      triggerHaptic([100, 50, 100]);
      
      if (onReviveComplete) onReviveComplete();
      updateViewState();
      return () => document.removeEventListener('contextmenu', handleContextMenu);
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
    playerRef.current = { x: startX + INITIAL_PLATFORM_WIDTH - PLAYER_SIZE - 5, y: 0 };
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

    updateViewState();
    return () => document.removeEventListener('contextmenu', handleContextMenu);
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
    const gapBase = Math.min(MAX_GAP, MIN_GAP + Math.random() * 100 + (difficulty * 10));
    const gap = Math.max(MIN_GAP, Math.min(MAX_GAP, gapBase + (Math.random() * 40 - 20)));
    
    let width = Math.max(MIN_PLATFORM_WIDTH, MAX_PLATFORM_WIDTH - (difficulty * 5));
    let isMoving = false;
    let moveSpeed = 0;
    let moveAmplitude = 0;

    if (scoreRef.current >= 5 && Math.random() < 0.3) {
      width = 70;
    } else {
      width = Math.max(MIN_PLATFORM_WIDTH, width + (Math.random() * 20 - 10));
    }

    if (scoreRef.current >= 20 && Math.random() < 0.2) {
      isMoving = true;
      moveSpeed = 45;
      moveAmplitude = 40;
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
    };

    if (platformsRef.current.length > 5) {
      platformsRef.current.shift();
    }
    
    platformsRef.current.forEach(p => p.isTarget = false);
    newPlatform.isTarget = true;
    
    platformsRef.current.push(newPlatform);
  };

  const getDynamicTolerance = () => {
    const reduction = Math.floor(scoreRef.current / 10) * 0.5;
    return Math.max(4, 6 - reduction);
  };

  const checkSuccess = () => {
    const stickLen = stickRef.current.length;
    const stickX = stickRef.current.x;
    
    const targetPlatform = platformsRef.current.find(p => p.x > stickX || (p.x + p.width > stickX + 10));

    if (!targetPlatform) return false;

    if (targetPlatform.isMoving) {
      targetPlatform.isMoving = false;
    }

    const stickTipX = stickX + stickLen;
    const tolerance = getDynamicTolerance(); 
    
    const landed = stickTipX >= targetPlatform.x - tolerance && stickTipX <= (targetPlatform.x + targetPlatform.width + tolerance);
    const perfect = Math.abs(stickTipX - (targetPlatform.x + targetPlatform.width / 2)) < 8;

    return { success: landed, perfect, target: targetPlatform };
  };

  const gameLoop = useCallback((dt: number) => {
    const safeDt = Math.min(dt, 0.05);
    timeRef.current += safeDt;
    hueRotationRef.current = (hueRotationRef.current + 5 * safeDt) % 360;

    const state = stateRef.current;
    let needsUpdate = false;
    let stickJitter = 0;

    playerScaleXRef.current = playerScaleXRef.current + (1 - playerScaleXRef.current) * 10 * safeDt;
    playerScaleYRef.current = playerScaleYRef.current + (1 - playerScaleYRef.current) * 10 * safeDt;

    // --- Cinematic Camera Zoom ---
    let targetZoom = 1.0;
    if (state === PlayerState.GROWING) targetZoom = 0.95; 
    else if (state === PlayerState.WALKING) targetZoom = 1.05; 
    else targetZoom = 1.0;
    
    cameraZoomRef.current = cameraZoomRef.current + (targetZoom - cameraZoomRef.current) * 2 * safeDt;

    platformsRef.current.forEach(p => {
      if (p.isMoving && p.baseX !== undefined && p.moveSpeed && p.moveAmplitude) {
        const omega = p.moveSpeed / p.moveAmplitude;
        const offset = Math.sin(timeRef.current * omega + (p.movePhase || 0)) * p.moveAmplitude;
        p.x = p.baseX + offset;
        needsUpdate = true;
      }
    });

    if (particlesRef.current.length > 0) {
      particlesRef.current = particlesRef.current.filter(p => {
        p.x += p.vx * safeDt;
        p.y += p.vy * safeDt;
        p.vy += PARTICLE_GRAVITY * safeDt;
        p.vx -= p.vx * PARTICLE_DRAG * safeDt;
        p.life -= safeDt * 1.5;
        return p.life > 0;
      });
      needsUpdate = true;
    }

    if (floatingTextsRef.current.length > 0) {
      floatingTextsRef.current = floatingTextsRef.current.filter(t => {
        t.y += t.velocityY * safeDt;
        t.life -= safeDt * 0.8;
        return t.life > 0;
      });
      needsUpdate = true;
    }

    if (state === PlayerState.GROWING) {
      stickRef.current.length += INITIAL_GROWTH_RATE * safeDt;
      stickJitter = Math.sin(timeRef.current * 60) * 3;
      
      playerScaleYRef.current = 0.95;
      playerScaleXRef.current = 1.05;
      needsUpdate = true;
    } 
    else if (state === PlayerState.ROTATING) {
      rotationPhaseTimeRef.current += safeDt;
      stickRotationVelocityRef.current += STICK_FALL_ACCEL * safeDt;
      stickRef.current.rotation += stickRotationVelocityRef.current * safeDt;

      const isSafetyStop = rotationPhaseTimeRef.current > 1.2;

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
             stateRef.current = PlayerState.WALKING;
             if (result.perfect) {
                comboRef.current += 1;
                const bonus = comboRef.current >= 3 ? 2 : 1;
                
                const perfectLoc = result.target.x + result.target.width / 2;
                spawnFloatingText(perfectLoc, 100, comboRef.current >= 3 ? 'FEVER!' : 'PERFECT!', comboRef.current >= 3 ? '#fcd34d' : '#bef264');
                
                onCoinCollected(bonus);
                playCoin();
                triggerHaptic([20, 30, 20]);
                spawnParticles(perfectLoc, 0, 'confetti', 20 + (comboRef.current * 5));
             } else {
                const landingLoc = stickRef.current.x + stickRef.current.length;
                spawnFloatingText(landingLoc, 50, 'NICE', '#fff');
                comboRef.current = 0;
             }
           } else {
             stateRef.current = PlayerState.WALKING;
             comboRef.current = 0;
           }
        }
      }
      needsUpdate = true;
    } 
    else if (state === PlayerState.WALKING) {
      playerRef.current.x += PLAYER_WALK_SPEED * safeDt;
      
      playerScaleYRef.current = 1 + Math.sin(timeRef.current * 20) * 0.1;
      playerScaleXRef.current = 1 - Math.sin(timeRef.current * 20) * 0.05;

      if (Math.random() < 0.1) spawnParticles(playerRef.current.x, 0, 'dust', 1);

      const stickX = stickRef.current.x;
      const stickLen = stickRef.current.length;
      const targetPlatform = platformsRef.current.find(p => p.x > stickX - 20 && p.id > 1);
      
      let destinationX = 0;
      let success = false;
      let failReason = '';

      if (targetPlatform) {
        const stickTipX = stickX + stickLen;
        const tolerance = getDynamicTolerance();
        const landed = stickTipX >= targetPlatform.x - tolerance && stickTipX <= (targetPlatform.x + targetPlatform.width + tolerance);
        
        if (landed) {
          destinationX = targetPlatform.x + targetPlatform.width - PLAYER_SIZE - 5;
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
          }
          stickRef.current.length = 0;
          stickRef.current.rotation = 0;
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
      playerRef.current.y += 10 * safeDt; 

      if (playerRef.current.y > 600) {
        stateRef.current = PlayerState.GAME_OVER; 
        onGameOver(scoreRef.current);
      }
      needsUpdate = true;
    }
    
    if (state !== PlayerState.GAME_OVER) {
        const screenW = window.innerWidth;
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

    if (needsUpdate || stickJitter !== 0) {
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
        stickJitter,
        combo: comboRef.current,
        bgDecor: bgDecorRef.current,
        isFever: comboRef.current >= 3,
      }));
    }
  }, [onScore, onGameOver, onCoinCollected]); 

  useGameLoop(gameLoop, stateRef.current !== PlayerState.GAME_OVER);

  const handlePointerDown = (e: React.SyntheticEvent) => {
    e.preventDefault(); // Critical for Android touch
    if (stateRef.current === PlayerState.IDLE) {
      stateRef.current = PlayerState.GROWING;
      startGrowSound();
      triggerHaptic(10);
    }
  };

  const handlePointerUp = (e: React.SyntheticEvent) => {
    e.preventDefault(); // Critical for Android touch
    if (stateRef.current === PlayerState.GROWING) {
      stateRef.current = PlayerState.ROTATING;
      stopGrowSound();
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
        className="absolute inset-0 transition-transform duration-300 ease-out"
        style={{ transform: `scale(${viewState.cameraZoom})`, transformOrigin: 'center center' }}
      >
        {/* Background Decor Layer - Surreal 3D Flux */}
        <div className="absolute inset-0 pointer-events-none" style={{ transformStyle: 'preserve-3d' }}>
            {viewState.bgDecor.map(d => {
                const parallaxX = (d.x - viewState.cameraX * d.speed) % 2000;
                const renderX = parallaxX < 0 ? parallaxX + 2000 : parallaxX;
                
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
                                // 3D Transform
                                transform: `rotateX(45deg) rotateZ(${d.rotation}deg) scaleY(${stateRef.current === PlayerState.GROWING ? 1.5 : 1})`,
                                transition: 'transform 0.2s',
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
                                height: `${300 + Math.random() * 200}px`, // Fixed height variation
                                bottom: 0,
                                opacity: d.opacity,
                                transform: `translateZ(-500px)`, // Push back
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
                            transform: d.type === 'geo' ? `rotate(${d.rotation}deg)` : 'none',
                            willChange: 'transform, left'
                        }}
                    />
                );
            })}
        </div>

        <div 
            className="cyber-ceiling" 
            style={{ backgroundPositionX: `${-viewState.cameraX * 0.5}px` }}
        />
        <div 
            className="cyber-grid" 
            style={{ backgroundPositionX: `${-viewState.cameraX * 0.5}px` }}
        />

        {/* Dynamic Vertical Lines for Depth Perception */}
        <div className="absolute inset-0 pointer-events-none">
            {Array.from({ length: 12 }).map((_, i) => {
               const spacing = 300;
               const totalWidth = spacing * 12;
               // Parallax factor 0.5 to match grid
               const xPos = ((i * spacing) - (viewState.cameraX * 0.5)) % totalWidth;
               const renderX = xPos < 0 ? xPos + totalWidth : xPos;
               
               return (
                 <div 
                    key={`v-depth-${i}`}
                    className="vertical-depth-marker"
                    style={{ left: `${renderX}px` }}
                 />
               );
            })}
        </div>

        <div className="scanlines" />

        {/* Game Layer */}
        <div 
            className="absolute top-0 left-0 w-full h-full pointer-events-none"
            style={{ transformStyle: 'preserve-3d' }}
        >
            {viewState.platforms.map(platform => {
            const isOffScreen = getRenderX(platform.x + platform.width) < -200;
            if (isOffScreen) return null;
            
            return (
                <div
                key={platform.id}
                className={`absolute transition-transform box-border group`}
                style={{
                    left: `${getRenderX(platform.x)}px`,
                    bottom: '0px',
                    width: `${platform.width}px`,
                    height: `${PLATFORM_HEIGHT}px`,
                    willChange: 'transform, left',
                    transform: 'translateZ(0)',
                }}
                >
                {/* 3D Side Face */}
                <div 
                    className={`absolute top-0 -right-[20px] w-[20px] h-full origin-left transform skew-y-[-45deg]
                    ${platform.isTarget ? 'bg-pink-800' : 'bg-cyan-800'}`}
                />
                
                {/* Main Front Face */}
                <div className={`w-full h-full relative z-10 border-t-2 platform-texture shadow-lg
                    ${platform.isTarget 
                        ? 'bg-gradient-to-b from-pink-600 via-pink-900 to-black border-pink-400 shadow-[0_0_50px_rgba(236,72,153,0.5)]' 
                        : 'bg-gradient-to-b from-cyan-600 via-cyan-900 to-black border-cyan-400 shadow-[0_0_50px_rgba(34,211,238,0.5)]'}
                `}>
                        <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent opacity-20" />
                        {platform.isTarget && (
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-pink-300 animate-pulse shadow-[0_0_20px_rgba(236,72,153,1)]" />
                        )}
                </div>
                </div>
            );
            })}

            {viewState.particles.map(p => (
            <div 
                key={p.id}
                className="absolute rounded-full z-20"
                style={{
                left: `${getRenderX(p.x)}px`,
                bottom: `${PLATFORM_HEIGHT + p.y}px`,
                width: `${p.size}px`,
                height: `${p.size}px`,
                backgroundColor: p.color,
                opacity: p.life,
                boxShadow: `0 0 ${p.size * 2}px ${p.color}`,
                willChange: 'left, bottom, opacity'
                }}
            />
            ))}

            {/* Floating Text Overlay */}
            {viewState.floatingTexts.map(t => (
                <div
                    key={t.id}
                    className="absolute z-50 font-black italic whitespace-nowrap text-outline"
                    style={{
                        left: `${getRenderX(t.x)}px`,
                        bottom: `${PLATFORM_HEIGHT + t.y}px`,
                        transform: 'translateX(-50%)',
                        fontSize: '24px',
                        color: t.color,
                        opacity: t.life,
                        textShadow: `0 0 5px ${t.color}`,
                    }}
                >
                    {t.text}
                </div>
            ))}

            {/* 3D Stick */}
            <div
            className="absolute origin-bottom-left z-10 rounded-full overflow-hidden"
            style={{
                left: `${getRenderX(viewState.stickX) + (Math.random() * viewState.stickJitter)}px`, 
                bottom: `${PLATFORM_HEIGHT}px`,
                width: `${STICK_WIDTH}px`,
                height: `${viewState.stickLength}px`,
                transform: `rotate(${viewState.stickRotation}deg)`,
                willChange: 'transform, height',
                boxShadow: `0 0 ${stateRef.current === PlayerState.GROWING ? '30px' : '15px'} rgba(253,224,71,0.8)`,
                background: '#facc15'
            }}
            >
                <div className={`w-full h-full bg-white`} />
            </div>

            <div
            className={`absolute rounded-sm transition-transform shadow-[0_0_20px_rgba(255,255,255,0.8)] z-20 ${skinColor}`}
            style={{
                left: `${getRenderX(viewState.playerX)}px`,
                bottom: `${PLATFORM_HEIGHT - viewState.playerY}px`,
                width: `${PLAYER_SIZE}px`,
                height: `${PLAYER_SIZE}px`,
                transform: `
                    translateY(${viewState.playerY > 0 ? 0 : 0}px)
                    rotate(${viewState.playerY > 0 ? viewState.playerY : 0}deg) 
                    scale(${viewState.playerScaleX}, ${viewState.playerScaleY})
                `,
                transformOrigin: 'bottom center',
                willChange: 'transform, left, bottom'
            }}
            >
            <div className="absolute top-1 right-1 w-2.5 h-2.5 bg-white rounded-full shadow-[0_0_5px_white]" />
            <div className="absolute top-2 -left-2 w-5 h-2 bg-inherit opacity-80 rounded-l-full animate-pulse" />
            </div>
        </div>
      </div>

      <div className="absolute bottom-[max(3rem,env(safe-area-inset-bottom))] left-0 w-full text-center pointer-events-none z-40 transition-transform duration-100 origin-bottom"
           style={{ transform: stateRef.current === PlayerState.GROWING ? 'scale(1.2)' : 'scale(1)' }}>
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
    </div>
  );
};

export default StickStretchGame;
