import React, { useState, useEffect } from 'react';
import { getSiteConfig } from '../../utils/siteConfigStore';

export const ChatBox: React.FC = () => {
  const [config, setConfig] = useState(getSiteConfig());

  useEffect(() => {
    const handleUpdate = () => setConfig(getSiteConfig());
    window.addEventListener('bmb_config_updated', handleUpdate);
    return () => window.removeEventListener('bmb_config_updated', handleUpdate);
  }, []);

  const cleanWa = config.whatsappNumber.replace(/[^0-9]/g, '');

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
      <a
        href={`https://wa.me/${cleanWa}?text=Hello%20Bring%20My%20Bite!%20I%20want%20to%20order%20meals.`}
        target="_blank"
        rel="noreferrer"
        className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-3 rounded-full shadow-2xl flex items-center gap-2.5 transition-all hover:scale-105 border-2 border-emerald-400"
        title="Chat on WhatsApp"
      >
        <span className="text-xl">💬</span>
        <span className="text-xs font-black tracking-wide pr-1">WhatsApp Order</span>
      </a>
    </div>
  );
};
