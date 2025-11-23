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