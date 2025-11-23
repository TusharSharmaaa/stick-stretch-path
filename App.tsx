
import React, { useState, useEffect } from 'react';
import { GameState, Skin } from './types';
import StickStretchGame from './components/StickStretchGame';
import MainMenu from './components/MainMenu';
import GameOver from './components/GameOver';
import { AdMock } from './components/AdMock'; // Import Mock
import { AD_CONFIG, AdType } from './utils/ads';
import { 
  getHighScore, 
  setHighScore, 
  getCoins, 
  saveCoins,
  getUnlockedSkins,
  saveUnlockedSkins,
  getSelectedSkin,
  saveSelectedSkin
} from './utils/storage';
import { SKINS, AD_COIN_REWARD } from './constants';
import { initAudio } from './utils/audio';

function App() {
  const [gameState, setGameState] = useState<GameState>(GameState.MENU);
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [coins, setCoins] = useState(0);
  const [isReviving, setIsReviving] = useState(false);
  
  // Ad State
  const [activeOverlayAd, setActiveOverlayAd] = useState<AdType | null>(null);
  const [adCallback, setAdCallback] = useState<((success: boolean) => void) | null>(null);
  const [deathCount, setDeathCount] = useState(0);

  // Skin State
  const [unlockedSkins, setUnlockedSkins] = useState<string[]>([]);
  const [currentSkinId, setCurrentSkinId] = useState<string>('default');

  useEffect(() => {
    setBestScore(getHighScore());
    setCoins(getCoins());
    setUnlockedSkins(getUnlockedSkins());
    setCurrentSkinId(getSelectedSkin());
    console.log("Game Loaded: AdMob Integrated");
  }, []);

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
    setGameState(GameState.PLAYING);
  };

  const handleGameOver = (finalScore: number) => {
    if (finalScore > bestScore) {
      setBestScore(finalScore);
      setHighScore(finalScore);
    }
    const earnedCoins = finalScore;
    const newTotalCoins = coins + earnedCoins;
    setCoins(newTotalCoins);
    saveCoins(newTotalCoins);
    
    // Increment death count for interstitial logic
    const newDeaths = deathCount + 1;
    setDeathCount(newDeaths);

    // Show Interstitial if threshold met (and not already on game over screen via revive loop)
    if (newDeaths % AD_CONFIG.INTERSTITIAL_INTERVAL === 0) {
       // Delay slightly for UX
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
  };

  const currentSkinColor = SKINS.find(s => s.id === currentSkinId)?.color || 'bg-red-500';

  return (
    <div className="relative w-full h-full bg-[#050510] overflow-hidden font-sans fixed inset-0 touch-none select-none">
      
      {/* Game Content Container - Padded bottom for Banner */}
      <div className="absolute inset-0 bottom-[50px]">
        {/* Persistent Game Layer */}
        {gameState !== GameState.MENU && (
            <StickStretchGame 
            key="game-session"
            skinColor={currentSkinColor}
            onScore={setScore}
            onGameOver={handleGameOver}
            onCoinCollected={handleCoinCollected}
            isReviving={isReviving}
            onReviveComplete={() => setIsReviving(false)}
            />
        )}

        {/* HUD Layer */}
        {gameState === GameState.PLAYING && (
            <div className="absolute top-0 left-0 w-full p-4 flex justify-between items-start pointer-events-none z-10 pt-[max(1rem,env(safe-area-inset-top))] pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))]">
            <div className="bg-black/50 backdrop-blur-md px-6 py-2 rounded-xl border border-cyan-500/30 shadow-[0_0_10px_rgba(34,211,238,0.2)]">
                <span className="text-4xl font-black italic text-cyan-400 drop-shadow-[0_0_5px_rgba(34,211,238,0.8)]">{score}</span>
            </div>
            <div className="bg-black/50 backdrop-blur-md px-4 py-2 rounded-xl border border-yellow-500/30 shadow-[0_0_10px_rgba(234,179,8,0.2)] flex items-center gap-2">
                <span className="text-yellow-400 font-bold drop-shadow-md">●</span>
                <span className="font-bold text-white text-xl">{coins}</span>
            </div>
            </div>
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
            />
        )}

        {gameState === GameState.GAME_OVER && (
            <GameOver 
            score={score}
            bestScore={bestScore}
            onRetry={handleStartGame}
            onHome={() => setGameState(GameState.MENU)}
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
    </div>
  );
}

export default App;
