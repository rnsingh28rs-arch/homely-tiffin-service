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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-xl bg-[#15231B] border border-[#2B4534] rounded-3xl p-6 sm:p-8 text-[#FAF7F2] shadow-2xl my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 w-10 h-10 rounded-full bg-[#0F1A13] border border-[#243B2D] text-slate-400 hover:text-white flex items-center justify-center transition cursor-pointer"
        >
          ✕
        </button>

        <div className="text-center mb-6 pr-6">
          <span className="px-3 py-1 bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold rounded-full uppercase">
            🔍 Zero-Login Live Tracking
          </span>
          <h2 className="text-2xl font-black text-white mt-2">Track Your Meal Delivery</h2>
          <p className="text-emerald-300/60 text-xs mt-1">Enter your 10-digit Mobile Number or Order ID</p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="flex gap-2 mb-6">
          <input
            type="text"
            placeholder="e.g. 9004848984 or BMB-123456"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="flex-1 bg-[#0F1A13] border border-[#243B2D] focus:border-amber-500 rounded-2xl px-4 py-3 text-sm text-white outline-none"
            autoFocus
          />
          <button
            type="submit"
            className="px-6 py-3 bg-gradient-to-r from-[#D97706] to-[#F59E0B] text-slate-950 font-black rounded-2xl shadow-lg hover:brightness-110 transition text-sm cursor-pointer"
          >
            Track ➔
          </button>
        </form>

        {/* Search Results */}
        {hasSearched && (
          <div className="space-y-5 max-h-[55vh] overflow-y-auto pr-1 scrollbar-none">
            {matchedOrders && matchedOrders.length > 0 ? (
              matchedOrders.map((ord) => {
                const isPending = ord.status === 'pending';
                const isApproved = ord.status === 'approved' || ord.status === 'out_for_delivery' || ord.status === 'delivered';
                const isOut = ord.status === 'out_for_delivery' || ord.status === 'delivered';
                const isDelivered = ord.status === 'delivered';
                const isDeclined = ord.status === 'rejected';

                return (
                  <div key={ord.id} className="bg-[#0F1A13] border border-[#243B2D] rounded-2xl p-5 space-y-4 shadow-lg">
                    
                    {/* Header */}
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#1E3325] pb-3">
                      <div>
                        <span className="text-xs text-slate-400">Order ID:</span>
                        <span className="ml-1.5 font-mono font-bold text-amber-400 text-sm">{ord.id}</span>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">{ord.formattedTimestamp}</div>
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
                        {ord.status === 'approved' && '🟢 Cooking in Kitchen 🍳'}
                        {ord.status === 'out_for_delivery' && '🚚 Out for Delivery'}
                        {ord.status === 'delivered' && '✅ Delivered'}
                        {ord.status === 'rejected' && '🔴 Payment Declined'}
                      </span>
                    </div>

                    {/* 5-Step Visual Progress Bar */}
                    {!isDeclined ? (
                      <div className="py-2">
                        <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 mb-2">
                          <span className={isPending ? 'text-amber-400' : 'text-emerald-400'}>1. UTR Check</span>
                          <span className={isApproved ? 'text-emerald-400 font-black' : ''}>2. Kitchen Cooking</span>
                          <span className={isOut ? 'text-sky-400 font-black' : ''}>3. On the Way</span>
                          <span className={isDelivered ? 'text-emerald-400 font-black' : ''}>4. Delivered</span>
                        </div>
                        <div className="w-full bg-[#18271E] h-2 rounded-full overflow-hidden flex">
                          <div className={`h-full ${isPending ? 'w-1/4 bg-amber-400 animate-pulse' : 'w-1/4 bg-emerald-500'}`}></div>
                          <div className={`h-full ${isApproved ? (isOut ? 'w-1/2 bg-emerald-500' : 'w-1/2 bg-emerald-400 animate-pulse') : 'w-0'}`}></div>
                          <div className={`h-full ${isDelivered ? 'w-1/4 bg-emerald-500' : 'w-0'}`}></div>
                        </div>
                      </div>
                    ) : (
                      <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300 space-y-1">
                        <div className="font-bold">⚠️ Payment Verification Declined:</div>
                        <p className="text-[11px] text-slate-300">{ord.rejectionReason || 'UTR did not match banking statements'}</p>
                      </div>
                    )}

                    {/* Order Details */}
                    <div className="text-xs space-y-1.5 text-slate-300 bg-[#15231B] p-3 rounded-xl border border-[#1E3325]">
                      <div className="flex justify-between">
                        <span>Customer:</span>
                        <span className="font-bold text-white">{ord.customerName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Meal Plan:</span>
                        <span className="font-bold text-amber-300">{ord.mealPlan}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Delivery Zone:</span>
                        <span className="font-bold text-white">{ord.city || 'Greater Noida'} (ETA: {ord.estimatedTime || '30 Mins'})</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Gate Address:</span>
                        <span className="font-medium text-white truncate max-w-[220px]">{ord.address}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Paid:</span>
                        <span className="font-black text-amber-400">₹{ord.amount} (UTR: {ord.utrNumber})</span>
                      </div>
                    </div>

                    <a
                      href={`https://wa.me/${cleanWa}?text=Hello%20Bring%20My%20Bite,%20I%20am%20tracking%20Order%20${ord.id}`}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full py-2.5 bg-[#18271E] hover:bg-[#22382B] text-emerald-300 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 border border-[#2B4534] transition cursor-pointer"
                    >
                      <span>💬</span> WhatsApp Kitchen Support
                    </a>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8 bg-[#0F1A13] border border-[#243B2D] rounded-2xl text-slate-400 text-xs">
                ❌ No active bookings found for this Mobile Number or Order ID.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
