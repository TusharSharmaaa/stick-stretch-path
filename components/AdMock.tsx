
import React, { useEffect, useState } from 'react';
import { X, Info } from 'lucide-react';

interface AdMockProps {
  type: 'BANNER' | 'INTERSTITIAL' | 'REWARDED';
  onClose: (rewardEarned: boolean) => void;
}

export const AdMock: React.FC<AdMockProps> = ({ type, onClose }) => {
  const [timeLeft, setTimeLeft] = useState(type === 'BANNER' ? 0 : 5);
  const [canClose, setCanClose] = useState(type === 'BANNER');

  useEffect(() => {
    if (type === 'BANNER') return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setCanClose(true);
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [type]);

  if (type === 'BANNER') {
    return (
      <div className="fixed bottom-0 left-0 w-full h-[50px] bg-gray-100 border-t border-gray-300 z-[100] flex items-center justify-center select-none">
        <div className="flex items-center gap-2">
            <div className="bg-blue-500 text-white text-[10px] px-1 rounded">Ad</div>
            <span className="text-xs text-gray-500 font-sans">Test Mode: Banner Ad (468x60)</span>
        </div>
      </div>
    );
  }

  // Full Screen Ad Mock (Interstitial / Rewarded)
  return (
    <div 
      className="fixed inset-0 z-[999] bg-black flex flex-col items-center justify-center animate-fade-in"
      style={{ minHeight: 'var(--app-height, 100vh)' }}
    >
      {/* Ad Header */}
      <div className="absolute top-0 left-0 w-full p-4 flex justify-between items-start safe-top">
        <div className="bg-black/50 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
            <Info className="w-3 h-3" /> Ad: Test App
        </div>
        {canClose ? (
          <button 
            onClick={() => onClose(true)}
            className="bg-white/20 hover:bg-white/40 rounded-full p-2 text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        ) : (
          <div className="text-white text-sm font-bold ring-2 ring-white/50 rounded-full w-8 h-8 flex items-center justify-center">
            {timeLeft}
          </div>
        )}
      </div>

      {/* Ad Content Mock */}
      <div className="w-full max-w-md p-8 text-center">
         <div className="w-24 h-24 bg-blue-500 rounded-2xl mx-auto mb-6 shadow-lg shadow-blue-500/50 flex items-center justify-center">
            <span className="text-4xl">🚀</span>
         </div>
         <h2 className="text-3xl font-black text-white mb-2">SUPER GAME 3000</h2>
         <p className="text-gray-300 mb-8">Install now and get 1,000,000 free coins! The best RPG of 2025.</p>
         
         <button className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg transform active:scale-95 transition-all">
            INSTALL NOW
         </button>
         
         {type === 'REWARDED' && (
             <p className="text-xs text-gray-500 mt-4 uppercase tracking-widest">Watch video to earn reward</p>
         )}
      </div>
    </div>
  );
};
