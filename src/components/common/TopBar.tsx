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
      {/* Topmost Info Strip */}
      <div className="bg-[#0C3822] text-emerald-100 text-[11px] py-1.5 px-4 font-medium border-b border-[#184F33]">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-amber-400">📍</span>
            <span>Serving: {config.deliveryLocations || 'Galgotias (Gate 1 & 2), Sharda, Bennett & Knowledge Park Hostels'}</span>
          </div>

          <div className="flex items-center gap-4">
            <a href={`tel:${config.phone.replace(/[^0-9+]/g, '')}`} className="hover:text-white font-mono flex items-center gap-1">
              <span>📞</span> {config.phone}
            </a>
            <a
              href={`https://wa.me/${cleanWa}?text=Hello%20Bring%20My%20Bite,%20I%20want%20to%20order%20meals.`}
              target="_blank"
              rel="noreferrer"
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1 transition"
            >
              <span>💬</span> WhatsApp
            </a>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <header className="bg-[#FAF7F2] border-b border-slate-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
          
          {/* Logo */}
          <a href="#" className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#0C3822] text-amber-400 flex items-center justify-center text-xl font-bold shadow-md">
              🍱
            </div>
            <div>
              <div className="text-lg font-black tracking-tight text-[#1A261E] leading-none">
                BRING MY BITE
              </div>
              <div className="text-[10px] text-emerald-800 font-bold uppercase tracking-wider mt-0.5">
                Homely Tiffin Service
              </div>
            </div>
          </a>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-bold text-slate-700">
            <a href="#" className="text-emerald-800 hover:text-emerald-950 font-black">Home</a>
            <a href="#daily-menu" className="hover:text-emerald-800 transition">Daily Menu</a>
            <a href="#monthly-plans" className="hover:text-emerald-800 transition">Monthly Plans</a>
            <button
              type="button"
              onClick={() => setIsTrackOpen(true)}
              className="hover:text-emerald-800 transition font-bold flex items-center gap-1 cursor-pointer"
            >
              <span>🔍</span> Track Order
            </button>
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setIsTrackOpen(true)}
              className="md:hidden p-2 text-slate-700 hover:text-emerald-800 font-bold text-xs"
              title="Track Order"
            >
              🔍 Track
            </button>

            <button
              type="button"
              onClick={() => openInstantOrder()}
              className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:brightness-110 text-slate-950 font-black text-xs rounded-xl shadow-md transition flex items-center gap-1.5 cursor-pointer"
            >
              <span>⚡</span>
              <span>Instant Thali</span>
            </button>

            <button
              type="button"
              onClick={() => openRegistration()}
              className="hidden sm:flex px-4 py-2 bg-[#0C3822] hover:bg-[#124E33] text-white font-black text-xs rounded-xl shadow-md transition items-center gap-1.5 cursor-pointer"
            >
              <span>📅</span>
              <span>Subscribe Now</span>
            </button>
          </div>
        </div>
      </header>

      {/* Global Track Order Modal */}
      <TrackOrderModal isOpen={isTrackOpen} onClose={() => setIsTrackOpen(false)} />
    </>
  );
};
