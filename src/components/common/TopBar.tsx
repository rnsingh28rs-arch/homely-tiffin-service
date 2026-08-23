import React, { useState, useEffect } from 'react';
import { getSiteConfig } from '../../utils/siteConfigStore';

export const TopBar: React.FC = () => {
  const [config, setConfig] = useState(getSiteConfig());

  useEffect(() => {
    const handleUpdate = () => setConfig(getSiteConfig());
    window.addEventListener('bmb_config_updated', handleUpdate);
    return () => window.removeEventListener('bmb_config_updated', handleUpdate);
  }, []);

  const cleanWa = config.whatsappNumber.replace(/[^0-9]/g, '');
  const cleanPhone = config.phone.replace(/[^0-9+]/g, '');

  return (
    <div className="bg-[#15231B] text-[#FAF7F2] text-xs py-2 px-4 border-b border-[#243B2D]">
      <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-2">
        <div className="flex items-center gap-2">
          <span className="text-[#F59E0B]">📍</span>
          <span className="text-emerald-200/90 truncate max-w-[280px] sm:max-w-md">
            Serving: {config.deliveryLocations}
          </span>
        </div>

        <div className="flex items-center gap-4">
          <a
            href={`tel:${cleanPhone}`}
            className="hover:text-[#F59E0B] transition flex items-center gap-1 text-emerald-100"
          >
            <span>📞</span> {config.phone}
          </a>
          <a
            href={`https://wa.me/${cleanWa}?text=Hello%20Bring%20My%20Bite,%20I%20want%20to%20know%20more%20about%20meal%20plans.`}
            target="_blank"
            rel="noreferrer"
            className="bg-emerald-600 hover:bg-emerald-500 text-white px-2.5 py-0.5 rounded-full transition flex items-center gap-1 font-bold text-[11px]"
          >
            <span>💬</span> WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
};
