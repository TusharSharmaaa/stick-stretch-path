export const getHighScore = (): number => {
  const score = localStorage.getItem('stick-stretch-highscore');
  return score ? parseInt(score, 10) : 0;
};

export const setHighScore = (score: number) => {
  localStorage.setItem('stick-stretch-highscore', score.toString());
};

export const getCoins = (): number => {
  const coins = localStorage.getItem('stick-stretch-coins');
  return coins ? parseInt(coins, 10) : 0;
};

export const saveCoins = (coins: number) => {
  localStorage.setItem('stick-stretch-coins', coins.toString());
};

export const getUnlockedSkins = (): string[] => {
  const skins = localStorage.getItem('stick-stretch-skins');
  return skins ? JSON.parse(skins) : ['default'];
};

export const saveUnlockedSkins = (skins: string[]) => {
  localStorage.setItem('stick-stretch-skins', JSON.stringify(skins));
};

export const getSelectedSkin = (): string => {
  return localStorage.getItem('stick-stretch-selected-skin') || 'default';
};

export const saveSelectedSkin = (skinId: string) => {
  localStorage.setItem('stick-stretch-selected-skin', skinId);
};

// Settings
export const getSettings = () => {
  const settings = localStorage.getItem('stick-stretch-settings');
  return settings ? JSON.parse(settings) : {
    soundEnabled: true,
    musicEnabled: true,
    hapticsEnabled: true,
  };
};

export const saveSettings = (settings: { soundEnabled: boolean; musicEnabled: boolean; hapticsEnabled: boolean }) => {
  localStorage.setItem('stick-stretch-settings', JSON.stringify(settings));
};

// Statistics
export const getStats = () => {
  const stats = localStorage.getItem('stick-stretch-stats');
  return stats ? JSON.parse(stats) : {
    gamesPlayed: 0,
    totalPerfects: 0,
    totalCoinsEarned: 0,
    averageScore: 0,
    bestCombo: 0,
    totalDistance: 0,
    achievementsUnlocked: 0,
  };
};

export const saveStats = (stats: any) => {
  localStorage.setItem('stick-stretch-stats', JSON.stringify(stats));
};

// Achievements
export const getAchievements = () => {
  const achievements = localStorage.getItem('stick-stretch-achievements');
  return achievements ? JSON.parse(achievements) : [];
};

export const saveAchievements = (achievements: any[]) => {
  localStorage.setItem('stick-stretch-achievements', JSON.stringify(achievements));
};

// Tutorial
export const hasSeenTutorial = () => {
  return localStorage.getItem('stick-stretch-tutorial') === 'seen';
};

export const markTutorialSeen = () => {
  localStorage.setItem('stick-stretch-tutorial', 'seen');
};

// Daily Challenges
export const getDailyChallenges = () => {
  const challenges = localStorage.getItem('stick-stretch-daily-challenges');
  if (!challenges) return null;
  const parsed = JSON.parse(challenges);
  // Check if expired (new day)
  const today = new Date().toDateString();
  const savedDate = parsed.date;
  if (savedDate !== today) return null;
  return parsed.challenges;
};

export const saveDailyChallenges = (challenges: any[]) => {
  localStorage.setItem('stick-stretch-daily-challenges', JSON.stringify({
    date: new Date().toDateString(),
    challenges,
  }));
};