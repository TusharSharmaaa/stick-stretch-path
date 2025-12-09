
import React from 'react';
import { RotateCcw, Home, Play, Share2 } from 'lucide-react';

interface GameOverProps {
  score: number;
  bestScore: number;
  onRetry: () => void;
  onHome: () => void;
  onWatchAd: () => void; // Triggers the App-level ad manager
}

const GameOver: React.FC<GameOverProps> = ({ score, bestScore, onRetry, onHome, onWatchAd }) => {
  // Local state removed, controlled by parent App.tsx now via onWatchAd

  return (
    <div 
      className="absolute inset-0 bg-[#050510]/95 z-20 backdrop-blur-xl flex flex-col items-center justify-center p-6 animate-fade-in overflow-y-auto overscroll-contain pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] touch-pan-y"
      style={{ maxHeight: 'var(--app-height, 100vh)' }}
    >
      {/* Background FX */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-900/20 via-transparent to-transparent pointer-events-none" />
      <div className="cyber-grid animate-grid-scroll opacity-30" />
      <div className="scanlines" />

      {/* Title */}
      <div className="relative mb-8 text-center">
         <h2 className="text-[clamp(2.5rem,8vw,3.5rem)] font-black italic text-transparent bg-clip-text bg-gradient-to-br from-red-500 to-pink-600 drop-shadow-[0_0_15px_rgba(236,72,153,0.5)] transform -skew-x-6">
            GAME OVER
         </h2>
         <p className="text-cyan-400 font-mono text-xs tracking-[0.5em] uppercase mt-2 animate-pulse">DON'T GIVE UP</p>
      </div>

      {/* Score Card */}
      <div className="relative w-full max-w-xs mb-8 group">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-pink-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition-opacity" />
        <div className="relative bg-black/60 backdrop-blur-md p-8 rounded-2xl border border-white/10 flex flex-col items-center text-center overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 via-pink-500 to-cyan-500" />
            
            <span className="text-xs text-slate-400 uppercase tracking-widest font-black mb-2">Score</span>
            <div className="text-7xl font-black text-white mb-4 drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
                {score}
            </div>
            
            <div className="bg-slate-800/80 px-4 py-1.5 rounded-lg border border-white/5 flex items-center gap-2">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Best</span>
                <span className="text-xl font-black text-yellow-400">{bestScore}</span>
            </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-4 w-full max-w-xs relative z-10">
        {/* Revive Button */}
        <button
            onClick={onWatchAd}
            className="group relative h-14 w-full transform -skew-x-12 transition-all hover:scale-105 active:scale-95"
        >
            <div className="absolute inset-0 bg-pink-600/50 rounded-lg opacity-80 transition-opacity blur-sm" />
            <div className="absolute inset-0 bg-slate-900 rounded-lg flex items-center justify-center border border-pink-500/50 group-hover:border-pink-500 group-hover:bg-slate-800 transition-colors">
                <div className="transform skew-x-12 flex items-center gap-3">
                    <Play className="w-5 h-5 text-pink-500 fill-current" />
                    <span className="font-bold text-lg text-white">REVIVE <span className="text-pink-500 text-xs">(AD)</span></span>
                </div>
            </div>
        </button>

        {/* Retry Button */}
        <button
          onClick={onRetry}
          className="group relative h-16 w-full transform -skew-x-12 transition-all hover:scale-105 active:scale-95"
        >
           <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-lg opacity-80 group-hover:opacity-100 transition-opacity blur-sm" />
           <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center border border-white/20">
              <div className="transform skew-x-12 flex items-center gap-3">
                 <RotateCcw className="w-6 h-6 text-white group-hover:rotate-180 transition-transform duration-500" />
                 <span className="font-black text-xl text-white italic tracking-wider">RETRY</span>
              </div>
           </div>
        </button>

        <div className="grid grid-cols-2 gap-4 mt-2">
             <button
              onClick={onHome}
              className="h-12 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg transform -skew-x-12 font-bold text-slate-300 hover:text-white transition-colors flex items-center justify-center"
            >
              <div className="transform skew-x-12 flex items-center gap-2">
                <Home className="w-4 h-4" /> MENU
              </div>
            </button>
            <button
              onClick={async () => {
                const shareData = {
                  title: 'Stick Stretch Path',
                  text: `I scored ${score} points! Can you beat my score?`,
                  url: window.location.href,
                };
                try {
                  if (navigator.share) {
                    await navigator.share(shareData);
                  } else {
                    // Fallback: copy to clipboard
                    await navigator.clipboard.writeText(`I scored ${score} points in Stick Stretch Path! Can you beat my score?`);
                    alert('Score copied to clipboard!');
                  }
                } catch (err) {
                  // User cancelled or error occurred - silently fail
                  // Share API failures are expected and don't need logging
                }
              }}
              className="h-12 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg transform -skew-x-12 font-bold text-slate-300 hover:text-white transition-colors flex items-center justify-center"
            >
              <div className="transform skew-x-12 flex items-center gap-2">
                <Share2 className="w-4 h-4" /> SHARE
              </div>
            </button>
        </div>
      </div>
    </div>
  );
};

export default GameOver;
