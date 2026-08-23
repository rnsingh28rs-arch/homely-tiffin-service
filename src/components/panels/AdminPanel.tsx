import React, { useState, useEffect } from 'react';
import { getSiteConfig } from '../../utils/siteConfigStore';
import { getStoredOrders, updateOrderStatus, OrderItem, OrderStatus } from '../../utils/orderStore';

export const AdminPanel: React.FC = () => {
  const [config] = useState(getSiteConfig());
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [pinInput, setPinInput] = useState<string>('');
  const [pinError, setPinError] = useState<string>('');
  
  const [orders, setOrders] = useState<OrderItem[]>(getStoredOrders());
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'out_for_delivery' | 'rejected'>('all');
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string>('');

  const refreshOrders = () => {
    setOrders(getStoredOrders());
  };

  useEffect(() => {
    refreshOrders();
    window.addEventListener('bmb_orders_updated', refreshOrders);
    return () => window.removeEventListener('bmb_orders_updated', refreshOrders);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === config.adminPin || pinInput === config.superAdminPin || pinInput === '6655') {
      setIsAuthenticated(true);
      setPinError('');
    } else {
      setPinError('Invalid Admin PIN! Enter 6655.');
    }
  };

  const handleStatusChange = (orderId: string, status: OrderStatus, reason?: string) => {
    updateOrderStatus(orderId, status, reason);
    setActionMessage(`Order ${orderId} marked as ${status.toUpperCase()}!`);
    setTimeout(() => setActionMessage(''), 3500);
  };

  const handleReject = (orderId: string) => {
    const reason = window.prompt('Enter reason for declining order:', 'Payment UTR verification failed');
    if (reason !== null) {
      handleStatusChange(orderId, 'rejected', reason || 'Payment unverified');
    }
  };

  const filteredOrders = orders.filter((o) => (filterStatus === 'all' ? true : o.status === filterStatus));
  const pendingCount = orders.filter((o) => o.status === 'pending').length;

  if (!isAuthenticated) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-[#15231B] border border-[#243B2D] rounded-3xl p-8 shadow-2xl text-center">
          <div className="w-14 h-14 bg-amber-500/20 text-amber-400 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl font-bold border border-amber-500/30">
            💼
          </div>
          <h2 className="text-2xl font-black text-white">Staff & Admin Login</h2>
          <p className="text-emerald-300/60 text-xs mt-1">Enter Master PIN to access Orders Desk</p>

          <form onSubmit={handleLogin} className="mt-6 space-y-4">
            <input
              type="password"
              maxLength={8}
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value)}
              placeholder="••••"
              className="w-full px-4 py-3.5 bg-[#0F1A13] border border-[#243B2D] focus:border-amber-500 rounded-2xl text-white text-center text-2xl tracking-[0.4em] outline-none"
              autoFocus
            />
            {pinError && <p className="text-rose-400 text-xs font-bold">{pinError}</p>}
            <button
              type="submit"
              className="w-full py-3.5 bg-gradient-to-r from-[#D97706] to-[#F59E0B] text-[#111A14] font-black rounded-2xl shadow-lg hover:brightness-110 transition"
            >
              Unlock Admin Portal
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Top Header */}
      <div className="bg-[#15231B] border border-[#243B2D] rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black text-white">📦 Orders Received & Approval Desk</h1>
            {pendingCount > 0 && (
              <span className="px-3 py-1 bg-rose-500 text-white font-black text-xs rounded-full animate-pulse shadow-lg">
                🔴 {pendingCount} Pending Verification
              </span>
            )}
          </div>
          <p className="text-emerald-300/60 text-xs mt-1">
            Verify customer UTR & payment slips, approve orders, and send 1-click WhatsApp bills
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={refreshOrders}
            className="px-4 py-2.5 bg-[#0F1A13] hover:bg-[#203326] text-emerald-200 text-xs font-bold rounded-xl border border-[#243B2D] transition"
          >
            🔄 Refresh
          </button>
          <button
            type="button"
            onClick={() => setIsAuthenticated(false)}
            className="px-4 py-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs font-bold rounded-xl border border-rose-500/30 transition"
          >
            Lock Admin
          </button>
        </div>
      </div>

      {actionMessage && (
        <div className="mb-6 p-4 bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 rounded-2xl text-xs font-bold flex items-center gap-2">
          <span>⚡</span>
          <span>{actionMessage}</span>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-4 mb-2 scrollbar-none">
        {[
          { id: 'all', label: `All Orders (${orders.length})` },
          { id: 'pending', label: `🟡 Pending (${pendingCount})` },
          { id: 'approved', label: `🟢 Approved (${orders.filter((o) => o.status === 'approved').length})` },
          { id: 'out_for_delivery', label: `🚚 Out for Delivery (${orders.filter((o) => o.status === 'out_for_delivery').length})` },
          { id: 'rejected', label: `🔴 Declined (${orders.filter((o) => o.status === 'rejected').length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setFilterStatus(tab.id as any)}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
              filterStatus === tab.id
                ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                : 'bg-[#15231B] text-slate-300 border border-[#243B2D]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="bg-[#15231B] border border-[#243B2D] rounded-3xl p-12 text-center text-slate-400">
          <p className="text-3xl mb-2">📭</p>
          <p className="text-sm font-bold text-white">No Orders Found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredOrders.map((order) => {
            const cleanPhone = order.phone.replace(/[^0-9]/g, '');

            // 1-Click WhatsApp Messages
            const approveWaMsg = `🎉 *Bring My Bite - Order Confirmed!* %0A%0A*Order ID:* ${order.id}%0A*Customer:* ${order.customerName}%0A*Meal:* ${order.mealPlan}%0A*Area:* ${order.city || 'Greater Noida'} (${order.estimatedTime || '30 Mins'})%0A*Address:* ${order.address}%0A*Total Bill:* ₹${order.amount} (UTR Verified ✅)%0A%0A🍱 *Your meal is being prepared fresh and will be delivered to your gate shortly!*`;

            const rejectWaMsg = `⚠️ *Bring My Bite - Order Alert* %0A%0A*Order ID:* ${order.id}%0A*Status:* Payment Unverified / Declined%0A*Reason:* ${order.rejectionReason || 'UTR number could not be verified'}%0A%0APlease reply to this WhatsApp message with your payment screenshot.`;

            return (
              <div
                key={order.id}
                className={`bg-[#15231B] border rounded-3xl p-6 transition shadow-lg ${
                  order.status === 'pending'
                    ? 'border-amber-500/50 bg-[#18291f]'
                    : order.status === 'approved'
                    ? 'border-emerald-500/30'
                    : order.status === 'out_for_delivery'
                    ? 'border-sky-500/30'
                    : 'border-rose-500/30 opacity-80'
                }`}
              >
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                  {/* Order Details */}
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono font-black text-amber-400 text-sm">{order.id}</span>
                      <span className="px-2 py-0.5 bg-[#0F1A13] border border-amber-500/30 text-amber-300 rounded-full text-[10px] font-bold">
                        📍 {order.city || 'Greater Noida'} • ⚡ {order.estimatedTime || '30 Mins'}
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          order.status === 'pending'
                            ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/40'
                            : order.status === 'approved'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : order.status === 'out_for_delivery'
                            ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                            : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                        }`}
                      >
                        {order.status === 'pending' && '🟡 Pending'}
                        {order.status === 'approved' && '🟢 Approved'}
                        {order.status === 'out_for_delivery' && '🚚 Out for Delivery'}
                        {order.status === 'rejected' && '🔴 Declined'}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <div className="text-base font-black text-white">
                      {order.customerName}{' '}
                      <span className="text-xs font-normal text-emerald-300/80 font-mono">({order.phone})</span>
                    </div>

                    <div className="text-xs text-slate-300">
                      📍 <span className="text-white font-medium">{order.address}</span> • 🍱{' '}
                      <span className="text-amber-300 font-bold">{order.mealPlan}</span>
                    </div>

                    {order.rejectionReason && (
                      <div className="text-xs text-rose-300 font-bold pt-1">
                        Decline Reason: {order.rejectionReason}
                      </div>
                    )}
                  </div>

                  {/* Payment Verification Box */}
                  <div className="bg-[#0F1A13] border border-[#243B2D] p-3.5 rounded-2xl flex items-center gap-4 min-w-[280px]">
                    <div className="space-y-0.5 flex-1">
                      <div className="text-[10px] text-slate-400 uppercase font-bold">UTR / UPI Ref</div>
                      <div className="text-xs font-mono font-bold text-amber-300 select-all">{order.utrNumber}</div>
                      <div className="text-sm font-black text-white pt-1">
                        ₹{order.amount}{' '}
                        {order.deliveryCharge > 0 && (
                          <span className="text-[10px] text-amber-300 font-normal">(Incl. ₹{order.deliveryCharge} Noida)</span>
                        )}
                      </div>
                    </div>

                    {order.paymentSlip ? (
                      <button
                        type="button"
                        onClick={() => setPreviewImage(order.paymentSlip)}
                        className="group relative w-14 h-14 rounded-xl overflow-hidden border border-emerald-500/40 hover:scale-105 transition"
                        title="Zoom Screenshot"
                      >
                        <img src={order.paymentSlip} alt="Slip" className="w-full h-full object-cover" />
                        <span className="absolute inset-0 bg-black/40 flex items-center justify-center text-[10px] text-white font-bold opacity-0 group-hover:opacity-100 transition">
                          🔍 Zoom
                        </span>
                      </button>
                    ) : (
                      <span className="text-[10px] text-slate-500 italic">No Slip</span>
                    )}
                  </div>

                  {/* Actions & WhatsApp 1-Click Notifications */}
                  <div className="flex flex-wrap items-center gap-2">
                    {order.status === 'pending' && (
                      <>
                        <button
                          type="button"
                          onClick={() => handleStatusChange(order.id, 'approved')}
                          className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl shadow-lg transition"
                        >
                          ✅ Approve
                        </button>
                        <button
                          type="button"
                          onClick={() => handleReject(order.id)}
                          className="px-3 py-2 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 font-bold text-xs rounded-xl border border-rose-500/40 transition"
                        >
                          ❌ Reject
                        </button>
                      </>
                    )}

                    {order.status === 'approved' && (
                      <button
                        type="button"
                        onClick={() => handleStatusChange(order.id, 'out_for_delivery')}
                        className="px-3 py-2 bg-sky-600 hover:bg-sky-500 text-white font-black text-xs rounded-xl transition"
                      >
                        🚚 Dispatch / Out
                      </button>
                    )}

                    {/* WhatsApp 1-Click Bill/Notice Link */}
                    <a
                      href={`https://wa.me/${cleanPhone}?text=${
                        order.status === 'rejected' ? rejectWaMsg : approveWaMsg
                      }`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-2 bg-[#203326] hover:bg-[#2c4734] text-emerald-200 text-xs font-bold rounded-xl border border-emerald-500/30 transition flex items-center gap-1.5"
                    >
                      <span>💬</span>
                      <span>{order.status === 'rejected' ? 'Send Decline Alert' : 'Send WhatsApp Bill'}</span>
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Image Preview Modal */}
      {previewImage && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
          <div className="relative max-w-2xl w-full bg-[#15231B] border border-[#243B2D] rounded-3xl p-4 text-center">
            <button
              type="button"
              onClick={() => setPreviewImage(null)}
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-rose-600 text-white font-bold"
            >
              ✕
            </button>
            <h3 className="text-sm font-bold text-white mb-3">📸 Payment Screenshot</h3>
            <div className="max-h-[75vh] overflow-auto rounded-xl border border-[#243B2D]">
              <img src={previewImage} alt="Full Slip" className="w-full object-contain mx-auto" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
