import { Achievement } from '../types';
import { ACHIEVEMENTS } from '../constants';
import { getAchievements, saveAchievements } from './storage';

export const initializeAchievements = (): Achievement[] => {
  const saved = getAchievements();
  if (saved.length > 0) return saved;
  
  return ACHIEVEMENTS.map(ach => ({
    id: ach.id,
    name: ach.name,
    description: ach.description,
    unlocked: false,
    progress: 0,
    target: ach.target,
  }));
};

export const updateAchievementProgress = (
  achievementId: string,
  progress: number,
  achievements: Achievement[]
): { achievements: Achievement[]; newlyUnlocked: Achievement | null } => {
  const updated = achievements.map(ach => {
    if (ach.id !== achievementId) return ach;
    
    const newProgress = Math.min(progress, ach.target || 0);
    const wasUnlocked = ach.unlocked;
    const nowUnlocked = newProgress >= (ach.target || 0);
    
    return {
      ...ach,
      progress: newProgress,
      unlocked: nowUnlocked,
      unlockedAt: !wasUnlocked && nowUnlocked ? Date.now() : ach.unlockedAt,
    };
  });
  
  saveAchievements(updated);
  
  const newlyUnlocked = updated.find(a => a.id === achievementId && a.unlocked && !achievements.find(o => o.id === achievementId && o.unlocked));
  
  return { achievements: updated, newlyUnlocked: newlyUnlocked || null };
};

export const checkAchievements = (
  stats: any,
  currentGame: { score: number; perfects: number; combo: number }
): { achievements: Achievement[]; newlyUnlocked: Achievement[] } => {
  let achievements = getAchievements();
  if (achievements.length === 0) {
    achievements = initializeAchievements();
  }
  
  const newlyUnlocked: Achievement[] = [];
  
  // Check various achievements based on accumulated stats
  const updates: Array<{ id: string; progress: number }> = [];
  
  // First perfect achievement
  if (stats.totalPerfects > 0) {
    updates.push({ id: 'first_perfect', progress: 1 });
  }
  
  // Perfect 10 in one game
  if (currentGame.perfects >= 10) {
    updates.push({ id: 'perfect_10', progress: 10 });
  }
  
  // Total perfects
  updates.push({ id: 'perfect_100', progress: stats.totalPerfects });
  
  // Combo achievements
  if (stats.bestCombo >= 5) {
    updates.push({ id: 'combo_5', progress: stats.bestCombo });
  }
  
  // Score achievements
  if (currentGame.score >= 50) {
    updates.push({ id: 'score_50', progress: currentGame.score });
  }
  if (currentGame.score >= 100) {
    updates.push({ id: 'score_100', progress: currentGame.score });
  }
  
  // Total coins
  updates.push({ id: 'coins_1000', progress: stats.totalCoinsEarned });
  
  // Games played
  updates.push({ id: 'games_100', progress: stats.gamesPlayed });
  
  updates.forEach(update => {
    const ach = achievements.find(a => a.id === update.id);
    if (!ach || ach.unlocked) return;
    
    const wasUnlocked = ach.unlocked;
    const result = updateAchievementProgress(update.id, update.progress, achievements);
    achievements = result.achievements;
    
    if (result.newlyUnlocked && !wasUnlocked) {
      newlyUnlocked.push(result.newlyUnlocked);
    }
  });
  
  return { achievements, newlyUnlocked };
};

