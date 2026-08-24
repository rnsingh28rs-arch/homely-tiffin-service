import React, { useState, useEffect } from 'react';
import { getSiteConfig, SiteConfig } from '../../utils/siteConfigStore';

export const TodayMenuTicker: React.FC = () => {
  const [config, setConfig] = useState<SiteConfig>(getSiteConfig());

  useEffect(() => {
    const handleUpdate = () => setConfig(getSiteConfig());
    window.addEventListener('bmb_config_updated', handleUpdate);
    return () => window.removeEventListener('bmb_config_updated', handleUpdate);
  }, []);

  const activeDishes = config.dishes || [];

  return (
    <div id="todays-menu" className="bg-[#0D2318] text-white py-4 px-4 border-b border-[#1A3D2A]">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 shrink-0">
          <span className="flex h-3 w-3 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
          </span>
          <span className="text-xs font-black uppercase tracking-wider text-amber-300">
            TODAY'S LIVE KITCHEN MENU:
          </span>
        </div>

        <div className="flex flex-wrap items-center justify-center md:justify-end gap-3 w-full">
          {activeDishes.map((dish) => (
            <div
              key={dish.id}
              className="bg-[#152E20] border border-[#244E36] px-3.5 py-1.5 rounded-xl flex items-center gap-2 text-xs shadow-sm"
            >
              <span className="text-amber-400 font-bold">
                {dish.category === 'Veg' ? '🌱' : dish.category === 'Egg' ? '🍳' : '🍗'} {dish.name}
              </span>
              <span className="text-slate-400">|</span>
              <span className="text-white font-mono font-black text-amber-300">₹{dish.price}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
