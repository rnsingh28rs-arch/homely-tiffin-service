import React, { useState, useEffect } from 'react';
import { getSiteConfig } from '../../utils/siteConfigStore';
import { getStoredOrders, updateOrderStatus, OrderItem, OrderStatus } from '../../utils/orderStore';
import { getStoredFundRequests, updateFundRequestStatus, FundRequest } from '../../utils/inventoryStore';
import { QuickCalculator } from '../common/QuickCalculator';

type AdminMainTab = 'orders' | 'groceryClearance' | 'analytics' | 'subscribers' | 'delivery';

export const AdminPanel: React.FC = () => {
  const [config] = useState(getSiteConfig());
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [pinInput, setPinInput] = useState<string>('');
  const [pinError, setPinError] = useState<string>('');
  
  // Navigation & State
  const [activeMainTab, setActiveMainTab] = useState<AdminMainTab>('orders');
  const [orders, setOrders] = useState<OrderItem[]>(getStoredOrders());
  const [fundRequests, setFundRequests] = useState<FundRequest[]>(getStoredFundRequests());
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'out_for_delivery' | 'rejected'>('all');
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string>('');
  const [showCalculator, setShowCalculator] = useState(false);

  const refreshAllData = () => {
    setOrders(getStoredOrders());
    setFundRequests(getStoredFundRequests());
  };

  useEffect(() => {
    refreshAllData();
    window.addEventListener('bmb_orders_updated', refreshAllData);
    window.addEventListener('bmb_inventory_updated', refreshAllData);
    return () => {
      window.removeEventListener('bmb_orders_updated', refreshAllData);
      window.removeEventListener('bmb_inventory_updated', refreshAllData);
    };
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
    const reason = window.prompt('Enter exact reason for declining order:', 'Payment UTR verification failed / Fake UTR');
    if (reason !== null) {
      handleStatusChange(orderId, 'rejected', reason || 'Payment unverified');
    }
  };

  // Grocery Fund Clearance
  const handleFundAction = (reqId: string, status: 'approved' | 'rejected') => {
    const remarks = window.prompt('Enter clearance note / payment mode:', status === 'approved' ? 'UPI Funds Released to Manager' : 'Budget Exceeded');
    if (remarks !== null) {
      updateFundRequestStatus(reqId, status, remarks);
      setActionMessage(`Fund Request ${reqId} ${status.toUpperCase()}!`);
      setTimeout(() => setActionMessage(''), 3500);
    }
  };

  const pendingOrders = orders.filter((o) => o.status === 'pending');
  const approvedOrders = orders.filter((o) => o.status === 'approved');
  const declinedOrders = orders.filter((o) => o.status === 'rejected');
  const outOrders = orders.filter((o) => o.status === 'out_for_delivery');

  const filteredOrders = orders.filter((o) => (filterStatus === 'all' ? true : o.status === filterStatus));
  const pendingFunds = fundRequests.filter((f) => f.status === 'pending');

  if (!isAuthenticated) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-[#15231B] border border-[#243B2D] rounded-3xl p-8 shadow-2xl text-center">
          <div className="w-14 h-14 bg-amber-500/20 text-amber-400 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl font-bold border border-amber-500/30">
            💼
          </div>
          <h2 className="text-2xl font-black text-white">Staff & Admin Login</h2>
          <p className="text-emerald-300/60 text-xs mt-1">Enter Master PIN to access Orders & Grocery Desk</p>

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 relative">
      {/* Header Bar */}
      <div className="bg-[#15231B] border border-[#243B2D] rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6 shadow-xl">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 to-amber-400 text-slate-950 font-black flex items-center justify-center text-lg shadow-md">
              💼
            </div>
            <div>
              <h1 className="text-2xl font-black text-white">Admin Operations & Clearance Desk</h1>
              <p className="text-emerald-300/60 text-xs">
                Real-time Orders, Second-Precision Timestamping, Mandi Fund Approvals & Fleet Dispatch
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => setShowCalculator(!showCalculator)}
            className="px-3.5 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-bold rounded-xl border border-amber-500/40 transition cursor-pointer flex items-center gap-1.5"
          >
            <span>🧮</span> {showCalculator ? 'Hide Calc' : 'Calculator'}
          </button>
          <button
            type="button"
            onClick={refreshAllData}
            className="px-3.5 py-2 bg-[#0F1A13] hover:bg-[#203326] text-emerald-200 text-xs font-bold rounded-xl border border-[#243B2D] transition cursor-pointer flex items-center gap-1.5"
          >
            <span>🔄</span> Refresh
          </button>
          <a
            href="#superadmin"
            className="px-3.5 py-2 bg-[#18271E] hover:bg-[#243B2D] text-amber-300 text-xs font-bold rounded-xl border border-amber-500/30 transition flex items-center gap-1.5"
          >
            <span>👑</span> CEO Suite
          </a>
          <button
            type="button"
            onClick={() => setIsAuthenticated(false)}
            className="px-3.5 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs font-bold rounded-xl border border-rose-500/30 transition cursor-pointer"
          >
            Lock
          </button>
        </div>
      </div>

      {/* Floating Calculator Overlay */}
      {showCalculator && (
        <div className="fixed bottom-6 right-6 z-50 shadow-2xl">
          <QuickCalculator onClose={() => setShowCalculator(false)} />
        </div>
      )}

      {actionMessage && (
        <div className="mb-6 p-4 bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 rounded-2xl text-xs font-bold flex items-center gap-2">
          <span>⚡</span>
          <span>{actionMessage}</span>
        </div>
      )}

      {/* Main Feature Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-3 mb-6 scrollbar-none border-b border-[#243B2D]">
        {[
          { id: 'orders', label: `📦 Orders Desk (${orders.length})`, badge: pendingOrders.length > 0 ? `🔴 ${pendingOrders.length}` : undefined },
          { id: 'groceryClearance', label: `💰 Grocery & Mandi Funds (${fundRequests.length})`, badge: pendingFunds.length > 0 ? `⚡ ${pendingFunds.length}` : undefined },
          { id: 'analytics', label: '📊 Live Revenue & Profit' },
          { id: 'subscribers', label: `👥 Subscribers Directory` },
          { id: 'delivery', label: '🚚 Delivery Fleet Dispatch' },
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

      {/* TAB 1: ORDERS RECEIVED DESK (WITH STRICT STATUS & EXACT SECONDS) */}
      {activeMainTab === 'orders' && (
        <div className="space-y-4">
          {/* Sub Filter Chips */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
            {[
              { id: 'all', label: `All Orders (${orders.length})` },
              { id: 'pending', label: `🟡 Pending Approval (${pendingOrders.length})` },
              { id: 'approved', label: `🟢 Approved (${approvedOrders.length})` },
              { id: 'out_for_delivery', label: `🚚 Out for Delivery (${outOrders.length})` },
              { id: 'rejected', label: `🔴 Declined / Rejected (${declinedOrders.length})` },
            ].map((sub) => (
              <button
                key={sub.id}
                type="button"
                onClick={() => setFilterStatus(sub.id as any)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  filterStatus === sub.id
                    ? 'bg-amber-500 text-slate-950 font-black shadow-md'
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
              <p className="text-sm font-bold text-white">No orders in this category</p>
              <p className="text-xs text-slate-500 mt-1">Check other filter tabs or refresh.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredOrders.map((order) => {
                const cleanPhone = order.phone.replace(/[^0-9]/g, '');

                // Formatted WhatsApp Digital Receipt
                const approveWaMsg = `🧾 *BRING MY BITE • OFFICIAL ORDER INVOICE* %0A━━━━━━━━━━━━━━━━━━━━━━━%0A🆔 *Order ID:* ${order.id}%0A👤 *Customer:* ${order.customerName}%0A📞 *Mobile:* ${order.phone}%0A⏱️ *Order Time:* ${order.formattedTimestamp}%0A📍 *Delivery Zone:* ${order.city || 'Greater Noida'} (${order.estimatedTime || '30 Mins ETA'})%0A🏢 *Gate/Address:* ${order.address}%0A━━━━━━━━━━━━━━━━━━━━━━━%0A🍱 *Meal Plan:* ${order.mealPlan}%0A⏰ *Slot:* ${order.slot}%0A💰 *Total Amount:* ₹${order.amount}.00%0A💳 *Payment Status:* VERIFIED ✅ (UTR: ${order.utrNumber})%0A━━━━━━━━━━━━━━━━━━━━━━━%0A👨‍🍳 *Status:* Kitchen is preparing your fresh meal! Delivery boy will arrive at your gate shortly.%0A📞 *Helpdesk:* ${config.phone}`;

                // Formatted WhatsApp Decline Notice
                const rejectWaMsg = `⚠️ *BRING MY BITE • PAYMENT DECLINE ALERT* %0A━━━━━━━━━━━━━━━━━━━━━━━%0A🆔 *Order ID:* ${order.id}%0A👤 *Customer:* ${order.customerName}%0A⏱️ *Attempt Time:* ${order.formattedTimestamp}%0A❌ *Status:* Payment Unverified / Declined%0A❗ *Decline Reason:* ${order.rejectionReason || 'UTR number does not match banking records'}%0A━━━━━━━━━━━━━━━━━━━━━━━%0A📸 *Action Required:* Please reply directly to this WhatsApp message with your UPI payment screenshot to verify & unlock your meal order.%0A📞 *Support:* ${config.phone}`;

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
                        : 'border-rose-500/40 bg-rose-950/10'
                    }`}
                  >
                    <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                      {/* Customer Info & Exact Timestamp */}
                      <div className="space-y-1.5 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono font-black text-amber-400 text-sm">{order.id}</span>
                          
                          {/* High-Precision Seconds Badge */}
                          <span className="px-2.5 py-0.5 bg-[#0F1A13] border border-[#2B4534] text-emerald-300 font-mono text-[11px] font-bold rounded-lg flex items-center gap-1">
                            <span>⏱️</span> {order.formattedTimestamp}
                          </span>

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
                        </div>

                        <div className="text-base font-black text-white pt-0.5">
                          {order.customerName}{' '}
                          <span className="text-xs font-normal text-emerald-300/80 font-mono">({order.phone})</span>
                        </div>

                        <div className="text-xs text-slate-300">
                          📍 <span className="text-white font-medium">{order.address}</span> • 🍱{' '}
                          <span className="text-amber-300 font-bold">{order.mealPlan}</span> • Slot:{' '}
                          <span className="text-white font-bold">{order.slot}</span>
                        </div>

                        {order.status === 'rejected' && order.rejectionReason && (
                          <div className="p-2.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300 font-bold">
                            ❗ Decline Reason: {order.rejectionReason}
                          </div>
                        )}
                      </div>

                      {/* Payment Verification Box */}
                      <div className="bg-[#0F1A13] border border-[#243B2D] p-3.5 rounded-2xl flex items-center gap-4 min-w-[280px]">
                        <div className="space-y-0.5 flex-1">
                          <div className="text-[10px] text-slate-400 uppercase font-bold">UTR / Ref Number</div>
                          <div className="text-xs font-mono font-bold text-amber-300 select-all">{order.utrNumber}</div>
                          <div className="text-sm font-black text-white pt-1">
                            ₹{order.amount}{' '}
                            {order.deliveryCharge > 0 && (
                              <span className="text-[10px] text-amber-300 font-normal">(+₹{order.deliveryCharge} Noida)</span>
                            )}
                          </div>
                        </div>

                        {order.paymentSlip ? (
                          <button
                            type="button"
                            onClick={() => setPreviewImage(order.paymentSlip)}
                            className="group relative w-14 h-14 rounded-xl overflow-hidden border border-emerald-500/40 hover:scale-105 transition cursor-pointer"
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

                        {/* WhatsApp Receipt or Decline Alert Button */}
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

      {/* TAB 2: GROCERY & MANDI FUND CLEARANCE (CHEF -> MANAGER -> ADMIN) */}
      {activeMainTab === 'groceryClearance' && (
        <div className="space-y-6">
          <div className="bg-[#15231B] border border-[#243B2D] rounded-3xl p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-lg font-black text-amber-300 flex items-center gap-2">
                  🛒 Daily Mandi Grocery & Kitchen Expenses Clearance
                </h3>
                <p className="text-xs text-emerald-300/60 mt-0.5">
                  Chef creates items list $\rightarrow$ Manager inputs Kg rates $\rightarrow$ Admin verifies and releases money
                </p>
              </div>

              <div className="p-3 bg-[#0F1A13] border border-amber-500/30 rounded-2xl text-right">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Total Cleared Expenses</span>
                <span className="text-xl font-black text-amber-400">
                  ₹{fundRequests.filter((f) => f.status === 'approved').reduce((s, f) => s + f.totalBudget, 0).toLocaleString()}
                </span>
              </div>
            </div>

            <div className="space-y-4">
              {fundRequests.map((req) => (
                <div
                  key={req.id}
                  className={`bg-[#0F1A13] border rounded-2xl p-5 space-y-4 ${
                    req.status === 'pending' ? 'border-amber-500/50' : req.status === 'approved' ? 'border-emerald-500/30' : 'border-rose-500/30'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#243B2D] pb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-amber-400 text-sm">{req.id}</span>
                      <span className="px-2 py-0.5 bg-[#18271E] text-slate-300 text-[10px] font-bold rounded-lg">
                        Date: {req.date} • {req.formattedTimestamp}
                      </span>
                      <span className="text-xs text-emerald-300 font-bold">Requested by: {req.requestedBy}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                          req.status === 'pending'
                            ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/40'
                            : req.status === 'approved'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                        }`}
                      >
                        {req.status === 'pending' ? '🟡 Pending Admin Approval' : req.status === 'approved' ? '🟢 Funds Released' : '🔴 Declined'}
                      </span>
                      <span className="text-base font-black text-amber-300 ml-2">Total: ₹{req.totalBudget}</span>
                    </div>
                  </div>

                  {/* Items List Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-300">
                      <thead className="bg-[#18271E] text-slate-400 text-[10px] uppercase">
                        <tr>
                          <th className="p-2">Item Name</th>
                          <th className="p-2">Quantity</th>
                          <th className="p-2">Rate / Unit</th>
                          <th className="p-2 text-right">Total (₹)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#243B2D]">
                        {req.items.map((item) => (
                          <tr key={item.id}>
                            <td className="p-2 font-bold text-white">{item.name}</td>
                            <td className="p-2">{item.qty} {item.unit}</td>
                            <td className="p-2 font-mono">₹{item.ratePerUnit}/{item.unit}</td>
                            <td className="p-2 text-right font-bold text-amber-300">₹{item.totalCost}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {req.adminRemarks && (
                    <div className="text-xs text-slate-400 bg-[#18271E] p-2.5 rounded-xl border border-[#243B2D]">
                      Note: <span className="text-emerald-300 font-semibold">{req.adminRemarks}</span>
                    </div>
                  )}

                  {req.status === 'pending' && (
                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => handleFundAction(req.id, 'approved')}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl shadow-lg transition cursor-pointer"
                      >
                        ✅ Approve & Release Funds
                      </button>
                      <button
                        type="button"
                        onClick={() => handleFundAction(req.id, 'rejected')}
                        className="px-3.5 py-2 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 font-bold text-xs rounded-xl border border-rose-500/40 transition cursor-pointer"
                      >
                        ❌ Decline Request
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: FINANCIALS & ANALYTICS */}
      {activeMainTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
            <div className="bg-[#15231B] border border-amber-500/30 p-6 rounded-3xl">
              <span className="text-xs font-bold text-slate-400 uppercase">Gross Verified Sales</span>
              <div className="text-3xl font-black text-amber-400 mt-2">
                ₹{orders.filter((o) => o.status !== 'rejected').reduce((s, o) => s + o.amount, 0).toLocaleString()}
              </div>
              <p className="text-[11px] text-emerald-300/60 mt-1">Confirmed customer payments</p>
            </div>

            <div className="bg-[#15231B] border border-rose-500/30 p-6 rounded-3xl">
              <span className="text-xs font-bold text-slate-400 uppercase">Total Mandi Expenses</span>
              <div className="text-3xl font-black text-rose-400 mt-2">
                ₹{fundRequests.filter((f) => f.status === 'approved').reduce((s, f) => s + f.totalBudget, 0).toLocaleString()}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Released raw material budget</p>
            </div>

            <div className="bg-[#15231B] border border-emerald-500/30 p-6 rounded-3xl">
              <span className="text-xs font-bold text-slate-400 uppercase">Estimated Net Margin</span>
              <div className="text-3xl font-black text-emerald-400 mt-2">
                ₹{(
                  orders.filter((o) => o.status !== 'rejected').reduce((s, o) => s + o.amount, 0) -
                  fundRequests.filter((f) => f.status === 'approved').reduce((s, f) => s + f.totalBudget, 0)
                ).toLocaleString()}
              </div>
              <p className="text-[11px] text-emerald-300/60 mt-1">Sales minus raw material costs</p>
            </div>

            <div className="bg-[#15231B] border border-[#243B2D] p-6 rounded-3xl">
              <span className="text-xs font-bold text-slate-400 uppercase">Total Thalis Cooked</span>
              <div className="text-3xl font-black text-white mt-2">
                {orders.filter((o) => o.status !== 'rejected').length}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Active customer volume</p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: ACTIVE SUBSCRIBERS */}
      {activeMainTab === 'subscribers' && (
        <div className="bg-[#15231B] border border-[#243B2D] rounded-3xl p-6">
          <h3 className="text-lg font-black text-amber-300 mb-4">👥 Active Monthly Subscribers Registry</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-[#0F1A13] text-amber-400 uppercase text-[10px] border-b border-[#243B2D]">
                <tr>
                  <th className="p-3">Customer</th>
                  <th className="p-3">Plan</th>
                  <th className="p-3">Slot</th>
                  <th className="p-3">Address</th>
                  <th className="p-3">Paid (₹)</th>
                  <th className="p-3">Order Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#243B2D]">
                {orders.filter((o) => o.planType === 'Monthly' && o.status !== 'rejected').map((sub) => (
                  <tr key={sub.id} className="hover:bg-[#18271E]">
                    <td className="p-3 font-bold text-white">
                      {sub.customerName}
                      <div className="text-[11px] font-mono text-emerald-300">{sub.phone}</div>
                    </td>
                    <td className="p-3 text-amber-300 font-semibold">{sub.mealPlan}</td>
                    <td className="p-3">{sub.slot}</td>
                    <td className="p-3 truncate max-w-xs">{sub.address}</td>
                    <td className="p-3 font-bold text-white">₹{sub.amount}</td>
                    <td className="p-3 font-mono text-slate-400">{sub.formattedTimestamp}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: DELIVERY FLEET */}
      {activeMainTab === 'delivery' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="bg-[#15231B] border border-[#243B2D] p-6 rounded-3xl space-y-3">
            <h3 className="text-base font-black text-amber-300">🏢 Greater Noida Express Hubs (30 Mins)</h3>
            <ul className="text-xs text-slate-300 space-y-2">
              <li className="flex justify-between p-2.5 bg-[#0F1A13] rounded-xl">
                <span>Galgotias University (Gate 1 & Gate 2)</span>
                <span className="font-bold text-amber-400">⚡ Live Delivery Active</span>
              </li>
              <li className="flex justify-between p-2.5 bg-[#0F1A13] rounded-xl">
                <span>Sharda University Campus & Gate 3</span>
                <span className="font-bold text-amber-400">⚡ Live Delivery Active</span>
              </li>
              <li className="flex justify-between p-2.5 bg-[#0F1A13] rounded-xl">
                <span>Bennett University & Knowledge Park Hostels</span>
                <span className="font-bold text-amber-400">⚡ Live Delivery Active</span>
              </li>
            </ul>
          </div>

          <div className="bg-[#15231B] border border-[#243B2D] p-6 rounded-3xl space-y-3">
            <h3 className="text-base font-black text-amber-300">🌆 Noida Extended Route (45 Mins)</h3>
            <ul className="text-xs text-slate-300 space-y-2">
              <li className="flex justify-between p-2.5 bg-[#0F1A13] rounded-xl">
                <span>Noida Expressway (Sector 128, 137, 142)</span>
                <span className="font-bold text-emerald-400">🚚 Daily Route Active (+₹25 Share)</span>
              </li>
              <li className="flex justify-between p-2.5 bg-[#0F1A13] rounded-xl">
                <span>Noida Central (Sector 50, 62, 76, 78)</span>
                <span className="font-bold text-emerald-400">🚚 Daily Route Active (+₹25 Share)</span>
              </li>
            </ul>
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
              <img src={previewImage} alt="Full Slip" className="w-full object-contain mx-auto" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
