import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { getSiteConfig, SiteConfig, VEG_IMG, EGG_IMG, CHICKEN_IMG } from '../../utils/siteConfigStore';

export const HeroBanner: React.FC = () => {
  const { openInstantOrder, openRegistration } = useApp();
  const [config, setConfig] = useState<SiteConfig>(getSiteConfig());
  const [activeMediaTab, setActiveMediaTab] = useState<'photos' | 'video'>('photos');
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);

  useEffect(() => {
    const handleUpdate = () => setConfig(getSiteConfig());
    window.addEventListener('bmb_config_updated', handleUpdate);
    return () => window.removeEventListener('bmb_config_updated', handleUpdate);
  }, []);

  const bannerSlides = [
    {
      img: VEG_IMG,
      title: "Pure Veg Classic Thali",
      rate: "₹80",
      tag: "Homestyle Daily Box"
    },
    {
      img: EGG_IMG,
      title: "Double Egg Delight Thali",
      rate: "₹100",
      tag: "High Protein Meal"
    },
    {
      img: CHICKEN_IMG,
      title: "Desi Chicken Curry Thali",
      rate: "₹120",
      tag: "Chef Special Club"
    }
  ];

  // Auto Slider for Hero Media Box
  useEffect(() => {
    if (activeMediaTab === 'photos') {
      const interval = setInterval(() => {
        setActivePhotoIdx((prev) => (prev + 1) % bannerSlides.length);
      }, 3500);
      return () => clearInterval(interval);
    }
  }, [activeMediaTab, bannerSlides.length]);

  return (
    <section className="relative overflow-hidden bg-[#FAF7F2] py-8 lg:py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Main Original 2-Column Split Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Column: Original Clean Hero Typography & Subscription Showcase */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Top Pill / Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0C3822]/10 border border-[#0C3822]/20 text-[#0C3822] text-xs font-black tracking-wide uppercase">
              <span>🔥</span>
              <span>{config.heroBadge || '#1 Student & Office Tiffin Service'}</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-[#1A261E] tracking-tight leading-[1.1]">
              Ghar Jaisa Swad, <br />
              <span className="text-emerald-800">Delivered on Time.</span>
            </h1>

            {/* Sub-headline */}
            <p className="text-slate-600 text-sm sm:text-base max-w-xl font-medium leading-relaxed">
              Hygienic, hot homestyle meals for Students, PG Flatmates & Corporate Offices in Greater Noida & Noida. Zero maid tantrums, zero utensil washing (bartan dhone ka jhanjhat khatam)!
            </p>

            {/* Quick Pricing Pill Highlights */}
            <div className="flex flex-wrap gap-2.5 pt-1">
              <div className="px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                <span>🌱</span> Pure Veg: <strong className="font-mono font-black text-emerald-700">₹80</strong>
              </div>
              <div className="px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-xl text-xs font-bold text-amber-900 flex items-center gap-1.5">
                <span>🍳</span> Egg Delight: <strong className="font-mono font-black text-amber-700">₹100</strong>
              </div>
              <div className="px-3 py-1.5 bg-rose-50 border border-rose-200 rounded-xl text-xs font-bold text-rose-900 flex items-center gap-1.5">
                <span>🍗</span> Chicken Special: <strong className="font-mono font-black text-rose-700">₹120</strong>
              </div>
            </div>

            {/* Primary Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-3">
              <button
                type="button"
                onClick={() => openInstantOrder()}
                className="px-8 py-4 bg-gradient-to-r from-amber-500 via-amber-600 to-amber-500 hover:brightness-110 text-slate-950 font-black text-sm rounded-2xl shadow-xl hover:scale-102 active:scale-98 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>⚡</span>
                <span>Order Single Thali (From ₹80)</span>
              </button>

              <button
                type="button"
                onClick={() => openRegistration()}
                className="px-8 py-4 bg-[#0C3822] hover:bg-[#124E33] text-white font-black text-sm rounded-2xl shadow-xl hover:scale-102 active:scale-98 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>📅</span>
                <span>Monthly 30-Day Plans</span>
              </button>
            </div>

            {/* Micro Delivery Guarantee Strip */}
            <div className="flex items-center gap-4 text-xs text-slate-500 pt-2 font-medium">
              <div className="flex items-center gap-1.5">
                <span className="text-emerald-600 font-bold">✓</span> Free Gate Drop (Greater Noida)
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-emerald-600 font-bold">✓</span> No Oil Overdose
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-emerald-600 font-bold">✓</span> By Shree Foods
              </div>
            </div>
          </div>

          {/* Right Column: Original Styled Frame + Promo Video / Live Stories Slider */}
          <div className="lg:col-span-5">
            <div className="relative bg-[#15231B] border-2 border-[#2B4534] rounded-3xl p-5 text-white shadow-2xl overflow-hidden">
              
              {/* Media Mode Header Tabs */}
              <div className="flex items-center justify-between border-b border-[#243B2D] pb-3 mb-3.5">
                <div className="flex items-center gap-1 bg-[#0F1A13] p-1 rounded-xl border border-[#243B2D]">
                  <button
                    type="button"
                    onClick={() => setActiveMediaTab('photos')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                      activeMediaTab === 'photos'
                        ? 'bg-amber-500 text-slate-950 font-black'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    📸 Live Thalis
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveMediaTab('video')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                      activeMediaTab === 'video'
                        ? 'bg-rose-600 text-white font-black'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <span>▶</span>
                    <span>Promo Reel</span>
                  </button>
                </div>

                <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-black rounded-full uppercase">
                  30-Hr Active
                </span>
              </div>

              {/* TAB 1: Auto-Rotating HD Food Stories */}
              {activeMediaTab === 'photos' && (
                <div className="space-y-3.5">
                  <div className="relative h-64 sm:h-72 w-full rounded-2xl overflow-hidden bg-[#0F1A13] group shadow-inner">
                    <img
                      src={bannerSlides[activePhotoIdx].img}
                      alt={bannerSlides[activePhotoIdx].title}
                      className="w-full h-full object-cover transition-all duration-700 transform group-hover:scale-105"
                    />

                    {/* Overlay Tag & Price */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-4">
                      <span className="text-[10px] uppercase font-bold text-amber-300 tracking-wider">
                        {bannerSlides[activePhotoIdx].tag}
                      </span>
                      <div className="flex items-center justify-between mt-0.5">
                        <h4 className="text-lg font-black text-white">{bannerSlides[activePhotoIdx].title}</h4>
                        <span className="text-xl font-black text-amber-400 font-mono">
                          {bannerSlides[activePhotoIdx].rate}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Slide Indicators */}
                  <div className="flex items-center justify-center gap-1.5">
                    {bannerSlides.map((_, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setActivePhotoIdx(i)}
                        className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                          activePhotoIdx === i ? 'w-6 bg-amber-400' : 'w-2 bg-slate-700'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 2: Short Advertisement Video / Reel Space */}
              {activeMediaTab === 'video' && (
                <div className="space-y-3">
                  <div className="relative h-64 sm:h-72 w-full rounded-2xl overflow-hidden bg-black border border-[#243B2D] flex items-center justify-center">
                    {/* Embedded Responsive Clean Player */}
                    <iframe
                      className="w-full h-full rounded-2xl"
                      src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=0&controls=1&rel=0"
                      title="Bring My Bite Kitchen Promo Video"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  </div>
                  <p className="text-[11px] text-center text-slate-400">
                    🎬 Fresh preparation in our Greater Noida kitchen.
                  </p>
                </div>
              )}

              {/* Bottom Quick Order Strip */}
              <div className="mt-4 pt-3 border-t border-[#243B2D] flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Fastest Dispatch</div>
                  <div className="text-xs font-bold text-emerald-300">Greater Noida (30 Mins)</div>
                </div>
                <button
                  type="button"
                  onClick={() => openInstantOrder()}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow transition cursor-pointer"
                >
                  Order This Box ➔
                </button>
              </div>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
