import React, { useState, useEffect } from 'react';
import { getStoredOrders, OrderItem } from '../../utils/orderStore';
import { TrackOrderModal } from './TrackOrderModal';

export const LiveActiveOrderBar: React.FC = () => {
  const [latestOrder, setLatestOrder] = useState<OrderItem | null>(null);
  const [isTrackModalOpen, setIsTrackModalOpen] = useState(false);

  const checkLatestActiveOrder = () => {
    const orders = getStoredOrders();
    // Look for today's active order (pending, approved, or out_for_delivery)
    const active = orders.find(
      (o) => o.status === 'pending' || o.status === 'approved' || o.status === 'out_for_delivery'
    );
    setLatestOrder(active || null);
  };

  useEffect(() => {
    checkLatestActiveOrder();
    window.addEventListener('bmb_orders_updated', checkLatestActiveOrder);
    return () => window.removeEventListener('bmb_orders_updated', checkLatestActiveOrder);
  }, []);

  if (!latestOrder) return null;

  return (
    <>
      <div className="bg-gradient-to-r from-[#18291F] via-[#1E3628] to-[#18291F] border-b border-amber-500/30 text-white px-4 py-2.5 sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2 text-xs">
          
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
            <span className="font-bold text-amber-300">Live Order Active:</span>
            <span className="font-mono text-white font-bold">{latestOrder.id}</span>
            <span className="text-slate-300 hidden sm:inline">•</span>
            <span className="text-emerald-200 truncate max-w-[200px] sm:max-w-xs">{latestOrder.mealPlan}</span>
          </div>

          <div className="flex items-center gap-3">
            <span
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                latestOrder.status === 'pending'
                  ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/40'
                  : latestOrder.status === 'approved'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
              }`}
            >
              {latestOrder.status === 'pending' && '🟡 Checking UTR'}
              {latestOrder.status === 'approved' && `🟢 Cooking (ETA: ${latestOrder.estimatedTime || '30 Mins'})`}
              {latestOrder.status === 'out_for_delivery' && '🚚 Out for Delivery'}
            </span>

            <button
              type="button"
              onClick={() => setIsTrackModalOpen(true)}
              className="px-3 py-1 bg-amber-500 text-slate-950 font-black text-[11px] rounded-xl hover:brightness-110 transition shadow cursor-pointer"
            >
              View Status ↗
            </button>
          </div>

        </div>
      </div>

      <TrackOrderModal isOpen={isTrackModalOpen} onClose={() => setIsTrackModalOpen(false)} />
    </>
  );
};
