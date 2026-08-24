import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { getSiteConfig, SiteConfig, VEG_IMG, EGG_IMG, CHICKEN_IMG } from '../../utils/siteConfigStore';

export const HeroBanner: React.FC = () => {
  const { openInstantOrder, openRegistration } = useApp();
  const [config, setConfig] = useState<SiteConfig>(getSiteConfig());
  const [activeTab, setActiveTab] = useState<'veg' | 'egg' | 'nonveg'>('veg');
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);

  useEffect(() => {
    const handleUpdate = () => setConfig(getSiteConfig());
    window.addEventListener('bmb_config_updated', handleUpdate);
    return () => window.removeEventListener('bmb_config_updated', handleUpdate);
  }, []);

  return (
    <section className="relative overflow-hidden pt-6 pb-12 px-4 sm:px-6 max-w-7xl mx-auto">
      {/* Category Pills & Sub-brand Badge */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-2 border-b border-[#243B2D]/10">
        <div className="flex items-center gap-2">
          <span className="text-xs font-black uppercase text-amber-700 tracking-wider">
            {config.heroBadge}
          </span>
          <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-md">
            By Shree Foods
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('veg')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTab === 'veg'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            🌱 Veg Classic (₹80)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('egg')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTab === 'egg'
                ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            🍳 Egg Delight (₹100)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('nonveg')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTab === 'nonveg'
                ? 'bg-rose-600 text-white shadow-md'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            🍗 Non-Veg Club (₹120)
          </button>
        </div>
      </div>

      {/* Main Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Col: Headlines, Monthly Plans & Audience Focus */}
        <div className="lg:col-span-7 space-y-6">
          <div>
            <span className="px-3 py-1 bg-amber-500/20 text-amber-800 border border-amber-500/40 rounded-full text-[11px] font-black uppercase">
              {activeTab === 'veg' && '🌿 PURE VEGETARIAN HOMESTYLE MEALS'}
              {activeTab === 'egg' && '🍳 HIGH-PROTEIN DOUBLE EGG COMBO'}
              {activeTab === 'nonveg' && '🍗 DESI CHICKEN SPECIAL PLAN'}
            </span>
            <h1 className="text-3xl sm:text-5xl font-black text-[#1A261E] mt-3 tracking-tight leading-tight">
              {config.heroHeadline}
            </h1>
            <p className="text-slate-600 text-sm sm:text-base mt-2">
              {config.heroTagline}
            </p>
          </div>

          {/* Featured Monthly Package Card */}
          <div className="bg-[#15231B] text-[#FAF7F2] rounded-3xl p-6 sm:p-7 border border-[#2B4534] shadow-2xl space-y-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#243B2D] pb-4">
              <div>
                <span className="text-xs text-amber-300 font-bold uppercase tracking-wider block">
                  30-Day Monthly Subscription
                </span>
                <h3 className="text-2xl font-black text-white mt-1">
                  {activeTab === 'veg' && 'The Pure Veg Monthly Plan'}
                  {activeTab === 'egg' && 'The Egg Delight Monthly Plan'}
                  {activeTab === 'nonveg' && 'The Chicken Special Monthly Plan'}
                </h3>
              </div>
              <div className="text-right bg-[#0F1A13] px-4 py-2 rounded-2xl border border-amber-500/30">
                <span className="text-[10px] text-slate-400 block uppercase font-bold">Package Price</span>
                <span className="text-2xl font-black text-amber-400">
                  {activeTab === 'veg' && `₹${config.packages?.veg?.monthlyPrice || 2400}`}
                  {activeTab === 'egg' && `₹${config.packages?.egg?.monthlyPrice || 2999}`}
                  {activeTab === 'nonveg' && `₹${config.packages?.nonVeg?.monthlyPrice || 3599}`}
                </span>
                <span className="text-[10px] text-slate-400 block font-bold">/ Month</span>
              </div>
            </div>

            <div className="text-xs text-slate-300 bg-[#0F1A13] p-4 rounded-2xl border border-[#243B2D] space-y-2">
              <div className="font-bold text-white flex items-center gap-1.5">
                <span>🍱</span> Daily Box Includes:
              </div>
              <p className="text-emerald-200/90 leading-relaxed font-medium">
                {activeTab === 'veg' && config.packages?.veg?.itemsIncluded}
                {activeTab === 'egg' && config.packages?.egg?.itemsIncluded}
                {activeTab === 'nonveg' && config.packages?.nonVeg?.itemsIncluded}
              </p>
            </div>

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

              <button
                type="button"
                onClick={() => setIsCalculatorOpen(true)}
                className="py-3.5 px-4 bg-[#0F1A13] hover:bg-[#1a2c20] text-amber-300 border border-amber-500/40 font-bold text-xs rounded-2xl transition cursor-pointer"
                title="Calculate Cook vs BMB Savings"
              >
                🧮 Savings ROI
              </button>
            </div>
          </div>
        </div>

        {/* Right Col: Live Food Visual & 3 Instant Thalis */}
        <div className="lg:col-span-5 space-y-4">
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
                src={activeTab === 'veg' ? VEG_IMG : activeTab === 'egg' ? EGG_IMG : CHICKEN_IMG}
                alt="Thali Preview"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="space-y-2.5 pt-2">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                ⚡ Instant One-Time Drop (30 Mins Express):
              </div>

              {/* Veg (₹80) */}
              <div className="p-3 bg-[#0F1A13] border border-[#243B2D] hover:border-emerald-500/50 rounded-2xl flex items-center justify-between transition">
                <div>
                  <div className="text-xs font-black text-white">Veg Classic Thali</div>
                  <div className="text-[10px] text-slate-400">4 Rotis, Dal, Sabzi, Rice, Salad</div>
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

              {/* Egg (₹100) */}
              <div className="p-3 bg-[#0F1A13] border border-[#243B2D] hover:border-amber-500/50 rounded-2xl flex items-center justify-between transition">
                <div>
                  <div className="text-xs font-black text-white">Egg Delight Thali</div>
                  <div className="text-[10px] text-slate-400">2-Egg Curry, 4 Rotis, Dal, Rice</div>
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

              {/* Chicken (₹120) */}
              <div className="p-3 bg-[#0F1A13] border border-[#243B2D] hover:border-rose-500/50 rounded-2xl flex items-center justify-between transition">
                <div>
                  <div className="text-xs font-black text-white">Non-Veg Club Thali</div>
                  <div className="text-[10px] text-slate-400">Chicken (3 Pcs), 4 Rotis, Rice, Salad</div>
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

      {/* Internal Cook vs BMB Savings ROI Modal */}
      {isCalculatorOpen && (
        <div
          className="fixed inset-0 z-[120] bg-black/80 flex items-center justify-center p-4"
          onClick={() => setIsCalculatorOpen(false)}
        >
          <div
            className="bg-[#15231B] border-2 border-amber-500/50 rounded-3xl p-6 max-w-lg w-full text-white space-y-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center border-b border-[#243B2D] pb-3">
              <h3 className="text-base font-black text-amber-300 flex items-center gap-2">
                <span>🧮</span> Cook Cost vs BMB Monthly ROI
              </h3>
              <button
                type="button"
                onClick={() => setIsCalculatorOpen(false)}
                className="text-slate-400 hover:text-white bg-[#0F1A13] px-2.5 py-1 rounded-lg text-xs"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-[#0F1A13] p-3 rounded-2xl border border-rose-500/30 space-y-1">
                <div className="text-rose-300 font-bold">Traditional Local Maid / Cook Expense:</div>
                <div className="flex justify-between text-slate-300">
                  <span>Maid Salary (Per Head):</span>
                  <span className="font-mono text-white">₹1,500 – ₹2,000</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Grocery, Oil, Spices & Gas:</span>
                  <span className="font-mono text-white">₹3,000 – ₹3,500</span>
                </div>
                <div className="border-t border-[#243B2D] pt-1 flex justify-between text-rose-400 font-black">
                  <span>Total Self-Cook Monthly Cost:</span>
                  <span>₹4,500 – ₹5,500</span>
                </div>
                <p className="text-[10px] text-slate-400 italic pt-1">
                  * Plus random maid holidays, grocery shopping fatigue, and washing dirty oily utensils daily.
                </p>
              </div>

              <div className="bg-[#0F1A13] p-3 rounded-2xl border border-emerald-500/40 space-y-1">
                <div className="text-emerald-300 font-bold">Bring My Bite All-Inclusive Subscription:</div>
                <div className="flex justify-between text-slate-300">
                  <span>30-Day Fresh Pure Veg Plan:</span>
                  <span className="font-mono text-amber-400 font-bold">₹2,400</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Utensil Washing / Grocery Jhanjhat:</span>
                  <span className="font-mono text-emerald-400 font-bold">₹0 (Zero)</span>
                </div>
                <div className="border-t border-[#243B2D] pt-1 flex justify-between text-emerald-300 font-black text-sm">
                  <span>Guaranteed Direct Savings:</span>
                  <span>Save ₹2,100+ / Month</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setIsCalculatorOpen(false);
                openRegistration();
              }}
              className="w-full py-3 bg-gradient-to-r from-[#D97706] to-[#F59E0B] text-slate-950 font-black text-xs rounded-xl shadow-lg cursor-pointer"
            >
              Start Saving & Subscribe Now ➔
            </button>
          </div>
        </div>
      )}
    </section>
  );
};
