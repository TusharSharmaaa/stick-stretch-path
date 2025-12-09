
import React from 'react';
import { Play, ShoppingBag, Coins, Video, Lock, BarChart3, Trophy, Calendar, Settings, X, Sparkles, Shield, FileText, Star, ExternalLink } from 'lucide-react';
import { SKINS, AD_COIN_REWARD, SHOP_BOOSTS, PLAY_STORE_URL } from '../constants';
import { Achievement, GameStats, DailyChallenge, BoostInventory } from '../types';

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
  boostInventory: BoostInventory;
  equippedBoosts: string[];
  onPurchaseBoost: (boostId: string, cost?: number) => void;
  onToggleBoostEquip: (boostId: string) => void;
  shopDealsUnlocked: boolean;
  onUnlockShopDeals: () => void;
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
  onTutorialClose,
  boostInventory,
  equippedBoosts,
  onPurchaseBoost,
  onToggleBoostEquip,
  shopDealsUnlocked,
  onUnlockShopDeals
}) => {
  const [activeTab, setActiveTab] = React.useState<'main' | 'shop' | 'stats' | 'achievements' | 'challenges' | 'settings'>('main');
  const [shopCategory, setShopCategory] = React.useState<'skins' | 'boosts'>('skins');
  const [activeLegalModal, setActiveLegalModal] = React.useState<'privacy' | 'terms' | null>(null);

  const formatNumber = (value: number) => value.toLocaleString();
  const formatDistance = (distance: number) => {
    if (distance >= 100000) {
      return `${(distance / 1000).toFixed(1)} km`;
    }
    if (distance >= 1000) {
      return `${(distance / 1000).toFixed(2)} km`;
    }
    return `${Math.round(distance)} m`;
  };
  const getEffectiveCost = (baseCost: number) => {
    if (!shopDealsUnlocked || baseCost === 0) return baseCost;
    return Math.max(1, Math.round(baseCost * 0.85));
  };

  const renderBoostIcon = (icon: 'Coins' | 'Shield' | 'Sparkles') => {
    if (icon === 'Shield') {
      return <Shield className="w-10 h-10 text-cyan-300" />;
    }
    if (icon === 'Sparkles') {
      return <Sparkles className="w-10 h-10 text-pink-300" />;
    }
    return <Coins className="w-10 h-10 text-yellow-300" />;
  };

  const rarityColors: Record<string, string> = {
    rare: 'text-cyan-300',
    legendary: 'text-yellow-300',
    mythic: 'text-pink-400'
  };
  const equippedBoostDetails = equippedBoosts
    .map(id => SHOP_BOOSTS.find(b => b.id === id))
    .filter((boost): boost is (typeof SHOP_BOOSTS)[number] => Boolean(boost));

  const legalModalContent: Record<'privacy' | 'terms', { title: string; sections: Array<{ heading: string; body: string }> }> = {
    privacy: {
      title: 'Privacy Policy',
      sections: [
        {
          heading: 'Data We Collect',
          body: 'Stick Stretch Path only stores basic gameplay data (scores, coins, unlocked skins) locally on your device. We do not collect personal identifiers or track you across other apps.'
        },
        {
          heading: 'How It Is Used',
          body: 'Your local data powers features such as leaderboards, achievements, shop unlocks, and saved settings. Nothing is uploaded to external servers.'
        },
        {
          heading: 'Ads & Analytics',
          body: 'Rewarded and interstitial ads are mock implementations in this build. If real ad networks are enabled later, they will adhere to their published privacy controls.'
        }
      ]
    },
    terms: {
      title: 'Terms & Conditions',
      sections: [
        {
          heading: 'Use of the Game',
          body: 'By playing Stick Stretch Path you agree to use the game for personal entertainment only and to refrain from tampering with the client, assets, or progression systems.'
        },
        {
          heading: 'Virtual Currency',
          body: 'Coins earned in-game are virtual and have no real-world value. We may adjust prices, rewards, or balance at any time to keep gameplay fair.'
        },
        {
          heading: 'Updates',
          body: 'Features and content can change frequently. Continued play after updates signifies acceptance of the latest rules and mechanics.'
        }
      ]
    }
  };

  type LegalLink = {
    id: 'privacy' | 'terms' | 'rate';
    label: string;
    description: string;
    icon: React.ElementType;
    url?: string;
    mode: 'modal' | 'external';
  };

  const legalLinks: LegalLink[] = [
    {
      id: 'privacy',
      label: 'Privacy Policy',
      description: 'Understand how we handle your data.',
      icon: Shield,
      mode: 'modal'
    },
    {
      id: 'terms',
      label: 'Terms & Conditions',
      description: 'Review the rules for using Stick Stretch Path.',
      icon: FileText,
      mode: 'modal'
    },
    {
      id: 'rate',
      label: 'Rate on Play Store',
      description: 'Enjoying the game? Leave us a review!',
      url: PLAY_STORE_URL,
      icon: Star,
      mode: 'external'
    }
  ];

  const handleLegalAction = (link: LegalLink) => {
    if (link.mode === 'modal') {
      setActiveLegalModal(link.id);
      return;
    }
    if (link.url) {
      handleExternalLink(link.url);
    }
  };

  const handleExternalLink = (url: string) => {
    if (!url) return;
    if (typeof window !== 'undefined') {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  const unlockedAchievementsCount = stats?.achievementsUnlocked ?? achievements.filter(a => a.unlocked).length;
  const totalAchievements = achievements.length;
  const achievementsProgressBase = totalAchievements > 0 ? totalAchievements : 1;
  const averageCoinsPerGame = stats && stats.gamesPlayed > 0 
    ? Math.round(stats.totalCoinsEarned / stats.gamesPlayed)
    : 0;

  return (
    <div className="absolute inset-0 bg-[#050510] flex flex-col items-center justify-center overflow-y-auto md:overflow-hidden overscroll-contain pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]">
      {/* Background FX */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-900/40 via-[#050510] to-[#050510] pointer-events-none" />
      <div className="cyber-grid animate-grid-scroll" />
      <div className="scanlines" />
      
      {/* Floating Particles/Decor */}
      <div className="absolute top-10 left-10 w-2 h-2 bg-cyan-400 rounded-full animate-ping" />
      <div className="absolute bottom-20 right-10 w-3 h-3 bg-pink-500 rounded-full animate-bounce" />

      <div className="z-10 w-full max-w-xl sm:max-w-3xl px-6 md:px-8 flex flex-col items-center h-full justify-center gap-6">
        
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
            <h1 className="text-[clamp(2.75rem,9vw,3.75rem)] leading-[1.05] font-black tracking-tighter italic transform -skew-x-6 relative">
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
              className="group relative h-[clamp(3.75rem,14vw,5rem)] w-full transform -skew-x-12 transition-all hover:scale-105 active:scale-95"
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
                    <span className="font-bold text-sm text-yellow-400">ACHIEVE</span>
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
          <div 
            className="w-full flex flex-col bg-slate-900/80 backdrop-blur-xl rounded-3xl border border-cyan-500/30 shadow-[0_0_50px_rgba(0,0,0,0.5)] animate-fade-in relative"
            style={{ maxHeight: 'calc(var(--app-height, 100vh) - 2.5rem)' }}
          >
            
            {/* Modal Badge */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-black px-4 py-1 rounded-full border border-cyan-500 text-cyan-400 text-xs font-bold tracking-widest uppercase shadow-[0_0_15px_rgba(34,211,238,0.5)] z-20">
              Themes
            </div>

            {/* Header Container (Fixed) */}
            <div className="p-4 pb-2 flex-none">
                <div className="flex justify-between items-center mb-3 mt-1">
                <h2 className="text-xl font-black text-white flex items-center gap-2 italic">
                    <ShoppingBag className="w-5 h-5 text-yellow-400" /> SHOP
                </h2>
                <div className="bg-black/50 px-3 py-1 rounded-lg border border-yellow-500/30 flex items-center gap-2">
                    <Coins className="w-4 h-4 text-yellow-400" />
                    <span className="font-mono text-white font-bold text-sm">{coins.toLocaleString()}</span>
                </div>
                </div>
                
                {/* Ad Incentivization Area */}
                <button 
                    onClick={onWatchAd}
                    className="w-full py-2.5 bg-gradient-to-r from-yellow-600 to-yellow-500 rounded-xl border border-yellow-300/50 flex items-center justify-center gap-3 transform transition-transform active:scale-95 shadow-[0_0_16px_rgba(234,179,8,0.25)] animate-pulse hover:animate-none group mb-3"
                >
                    <Video className="w-5 h-5 text-black fill-current" />
                    <span className="font-black text-black italic text-base tracking-wider">WATCH AD</span>
                    <span className="bg-black/15 px-2 py-0.5 rounded text-black font-bold text-xs">+{AD_COIN_REWARD} <Coins className="w-3 h-3 inline -mt-0.5" /></span>
                </button>

                <div className={`p-3 rounded-2xl border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 ${shopDealsUnlocked ? 'border-cyan-400/50 bg-cyan-500/10' : 'border-yellow-500/40 bg-yellow-500/5'}`}>
                  <div className="space-y-0.5">
                    <p className="text-[10px] font-black tracking-[0.3em] text-slate-400 uppercase">VIP DEALS</p>
                    <p className="text-white font-bold text-sm leading-tight">-15% on skins & boosts {shopDealsUnlocked ? 'active' : 'after ad unlock'}</p>
                    <p className="text-[11px] text-slate-400">Watch a rewarded ad to unlock premium pricing.</p>
                  </div>
                  <button
                    onClick={() => {
                      if (!shopDealsUnlocked) onUnlockShopDeals();
                    }}
                    disabled={shopDealsUnlocked}
                    className={`px-3 py-2 rounded-xl font-black uppercase tracking-wide text-[11px] border ${
                      shopDealsUnlocked
                        ? 'bg-slate-800/70 text-slate-400 border-slate-700 cursor-not-allowed'
                        : 'bg-yellow-400/90 text-black border-yellow-200 hover:bg-yellow-300'
                    }`}
                  >
                    {shopDealsUnlocked ? 'ACTIVE' : 'UNLOCK VIA AD'}
                  </button>
                </div>

                <div className="mt-3 flex gap-3">
                  <button
                    onClick={() => setShopCategory('skins')}
                    className={`flex-1 py-2 rounded-xl font-bold text-sm border ${
                      shopCategory === 'skins'
                        ? 'bg-pink-500 text-white border-pink-400'
                        : 'bg-slate-900/60 text-slate-400 border-slate-700'
                    }`}
                  >
                    Themes
                  </button>
                  <button
                    onClick={() => setShopCategory('boosts')}
                    className={`flex-1 py-2 rounded-xl font-bold text-sm border ${
                      shopCategory === 'boosts'
                        ? 'bg-cyan-500 text-black border-cyan-300'
                        : 'bg-slate-900/60 text-slate-400 border-slate-700'
                    }`}
                  >
                    Boosters
                  </button>
                </div>
            </div>

            {/* Shop Content (Scrollable) */}
            <div className="flex-1 overflow-y-auto px-4 sm:px-6 custom-scrollbar space-y-3 pb-4 touch-pan-y overscroll-contain">
              {shopCategory === 'skins' ? (
                SKINS.map((skin) => {
                  const isUnlocked = unlockedSkins.includes(skin.id);
                  const isSelected = currentSkin === skin.id;
                  const effectiveCost = getEffectiveCost(skin.cost);
                  const hasDiscount = shopDealsUnlocked && skin.cost > 0 && effectiveCost < skin.cost;
                  const missingCoins = Math.max(0, effectiveCost - coins);
                  const isAchievementSkin = skin.id.startsWith('achievement_');
                  let unlockRequirementText = '';
                  if (!isUnlocked && isAchievementSkin) {
                    if (skin.id === 'achievement_perfect10') {
                      unlockRequirementText = 'UNLOCK VIA: Perfect 10 Achievement';
                    } else if (skin.id === 'achievement_100games') {
                      unlockRequirementText = 'UNLOCK VIA: 100 Games Achievement';
                    } else {
                      unlockRequirementText = 'UNLOCK VIA ACHIEVEMENT';
                    }
                  }

                  return (
                  <div 
                    key={skin.id}
                    className={`relative p-3 rounded-xl border transition-all group overflow-hidden shrink-0 ${
                        isSelected 
                          ? 'border-pink-500 bg-pink-500/10 shadow-[0_0_20px_rgba(236,72,153,0.2)]' 
                          : 'border-slate-700 bg-slate-800/50 hover:border-cyan-500/50 hover:bg-slate-800'
                      }`}
                    >
                      {skin.badge && (
                        <div className="absolute top-1.5 right-3 bg-yellow-400 text-black text-[10px] font-black px-2 py-[3px] rounded-full leading-none shadow-[0_2px_6px_rgba(0,0,0,0.3)]">
                          {skin.badge}
                        </div>
                      )}
                      {isSelected && <div className="absolute inset-0 bg-gradient-to-r from-pink-500/10 to-transparent" />}
                      
                      <div className="flex items-center justify-between relative z-10">
                          <div className="flex items-center gap-4">
                              <div className={`w-12 h-12 rounded-lg shadow-lg ${skin.color} transform group-hover:rotate-6 transition-transform`} />
                              <div className="flex flex-col">
                                  <span className={`font-bold text-lg flex items-center gap-2 ${isSelected ? 'text-pink-400' : 'text-white'}`}>
                                    {skin.name}
                                    {skin.rarity && (
                                      <span className={`text-[10px] uppercase ${rarityColors[skin.rarity] || 'text-slate-400'}`}>
                                        {skin.rarity}
                                      </span>
                                    )}
                                  </span>
                                  <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold flex items-center gap-1">
                                    {isUnlocked ? 'OWNED' : isAchievementSkin ? unlockRequirementText : `${effectiveCost.toLocaleString()} COINS`}
                                    {hasDiscount && !isAchievementSkin && <span className="text-cyan-300">VIP</span>}
                                  </span>
                              </div>
                          </div>

                        {isUnlocked ? (
                          isSelected ? (
                            <div className="bg-pink-500 text-white text-xs font-black px-3 py-1 rounded skew-x-[-10deg]">EQUIPPED</div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => onSelectSkin(skin.id)}
                              className="text-xs font-bold px-3 py-1.5 rounded skew-x-[-10deg] bg-cyan-500 text-black hover:bg-cyan-400 transition-all"
                            >
                              EQUIP
                            </button>
                          )
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              if (!isAchievementSkin && coins >= effectiveCost && effectiveCost >= 0) {
                                onUnlockSkin(skin.id, effectiveCost);
                              }
                            }}
                            disabled={isAchievementSkin || (effectiveCost > 0 && coins < effectiveCost)}
                            className={`text-xs font-bold px-3 py-1.5 rounded skew-x-[-10deg] transition-all flex items-center gap-1 ${
                              !isAchievementSkin && coins >= effectiveCost && effectiveCost >= 0
                                ? 'bg-cyan-500 text-black hover:bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.5)]' 
                                : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                            }`}
                          >
                            {isAchievementSkin ? (
                              <>LOCKED <Lock className="w-3 h-3" /></>
                            ) : coins >= effectiveCost && effectiveCost >= 0 ? (
                              effectiveCost === 0 ? (
                                <>FREE</>
                              ) : (
                                <>UNLOCK <Lock className="w-3 h-3" /></>
                              )
                            ) : (
                              <>NEED {missingCoins.toLocaleString()} <Coins className="w-3 h-3" /></>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <>
                  <div className="bg-slate-900/60 border border-cyan-500/30 rounded-2xl p-4">
                    <div className="text-xs uppercase tracking-[0.3em] text-slate-400 font-black mb-2">Active next run</div>
                    {equippedBoostDetails.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {equippedBoostDetails.map(boost => (
                          <span key={boost.id} className="px-3 py-1 rounded-full text-xs font-bold bg-cyan-500/20 text-cyan-200 border border-cyan-400/40">
                            {boost.name}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-slate-400 text-sm">No boosters queued. Purchase and equip one to supercharge the next run.</p>
                    )}
                  </div>

                  {SHOP_BOOSTS.map(boost => {
                    const owned = boostInventory[boost.id] || 0;
                    const isEquipped = equippedBoosts.includes(boost.id);
                    const effectiveCost = getEffectiveCost(boost.cost);
                    const hasDiscount = shopDealsUnlocked && boost.cost > 0 && effectiveCost < boost.cost;
                    const canBuy = coins >= effectiveCost;

                    return (
                      <div
                        key={boost.id}
                        className="p-4 rounded-2xl border border-slate-700 bg-slate-900/60 flex flex-col gap-3"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-16 h-16 bg-black/30 rounded-2xl flex items-center justify-center border border-white/5">
                              {renderBoostIcon(boost.icon)}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="text-white font-black text-lg">{boost.name}</h4>
                                {hasDiscount && <span className="text-[10px] font-black text-cyan-300">VIP</span>}
                              </div>
                              <p className="text-slate-400 text-sm">{boost.description}</p>
                              <p className="text-[11px] text-slate-500 uppercase tracking-[0.3em]">{boost.durationLabel}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-slate-400 text-xs uppercase">owned</p>
                            <p className="text-2xl font-black text-white">{owned}</p>
                          </div>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2">
                          <button
                            onClick={() => onToggleBoostEquip(boost.id)}
                            disabled={!owned && !isEquipped}
                            className={`flex-1 py-2 rounded-xl font-bold text-sm border ${
                              isEquipped
                                ? 'bg-pink-500 text-white border-pink-400 hover:bg-pink-400'
                                : owned
                                  ? 'bg-slate-800 text-white border-slate-600 hover:border-pink-400'
                                  : 'bg-slate-900 text-slate-500 border-slate-800 cursor-not-allowed'
                            }`}
                          >
                            {isEquipped ? 'Equipped (click to unequip)' : owned ? 'Equip for next run' : 'No charges'}
                          </button>
                          <button
                            onClick={() => {
                              if (canBuy && effectiveCost > 0 && coins >= effectiveCost) {
                                onPurchaseBoost(boost.id, effectiveCost);
                              }
                            }}
                            disabled={!canBuy || effectiveCost <= 0 || coins < effectiveCost}
                            className={`flex-1 py-2 rounded-xl font-bold text-sm border flex items-center justify-center gap-2 ${
                              canBuy && effectiveCost > 0 && coins >= effectiveCost
                                ? 'bg-cyan-500 text-black border-cyan-300 hover:bg-cyan-400'
                                : 'bg-slate-900 text-slate-500 border-slate-800 cursor-not-allowed'
                            }`}
                          >
                            <Coins className="w-4 h-4" />
                            {effectiveCost > 0 ? `Spend ${effectiveCost.toLocaleString()}` : 'FREE'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </>
              )}
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
          <div 
            className="w-full flex flex-col bg-slate-900/80 backdrop-blur-xl rounded-3xl border border-purple-500/30 shadow-[0_0_50px_rgba(0,0,0,0.5)] animate-fade-in relative"
            style={{ maxHeight: 'calc(var(--app-height, 100vh) - 2.5rem)' }}
          >
            <div className="p-6 pb-2 flex-none">
              <h2 className="text-2xl font-black text-white flex items-center gap-2 italic mb-1">
                <BarChart3 className="w-6 h-6 text-purple-400" /> STATISTICS
              </h2>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-[0.3em]">Lifetime performance</p>
            </div>
            <div className="flex-1 overflow-y-auto px-4 sm:px-6 space-y-6 pb-6 touch-pan-y overscroll-contain">
              {stats ? (
                <>
                  <section>
                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] mb-2">Highlights</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="bg-gradient-to-br from-pink-500/10 to-slate-900/60 p-4 rounded-xl border border-pink-500/40">
                        <span className="text-slate-300 text-[10px] font-black uppercase tracking-widest">High Score</span>
                        <div className="text-3xl font-black text-white mt-1 flex items-center gap-2">
                          {formatNumber(bestScore)}
                        </div>
                        <p className="text-xs text-slate-400 mt-1">Personal best run</p>
                      </div>
                      <div className="bg-gradient-to-br from-purple-500/10 to-slate-900/60 p-4 rounded-xl border border-purple-500/40">
                        <span className="text-slate-300 text-[10px] font-black uppercase tracking-widest">Best Combo</span>
                        <div className="text-3xl font-black text-white mt-1">{formatNumber(stats.bestCombo)}</div>
                        <p className="text-xs text-slate-400 mt-1">Longest perfect streak</p>
                      </div>
                      <div className="bg-gradient-to-br from-yellow-500/10 to-slate-900/60 p-4 rounded-xl border border-yellow-500/40 sm:col-span-2">
                        <span className="text-slate-300 text-[10px] font-black uppercase tracking-widest">Lifetime Coins</span>
                        <div className="text-3xl font-black text-yellow-300 mt-1 flex items-center gap-2">
                          <Coins className="w-6 h-6" /> {formatNumber(stats.totalCoinsEarned)}
                        </div>
                        <p className="text-xs text-slate-400 mt-1">Total collected from games, challenges, and ads</p>
                      </div>
                    </div>
                  </section>

                  <section>
                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] mb-2">Lifetime Totals</p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="bg-slate-800/60 p-4 rounded-xl border border-white/5">
                        <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Games Played</span>
                        <div className="text-2xl font-black text-white mt-1">{formatNumber(stats.gamesPlayed)}</div>
                        <p className="text-xs text-slate-500 mt-1">Sessions completed</p>
                      </div>
                      <div className="bg-slate-800/60 p-4 rounded-xl border border-white/5">
                        <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Total Perfects</span>
                        <div className="text-2xl font-black text-white mt-1">{formatNumber(stats.totalPerfects)}</div>
                        <p className="text-xs text-slate-500 mt-1">Perfect landings hit</p>
                      </div>
                      <div className="bg-slate-800/60 p-4 rounded-xl border border-white/5">
                        <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Distance Traveled</span>
                        <div className="text-2xl font-black text-white mt-1">{formatDistance(stats.totalDistance)}</div>
                        <p className="text-xs text-slate-500 mt-1">Approx. meters crossed</p>
                      </div>
                    </div>
                  </section>

                  <section>
                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] mb-2">Efficiency</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="bg-slate-800/60 p-4 rounded-xl border border-white/5">
                        <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Average Score</span>
                        <div className="text-3xl font-black text-white mt-1">{formatNumber(Math.round(stats.averageScore))}</div>
                        <p className="text-xs text-slate-500 mt-1">Across all completed runs</p>
                      </div>
                      <div className="bg-slate-800/60 p-4 rounded-xl border border-white/5">
                        <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Avg Coins / Game</span>
                        <div className="text-3xl font-black text-yellow-200 mt-1 flex items-center gap-2">
                          <Coins className="w-5 h-5" /> {formatNumber(averageCoinsPerGame)}
                        </div>
                        <p className="text-xs text-slate-500 mt-1">Lifetime earn rate</p>
                      </div>
                    </div>
                  </section>

                  <section>
                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] mb-2">Achievements</p>
                    <div className="bg-slate-800/70 p-4 rounded-xl border border-purple-500/30">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-xs font-bold text-slate-400 uppercase">Unlocked</span>
                          <div className="text-3xl font-black text-white">
                            {unlockedAchievementsCount}/{totalAchievements}
                          </div>
                        </div>
                        <Trophy className="w-10 h-10 text-yellow-400" />
                      </div>
                      <div className="w-full h-2 bg-slate-900 rounded-full mt-3 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                          style={{ width: `${Math.min(100, (unlockedAchievementsCount / achievementsProgressBase) * 100)}%` }}
                        />
                      </div>
                      <p className="text-xs text-slate-400 mt-2">Keep pushing for new milestones to unlock cosmetic rewards.</p>
                    </div>
                  </section>
                </>
              ) : (
                <div className="text-center text-slate-400 text-sm">
                  Play at least one game to start building your stats!
                </div>
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
          <div 
            className="w-full flex flex-col bg-slate-900/80 backdrop-blur-xl rounded-3xl border border-yellow-500/30 shadow-[0_0_50px_rgba(0,0,0,0.5)] animate-fade-in relative"
            style={{ maxHeight: 'calc(var(--app-height, 100vh) - 2.5rem)' }}
          >
            <div className="p-6 pb-2 flex-none">
              <h2 className="text-2xl font-black text-white flex items-center gap-2 italic mb-4">
                <Trophy className="w-6 h-6 text-yellow-400" /> ACHIEVEMENTS
              </h2>
            </div>
            <div className="flex-1 overflow-y-auto px-4 sm:px-6 space-y-3 pb-4 touch-pan-y overscroll-contain">
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
          <div 
            className="w-full flex flex-col bg-slate-900/80 backdrop-blur-xl rounded-3xl border border-pink-500/30 shadow-[0_0_50px_rgba(0,0,0,0.5)] animate-fade-in relative"
            style={{ maxHeight: 'calc(var(--app-height, 100vh) - 2.5rem)' }}
          >
            <div className="p-6 pb-2 flex-none">
              <h2 className="text-2xl font-black text-white flex items-center gap-2 italic mb-4">
                <Calendar className="w-6 h-6 text-pink-400" /> DAILY CHALLENGES
              </h2>
            </div>
            <div className="flex-1 overflow-y-auto px-4 sm:px-6 space-y-3 pb-4 touch-pan-y overscroll-contain">
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
          <div 
            className="w-full flex flex-col bg-slate-900/80 backdrop-blur-xl rounded-3xl border border-slate-500/30 shadow-[0_0_50px_rgba(0,0,0,0.5)] animate-fade-in relative"
            style={{ maxHeight: 'calc(var(--app-height, 100vh) - 2.5rem)' }}
          >
            <div className="p-6 pb-2 flex-none">
              <h2 className="text-2xl font-black text-white flex items-center gap-2 italic mb-4">
                <Settings className="w-6 h-6 text-slate-400" /> SETTINGS
              </h2>
            </div>
            <div className="flex-1 overflow-y-auto px-4 sm:px-6 space-y-3 pb-4 touch-pan-y overscroll-contain">
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
              <div className="bg-slate-900/60 p-4 rounded-xl border border-white/5 space-y-3">
                <div className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">Support</div>
                {legalLinks.map(link => (
                  <button
                    key={link.id}
                    onClick={() => handleLegalAction(link)}
                    className="w-full flex items-center justify-between text-left bg-slate-900/40 border border-slate-700 hover:border-cyan-400/60 hover:bg-slate-800/60 transition-colors rounded-xl px-4 py-3 gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <link.icon className="w-5 h-5 text-cyan-300" />
                      <div>
                        <div className="font-bold text-white">{link.label}</div>
                        <div className="text-xs text-slate-400">{link.description}</div>
                      </div>
                    </div>
                    {link.mode === 'external' ? (
                      <ExternalLink className="w-4 h-4 text-slate-500" />
                    ) : (
                      <FileText className="w-4 h-4 text-slate-500" />
                    )}
                  </button>
                ))}
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

        {activeLegalModal && (
          <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-6">
            <div className="bg-slate-900/95 border border-cyan-500/40 rounded-2xl p-6 max-w-lg w-full relative space-y-4">
              <button
                onClick={() => setActiveLegalModal(null)}
                className="absolute top-4 right-4 text-white/60 hover:text-white"
                aria-label="Close legal modal"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-3">
                {activeLegalModal === 'privacy' ? (
                  <Shield className="w-6 h-6 text-cyan-300" />
                ) : (
                  <FileText className="w-6 h-6 text-cyan-300" />
                )}
                <h3 className="text-2xl font-black text-white">
                  {legalModalContent[activeLegalModal].title}
                </h3>
              </div>
              <div className="space-y-4 text-sm text-slate-300 leading-relaxed max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                {legalModalContent[activeLegalModal].sections.map(section => (
                  <div key={section.heading}>
                    <p className="text-cyan-200 font-semibold mb-1">{section.heading}</p>
                    <p>{section.body}</p>
                  </div>
                ))}
              </div>
              <div className="text-xs text-slate-500">
                Last updated {new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MainMenu;
