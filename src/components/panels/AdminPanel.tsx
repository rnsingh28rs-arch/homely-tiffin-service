import React, { useState, useEffect } from 'react';
import { getSiteConfig } from '../../utils/siteConfigStore';
import { getStoredOrders, updateOrderStatus, OrderItem, OrderStatus } from '../../utils/orderStore';

export const AdminPanel: React.FC = () => {
  const [config] = useState(getSiteConfig());
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [pinInput, setPinInput] = useState<string>('');
  const [pinError, setPinError] = useState<string>('');
  
  // Orders & Filter State
  const [orders, setOrders] = useState<OrderItem[]>(getStoredOrders());
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string>('');

  // Sync Orders in Realtime
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
      setPinError('गलत Admin PIN! 6655 दर्ज करें।');
    }
  };

  const handleApprove = (orderId: string, customerPhone: string) => {
    updateOrderStatus(orderId, 'approved');
    setActionMessage(`Order ${orderId} स्वीकृत (Approved) हो गया है!`);
    setTimeout(() => setActionMessage(''), 3500);
  };

  const handleReject = (orderId: string) => {
    const reason = window.prompt('अस्वीकार (Reject) करने का कारण दर्ज करें:', 'Payment not verified / Invalid UTR');
    if (reason !== null) {
      updateOrderStatus(orderId, 'rejected', reason || 'Payment unverified');
      setActionMessage(`Order ${orderId} को Declined मार्क कर दिया गया है।`);
      setTimeout(() => setActionMessage(''), 3500);
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
          <p className="text-emerald-300/60 text-xs mt-1">ऑर्डर अप्रूवल पोर्टल एक्सेस करने के लिए PIN डालें</p>

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
      {/* Header Bar */}
      <div className="bg-[#15231B] border border-[#243B2D] rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black text-white">📦 Orders Received & Approval Desk</h1>
            {pendingCount > 0 && (
              <span className="px-3 py-1 bg-rose-500 text-white font-black text-xs rounded-full animate-pulse shadow-lg">
                🔴 {pendingCount} New Pending
              </span>
            )}
          </div>
          <p className="text-emerald-300/60 text-xs mt-1">
            कस्टमर्स के यूटीआर नंबर व स्क्रीनशॉट वेरीफाई करें और ऑर्डर अप्रूव/रिजेक्ट करें
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={refreshOrders}
            className="px-4 py-2.5 bg-[#0F1A13] hover:bg-[#203326] text-emerald-200 text-xs font-bold rounded-xl border border-[#243B2D] transition"
          >
            🔄 Refresh Orders
          </button>
          <button
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
      <div className="flex gap-2 overflow-x-auto pb-4 mb-2">
        <button
          onClick={() => setFilterStatus('all')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
            filterStatus === 'all'
              ? 'bg-amber-500 text-slate-950 font-black'
              : 'bg-[#15231B] text-slate-300 border border-[#243B2D]'
          }`}
        >
          All Orders ({orders.length})
        </button>
        <button
          onClick={() => setFilterStatus('pending')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
            filterStatus === 'pending'
              ? 'bg-amber-500 text-slate-950 font-black'
              : 'bg-[#15231B] text-slate-300 border border-[#243B2D]'
          }`}
        >
          🟡 Pending Approval ({pendingCount})
        </button>
        <button
          onClick={() => setFilterStatus('approved')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
            filterStatus === 'approved'
              ? 'bg-amber-500 text-slate-950 font-black'
              : 'bg-[#15231B] text-slate-300 border border-[#243B2D]'
          }`}
        >
          🟢 Approved ({orders.filter((o) => o.status === 'approved').length})
        </button>
        <button
          onClick={() => setFilterStatus('rejected')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
            filterStatus === 'rejected'
              ? 'bg-amber-500 text-slate-950 font-black'
              : 'bg-[#15231B] text-slate-300 border border-[#243B2D]'
          }`}
        >
          🔴 Declined ({orders.filter((o) => o.status === 'rejected').length})
        </button>
      </div>

      {/* Orders List / Table */}
      {filteredOrders.length === 0 ? (
        <div className="bg-[#15231B] border border-[#243B2D] rounded-3xl p-12 text-center text-slate-400">
          <p className="text-3xl mb-2">📭</p>
          <p className="text-sm font-bold text-white">कोई ऑर्डर नहीं मिला</p>
          <p className="text-xs text-emerald-300/50 mt-1">जब कस्टमर नया ऑर्डर डालेगा, वह यहाँ तुरंत दिखाई देगा।</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredOrders.map((order) => {
            const cleanPhone = order.phone.replace(/[^0-9]/g, '');
            return (
              <div
                key={order.id}
                className={`bg-[#15231B] border rounded-3xl p-6 transition shadow-lg ${
                  order.status === 'pending'
                    ? 'border-amber-500/50 bg-[#18291f]'
                    : order.status === 'approved'
                    ? 'border-emerald-500/30'
                    : 'border-rose-500/30 opacity-75'
                }`}
              >
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                  {/* Customer & Order Summary */}
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className="font-mono font-black text-amber-400 text-sm">{order.id}</span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          order.status === 'pending'
                            ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/40'
                            : order.status === 'approved'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                        }`}
                      >
                        {order.status === 'pending' ? '🟡 Pending Approval' : order.status === 'approved' ? '🟢 Approved' : '🔴 Declined'}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} •{' '}
                        {new Date(order.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="text-base font-black text-white">
                      {order.customerName}{' '}
                      <span className="text-xs font-normal text-emerald-300/80 font-mono">({order.phone})</span>
                    </div>

                    <div className="text-xs text-slate-300">
                      📍 <span className="text-white font-medium">{order.address}</span> • 🍱{' '}
                      <span className="text-amber-300 font-bold">{order.mealPlan}</span> • स्लॉट:{' '}
                      <span className="text-white font-bold">{order.slot}</span>
                    </div>

                    {order.rejectionReason && (
                      <div className="text-xs text-rose-300 font-bold pt-1">
                        कारण: {order.rejectionReason}
                      </div>
                    )}
                  </div>

                  {/* Payment Verification Block */}
                  <div className="bg-[#0F1A13] border border-[#243B2D] p-3.5 rounded-2xl flex items-center gap-4 min-w-[280px]">
                    <div className="space-y-0.5 flex-1">
                      <div className="text-[10px] text-slate-400 uppercase font-bold">UTR / Ref Number</div>
                      <div className="text-xs font-mono font-bold text-amber-300 select-all">{order.utrNumber}</div>
                      <div className="text-sm font-black text-white pt-1">₹{order.amount}</div>
                    </div>

                    {order.paymentSlip ? (
                      <button
                        type="button"
                        onClick={() => setPreviewImage(order.paymentSlip)}
                        className="group relative w-14 h-14 rounded-xl overflow-hidden border border-emerald-500/40 hover:scale-105 transition"
                        title="Click to Zoom Screenshot"
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

                  {/* Action Buttons */}
                  <div className="flex flex-wrap items-center gap-2">
                    {order.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleApprove(order.id, order.phone)}
                          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl shadow-lg shadow-emerald-900/30 transition flex items-center gap-1.5"
                        >
                          <span>✅</span> Approve
                        </button>

                        <button
                          onClick={() => handleReject(order.id)}
                          className="px-3.5 py-2.5 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 font-bold text-xs rounded-xl border border-rose-500/40 transition"
                        >
                          ❌ Reject
                        </button>
                      </>
                    )}

                    <a
                      href={`https://wa.me/${cleanPhone}?text=Hello%20${encodeURIComponent(
                        order.customerName
                      )},%20Aapka%20Bring%20My%20Bite%20order%20(${order.id})%20${
                        order.status === 'approved' ? 'ACCEPT' : 'UPDATE'
                      }%20ho%20gaya%20hai.`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-2.5 bg-[#203326] hover:bg-[#2c4734] text-emerald-200 text-xs font-bold rounded-xl border border-emerald-500/30 transition flex items-center gap-1"
                      title="Customer ko WhatsApp message bhejein"
                    >
                      <span>💬</span> WhatsApp
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Screenshot Full Modal Preview */}
      {previewImage && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
          <div className="relative max-w-2xl w-full bg-[#15231B] border border-[#243B2D] rounded-3xl p-4 text-center">
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-rose-600 text-white font-bold"
            >
              ✕
            </button>
            <h3 className="text-sm font-bold text-white mb-3">📸 Payment Screenshot Preview</h3>
            <div className="max-h-[75vh] overflow-auto rounded-xl border border-[#243B2D]">
              <img src={previewImage} alt="Payment Full Slip" className="w-full object-contain mx-auto" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
