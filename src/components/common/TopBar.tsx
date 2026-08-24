import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { getSiteConfig, SiteConfig, formatIndianWhatsAppNumber } from '../../utils/siteConfigStore';
import { TrackOrderModal } from '../customer/TrackOrderModal';

export const TopBar: React.FC = () => {
  const { openInstantOrder, openRegistration } = useApp();
  const [config, setConfig] = useState<SiteConfig>(getSiteConfig());
  const [isTrackOpen, setIsTrackOpen] = useState(false);

  useEffect(() => {
    const handleUpdate = () => setConfig(getSiteConfig());
    window.addEventListener('bmb_config_updated', handleUpdate);
    return () => window.removeEventListener('bmb_config_updated', handleUpdate);
  }, []);

  const cleanWa = formatIndianWhatsAppNumber(config.whatsappNumber);

  return (
    <>
      <div className="bg-[#0C3822] text-emerald-100 text-[11px] py-2 px-4 font-medium border-b border-[#184F33] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-amber-400">📍</span>
            <span className="font-semibold text-emerald-200">Operating in:</span>
            <span>Greater Noida & Noida (College Hostels, PG Flats & Corporate Offices)</span>
          </div>

          <div className="flex items-center gap-4">
            <a
              href={`tel:${config.phone.replace(/[^0-9+]/g, '')}`}
              className="hover:text-white font-mono font-bold flex items-center gap-1.5 transition text-amber-300"
            >
              <span>📞</span> {config.phone}
            </a>

            <a
              href={`https://wa.me/${cleanWa}?text=Hello%20Bring%20My%20Bite%20Team,%20I%20want%20to%20order%20meals.`}
              target="_blank"
              rel="noreferrer"
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1 rounded-full font-bold flex items-center gap-1 transition shadow-sm"
            >
              <span>💬</span> WhatsApp
            </a>
          </div>
        </div>
      </div>

      <header className="bg-[#FAF7F2] border-b border-slate-200 shadow-sm sticky top-[37px] z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
          <a href="#" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-2xl bg-[#0C3822] text-amber-400 flex items-center justify-center text-2xl font-black shadow-md group-hover:scale-105 transition">
              🍱
            </div>
            <div>
              <div className="text-lg sm:text-xl font-black tracking-tight text-[#1A261E] leading-none">
                BRING MY BITE
              </div>
              <div className="text-[10px] text-emerald-800 font-bold uppercase tracking-wider mt-0.5 flex items-center gap-1">
                <span>By</span>
                <span className="text-amber-700 font-black">Shree Foods</span>
                <span className="text-slate-400 font-normal">| Homely Tiffin</span>
              </div>
            </div>
          </a>

          <nav className="hidden lg:flex items-center gap-6 text-xs font-bold text-slate-700">
            <a href="#" className="text-emerald-800 hover:text-emerald-950 font-black">Home</a>
            <a href="#todays-menu" className="hover:text-emerald-800 transition">Today's Menu</a>
            <a href="#packages" className="hover:text-emerald-800 transition">Monthly Packages</a>
            <a href="#audience-focus" className="hover:text-emerald-800 transition">Why Us (No Dishes)</a>
            <a href="#cost-roi" className="hover:text-emerald-800 transition">Cook vs BMB ROI</a>
            <button
              type="button"
              onClick={() => setIsTrackOpen(true)}
              className="hover:text-emerald-800 transition font-bold flex items-center gap-1 cursor-pointer"
            >
              <span>🔍</span> Track Order
            </button>
          </nav>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setIsTrackOpen(true)}
              className="lg:hidden px-2.5 py-1.5 text-slate-700 hover:text-emerald-800 font-bold text-xs border border-slate-300 rounded-xl"
            >
              🔍 Track
            </button>

            <button
              type="button"
              onClick={() => openInstantOrder()}
              className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:brightness-110 text-slate-950 font-black text-xs rounded-xl shadow-md transition flex items-center gap-1.5 cursor-pointer"
            >
              <span>⚡</span>
              <span>Order Thali</span>
            </button>

            <button
              type="button"
              onClick={() => openRegistration()}
              className="hidden sm:flex px-4 py-2.5 bg-[#0C3822] hover:bg-[#124E33] text-white font-black text-xs rounded-xl shadow-md transition items-center gap-1.5 cursor-pointer"
            >
              <span>📅</span>
              <span>Monthly Subscription</span>
            </button>
          </div>
        </div>
      </header>

      <TrackOrderModal isOpen={isTrackOpen} onClose={() => setIsTrackOpen(false)} />
    </>
  );
};
