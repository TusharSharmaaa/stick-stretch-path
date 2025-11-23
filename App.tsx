
import React, { useState, useEffect } from 'react';
import { GameState, Skin, Achievement, GameStats, DailyChallenge } from './types';
import StickStretchGame from './components/StickStretchGame';
import MainMenu from './components/MainMenu';
import GameOver from './components/GameOver';
import { AdMock } from './components/AdMock';
import { AD_CONFIG, AdType } from './utils/ads';
import { 
  getHighScore, 
  setHighScore, 
  getCoins, 
  saveCoins,
  getUnlockedSkins,
  saveUnlockedSkins,
  getSelectedSkin,
  saveSelectedSkin,
  getSettings,
  saveSettings,
  getStats,
  saveStats,
  hasSeenTutorial,
  markTutorialSeen,
  saveDailyChallenges
} from './utils/storage';
import { SKINS, AD_COIN_REWARD } from './constants';
import { initAudio, startBackgroundMusic, stopBackgroundMusic, setSoundEnabled } from './utils/audio';
import { initializeAchievements, checkAchievements } from './utils/achievements';
import { generateDailyChallenges } from './utils/dailyChallenges';

function App() {
  const [gameState, setGameState] = useState<GameState>(GameState.MENU);
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [coins, setCoins] = useState(0);
  const [isReviving, setIsReviving] = useState(false);
  const [gameSessionKey, setGameSessionKey] = useState(0); // Force remount on retry
  
  // Ad State
  const [activeOverlayAd, setActiveOverlayAd] = useState<AdType | null>(null);
  const [adCallback, setAdCallback] = useState<((success: boolean) => void) | null>(null);
  const [deathCount, setDeathCount] = useState(0);

  // Skin State
  const [unlockedSkins, setUnlockedSkins] = useState<string[]>([]);
  const [currentSkinId, setCurrentSkinId] = useState<string>('default');

  // New Features State
  const [settings, setSettings] = useState(getSettings());
  const [stats, setStats] = useState<GameStats>(getStats());
  const [achievements, setAchievements] = useState<Achievement[]>(initializeAchievements());
  const [dailyChallenges, setDailyChallenges] = useState<DailyChallenge[]>(generateDailyChallenges());
  const [showTutorial, setShowTutorial] = useState(!hasSeenTutorial());
  const [notification, setNotification] = useState<{ text: string; type: 'achievement' | 'challenge' | 'powerup' } | null>(null);
  const [currentGameStats, setCurrentGameStats] = useState({ perfects: 0, combo: 0, coinsCollected: 0 });

  useEffect(() => {
    setBestScore(getHighScore());
    setCoins(getCoins());
    setUnlockedSkins(getUnlockedSkins());
    setCurrentSkinId(getSelectedSkin());
    setSettings(getSettings());
    setStats(getStats());
    setAchievements(initializeAchievements());
    setDailyChallenges(generateDailyChallenges());
    
    // Initialize audio with settings
    initAudio();
    setSoundEnabled(settings.soundEnabled);
    if (settings.musicEnabled) {
      startBackgroundMusic(true);
    }
    
    // Check for pending achievement notifications (when returning to menu)
    const pendingAch = localStorage.getItem('stick-stretch-pending-achievements');
    if (pendingAch) {
      const pendingIds = JSON.parse(pendingAch);
      if (pendingIds.length > 0) {
        const achievements = initializeAchievements();
        const newlyUnlocked = achievements.filter(a => pendingIds.includes(a.id) && a.unlocked);
        if (newlyUnlocked.length > 0) {
          // Show notifications after a short delay
          newlyUnlocked.forEach((ach, i) => {
            setTimeout(() => {
              setNotification({ text: `Achievement Unlocked: ${ach.name}`, type: 'achievement' });
              setTimeout(() => setNotification(null), 3000);
            }, 500 + (i * 500));
          });
          // Clear pending
          localStorage.removeItem('stick-stretch-pending-achievements');
        }
      }
    }
    
    // Check for pending challenge notifications
    const pendingCh = localStorage.getItem('stick-stretch-pending-challenges');
    if (pendingCh) {
      const pendingChallenges = JSON.parse(pendingCh);
      if (pendingChallenges.length > 0) {
        pendingChallenges.forEach((ch: { id: string; reward: number }, i: number) => {
          setTimeout(() => {
            setNotification({ text: `Daily Challenge Complete! +${ch.reward} coins`, type: 'challenge' });
            setTimeout(() => setNotification(null), 3000);
          }, 500 + (i * 500));
        });
        localStorage.removeItem('stick-stretch-pending-challenges');
      }
    }
    
    console.log("Game Loaded: Enhanced Features");
  }, []);

  // Update settings
  const updateSettings = (newSettings: typeof settings) => {
    setSettings(newSettings);
    saveSettings(newSettings);
    setSoundEnabled(newSettings.soundEnabled);
    if (newSettings.musicEnabled) {
      startBackgroundMusic(true);
    } else {
      stopBackgroundMusic();
    }
  };

  // Helper to show ads
  const showAd = (type: AdType, onComplete: (success: boolean) => void) => {
    setActiveOverlayAd(type);
    setAdCallback(() => onComplete);
  };

  const handleAdClose = (rewardEarned: boolean) => {
    setActiveOverlayAd(null);
    if (adCallback) {
      adCallback(rewardEarned);
      setAdCallback(null);
    }
  };

  const handleStartGame = () => {
    initAudio();
    setScore(0);
    setIsReviving(false);
    setCurrentGameStats({ perfects: 0, combo: 0, coinsCollected: 0 });
    setNotification(null); // Clear any notifications when starting game
    setGameSessionKey(prev => prev + 1); // Force component remount
    setGameState(GameState.PLAYING);
  };

  const handleGameOver = (finalScore: number) => {
    if (finalScore > bestScore) {
      setBestScore(finalScore);
      setHighScore(finalScore);
    }
    const earnedCoins = finalScore + currentGameStats.coinsCollected;
    const newTotalCoins = coins + earnedCoins;
    setCoins(newTotalCoins);
    saveCoins(newTotalCoins);
    
    // Update statistics
    const newStats: GameStats = {
      gamesPlayed: stats.gamesPlayed + 1,
      totalPerfects: stats.totalPerfects + currentGameStats.perfects,
      totalCoinsEarned: stats.totalCoinsEarned + earnedCoins,
      averageScore: ((stats.averageScore * stats.gamesPlayed) + finalScore) / (stats.gamesPlayed + 1),
      bestCombo: Math.max(stats.bestCombo, currentGameStats.combo),
      totalDistance: stats.totalDistance + finalScore * 100, // Approximate
      achievementsUnlocked: stats.achievementsUnlocked,
    };
    setStats(newStats);
    saveStats(newStats);
    
    // Check achievements
    const achResult = checkAchievements(newStats, {
      score: finalScore,
      perfects: currentGameStats.perfects,
      combo: currentGameStats.combo,
    });
    setAchievements(achResult.achievements);
    
    // Unlock achievement skins (silently, no notification here)
    achResult.newlyUnlocked.forEach(ach => {
      if (ach.id === 'perfect_10' && !unlockedSkins.includes('achievement_perfect10')) {
        const newSkins = [...unlockedSkins, 'achievement_perfect10'];
        setUnlockedSkins(newSkins);
        saveUnlockedSkins(newSkins);
      }
      if (ach.id === 'games_100' && !unlockedSkins.includes('achievement_100games')) {
        const newSkins = [...unlockedSkins, 'achievement_100games'];
        setUnlockedSkins(newSkins);
        saveUnlockedSkins(newSkins);
      }
    });
    
    // Store newly unlocked achievements to show on menu return
    if (achResult.newlyUnlocked.length > 0) {
      // Store in a way that can be checked when returning to menu
      const stored = localStorage.getItem('stick-stretch-pending-achievements');
      const pending = stored ? JSON.parse(stored) : [];
      const newPending = [...pending, ...achResult.newlyUnlocked.map(a => a.id)];
      localStorage.setItem('stick-stretch-pending-achievements', JSON.stringify([...new Set(newPending)]));
    }
    
    // Update daily challenges
    let updatedChallenges = [...dailyChallenges];
    const completedChallenges: Array<{ id: string; reward: number }> = [];
    
    updatedChallenges = updatedChallenges.map(ch => {
      if (ch.completed) return ch;
      
      let progress = ch.progress;
      if (ch.description.includes('perfect')) {
        progress += currentGameStats.perfects;
      } else if (ch.description.includes('score')) {
        progress = Math.max(progress, finalScore);
      } else if (ch.description.includes('combo')) {
        progress = Math.max(progress, currentGameStats.combo);
      } else if (ch.description.includes('coins')) {
        progress += currentGameStats.coinsCollected;
      } else if (ch.description.includes('games')) {
        progress += 1;
      }
      
      const newProgress = Math.min(progress, ch.target);
      const wasCompleted = ch.completed;
      const nowCompleted = newProgress >= ch.target;
      
      if (nowCompleted && !wasCompleted) {
        completedChallenges.push({ id: ch.id, reward: ch.reward });
      }
      
      return {
        ...ch,
        progress: newProgress,
        completed: nowCompleted || ch.completed,
      };
    });
    
    // Save updated challenges
    saveDailyChallenges(updatedChallenges);
    setDailyChallenges(updatedChallenges);
    
    // Show notifications for completed challenges (store to show on menu return)
    if (completedChallenges.length > 0) {
      const stored = localStorage.getItem('stick-stretch-pending-challenges');
      const pending = stored ? JSON.parse(stored) : [];
      const newPending = [...pending, ...completedChallenges];
      localStorage.setItem('stick-stretch-pending-challenges', JSON.stringify(newPending));
      
      // Award coins immediately
      const totalReward = completedChallenges.reduce((sum, c) => sum + c.reward, 0);
      const rewardCoins = coins + totalReward;
      setCoins(rewardCoins);
      saveCoins(rewardCoins);
    }
    
    // Increment death count for interstitial logic
    const newDeaths = deathCount + 1;
    setDeathCount(newDeaths);

    // Show Interstitial if threshold met
    if (newDeaths % AD_CONFIG.INTERSTITIAL_INTERVAL === 0) {
       setTimeout(() => {
           showAd('INTERSTITIAL', () => {
               setGameState(GameState.GAME_OVER);
           });
       }, 800);
    } else {
       setGameState(GameState.GAME_OVER);
    }
  };

  const handleRevive = () => {
    // Show Rewarded Ad for Revive
    showAd('REWARDED', (success) => {
        if (success) {
            setGameState(GameState.PLAYING);
            setIsReviving(true);
        }
    });
  };

  const handleUnlockSkin = (skinId: string, cost: number) => {
    if (coins >= cost && !unlockedSkins.includes(skinId)) {
      const newCoins = coins - cost;
      const newSkins = [...unlockedSkins, skinId];
      
      setCoins(newCoins);
      saveCoins(newCoins);
      
      setUnlockedSkins(newSkins);
      saveUnlockedSkins(newSkins);
      
      setCurrentSkinId(skinId);
      saveSelectedSkin(skinId);
    }
  };

  const handleSelectSkin = (skinId: string) => {
    if (unlockedSkins.includes(skinId)) {
      setCurrentSkinId(skinId);
      saveSelectedSkin(skinId);
    }
  };

  const handleWatchAdForCoins = () => {
    showAd('REWARDED', (success) => {
        if (success) {
            const newCoins = coins + AD_COIN_REWARD;
            setCoins(newCoins);
            saveCoins(newCoins);
            // alert(`AD WATCHED! +${AD_COIN_REWARD} COINS EARNED.`); // Removed alert for smoother flow
        }
    });
  };

  const handleCoinCollected = (amount: number = 1) => {
    const newCoins = coins + amount;
    setCoins(newCoins);
    saveCoins(newCoins);
    setCurrentGameStats(prev => ({ ...prev, coinsCollected: prev.coinsCollected + amount }));
  };

  const handleGameEvent = (event: { type: 'perfect' | 'combo'; value: number }) => {
    if (event.type === 'perfect') {
      setCurrentGameStats(prev => ({ ...prev, perfects: prev.perfects + 1 }));
    } else if (event.type === 'combo') {
      setCurrentGameStats(prev => ({ ...prev, combo: Math.max(prev.combo, event.value) }));
    }
  };

  const currentSkinColor = SKINS.find(s => s.id === currentSkinId)?.color || 'bg-red-500';

  return (
    <div className="relative w-full h-full bg-[#050510] overflow-hidden font-sans fixed inset-0 touch-none select-none">
      
      {/* Game Content Container - Padded bottom for Banner */}
      <div className="absolute inset-0 bottom-[50px]">
        {/* Persistent Game Layer */}
        {gameState !== GameState.MENU && (
            <StickStretchGame 
            key={`game-session-${gameSessionKey}`}
            skinColor={currentSkinColor}
            onScore={setScore}
            onGameOver={handleGameOver}
            onCoinCollected={handleCoinCollected}
            isReviving={isReviving}
            onReviveComplete={() => setIsReviving(false)}
            onGameEvent={handleGameEvent}
            settings={settings}
            />
        )}

        {/* HUD Layer */}
        {gameState === GameState.PLAYING && (
            <>
            <div className="absolute top-0 left-0 w-full p-4 flex justify-between items-start pointer-events-none z-10 pt-[max(1rem,env(safe-area-inset-top))] pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))]">
            <div className="bg-black/50 backdrop-blur-md px-6 py-2 rounded-xl border border-cyan-500/30 shadow-[0_0_10px_rgba(34,211,238,0.2)]">
                <span className="text-4xl font-black italic text-cyan-400 drop-shadow-[0_0_5px_rgba(34,211,238,0.8)]">{score}</span>
            </div>
            <div className="bg-black/50 backdrop-blur-md px-4 py-2 rounded-xl border border-yellow-500/30 shadow-[0_0_10px_rgba(234,179,8,0.2)] flex items-center gap-2">
                <span className="text-yellow-400 font-bold drop-shadow-md">●</span>
                <span className="font-bold text-white text-xl">{coins}</span>
            </div>
            </div>
            {/* Back Button */}
            <button
                onClick={() => setGameState(GameState.MENU)}
                className="absolute top-[max(4rem,calc(1rem+env(safe-area-inset-top)+3rem))] right-[max(1rem,env(safe-area-inset-right))] z-20 bg-black/60 backdrop-blur-md px-4 py-2 rounded-lg border border-slate-600 hover:border-slate-500 transition-colors flex items-center gap-2 pointer-events-auto"
            >
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span className="text-white font-bold text-sm">BACK</span>
            </button>
            </>
        )}

        {/* Menus */}
        {gameState === GameState.MENU && (
            <MainMenu 
            onPlay={handleStartGame}
            coins={coins}
            bestScore={bestScore}
            currentSkin={currentSkinId}
            onSelectSkin={handleSelectSkin}
            unlockedSkins={unlockedSkins}
            onUnlockSkin={handleUnlockSkin}
            onWatchAd={handleWatchAdForCoins}
            stats={stats}
            achievements={achievements}
            dailyChallenges={dailyChallenges}
            settings={settings}
            onUpdateSettings={updateSettings}
            showTutorial={showTutorial}
            onTutorialClose={() => { setShowTutorial(false); markTutorialSeen(); }}
            />
        )}

        {gameState === GameState.GAME_OVER && (
            <GameOver 
            score={score}
            bestScore={bestScore}
            onRetry={handleStartGame}
            onHome={() => {
              setGameState(GameState.MENU);
              // Check for pending achievements when returning to menu
              const pendingAch = localStorage.getItem('stick-stretch-pending-achievements');
              if (pendingAch) {
                const pendingIds = JSON.parse(pendingAch);
                if (pendingIds.length > 0) {
                  const achievements = initializeAchievements();
                  const newlyUnlocked = achievements.filter(a => pendingIds.includes(a.id) && a.unlocked);
                  if (newlyUnlocked.length > 0) {
                    newlyUnlocked.forEach((ach, i) => {
                      setTimeout(() => {
                        setNotification({ text: `Achievement Unlocked: ${ach.name}`, type: 'achievement' });
                        setTimeout(() => setNotification(null), 3000);
                      }, 500 + (i * 500));
                    });
                    localStorage.removeItem('stick-stretch-pending-achievements');
                  }
                }
              }
              
              // Check for pending challenges
              const pendingCh = localStorage.getItem('stick-stretch-pending-challenges');
              if (pendingCh) {
                const pendingChallenges = JSON.parse(pendingCh);
                if (pendingChallenges.length > 0) {
                  pendingChallenges.forEach((ch: { id: string; reward: number }, i: number) => {
                    setTimeout(() => {
                      setNotification({ text: `Daily Challenge Complete! +${ch.reward} coins`, type: 'challenge' });
                      setTimeout(() => setNotification(null), 3000);
                    }, 1000 + (i * 500));
                  });
                  localStorage.removeItem('stick-stretch-pending-challenges');
                }
              }
            }}
            onWatchAd={handleRevive}
            />
        )}
      </div>

      {/* Ad Overlay System */}
      {activeOverlayAd && (
          <AdMock type={activeOverlayAd} onClose={handleAdClose} />
      )}

      {/* Banner Ad - Always present at bottom */}
      <AdMock type="BANNER" onClose={() => {}} />

      {/* Notification Overlay */}
      {notification && (
        <div className={`absolute top-20 left-1/2 -translate-x-1/2 z-[200] px-6 py-3 rounded-xl border-2 backdrop-blur-md animate-fade-in pointer-events-none ${
          notification.type === 'achievement' ? 'bg-yellow-500/20 border-yellow-400 text-yellow-300' :
          notification.type === 'challenge' ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300' :
          'bg-pink-500/20 border-pink-400 text-pink-300'
        }`}>
          <span className="font-black text-lg">{notification.text}</span>
        </div>
      )}
    </div>
  );
}

export default App;
