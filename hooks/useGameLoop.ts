import { useEffect, useRef } from 'react';

export const useGameLoop = (
  callback: (deltaTime: number) => void,
  isRunning: boolean
) => {
  const requestRef = useRef<number | undefined>(undefined);
  const previousTimeRef = useRef<number | undefined>(undefined);

  const animate = (time: number) => {
    if (previousTimeRef.current !== undefined) {
      const deltaTime = (time - previousTimeRef.current) / 1000; // Convert to seconds
      callback(deltaTime);
    }
    previousTimeRef.current = time;
    requestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    if (isRunning) {
      previousTimeRef.current = undefined;
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
  }, [isRunning, callback]);
};