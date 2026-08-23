import React, { useState } from 'react';
import { getStoredOrders, OrderItem } from '../../utils/orderStore';
import { getSiteConfig } from '../../utils/siteConfigStore';

interface TrackOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TrackOrderModal: React.FC<TrackOrderModalProps> = ({ isOpen, onClose }) => {
  const [searchInput, setSearchInput] = useState('');
  const [matchedOrders, setMatchedOrders] = useState<OrderItem[] | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const config = getSiteConfig();

  if (!isOpen) return null;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchInput.trim().toLowerCase();
    if (!query) return;

    const all = getStoredOrders();
    const cleanQueryPhone = query.replace(/[^0-9]/g, '');

    const found = all.filter((ord) => {
      const cleanOrdPhone = ord.phone.replace(/[^0-9]/g, '');
      return (
        ord.id.toLowerCase().includes(query) ||
        (cleanQueryPhone && cleanOrdPhone.includes(cleanQueryPhone))
      );
    });

    setMatchedOrders(found);
    setHasSearched(true);
  };

  const cleanWa = config.whatsappNumber.replace(/[^0-9]/g, '');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-xl bg-[#15231B] border border-[#2B4534] rounded-3xl p-6 sm:p-8 text-[#FAF7F2] shadow-2xl my-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-9 h-9 rounded-full bg-[#0F1A13] border border-[#243B2D] text-slate-400 hover:text-white flex items-center justify-center transition"
        >
          ✕
        </button>

        <div className="text-center mb-6">
          <span className="px-3 py-1 bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold rounded-full">
            🔍 Live Order Status
          </span>
          <h2 className="text-2xl font-black text-white mt-2">अपना टिफिन ऑर्डर ट्रैक करें</h2>
          <p className="text-emerald-300/60 text-xs mt-1">अपना मोबाइल नंबर या Order ID डालकर स्थिति जानें</p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="flex gap-2 mb-6">
          <input
            type="text"
            placeholder="उदा. 9004848984 या BMB-123456"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="flex-1 bg-[#0F1A13] border border-[#243B2D] focus:border-amber-500 rounded-2xl px-4 py-3 text-sm text-white outline-none"
            autoFocus
          />
          <button
            type="submit"
            className="px-6 py-3 bg-gradient-to-r from-[#D97706] to-[#F59E0B] text-[#111A14] font-black rounded-2xl shadow-lg hover:brightness-110 transition text-sm"
          >
            Track ➔
          </button>
        </form>

        {/* Search Results */}
        {hasSearched && (
          <div className="space-y-4 max-h-[55vh] overflow-y-auto pr-1">
            {matchedOrders && matchedOrders.length > 0 ? (
              matchedOrders.map((ord) => (
                <div key={ord.id} className="bg-[#0F1A13] border border-[#243B2D] rounded-2xl p-5 space-y-3">
                  <div className="flex items-center justify-between border-b border-[#1E3325] pb-2.5">
                    <div>
                      <span className="text-xs text-slate-400">Order ID:</span>
                      <span className="ml-1.5 font-mono font-bold text-amber-400 text-sm">{ord.id}</span>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-[11px] font-black uppercase ${
                        ord.status === 'pending'
                          ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/40'
                          : ord.status === 'approved'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : ord.status === 'out_for_delivery'
                          ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                          : ord.status === 'delivered'
                          ? 'bg-emerald-600 text-white'
                          : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                      }`}
                    >
                      {ord.status === 'pending' && '🟡 Verification Pending'}
                      {ord.status === 'approved' && '🟢 Approved & Cooking 🍳'}
                      {ord.status === 'out_for_delivery' && '🚚 Out for Delivery'}
                      {ord.status === 'delivered' && '✅ Delivered'}
                      {ord.status === 'rejected' && '🔴 Payment Declined'}
                    </span>
                  </div>

                  <div className="text-xs space-y-1.5 text-slate-300">
                    <div className="flex justify-between">
                      <span>कस्टमर:</span>
                      <span className="font-bold text-white">{ord.customerName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>मील थाली:</span>
                      <span className="font-bold text-amber-300">{ord.mealPlan}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>शहर / लोकेशन:</span>
                      <span className="font-bold text-white">{ord.city || 'Greater Noida'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>अनुमानित समय (ETA):</span>
                      <span className="font-bold text-emerald-300">{ord.estimatedTime || '30 Mins'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>कुल राशि:</span>
                      <span className="font-bold text-amber-400">₹{ord.amount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>UTR Number:</span>
                      <span className="font-mono text-white">{ord.utrNumber}</span>
                    </div>
                  </div>

                  {ord.status === 'approved' && (
                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-200">
                      🎉 आपका पेमेंट स्वीकृत हो गया है! किचन में ताज़ा खाना तैयार हो रहा है और{' '}
                      <strong>{ord.estimatedTime || '30 मिनट'}</strong> में आपके गेट पर पहुँचेगा।
                    </div>
                  )}

                  {ord.status === 'rejected' && (
                    <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-200">
                      ⚠️ <strong>कारण:</strong> {ord.rejectionReason || 'UTR Match Nahi Hua'}. कृपया नीचे WhatsApp पर पेमेंट स्क्रीनशॉट भेजें।
                    </div>
                  )}

                  <a
                    href={`https://wa.me/${cleanWa}?text=Hello%20Bring%20My%20Bite,%20Main%20apna%20Order%20status%20check%20kar%20raha%20hoon.%20Order%20ID:%20${ord.id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-2 bg-[#18271E] hover:bg-[#22382B] text-emerald-300 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 border border-[#2B4534] transition"
                  >
                    <span>💬</span> WhatsApp Support Se Baat Karein
                  </a>
                </div>
              ))
            ) : (
              <div className="text-center py-8 bg-[#0F1A13] border border-[#243B2D] rounded-2xl text-slate-400 text-xs">
                ❌ इस नंबर या Order ID से कोई बुकिंग नहीं मिली।
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
