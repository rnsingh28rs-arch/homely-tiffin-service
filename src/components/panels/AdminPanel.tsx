import React, { useState, useEffect } from 'react';
import { getSiteConfig } from '../../utils/siteConfigStore';
import { getStoredOrders, updateOrderStatus, OrderItem, OrderStatus } from '../../utils/orderStore';

type AdminMainTab = 'orders' | 'analytics' | 'subscribers' | 'delivery' | 'quickSettings';

export const AdminPanel: React.FC = () => {
  const [config] = useState(getSiteConfig());
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [pinInput, setPinInput] = useState<string>('');
  const [pinError, setPinError] = useState<string>('');
  
  // Navigation & Data State
  const [activeMainTab, setActiveMainTab] = useState<AdminMainTab>('orders');
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
    setActionMessage(`Order ${orderId} status updated to: ${status.toUpperCase()}!`);
    setTimeout(() => setActionMessage(''), 3500);
  };

  const handleReject = (orderId: string) => {
    const reason = window.prompt('Enter reason for declining order:', 'Payment UTR verification failed');
    if (reason !== null) {
      handleStatusChange(orderId, 'rejected', reason || 'Payment unverified');
    }
  };

  // Calculations for Analytics Tab
  const totalRevenue = orders
    .filter((o) => o.status === 'approved' || o.status === 'out_for_delivery' || o.status === 'delivered')
    .reduce((sum, o) => sum + (o.amount || 0), 0);

  const pendingCount = orders.filter((o) => o.status === 'pending').length;
  const activeSubs = orders.filter((o) => o.planType === 'Monthly' && o.status !== 'rejected');
  const grNoidaOrders = orders.filter((o) => o.city === 'Greater Noida' || !o.city);
  const noidaOrders = orders.filter((o) => o.city === 'Noida');

  const filteredOrders = orders.filter((o) => (filterStatus === 'all' ? true : o.status === filterStatus));

  if (!isAuthenticated) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-[#15231B] border border-[#243B2D] rounded-3xl p-8 shadow-2xl text-center">
          <div className="w-14 h-14 bg-amber-500/20 text-amber-400 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl font-bold border border-amber-500/30">
            💼
          </div>
          <h2 className="text-2xl font-black text-white">Staff & Admin Login</h2>
          <p className="text-emerald-300/60 text-xs mt-1">Enter Master PIN to access Admin Command Center</p>

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
              className="w-full py-3.5 bg-gradient-to-r from-[#D97706] to-[#F59E0B] text-[#111A14] font-black rounded-2xl shadow-lg hover:brightness-110 transition cursor-pointer"
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
      <div className="bg-[#15231B] border border-[#243B2D] rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6 shadow-xl">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 to-amber-400 text-slate-950 font-black flex items-center justify-center text-lg">
              💼
            </div>
            <div>
              <h1 className="text-2xl font-black text-white">Admin Command Center</h1>
              <p className="text-emerald-300/60 text-xs">
                Live Orders, Revenue Analytics, Subscribers Directory & Delivery Dispatch
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={refreshOrders}
            className="px-4 py-2 bg-[#0F1A13] hover:bg-[#203326] text-emerald-200 text-xs font-bold rounded-xl border border-[#243B2D] transition cursor-pointer flex items-center gap-1.5"
          >
            <span>🔄</span> Refresh Data
          </button>
          <a
            href="#superadmin"
            className="px-4 py-2 bg-[#18271E] hover:bg-[#243B2D] text-amber-300 text-xs font-bold rounded-xl border border-amber-500/30 transition flex items-center gap-1.5"
          >
            <span>👑</span> Super Admin
          </a>
          <button
            type="button"
            onClick={() => setIsAuthenticated(false)}
            className="px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs font-bold rounded-xl border border-rose-500/30 transition cursor-pointer"
          >
            Lock Panel
          </button>
        </div>
      </div>

      {actionMessage && (
        <div className="mb-6 p-4 bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 rounded-2xl text-xs font-bold flex items-center gap-2">
          <span>⚡</span>
          <span>{actionMessage}</span>
        </div>
      )}

      {/* Main Feature Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-3 mb-6 scrollbar-none border-b border-[#243B2D]">
        {[
          { id: 'orders', label: `📦 Orders Desk (${orders.length})`, badge: pendingCount > 0 ? `🔴 ${pendingCount}` : undefined },
          { id: 'analytics', label: '📊 Financials & Analytics' },
          { id: 'subscribers', label: `👥 Subscribers Directory (${activeSubs.length})` },
          { id: 'delivery', label: '🚚 Delivery Gates & Dispatch' },
          { id: 'quickSettings', label: '⚙️ Live Quick Settings' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveMainTab(tab.id as AdminMainTab)}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition flex items-center gap-2 cursor-pointer ${
              activeMainTab === tab.id
                ? 'bg-gradient-to-r from-[#D97706] to-[#F59E0B] text-slate-950 font-black shadow-lg'
                : 'bg-[#15231B] text-slate-300 hover:bg-[#1f3527] border border-[#243B2D]'
            }`}
          >
            <span>{tab.label}</span>
            {tab.badge && (
              <span className="px-2 py-0.5 bg-rose-600 text-white rounded-full text-[10px] font-black animate-pulse">
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* TAB 1: ORDERS RECEIVED DESK */}
      {activeMainTab === 'orders' && (
        <div className="space-y-4">
          {/* Sub-Filters */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
            {[
              { id: 'all', label: `All (${orders.length})` },
              { id: 'pending', label: `🟡 Pending (${pendingCount})` },
              { id: 'approved', label: `🟢 Approved (${orders.filter((o) => o.status === 'approved').length})` },
              { id: 'out_for_delivery', label: `🚚 Out for Delivery (${orders.filter((o) => o.status === 'out_for_delivery').length})` },
              { id: 'rejected', label: `🔴 Declined (${orders.filter((o) => o.status === 'rejected').length})` },
            ].map((sub) => (
              <button
                key={sub.id}
                type="button"
                onClick={() => setFilterStatus(sub.id as any)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  filterStatus === sub.id
                    ? 'bg-amber-500 text-slate-950 font-black'
                    : 'bg-[#0F1A13] text-slate-400 border border-[#243B2D]'
                }`}
              >
                {sub.label}
              </button>
            ))}
          </div>

          {filteredOrders.length === 0 ? (
            <div className="bg-[#15231B] border border-[#243B2D] rounded-3xl p-12 text-center text-slate-400">
              <p className="text-3xl mb-2">📭</p>
              <p className="text-sm font-bold text-white">No Orders Found in this category</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredOrders.map((order) => {
                const cleanPhone = order.phone.replace(/[^0-9]/g, '');

                const approveWaMsg = `🎉 *Bring My Bite - Order Confirmed!* %0A%0A*Order ID:* ${order.id}%0A*Customer:* ${order.customerName}%0A*Meal:* ${order.mealPlan}%0A*Delivery Zone:* ${order.city || 'Greater Noida'} (${order.estimatedTime || '30 Mins'})%0A*Address:* ${order.address}%0A*Total Bill:* ₹${order.amount} (UTR Verified ✅)%0A%0A🍱 *Your meal is being prepared fresh in our kitchen!*`;

                const rejectWaMsg = `⚠️ *Bring My Bite - Order Alert* %0A%0A*Order ID:* ${order.id}%0A*Status:* Payment Unverified / Declined%0A*Reason:* ${order.rejectionReason || 'UTR verification mismatch'}%0A%0APlease reply to this message with your payment screenshot.`;

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
                      {/* Customer Info */}
                      <div className="space-y-1.5 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono font-black text-amber-400 text-sm">{order.id}</span>
                          <span className="px-2 py-0.5 bg-[#0F1A13] border border-amber-500/30 text-amber-300 rounded-full text-[10px] font-bold">
                            📍 {order.city || 'Greater Noida'} • {order.estimatedTime || '30 Mins'}
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

                      {/* Payment Box */}
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
                            className="group relative w-14 h-14 rounded-xl overflow-hidden border border-emerald-500/40 hover:scale-105 transition cursor-pointer"
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

                      {/* Action Buttons */}
                      <div className="flex flex-wrap items-center gap-2">
                        {order.status === 'pending' && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleStatusChange(order.id, 'approved')}
                              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl shadow-lg transition cursor-pointer"
                            >
                              ✅ Approve
                            </button>
                            <button
                              type="button"
                              onClick={() => handleReject(order.id)}
                              className="px-3 py-2 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 font-bold text-xs rounded-xl border border-rose-500/40 transition cursor-pointer"
                            >
                              ❌ Reject
                            </button>
                          </>
                        )}

                        {order.status === 'approved' && (
                          <button
                            type="button"
                            onClick={() => handleStatusChange(order.id, 'out_for_delivery')}
                            className="px-3 py-2 bg-sky-600 hover:bg-sky-500 text-white font-black text-xs rounded-xl transition cursor-pointer"
                          >
                            🚚 Dispatch
                          </button>
                        )}

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
        </div>
      )}

      {/* TAB 2: FINANCIALS & ANALYTICS */}
      {activeMainTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
            <div className="bg-[#15231B] border border-amber-500/30 p-6 rounded-3xl">
              <span className="text-xs font-bold text-slate-400 uppercase">Total Verified GMV</span>
              <div className="text-3xl font-black text-amber-400 mt-2">₹{totalRevenue.toLocaleString()}</div>
              <p className="text-[11px] text-emerald-300/60 mt-1">Across all confirmed bookings</p>
            </div>

            <div className="bg-[#15231B] border border-emerald-500/30 p-6 rounded-3xl">
              <span className="text-xs font-bold text-slate-400 uppercase">Active Subscriptions</span>
              <div className="text-3xl font-black text-emerald-400 mt-2">{activeSubs.length}</div>
              <p className="text-[11px] text-emerald-300/60 mt-1">30-day recurring customers</p>
            </div>

            <div className="bg-[#15231B] border border-[#243B2D] p-6 rounded-3xl">
              <span className="text-xs font-bold text-slate-400 uppercase">Greater Noida Deliveries</span>
              <div className="text-3xl font-black text-white mt-2">{grNoidaOrders.length}</div>
              <p className="text-[11px] text-emerald-300/60 mt-1">⚡ 30-min express zone</p>
            </div>

            <div className="bg-[#15231B] border border-[#243B2D] p-6 rounded-3xl">
              <span className="text-xs font-bold text-slate-400 uppercase">Noida Extended Orders</span>
              <div className="text-3xl font-black text-white mt-2">{noidaOrders.length}</div>
              <p className="text-[11px] text-emerald-300/60 mt-1">🚚 45-min delivery route</p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: ACTIVE SUBSCRIBERS DIRECTORY */}
      {activeMainTab === 'subscribers' && (
        <div className="bg-[#15231B] border border-[#243B2D] rounded-3xl p-6">
          <h3 className="text-lg font-black text-amber-300 mb-4 flex items-center gap-2">
            👥 Monthly Meal Plan Subscribers Registry
          </h3>

          {activeSubs.length === 0 ? (
            <p className="text-xs text-slate-400 py-8 text-center">No active monthly subscribers yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-[#0F1A13] text-amber-400 font-bold uppercase text-[10px] border-b border-[#243B2D]">
                  <tr>
                    <th className="p-3">Customer</th>
                    <th className="p-3">Plan</th>
                    <th className="p-3">Slot</th>
                    <th className="p-3">Gate Address</th>
                    <th className="p-3">Paid Amount</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#243B2D]">
                  {activeSubs.map((sub) => (
                    <tr key={sub.id} className="hover:bg-[#18271E] transition">
                      <td className="p-3 font-bold text-white">
                        {sub.customerName}
                        <div className="text-[11px] font-mono text-emerald-300/80">{sub.phone}</div>
                      </td>
                      <td className="p-3 text-amber-300 font-semibold">{sub.mealPlan}</td>
                      <td className="p-3">{sub.slot}</td>
                      <td className="p-3 text-slate-300 max-w-xs truncate">{sub.address}</td>
                      <td className="p-3 font-bold text-white">₹{sub.amount}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded-full font-bold text-[10px]">
                          {sub.status.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: DELIVERY GATES & DISPATCH BOARD */}
      {activeMainTab === 'delivery' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="bg-[#15231B] border border-[#243B2D] p-6 rounded-3xl space-y-3">
            <h3 className="text-base font-black text-amber-300 flex items-center gap-2">
              🏢 Greater Noida Delivery Hubs (30 Mins)
            </h3>
            <ul className="text-xs text-slate-300 space-y-2">
              <li className="flex justify-between p-2.5 bg-[#0F1A13] rounded-xl">
                <span>Galgotias University (Gate 1 & Gate 2)</span>
                <span className="font-bold text-amber-400">⚡ Active</span>
              </li>
              <li className="flex justify-between p-2.5 bg-[#0F1A13] rounded-xl">
                <span>Sharda University Campus & Gate 3</span>
                <span className="font-bold text-amber-400">⚡ Active</span>
              </li>
              <li className="flex justify-between p-2.5 bg-[#0F1A13] rounded-xl">
                <span>Bennett University & Knowledge Park Hostels</span>
                <span className="font-bold text-amber-400">⚡ Active</span>
              </li>
              <li className="flex justify-between p-2.5 bg-[#0F1A13] rounded-xl">
                <span>Pari Chowk & Alpha/Beta Residential Sectors</span>
                <span className="font-bold text-amber-400">⚡ Active</span>
              </li>
            </ul>
          </div>

          <div className="bg-[#15231B] border border-[#243B2D] p-6 rounded-3xl space-y-3">
            <h3 className="text-base font-black text-amber-300 flex items-center gap-2">
              🌆 Noida Extended Hubs (45 Mins)
            </h3>
            <ul className="text-xs text-slate-300 space-y-2">
              <li className="flex justify-between p-2.5 bg-[#0F1A13] rounded-xl">
                <span>Noida Expressway (Sector 128, 137, 142)</span>
                <span className="font-bold text-emerald-400">🚚 Route Scheduled</span>
              </li>
              <li className="flex justify-between p-2.5 bg-[#0F1A13] rounded-xl">
                <span>Noida Central (Sector 50, 62, 76, 78)</span>
                <span className="font-bold text-emerald-400">🚚 Route Scheduled</span>
              </li>
            </ul>
          </div>
        </div>
      )}

      {/* TAB 5: QUICK SETTINGS & SUPER ADMIN SHORTCUT */}
      {activeMainTab === 'quickSettings' && (
        <div className="bg-[#15231B] border border-[#243B2D] rounded-3xl p-6 sm:p-8 space-y-6">
          <h3 className="text-base font-black text-amber-300 flex items-center gap-2">
            ⚙️ Quick Configuration & Master Links
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-[#0F1A13] rounded-2xl border border-[#243B2D] space-y-2">
              <div className="text-xs font-bold text-white">Full CMS & Dynamic Pricing</div>
              <p className="text-[11px] text-slate-400">
                Change UPI QR, FSSAI, GST, WhatsApp Business number and meal prices.
              </p>
              <a
                href="#superadmin"
                className="inline-block px-4 py-2 bg-gradient-to-r from-[#D97706] to-[#F59E0B] text-slate-950 font-black text-xs rounded-xl mt-2"
              >
                Open Super Admin Panel ➔
              </a>
            </div>

            <div className="p-4 bg-[#0F1A13] rounded-2xl border border-[#243B2D] space-y-2">
              <div className="text-xs font-bold text-white">Live Kitchen Display</div>
              <p className="text-[11px] text-slate-400">
                Chef panel to prepare lunch & dinner items per shift.
              </p>
              <a
                href="#chef"
                className="inline-block px-4 py-2 bg-[#18271E] hover:bg-[#22382B] text-emerald-300 font-bold text-xs rounded-xl border border-emerald-500/30 mt-2"
              >
                Open Kitchen Display ➔
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Screenshot Zoom Modal */}
      {previewImage && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
          <div className="relative max-w-2xl w-full bg-[#15231B] border border-[#243B2D] rounded-3xl p-4 text-center">
            <button
              type="button"
              onClick={() => setPreviewImage(null)}
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-rose-600 text-white font-bold cursor-pointer"
            >
              ✕
            </button>
            <h3 className="text-sm font-bold text-white mb-3">📸 Payment Screenshot Preview</h3>
            <div className="max-h-[75vh] overflow-auto rounded-xl border border-[#243B2D]">
              <img src={previewImage} alt="Payment Slip" className="w-full object-contain mx-auto" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
