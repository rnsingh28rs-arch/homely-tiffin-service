import React, { useState, useEffect } from 'react';
import { getSiteConfig } from '../../utils/siteConfigStore';

export const Footer: React.FC = () => {
  const [config, setConfig] = useState(getSiteConfig());

  useEffect(() => {
    const handleUpdate = () => setConfig(getSiteConfig());
    window.addEventListener('bmb_config_updated', handleUpdate);
    return () => window.removeEventListener('bmb_config_updated', handleUpdate);
  }, []);

  const cleanWa = config.whatsappNumber.replace(/[^0-9]/g, '');
  const cleanPhone = config.phone.replace(/[^0-9+]/g, '');

  return (
    <footer className="bg-[#111A14] text-[#FAF7F2] border-t border-[#243B2D] mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="space-y-3 md:col-span-1">
            <h3 className="text-xl font-black text-white flex items-center gap-2">
              <span className="text-[#F59E0B]">🍱</span> {config.brandName}
            </h3>
            <p className="text-xs text-emerald-200/70 leading-relaxed">
              {config.heroTagline}
            </p>
            <div className="pt-2">
              <span className="text-[11px] text-amber-300 font-bold block">
                🛡️ FSSAI Lic: {config.fssaiNumber}
              </span>
              <span className="text-[11px] text-emerald-300/80 font-mono block">
                📑 GSTIN: {config.gstNumber}
              </span>
            </div>
          </div>

          {/* Quick Contact */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-300">Contact & Orders</h4>
            <ul className="space-y-2 text-xs text-emerald-200/80">
              <li>
                <a href={`tel:${cleanPhone}`} className="hover:text-white transition flex items-center gap-1.5">
                  <span>📞</span> {config.phone}
                </a>
              </li>
              <li>
                <a
                  href={`https://wa.me/${cleanWa}`}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-emerald-300 transition flex items-center gap-1.5"
                >
                  <span>💬</span> WhatsApp: +{cleanWa}
                </a>
              </li>
              <li>
                <a href={`mailto:${config.email}`} className="hover:text-white transition flex items-center gap-1.5">
                  <span>✉️</span> {config.email}
                </a>
              </li>
            </ul>
          </div>

          {/* Delivery Gate Locations */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-300">Delivery Areas</h4>
            <p className="text-xs text-emerald-200/70 leading-relaxed">
              {config.deliveryLocations}
            </p>
            <div className="text-[11px] text-emerald-300/60 pt-1">
              <p>🍱 Lunch: {config.deliverySlots.lunchTime}</p>
              <p>🌙 Dinner: {config.deliverySlots.dinnerTime}</p>
            </div>
          </div>

          {/* Legal / Payment */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-300">Official Kitchen</h4>
            <p className="text-xs text-emerald-200/70 leading-relaxed">
              {config.kitchenAddress}
            </p>
            <p className="text-[11px] text-emerald-300/60 font-mono">
              Accepted UPI: {config.upiId}
            </p>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-[#1F3326] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-emerald-300/50">
          <p>© {new Date().getFullYear()} {config.legalEntityName}. All rights reserved.</p>
          <div className="flex gap-4">
            <a href="#superadmin" className="hover:text-amber-300 transition text-[11px]">
              🔒 Super Admin
            </a>
            <a href="#admin" className="hover:text-amber-300 transition text-[11px]">
              💼 Staff Login
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
