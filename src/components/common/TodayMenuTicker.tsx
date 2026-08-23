import React, { useState, useEffect } from 'react';
import { getSiteConfig, SiteConfig } from '../../utils/siteConfigStore';
import { useApp } from '../../context/AppContext';

export const TodayMenuTicker: React.FC = () => {
  const { openInstantOrder } = useApp();
  const [config, setConfig] = useState<SiteConfig>(getSiteConfig());

  useEffect(() => {
    const handleUpdate = () => setConfig(getSiteConfig());
    window.addEventListener('bmb_config_updated', handleUpdate);
    return () => window.removeEventListener('bmb_config_updated', handleUpdate);
  }, []);

  const activeDishes = (config.dishes || []).filter((d) => d.isAvailable);

  return (
    <div className="bg-[#FAF7F2] border-b border-[#243B2D]/10 py-2.5 px-4 overflow-hidden shadow-inner">
      <div className="max-w-7xl mx-auto flex items-center gap-3">
        <span className="px-2.5 py-1 bg-amber-500 text-slate-950 font-black text-[10px] rounded-lg uppercase tracking-wider shrink-0 shadow-sm">
          🔥 Today's Menu
        </span>

        <div className="flex-1 overflow-x-auto scrollbar-none whitespace-nowrap flex items-center gap-6 text-xs text-[#1A261E] font-bold">
          {activeDishes.map((dish) => (
            <button
              key={dish.id}
              type="button"
              onClick={() => openInstantOrder()}
              className="inline-flex items-center gap-2 hover:text-amber-600 transition cursor-pointer shrink-0"
            >
              <span>{dish.category === 'Veg' ? '🌱' : dish.category === 'Egg' ? '🍳' : '🍗'}</span>
              <span>{dish.name}:</span>
              <span className="text-amber-600 font-black">₹{dish.price}</span>
              <span className="text-slate-300">•</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
