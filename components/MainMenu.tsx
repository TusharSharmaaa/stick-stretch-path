
import React from 'react';
import { Play, ShoppingBag, Coins, Video, ChevronRight, Lock, BarChart3, Trophy, Calendar, Settings, X } from 'lucide-react';
import { SKINS, AD_COIN_REWARD } from '../constants';
import { Achievement, GameStats, DailyChallenge } from '../types';

interface MainMenuProps {
  onPlay: () => void;
  coins: number;
  bestScore: number;
  currentSkin: string;
  onSelectSkin: (skinId: string) => void;
  unlockedSkins: string[];
  onUnlockSkin: (skinId: string, cost: number) => void;
  onWatchAd: () => void;
  stats?: GameStats;
  achievements?: Achievement[];
  dailyChallenges?: DailyChallenge[];
  settings?: { soundEnabled: boolean; musicEnabled: boolean; hapticsEnabled: boolean };
  onUpdateSettings?: (settings: { soundEnabled: boolean; musicEnabled: boolean; hapticsEnabled: boolean }) => void;
  showTutorial?: boolean;
  onTutorialClose?: () => void;
}

const MainMenu: React.FC<MainMenuProps> = ({
  onPlay,
  coins,
  bestScore,
  currentSkin,
  onSelectSkin,
  unlockedSkins,
  onUnlockSkin,
  onWatchAd,
  stats,
  achievements = [],
  dailyChallenges = [],
  settings = { soundEnabled: true, musicEnabled: true, hapticsEnabled: true },
  onUpdateSettings,
  showTutorial = false,
  onTutorialClose
}) => {
  const [activeTab, setActiveTab] = React.useState<'main' | 'shop' | 'stats' | 'achievements' | 'challenges' | 'settings'>('main');

  return (
    <div className="absolute inset-0 bg-[#050510] flex flex-col items-center justify-center overflow-hidden pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]">
      {/* Background FX */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-900/40 via-[#050510] to-[#050510] pointer-events-none" />
      <div className="cyber-grid animate-grid-scroll" />
      <div className="scanlines" />
      
      {/* Floating Particles/Decor */}
      <div className="absolute top-10 left-10 w-2 h-2 bg-cyan-400 rounded-full animate-ping" />
      <div className="absolute bottom-20 right-10 w-3 h-3 bg-pink-500 rounded-full animate-bounce" />

      <div className="z-10 w-full max-w-md px-6 flex flex-col items-center h-full justify-center">
        
        {/* Tutorial Overlay */}
        {showTutorial && (
          <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-6">
            <div className="bg-slate-900/95 border border-cyan-500/50 rounded-2xl p-6 max-w-md relative">
              <button onClick={onTutorialClose} className="absolute top-4 right-4 text-white/60 hover:text-white">
                <X className="w-5 h-5" />
              </button>
              <h3 className="text-2xl font-black text-cyan-400 mb-4">HOW TO PLAY</h3>
              <div className="space-y-3 text-white/80 text-sm">
                <p><span className="text-cyan-400 font-bold">HOLD</span> to grow your stick</p>
                <p><span className="text-cyan-400 font-bold">RELEASE</span> to drop it</p>
                <p><span className="text-pink-400 font-bold">PERFECT</span> landings give bonus coins!</p>
                <p><span className="text-yellow-400 font-bold">COMBO</span> for even more rewards</p>
              </div>
              <button 
                onClick={onTutorialClose}
                className="mt-6 w-full py-2 bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded-lg"
              >
                GOT IT!
              </button>
            </div>
          </div>
        )}

        {/* Title Section */}
        {activeTab === 'main' && (
          <div className="mb-12 text-center relative group cursor-default animate-fade-in">
            <div className="absolute inset-0 bg-pink-500 blur-[40px] opacity-20 animate-pulse" />
            <h1 className="text-6xl font-black tracking-tighter italic transform -skew-x-6 relative">
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">
                STICK
              </span>
              <span className="block text-transparent text-outline text-pink-500 relative -mt-2">
                STRETCH
                <span className="absolute inset-0 text-cyan-400 opacity-50 translate-x-[2px] animate-pulse">STRETCH</span>
              </span>
            </h1>
            <div className="mt-2 text-cyan-400 font-bold tracking-[0.5em] text-xs uppercase animate-pulse">
              BRIDGE THE GAP
            </div>
          </div>
        )}

        {activeTab === 'main' ? (
          <div className="flex flex-col gap-5 w-full animate-fade-in">
            {/* Play Button */}
            <button
              onClick={onPlay}
              className="group relative h-20 w-full transform -skew-x-12 transition-all hover:scale-105 active:scale-95"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-pink-600 to-purple-600 rounded-lg opacity-80 group-hover:opacity-100 transition-opacity blur-sm group-hover:blur-md" />
              <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-purple-500 rounded-lg flex items-center justify-center border-2 border-white/20">
                <div className="transform skew-x-12 flex items-center gap-3">
                  <span className="font-black text-3xl text-white italic tracking-wider group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-white transition-all">
                    PLAY
                  </span>
                  <Play className="w-8 h-8 fill-white group-hover:scale-125 transition-transform" />
                </div>
              </div>
            </button>

            {/* Menu Buttons Grid */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setActiveTab('shop')}
                className="group relative h-14 w-full transform -skew-x-12 transition-all hover:scale-105 active:scale-95"
              >
                <div className="absolute inset-0 bg-cyan-500/10 border border-cyan-500 rounded-lg group-hover:bg-cyan-500/30 transition-colors" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="transform skew-x-12 flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4 text-cyan-400" />
                    <span className="font-bold text-sm text-cyan-400">SHOP</span>
                  </div>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('stats')}
                className="group relative h-14 w-full transform -skew-x-12 transition-all hover:scale-105 active:scale-95"
              >
                <div className="absolute inset-0 bg-purple-500/10 border border-purple-500 rounded-lg group-hover:bg-purple-500/30 transition-colors" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="transform skew-x-12 flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-purple-400" />
                    <span className="font-bold text-sm text-purple-400">STATS</span>
                  </div>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('achievements')}
                className="group relative h-14 w-full transform -skew-x-12 transition-all hover:scale-105 active:scale-95"
              >
                <div className="absolute inset-0 bg-yellow-500/10 border border-yellow-500 rounded-lg group-hover:bg-yellow-500/30 transition-colors" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="transform skew-x-12 flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-yellow-400" />
                    <span className="font-bold text-sm text-yellow-400">ACHIEV</span>
                  </div>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('challenges')}
                className="group relative h-14 w-full transform -skew-x-12 transition-all hover:scale-105 active:scale-95"
              >
                <div className="absolute inset-0 bg-pink-500/10 border border-pink-500 rounded-lg group-hover:bg-pink-500/30 transition-colors" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="transform skew-x-12 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-pink-400" />
                    <span className="font-bold text-sm text-pink-400">DAILY</span>
                  </div>
                </div>
              </button>
            </div>
            
            <button
              onClick={() => setActiveTab('settings')}
              className="group relative h-12 w-full transform -skew-x-12 transition-all hover:scale-105 active:scale-95"
            >
              <div className="absolute inset-0 bg-slate-700/20 border border-slate-600 rounded-lg group-hover:bg-slate-700/40 transition-colors" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="transform skew-x-12 flex items-center gap-2">
                  <Settings className="w-4 h-4 text-slate-400" />
                  <span className="font-bold text-sm text-slate-400">SETTINGS</span>
                </div>
              </div>
            </button>

            {/* Stats Row */}
            <div className="mt-8 grid grid-cols-2 gap-4">
               <div className="bg-slate-900/60 backdrop-blur-md p-4 rounded-xl border border-white/5 flex flex-col items-center relative overflow-hidden group hover:border-yellow-500/50 transition-colors">
                  <div className="absolute top-0 left-0 w-full h-1 bg-yellow-500 opacity-50" />
                  <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">High Score</span>
                  <span className="text-3xl font-black text-white flex items-center gap-2">
                     {bestScore}
                  </span>
               </div>
               <div className="bg-slate-900/60 backdrop-blur-md p-4 rounded-xl border border-white/5 flex flex-col items-center relative overflow-hidden group hover:border-yellow-500/50 transition-colors">
                  <div className="absolute top-0 left-0 w-full h-1 bg-yellow-500 opacity-50" />
                  <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Coins</span>
                  <span className="text-3xl font-black text-white flex items-center gap-2">
                     <Coins className="w-5 h-5 text-yellow-400" /> {coins}
                  </span>
               </div>
            </div>
          </div>
        ) : activeTab === 'shop' ? (
          /* Shop / Loadout Screen - Responsive Modal */
          <div className="w-full max-h-[85vh] flex flex-col bg-slate-900/80 backdrop-blur-xl rounded-3xl border border-cyan-500/30 shadow-[0_0_50px_rgba(0,0,0,0.5)] animate-fade-in relative">
            
            {/* Modal Badge */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-black px-4 py-1 rounded-full border border-cyan-500 text-cyan-400 text-xs font-bold tracking-widest uppercase shadow-[0_0_15px_rgba(34,211,238,0.5)] z-20">
              Themes
            </div>

            {/* Header Container (Fixed) */}
            <div className="p-6 pb-2 flex-none">
                <div className="flex justify-between items-center mb-4 mt-2">
                <h2 className="text-2xl font-black text-white flex items-center gap-2 italic">
                    <ShoppingBag className="w-6 h-6 text-yellow-400" /> SHOP
                </h2>
                <div className="bg-black/50 px-4 py-1.5 rounded-lg border border-yellow-500/30 flex items-center gap-2">
                    <Coins className="w-4 h-4 text-yellow-400" />
                    <span className="font-mono text-white font-bold">{coins}</span>
                </div>
                </div>
                
                {/* Ad Incentivization Area */}
                <button 
                    onClick={onWatchAd}
                    className="w-full py-3 bg-gradient-to-r from-yellow-600 to-yellow-500 rounded-xl border border-yellow-300/50 flex items-center justify-center gap-3 transform transition-transform active:scale-95 shadow-[0_0_20px_rgba(234,179,8,0.3)] animate-pulse hover:animate-none group mb-2"
                >
                    <Video className="w-6 h-6 text-black fill-current" />
                    <span className="font-black text-black italic text-lg tracking-wider">WATCH AD</span>
                    <span className="bg-black/20 px-2 py-0.5 rounded text-black font-bold text-sm">+{AD_COIN_REWARD} <Coins className="w-3 h-3 inline -mt-0.5" /></span>
                </button>
            </div>

            {/* Skin List (Scrollable) */}
            <div className="flex-1 overflow-y-auto px-6 custom-scrollbar space-y-3 pb-4">
              {SKINS.map((skin) => {
                const isUnlocked = unlockedSkins.includes(skin.id);
                const isSelected = currentSkin === skin.id;

                return (
                  <div 
                    key={skin.id}
                    onClick={() => {
                        if (isUnlocked) onSelectSkin(skin.id);
                        else if (coins >= skin.cost) onUnlockSkin(skin.id, skin.cost);
                    }}
                    className={`relative p-3 rounded-xl border transition-all cursor-pointer group overflow-hidden shrink-0 ${
                      isSelected 
                        ? 'border-pink-500 bg-pink-500/10 shadow-[0_0_20px_rgba(236,72,153,0.2)]' 
                        : 'border-slate-700 bg-slate-800/50 hover:border-cyan-500/50 hover:bg-slate-800'
                    }`}
                  >
                    {isSelected && <div className="absolute inset-0 bg-gradient-to-r from-pink-500/10 to-transparent" />}
                    
                    <div className="flex items-center justify-between relative z-10">
                        <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-lg shadow-lg ${skin.color} transform group-hover:rotate-6 transition-transform`} />
                            <div className="flex flex-col">
                                <span className={`font-bold text-lg ${isSelected ? 'text-pink-400' : 'text-white'}`}>{skin.name}</span>
                                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">
                                    {isUnlocked ? 'OWNED' : `${skin.cost} COINS`}
                                </span>
                            </div>
                        </div>

                        {isUnlocked ? (
                            isSelected ? (
                                <div className="bg-pink-500 text-white text-xs font-bold px-3 py-1 rounded skew-x-[-10deg]">EQUIPPED</div>
                            ) : (
                                <div className="text-slate-500 group-hover:text-white transition-colors">
                                    <ChevronRight className="w-6 h-6" />
                                </div>
                            )
                        ) : (
                            <button
                                className={`text-xs font-bold px-3 py-1.5 rounded skew-x-[-10deg] transition-all flex items-center gap-1 ${
                                    coins >= skin.cost 
                                    ? 'bg-cyan-500 text-black hover:bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.5)]' 
                                    : 'bg-slate-700 text-slate-500'
                                }`}
                            >
                                {coins >= skin.cost ? (
                                    <>UNLOCK <Lock className="w-3 h-3" /></>
                                ) : (
                                    <>NEED {skin.cost - coins} <Coins className="w-3 h-3" /></>
                                )}
                            </button>
                        )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer (Fixed at bottom of modal) */}
            <div className="p-6 pt-2 flex-none border-t border-white/5">
                <button 
                onClick={() => setActiveTab('main')}
                className="w-full py-3 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-xl font-bold text-slate-300 uppercase tracking-widest text-sm hover:text-white transition-colors"
                >
                Back to Menu
                </button>
            </div>
          </div>
        ) : activeTab === 'stats' ? (
          <div className="w-full max-h-[85vh] flex flex-col bg-slate-900/80 backdrop-blur-xl rounded-3xl border border-purple-500/30 shadow-[0_0_50px_rgba(0,0,0,0.5)] animate-fade-in relative">
            <div className="p-6 pb-2 flex-none">
              <h2 className="text-2xl font-black text-white flex items-center gap-2 italic mb-4">
                <BarChart3 className="w-6 h-6 text-purple-400" /> STATISTICS
              </h2>
            </div>
            <div className="flex-1 overflow-y-auto px-6 space-y-3 pb-4">
              {stats && (
                <>
                  <div className="bg-slate-800/50 p-4 rounded-xl border border-white/5">
                    <span className="text-slate-400 text-xs font-bold uppercase">Games Played</span>
                    <div className="text-2xl font-black text-white mt-1">{stats.gamesPlayed}</div>
                  </div>
                  <div className="bg-slate-800/50 p-4 rounded-xl border border-white/5">
                    <span className="text-slate-400 text-xs font-bold uppercase">Total Perfects</span>
                    <div className="text-2xl font-black text-white mt-1">{stats.totalPerfects}</div>
                  </div>
                  <div className="bg-slate-800/50 p-4 rounded-xl border border-white/5">
                    <span className="text-slate-400 text-xs font-bold uppercase">Average Score</span>
                    <div className="text-2xl font-black text-white mt-1">{Math.round(stats.averageScore)}</div>
                  </div>
                  <div className="bg-slate-800/50 p-4 rounded-xl border border-white/5">
                    <span className="text-slate-400 text-xs font-bold uppercase">Best Combo</span>
                    <div className="text-2xl font-black text-white mt-1">{stats.bestCombo}</div>
                  </div>
                  <div className="bg-slate-800/50 p-4 rounded-xl border border-white/5">
                    <span className="text-slate-400 text-xs font-bold uppercase">Total Coins Earned</span>
                    <div className="text-2xl font-black text-yellow-400 mt-1 flex items-center gap-2">
                      <Coins className="w-5 h-5" /> {stats.totalCoinsEarned}
                    </div>
                  </div>
                </>
              )}
            </div>
            <div className="p-6 pt-2 flex-none border-t border-white/5">
              <button 
                onClick={() => setActiveTab('main')}
                className="w-full py-3 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-xl font-bold text-slate-300 uppercase tracking-widest text-sm hover:text-white transition-colors"
              >
                Back to Menu
              </button>
            </div>
          </div>
        ) : activeTab === 'achievements' ? (
          <div className="w-full max-h-[85vh] flex flex-col bg-slate-900/80 backdrop-blur-xl rounded-3xl border border-yellow-500/30 shadow-[0_0_50px_rgba(0,0,0,0.5)] animate-fade-in relative">
            <div className="p-6 pb-2 flex-none">
              <h2 className="text-2xl font-black text-white flex items-center gap-2 italic mb-4">
                <Trophy className="w-6 h-6 text-yellow-400" /> ACHIEVEMENTS
              </h2>
            </div>
            <div className="flex-1 overflow-y-auto px-6 space-y-3 pb-4">
              {achievements.map(ach => (
                <div 
                  key={ach.id}
                  className={`p-4 rounded-xl border ${
                    ach.unlocked 
                      ? 'bg-yellow-500/10 border-yellow-500/50' 
                      : 'bg-slate-800/50 border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className={`font-bold ${ach.unlocked ? 'text-yellow-400' : 'text-slate-400'}`}>
                        {ach.name}
                      </div>
                      <div className="text-xs text-slate-400 mt-1">{ach.description}</div>
                      {ach.target && (
                        <div className="text-xs text-slate-500 mt-2">
                          Progress: {ach.progress || 0} / {ach.target}
                        </div>
                      )}
                    </div>
                    {ach.unlocked && <Trophy className="w-6 h-6 text-yellow-400" />}
                  </div>
                </div>
              ))}
            </div>
            <div className="p-6 pt-2 flex-none border-t border-white/5">
              <button 
                onClick={() => setActiveTab('main')}
                className="w-full py-3 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-xl font-bold text-slate-300 uppercase tracking-widest text-sm hover:text-white transition-colors"
              >
                Back to Menu
              </button>
            </div>
          </div>
        ) : activeTab === 'challenges' ? (
          <div className="w-full max-h-[85vh] flex flex-col bg-slate-900/80 backdrop-blur-xl rounded-3xl border border-pink-500/30 shadow-[0_0_50px_rgba(0,0,0,0.5)] animate-fade-in relative">
            <div className="p-6 pb-2 flex-none">
              <h2 className="text-2xl font-black text-white flex items-center gap-2 italic mb-4">
                <Calendar className="w-6 h-6 text-pink-400" /> DAILY CHALLENGES
              </h2>
            </div>
            <div className="flex-1 overflow-y-auto px-6 space-y-3 pb-4">
              {dailyChallenges.map(ch => (
                <div 
                  key={ch.id}
                  className={`p-4 rounded-xl border ${
                    ch.completed 
                      ? 'bg-pink-500/10 border-pink-500/50' 
                      : 'bg-slate-800/50 border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-bold text-white">{ch.description}</div>
                    {ch.completed && <span className="text-xs bg-pink-500 text-white px-2 py-1 rounded">DONE</span>}
                  </div>
                  <div className="text-xs text-slate-400 mb-2">
                    {ch.progress} / {ch.target}
                  </div>
                  <div className="text-xs text-yellow-400 flex items-center gap-1">
                    <Coins className="w-3 h-3" /> Reward: {ch.reward} coins
                  </div>
                </div>
              ))}
            </div>
            <div className="p-6 pt-2 flex-none border-t border-white/5">
              <button 
                onClick={() => setActiveTab('main')}
                className="w-full py-3 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-xl font-bold text-slate-300 uppercase tracking-widest text-sm hover:text-white transition-colors"
              >
                Back to Menu
              </button>
            </div>
          </div>
        ) : activeTab === 'settings' ? (
          <div className="w-full max-h-[85vh] flex flex-col bg-slate-900/80 backdrop-blur-xl rounded-3xl border border-slate-500/30 shadow-[0_0_50px_rgba(0,0,0,0.5)] animate-fade-in relative">
            <div className="p-6 pb-2 flex-none">
              <h2 className="text-2xl font-black text-white flex items-center gap-2 italic mb-4">
                <Settings className="w-6 h-6 text-slate-400" /> SETTINGS
              </h2>
            </div>
            <div className="flex-1 overflow-y-auto px-6 space-y-3 pb-4">
              <div className="bg-slate-800/50 p-4 rounded-xl border border-white/5">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-bold text-white">Sound Effects</div>
                    <div className="text-xs text-slate-400">Game sound effects</div>
                  </div>
                  <button
                    onClick={() => onUpdateSettings?.({ ...settings, soundEnabled: !settings.soundEnabled })}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      settings.soundEnabled ? 'bg-cyan-500' : 'bg-slate-600'
                    }`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                      settings.soundEnabled ? 'translate-x-6' : 'translate-x-0.5'
                    }`} />
                  </button>
                </div>
              </div>
              <div className="bg-slate-800/50 p-4 rounded-xl border border-white/5">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-bold text-white">Background Music</div>
                    <div className="text-xs text-slate-400">Ambient background music</div>
                  </div>
                  <button
                    onClick={() => onUpdateSettings?.({ ...settings, musicEnabled: !settings.musicEnabled })}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      settings.musicEnabled ? 'bg-cyan-500' : 'bg-slate-600'
                    }`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                      settings.musicEnabled ? 'translate-x-6' : 'translate-x-0.5'
                    }`} />
                  </button>
                </div>
              </div>
              <div className="bg-slate-800/50 p-4 rounded-xl border border-white/5">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-bold text-white">Haptic Feedback</div>
                    <div className="text-xs text-slate-400">Vibration on actions</div>
                  </div>
                  <button
                    onClick={() => onUpdateSettings?.({ ...settings, hapticsEnabled: !settings.hapticsEnabled })}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      settings.hapticsEnabled ? 'bg-cyan-500' : 'bg-slate-600'
                    }`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                      settings.hapticsEnabled ? 'translate-x-6' : 'translate-x-0.5'
                    }`} />
                  </button>
                </div>
              </div>
            </div>
            <div className="p-6 pt-2 flex-none border-t border-white/5">
              <button 
                onClick={() => setActiveTab('main')}
                className="w-full py-3 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-xl font-bold text-slate-300 uppercase tracking-widest text-sm hover:text-white transition-colors"
              >
                Back to Menu
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default MainMenu;
