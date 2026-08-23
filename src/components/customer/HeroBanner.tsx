import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { getSiteConfig, SiteConfig, VEG_THALI_IMG, EGG_THALI_IMG, CHICKEN_THALI_IMG } from '../../utils/siteConfigStore';

export const HeroBanner: React.FC = () => {
  const { openInstantOrder, openRegistration } = useApp();
  const [config, setConfig] = useState<SiteConfig>(getSiteConfig());
  const [activePlanTab, setActivePlanTab] = useState<'veg' | 'egg' | 'nonveg'>('veg');

  useEffect(() => {
    const handleUpdate = () => setConfig(getSiteConfig());
    window.addEventListener('bmb_config_updated', handleUpdate);
    return () => window.removeEventListener('bmb_config_updated', handleUpdate);
  }, []);

  return (
    <section className="relative overflow-hidden pt-6 pb-12 px-4 sm:px-6 max-w-7xl mx-auto">
      {/* Category Navigation Pills */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-2 border-b border-[#243B2D]/10">
        <span className="text-xs font-black uppercase text-amber-700 tracking-wider">
          {config.heroBadge || '🔥 #1 Student & Office Tiffin in Greater Noida'}
        </span>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActivePlanTab('veg')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              activePlanTab === 'veg'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            🌱 Veg Classic
          </button>
          <button
            type="button"
            onClick={() => setActivePlanTab('egg')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              activePlanTab === 'egg'
                ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            🍳 Egg Delight
          </button>
          <button
            type="button"
            onClick={() => setActivePlanTab('nonveg')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              activePlanTab === 'nonveg'
                ? 'bg-rose-600 text-white shadow-md'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            🍗 Non-Veg Club
          </button>
        </div>
      </div>

      {/* Main Hero Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Headline & Active Monthly Package Showcase */}
        <div className="lg:col-span-7 space-y-6">
          <div>
            <span className="px-3 py-1 bg-amber-500/20 text-amber-800 border border-amber-500/40 rounded-full text-[11px] font-black uppercase">
              {activePlanTab === 'veg' && '🌿 PURE VEGETARIAN HOMESTYLE MEALS'}
              {activePlanTab === 'egg' && '🍳 HIGH-PROTEIN DOUBLE EGG COMBO'}
              {activePlanTab === 'nonveg' && '🍗 DESI CHICKEN SPECIAL PLAN'}
            </span>
            <h1 className="text-3xl sm:text-5xl font-black text-[#1A261E] mt-3 tracking-tight leading-tight">
              {config.heroHeadline || 'Homely Food. Delivered with Care.'}
            </h1>
            <p className="text-slate-600 text-sm sm:text-base mt-2">
              {config.heroTagline || 'Premium hygienic tiffin service for Students & Working Professionals.'}
            </p>
          </div>

          {/* Active Featured Card (Synced with Exact ₹80, ₹100, ₹120 Rates) */}
          <div className="bg-[#15231B] text-[#FAF7F2] rounded-3xl p-6 sm:p-7 border border-[#2B4534] shadow-2xl space-y-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#243B2D] pb-4">
              <div>
                <span className="text-xs text-amber-300 font-bold uppercase tracking-wider block">
                  30-Day Monthly Subscription
                </span>
                <h3 className="text-2xl font-black text-white mt-1">
                  {activePlanTab === 'veg' && 'The Pure Veg Monthly Plan'}
                  {activePlanTab === 'egg' && 'The Egg Delight Monthly Plan'}
                  {activePlanTab === 'nonveg' && 'The Chicken Special Monthly Plan'}
                </h3>
              </div>
              <div className="text-right bg-[#0F1A13] px-4 py-2 rounded-2xl border border-amber-500/30">
                <span className="text-[10px] text-slate-400 block uppercase font-bold">Package Price</span>
                <span className="text-2xl font-black text-amber-400">
                  {activePlanTab === 'veg' && `₹${config.packages?.veg?.monthlyPrice || 2400}`}
                  {activePlanTab === 'egg' && `₹${config.packages?.egg?.monthlyPrice || 2999}`}
                  {activePlanTab === 'nonveg' && `₹${config.packages?.nonVeg?.monthlyPrice || 3599}`}
                </span>
                <span className="text-[10px] text-slate-400 block font-bold">/ Month</span>
              </div>
            </div>

            {/* Menu Items Details */}
            <div className="text-xs text-slate-300 bg-[#0F1A13] p-4 rounded-2xl border border-[#243B2D] space-y-2">
              <div className="font-bold text-white flex items-center gap-1.5">
                <span>🍱</span> Daily Box Includes:
              </div>
              <p className="text-emerald-200/90 leading-relaxed font-medium">
                {activePlanTab === 'veg' && (config.packages?.veg?.itemsIncluded || '4 Butter Tawa Rotis + Seasonal Dal + Green Sabzi + Steamed Rice + Salad & Pickle')}
                {activePlanTab === 'egg' && (config.packages?.egg?.itemsIncluded || '2-Egg Rich Curry + 4 Soft Rotis + Steamed Rice + Yellow Dal + Fresh Salad')}
                {activePlanTab === 'nonveg' && (config.packages?.nonVeg?.itemsIncluded || 'Homestyle Chicken Curry (3 Pcs) + 4 Rotis + Steamed Rice + Salad & Raita')}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={() => openRegistration()}
                className="flex-1 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-2xl shadow-lg transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>📅</span>
                <span>Subscribe Monthly Plan</span>
              </button>

              <button
                type="button"
                onClick={() => openInstantOrder()}
                className="py-3.5 px-6 bg-gradient-to-r from-amber-500 to-amber-600 hover:brightness-110 text-slate-950 font-black text-xs rounded-2xl shadow-lg transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>⚡</span>
                <span>Order Single Thali</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Live 3-Thali Order Quick Deck */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Live Preview Box with Exact HD Photo */}
          <div className="bg-[#15231B] border-2 border-[#2B4534] rounded-3xl p-5 text-white shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-black text-amber-300 uppercase flex items-center gap-1.5">
                <span>🍱</span> Live Food Preview
              </span>
              <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-black rounded-full uppercase">
                Warm & Fresh
              </span>
            </div>

            <div className="relative h-44 w-full rounded-2xl overflow-hidden mb-3 bg-[#0F1A13]">
              <img
                src={
                  activePlanTab === 'veg'
                    ? VEG_THALI_IMG
                    : activePlanTab === 'egg'
                    ? EGG_THALI_IMG
                    : CHICKEN_THALI_IMG
                }
                alt="Thali Preview"
                className="w-full h-full object-cover"
              />
            </div>

            {/* 3 Instant One-Time Dishes with Exact Rates (₹80, ₹100, ₹120) */}
            <div className="space-y-2.5 pt-2">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                ⚡ Instant One-Time Thalis (30 Mins Gate Drop):
              </div>

              {/* Pure Veg (₹80) */}
              <div className="p-3 bg-[#0F1A13] border border-[#243B2D] hover:border-emerald-500/50 rounded-2xl flex items-center justify-between transition">
                <div className="flex items-center gap-3">
                  <img src={VEG_THALI_IMG} alt="Veg" className="w-11 h-11 object-cover rounded-xl" />
                  <div>
                    <div className="text-xs font-black text-white">Pure Veg Thali</div>
                    <div className="text-[10px] text-slate-400">4 Rotis, Dal, Sabzi, Rice, Salad</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-base font-black text-amber-400 font-mono">₹80</span>
                  <button
                    type="button"
                    onClick={() => openInstantOrder()}
                    className="px-3 py-1.5 bg-amber-500 text-slate-950 font-black text-xs rounded-xl shadow cursor-pointer hover:brightness-110"
                  >
                    Order ➔
                  </button>
                </div>
              </div>

              {/* Egg Delight (₹100) */}
              <div className="p-3 bg-[#0F1A13] border border-[#243B2D] hover:border-amber-500/50 rounded-2xl flex items-center justify-between transition">
                <div className="flex items-center gap-3">
                  <img src={EGG_THALI_IMG} alt="Egg" className="w-11 h-11 object-cover rounded-xl" />
                  <div>
                    <div className="text-xs font-black text-white">Egg Delight Thali</div>
                    <div className="text-[10px] text-slate-400">2-Egg Curry, 4 Rotis, Dal, Rice</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-base font-black text-amber-400 font-mono">₹100</span>
                  <button
                    type="button"
                    onClick={() => openInstantOrder()}
                    className="px-3 py-1.5 bg-amber-500 text-slate-950 font-black text-xs rounded-xl shadow cursor-pointer hover:brightness-110"
                  >
                    Order ➔
                  </button>
                </div>
              </div>

              {/* Chicken Curry (₹120) */}
              <div className="p-3 bg-[#0F1A13] border border-[#243B2D] hover:border-rose-500/50 rounded-2xl flex items-center justify-between transition">
                <div className="flex items-center gap-3">
                  <img src={CHICKEN_THALI_IMG} alt="Chicken" className="w-11 h-11 object-cover rounded-xl" />
                  <div>
                    <div className="text-xs font-black text-white">Chicken Curry Thali</div>
                    <div className="text-[10px] text-slate-400">Chicken (3 Pcs), 4 Rotis, Rice, Salad</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-base font-black text-amber-400 font-mono">₹120</span>
                  <button
                    type="button"
                    onClick={() => openInstantOrder()}
                    className="px-3 py-1.5 bg-amber-500 text-slate-950 font-black text-xs rounded-xl shadow cursor-pointer hover:brightness-110"
                  >
                    Order ➔
                  </button>
                </div>
              </div>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
