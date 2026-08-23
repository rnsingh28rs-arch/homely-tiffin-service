import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { getSiteConfig, SiteConfig } from '../../utils/siteConfigStore';

export const PackagesSection: React.FC = () => {
  const { openRegistration } = useApp();
  const [config, setConfig] = useState<SiteConfig>(getSiteConfig());

  useEffect(() => {
    const handleUpdate = () => setConfig(getSiteConfig());
    window.addEventListener('bmb_config_updated', handleUpdate);
    return () => window.removeEventListener('bmb_config_updated', handleUpdate);
  }, []);

  return (
    <section className="py-16 px-4 sm:px-6 max-w-7xl mx-auto" id="monthly-plans">
      <div className="text-center max-w-3xl mx-auto mb-12">
        <span className="px-3.5 py-1 bg-emerald-500/10 text-emerald-700 border border-emerald-500/20 rounded-full text-xs font-black uppercase tracking-wider">
          📅 30-Day Monthly Subscriptions
        </span>
        <h2 className="text-3xl sm:text-4xl font-black text-[#1A261E] mt-3 tracking-tight">
          Pocket-Friendly Monthly Tiffin Plans
        </h2>
        <p className="text-slate-600 text-sm mt-2">
          Hassle-free daily meal delivery for students and working professionals across Greater Noida & Noida.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Pure Veg Plan */}
        <div className="bg-white border-2 border-emerald-500/30 rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-emerald-500 text-white font-black text-[10px] px-3 py-1 rounded-bl-xl uppercase tracking-wider">
            Most Popular 🌱
          </div>

          <div>
            <span className="text-xs font-black text-emerald-600 uppercase tracking-wider">Pure Vegetarian</span>
            <h3 className="text-2xl font-black text-[#1A261E] mt-1">Homestyle Veg Plan</h3>
            <div className="mt-4 flex items-baseline gap-1">
              <span className="text-4xl font-black text-[#1A261E]">₹{config.packages?.veg?.monthlyPrice || 2999}</span>
              <span className="text-xs text-slate-500 font-bold">/ 30 Days</span>
            </div>
            <p className="text-xs text-slate-600 mt-2 font-medium">
              {config.packages?.veg?.description || 'Shuddh Shakahari Ghar Ka Khana'}
            </p>

            <div className="mt-6 pt-6 border-t border-slate-100 space-y-3">
              <div className="text-xs font-bold text-slate-800">What's included daily:</div>
              <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-2xl border border-slate-100">
                {config.packages?.veg?.itemsIncluded || '4 Butter Rotis + Dal Tadka + Sabzi + Rice + Salad'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => openRegistration()}
            className="mt-8 w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-2xl shadow-lg transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>📅</span>
            <span>Subscribe Veg Plan</span>
          </button>
        </div>

        {/* Egg Special Plan */}
        <div className="bg-white border-2 border-amber-500/40 rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-amber-500 text-slate-950 font-black text-[10px] px-3 py-1 rounded-bl-xl uppercase tracking-wider">
            High Protein 💪
          </div>

          <div>
            <span className="text-xs font-black text-amber-600 uppercase tracking-wider">Egg Lovers</span>
            <h3 className="text-2xl font-black text-[#1A261E] mt-1">Double Egg Combo Plan</h3>
            <div className="mt-4 flex items-baseline gap-1">
              <span className="text-4xl font-black text-[#1A261E]">₹{config.packages?.egg?.monthlyPrice || 3499}</span>
              <span className="text-xs text-slate-500 font-bold">/ 30 Days</span>
            </div>
            <p className="text-xs text-slate-600 mt-2 font-medium">
              {config.packages?.egg?.description || 'High-Protein Double Egg Curry Combo'}
            </p>

            <div className="mt-6 pt-6 border-t border-slate-100 space-y-3">
              <div className="text-xs font-bold text-slate-800">What's included daily:</div>
              <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-2xl border border-slate-100">
                {config.packages?.egg?.itemsIncluded || '2-Egg Curry + 4 Rotis + Steamed Rice + Dal + Salad'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => openRegistration()}
            className="mt-8 w-full py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:brightness-110 text-slate-950 font-black text-xs rounded-2xl shadow-lg transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>📅</span>
            <span>Subscribe Egg Plan</span>
          </button>
        </div>

        {/* Non-Veg Plan */}
        <div className="bg-white border-2 border-rose-500/30 rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-rose-500 text-white font-black text-[10px] px-3 py-1 rounded-bl-xl uppercase tracking-wider">
            Chef Special 🍗
          </div>

          <div>
            <span className="text-xs font-black text-rose-600 uppercase tracking-wider">Chicken Feast</span>
            <h3 className="text-2xl font-black text-[#1A261E] mt-1">Chicken Special Plan</h3>
            <div className="mt-4 flex items-baseline gap-1">
              <span className="text-4xl font-black text-[#1A261E]">₹{config.packages?.nonVeg?.monthlyPrice || 4199}</span>
              <span className="text-xs text-slate-500 font-bold">/ 30 Days</span>
            </div>
            <p className="text-xs text-slate-600 mt-2 font-medium">
              {config.packages?.nonVeg?.description || 'Desi Style Special Chicken Thali'}
            </p>

            <div className="mt-6 pt-6 border-t border-slate-100 space-y-3">
              <div className="text-xs font-bold text-slate-800">What's included daily:</div>
              <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-2xl border border-slate-100">
                {config.packages?.nonVeg?.itemsIncluded || 'Homestyle Chicken Curry (3 Pcs) + 4 Rotis + Rice + Salad'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => openRegistration()}
            className="mt-8 w-full py-3.5 bg-rose-600 hover:bg-rose-500 text-white font-black text-xs rounded-2xl shadow-lg transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>📅</span>
            <span>Subscribe Chicken Plan</span>
          </button>
        </div>
      </div>
    </section>
  );
};
