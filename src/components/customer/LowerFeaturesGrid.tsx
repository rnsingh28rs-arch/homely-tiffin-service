import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { getSiteConfig, SiteConfig, DynamicDish } from '../../utils/siteConfigStore';

export const LowerFeaturesGrid: React.FC = () => {
  const { openInstantOrder } = useApp();
  const [config, setConfig] = useState<SiteConfig>(getSiteConfig());
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const syncConfig = () => {
    setConfig(getSiteConfig());
  };

  useEffect(() => {
    syncConfig();
    window.addEventListener('bmb_config_updated', syncConfig);
    return () => window.removeEventListener('bmb_config_updated', syncConfig);
  }, []);

  const activeDishes = (config.dishes || []).filter((d) => d.isAvailable);
  const displayedDishes = activeDishes.filter(
    (d) => (selectedCategory === 'All' ? true : d.category === selectedCategory)
  );

  return (
    <section className="py-12 px-4 sm:px-6 max-w-7xl mx-auto" id="daily-menu">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-8">
        <span className="px-3.5 py-1 bg-amber-500/20 text-amber-600 border border-amber-500/30 rounded-full text-xs font-black uppercase tracking-wider">
          🔥 Freshly Cooked Today
        </span>
        <h2 className="text-3xl sm:text-4xl font-black text-[#1A261E] mt-3 tracking-tight">
          Daily Thalis & Special Rice Combos
        </h2>
        <p className="text-slate-600 text-sm mt-2">
          Prepared daily in our hygienic kitchen with pure desi ghee, mustard oil and zero preservatives.
        </p>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
          {['All', 'Veg', 'Egg', 'Non-Veg', 'Rice Combo'].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {cat === 'All' ? '🌟 All Items' : cat === 'Veg' ? '🌱 Pure Veg' : cat === 'Egg' ? '🍳 Egg Special' : cat === 'Non-Veg' ? '🍗 Non-Veg' : '🍚 Rice Combos'}
            </button>
          ))}
        </div>
      </div>

      {/* Dynamic Dishes Grid (Connected to Super Admin) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayedDishes.map((dish) => (
          <div
            key={dish.id}
            className="bg-white border border-slate-200 hover:border-amber-500/50 rounded-3xl p-5 shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
          >
            <div>
              {/* Dish Photo */}
              <div className="relative h-48 w-full rounded-2xl overflow-hidden mb-4 bg-slate-100">
                <img
                  src={dish.imageUrl || 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=80'}
                  alt={dish.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=80';
                  }}
                />
                <div className="absolute top-3 left-3 flex gap-1.5">
                  <span className="px-2.5 py-1 bg-black/70 backdrop-blur text-amber-300 text-[10px] font-black rounded-lg uppercase">
                    {dish.category}
                  </span>
                  {dish.badge && (
                    <span className="px-2.5 py-1 bg-amber-500 text-slate-950 text-[10px] font-black rounded-lg shadow">
                      {dish.badge}
                    </span>
                  )}
                </div>
              </div>

              {/* Dish Info */}
              <h3 className="text-lg font-black text-[#1A261E] group-hover:text-amber-600 transition">
                {dish.name}
              </h3>
              <p className="text-slate-600 text-xs mt-1.5 line-clamp-2 leading-relaxed">
                {dish.items}
              </p>
            </div>

            {/* Price & Instant Order Button */}
            <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Price per plate</span>
                <span className="text-2xl font-black text-[#1A261E]">₹{dish.price}</span>
              </div>

              <button
                type="button"
                onClick={() => openInstantOrder()}
                className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:brightness-110 text-slate-950 font-black text-xs rounded-xl shadow-md transition flex items-center gap-1.5 cursor-pointer"
              >
                <span>⚡</span>
                <span>Order Now</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Trust & Delivery Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-12 pt-8 border-t border-slate-200">
        <div className="bg-[#15231B] text-[#FAF7F2] p-5 rounded-3xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center text-2xl font-bold">
            ⚡
          </div>
          <div>
            <h4 className="font-bold text-sm text-white">30 Min Delivery</h4>
            <p className="text-xs text-emerald-200/70 mt-0.5">Express delivery in Greater Noida & KP Hostels</p>
          </div>
        </div>

        <div className="bg-[#15231B] text-[#FAF7F2] p-5 rounded-3xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-2xl font-bold">
            🛡️
          </div>
          <div>
            <h4 className="font-bold text-sm text-white">100% Hygienic Food</h4>
            <p className="text-xs text-emerald-200/70 mt-0.5">FSSAI Certified Kitchen with RO filtered water</p>
          </div>
        </div>

        <div className="bg-[#15231B] text-[#FAF7F2] p-5 rounded-3xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-sky-500/20 text-sky-400 flex items-center justify-center text-2xl font-bold">
            🚚
          </div>
          <div>
            <h4 className="font-bold text-sm text-white">Gate Delivery</h4>
            <p className="text-xs text-emerald-200/70 mt-0.5">Hot meal delivered directly to your campus gate</p>
          </div>
        </div>
      </div>
    </section>
  );
};
