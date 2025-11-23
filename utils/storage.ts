export const getHighScore = (): number => {
  try {
    const score = localStorage.getItem('stick-stretch-highscore');
    return score ? parseInt(score, 10) : 0;
  } catch (e) {
    console.error('Error reading high score:', e);
    return 0;
  }
};

export const setHighScore = (score: number) => {
  try {
    localStorage.setItem('stick-stretch-highscore', score.toString());
  } catch (e) {
    console.error('Error saving high score:', e);
  }
};

export const getCoins = (): number => {
  try {
    const coins = localStorage.getItem('stick-stretch-coins');
    return coins ? parseInt(coins, 10) : 0;
  } catch (e) {
    console.error('Error reading coins:', e);
    return 0;
  }
};

export const saveCoins = (coins: number) => {
  try {
    localStorage.setItem('stick-stretch-coins', coins.toString());
  } catch (e) {
    console.error('Error saving coins:', e);
  }
};

export const getUnlockedSkins = (): string[] => {
  try {
    const skins = localStorage.getItem('stick-stretch-skins');
    return skins ? JSON.parse(skins) : ['default'];
  } catch (e) {
    console.error('Error reading unlocked skins:', e);
    return ['default'];
  }
};

export const saveUnlockedSkins = (skins: string[]) => {
  try {
    localStorage.setItem('stick-stretch-skins', JSON.stringify(skins));
  } catch (e) {
    console.error('Error saving unlocked skins:', e);
  }
};

export const getSelectedSkin = (): string => {
  try {
    return localStorage.getItem('stick-stretch-selected-skin') || 'default';
  } catch (e) {
    console.error('Error reading selected skin:', e);
    return 'default';
  }
};

export const saveSelectedSkin = (skinId: string) => {
  try {
    localStorage.setItem('stick-stretch-selected-skin', skinId);
  } catch (e) {
    console.error('Error saving selected skin:', e);
  }
};

// Settings
export const getSettings = () => {
  try {
    const settings = localStorage.getItem('stick-stretch-settings');
    return settings ? JSON.parse(settings) : {
      soundEnabled: true,
      musicEnabled: true,
      hapticsEnabled: true,
    };
  } catch (e) {
    console.error('Error reading settings:', e);
    return {
      soundEnabled: true,
      musicEnabled: true,
      hapticsEnabled: true,
    };
  }
};

export const saveSettings = (settings: { soundEnabled: boolean; musicEnabled: boolean; hapticsEnabled: boolean }) => {
  try {
    localStorage.setItem('stick-stretch-settings', JSON.stringify(settings));
  } catch (e) {
    console.error('Error saving settings:', e);
  }
};

// Statistics
export const getStats = () => {
  try {
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
  } catch (e) {
    console.error('Error reading stats:', e);
    return {
      gamesPlayed: 0,
      totalPerfects: 0,
      totalCoinsEarned: 0,
      averageScore: 0,
      bestCombo: 0,
      totalDistance: 0,
      achievementsUnlocked: 0,
    };
  }
};

export const saveStats = (stats: any) => {
  try {
    localStorage.setItem('stick-stretch-stats', JSON.stringify(stats));
  } catch (e) {
    console.error('Error saving stats:', e);
  }
};

// Achievements
export const getAchievements = () => {
  try {
    const achievements = localStorage.getItem('stick-stretch-achievements');
    return achievements ? JSON.parse(achievements) : [];
  } catch (e) {
    console.error('Error reading achievements:', e);
    return [];
  }
};

export const saveAchievements = (achievements: any[]) => {
  try {
    localStorage.setItem('stick-stretch-achievements', JSON.stringify(achievements));
  } catch (e) {
    console.error('Error saving achievements:', e);
  }
};

// Tutorial
export const hasSeenTutorial = () => {
  try {
    return localStorage.getItem('stick-stretch-tutorial') === 'seen';
  } catch (e) {
    console.error('Error reading tutorial status:', e);
    return false;
  }
};

export const markTutorialSeen = () => {
  try {
    localStorage.setItem('stick-stretch-tutorial', 'seen');
  } catch (e) {
    console.error('Error saving tutorial status:', e);
  }
};

// Daily Challenges
export const getDailyChallenges = () => {
  try {
    const challenges = localStorage.getItem('stick-stretch-daily-challenges');
    if (!challenges) return null;
    const parsed = JSON.parse(challenges);
    // Check if expired (new day)
    const today = new Date().toDateString();
    const savedDate = parsed.date;
    if (savedDate !== today) return null;
    return parsed.challenges;
  } catch (e) {
    console.error('Error reading daily challenges:', e);
    return null;
  }
};

export const saveDailyChallenges = (challenges: any[]) => {
  try {
    localStorage.setItem('stick-stretch-daily-challenges', JSON.stringify({
      date: new Date().toDateString(),
      challenges,
    }));
  } catch (e) {
    console.error('Error saving daily challenges:', e);
  }
};