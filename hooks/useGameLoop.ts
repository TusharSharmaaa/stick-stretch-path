import { useEffect, useRef } from 'react';

export const useGameLoop = (
  callback: (deltaTime: number) => void,
  isRunning: boolean
) => {
  const requestRef = useRef<number | undefined>(undefined);
  const previousTimeRef = useRef<number | undefined>(undefined);
  const callbackRef = useRef(callback);
  const frameSkipRef = useRef<number>(0);
  const lastFpsCheckRef = useRef<number>(0);
  const frameCountRef = useRef<number>(0);
  const targetFpsRef = useRef<number>(60);

  // Keep callback ref updated
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const animate = (time: number) => {
    if (previousTimeRef.current !== undefined) {
      const deltaTime = (time - previousTimeRef.current) / 1000; // Convert to seconds
      // Cap deltaTime to prevent large jumps
      const safeDeltaTime = Math.min(deltaTime, 0.05);
      
      // FPS monitoring and adaptive frame skipping (less aggressive for smoother gameplay)
      frameCountRef.current++;
      if (time - lastFpsCheckRef.current > 1000) {
        const currentFps = frameCountRef.current;
        frameCountRef.current = 0;
        lastFpsCheckRef.current = time;
        
        // Less aggressive frame skipping - only skip if FPS is really low
        if (currentFps < 40) {
          targetFpsRef.current = Math.max(35, currentFps - 3);
        } else if (currentFps >= 55) {
          targetFpsRef.current = 60; // Target 60fps for smooth gameplay
        }
      }
      
      // Frame skipping for performance (less aggressive - only skip if FPS is very low)
      const skipFrames = Math.max(0, Math.floor(60 / targetFpsRef.current) - 1);
      frameSkipRef.current++;
      
      // Always run callback for smooth gameplay (frame skipping is handled internally by the game loop)
      callbackRef.current(safeDeltaTime);
      
      // Reset skip counter when needed
      if (frameSkipRef.current > skipFrames) {
        frameSkipRef.current = 0;
      }
    }
    previousTimeRef.current = time;
    requestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    if (isRunning) {
      previousTimeRef.current = undefined;
      lastFpsCheckRef.current = performance.now();
      frameCountRef.current = 0;
      frameSkipRef.current = 0;
      targetFpsRef.current = 60;
      requestRef.current = requestAnimationFrame(animate);
    } else {
      previousTimeRef.current = undefined;
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    }

    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [isRunning]);
};