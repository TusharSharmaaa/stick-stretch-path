import { DailyChallenge } from '../types';
import { getDailyChallenges, saveDailyChallenges } from './storage';

const CHALLENGE_TEMPLATES = [
  { description: 'Land 5 perfect landings', target: 5, reward: 50 },
  { description: 'Reach score 20', target: 20, reward: 30 },
  { description: 'Get a 3 combo', target: 3, reward: 40 },
  { description: 'Collect 10 coins', target: 10, reward: 25 },
  { description: 'Play 3 games', target: 3, reward: 20 },
];

export const generateDailyChallenges = (): DailyChallenge[] => {
  const existing = getDailyChallenges();
  if (existing) {
    // Check if any challenges have expired
    const now = Date.now();
    const allExpired = existing.every(ch => ch.expiresAt < now);
    if (!allExpired) {
      // Filter out expired challenges and return valid ones
      const valid = existing.filter(ch => ch.expiresAt >= now);
      if (valid.length > 0) {
        return valid;
      }
    }
    // If all expired or none valid, generate new ones
  }
  
  // Pick 3 random challenges using Fisher–Yates shuffle for unbiased randomness
  const pool = [...CHALLENGE_TEMPLATES];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = pool[i];
    pool[i] = pool[j];
    pool[j] = tmp;
  }
  const selected = pool.slice(0, 3);
  
  const challenges: DailyChallenge[] = selected.map((ch, i) => ({
    id: `daily_${Date.now()}_${i}`,
    description: ch.description,
    target: ch.target,
    progress: 0,
    reward: ch.reward,
    completed: false,
    expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
  }));
  
  saveDailyChallenges(challenges);
  return challenges;
};

export const updateDailyChallengeProgress = (
  challengeId: string,
  progress: number,
  challenges: DailyChallenge[]
): { challenges: DailyChallenge[]; completed: boolean } => {
  const updated = challenges.map(ch => {
    if (ch.id !== challengeId) return ch;
    
    const newProgress = Math.min(progress, ch.target);
    const completed = newProgress >= ch.target && !ch.completed;
    
    return {
      ...ch,
      progress: newProgress,
      completed: completed || ch.completed,
    };
  });
  
  saveDailyChallenges(updated);
  const challenge = updated.find(ch => ch.id === challengeId);
  
  return {
    challenges: updated,
    completed: challenge?.completed || false,
  };
};

