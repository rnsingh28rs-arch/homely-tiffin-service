import React from 'react';
import { useApp } from '../../context/AppContext';

export const StaffNavBar: React.FC = () => {
  const { activeRole, setActiveRole, authenticatedRoles } = useApp();

  const handleExitToWebsite = () => {
    setActiveRole('customer');
    window.location.hash = '';
  };

  return (
    <div className="bg-[#111A14] text-[#FAF7F2] border-b border-[#243B2D] px-4 py-3 sticky top-0 z-40 shadow-xl">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        
        {/* Workspace Title & Current Badge */}
        <div className="flex items-center gap-3">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="text-xs font-black uppercase tracking-wider text-amber-300">
            Internal Workspace
          </span>
          <span className="text-xs text-slate-400 hidden sm:inline">•</span>
          <span className="text-xs font-bold text-emerald-200 capitalize">
            Active: {activeRole} Desk
          </span>
        </div>

        {/* Role Hierarchy Navigation Switcher */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Admin Tab (Visible if SuperAdmin or Admin) */}
          <button
            type="button"
            onClick={() => {
              setActiveRole('admin');
              window.location.hash = '#admin';
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeRole === 'admin'
                ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                : 'bg-[#18271E] text-slate-300 hover:bg-[#23382B] border border-[#243B2D]'
            }`}
          >
            <span>💼</span>
            <span>Admin Orders</span>
          </button>

          {/* Manager Tab (Visible to SuperAdmin, Admin, Manager) */}
          <button
            type="button"
            onClick={() => {
              setActiveRole('manager');
              window.location.hash = '#manager';
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeRole === 'manager'
                ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                : 'bg-[#18271E] text-slate-300 hover:bg-[#23382B] border border-[#243B2D]'
            }`}
          >
            <span>📋</span>
            <span>Manager</span>
          </button>

          {/* Chef Tab (Visible to SuperAdmin, Admin, Manager, Chef) */}
          <button
            type="button"
            onClick={() => {
              setActiveRole('chef');
              window.location.hash = '#chef';
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeRole === 'chef'
                ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                : 'bg-[#18271E] text-slate-300 hover:bg-[#23382B] border border-[#243B2D]'
            }`}
          >
            <span>👨‍🍳</span>
            <span>Kitchen Display</span>
          </button>

          {/* Super Admin Shortcut (Direct Jump) */}
          <a
            href="#superadmin"
            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-[#18271E] hover:bg-[#23382B] text-amber-300 border border-amber-500/30 transition flex items-center gap-1.5"
          >
            <span>👑</span>
            <span>Super Admin</span>
          </a>

          {/* Exit to Public Website Button */}
          <button
            type="button"
            onClick={handleExitToWebsite}
            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 transition flex items-center gap-1 ml-1"
          >
            <span>🌐</span>
            <span>Exit to Website</span>
          </button>
        </div>

      </div>
    </div>
  );
};
