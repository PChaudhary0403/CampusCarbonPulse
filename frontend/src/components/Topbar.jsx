import React from 'react';
import { Search, Bell, Calendar, User } from 'lucide-react';

function Topbar({ title }) {
  const today = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  return (
    <header className="topbar-container animate-reveal">
      <div className="topbar-left">
        <h1 className="topbar-title font-syne capitalize tracking-tighter">{title}</h1>
        <div className="topbar-date">
          <Calendar size={12} className="text-green-500" />
          {today}
        </div>
      </div>

      <div className="topbar-right">
        <div className="search-bar-wrapper">
          <Search size={16} className="text-slate-600" />
          <input type="text" placeholder="Search Audit Logs..." className="search-input" />
        </div>

        <div className="topbar-actions">
          <div className="px-5 py-2 rounded-full bg-green-500/10 border border-green-500/20 flex items-center gap-3">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-[9px] font-bold text-green-500 uppercase tracking-[0.2em]">Sync: Optimal</span>
          </div>
          <button className="action-btn relative">
            <Bell size={20} />
            <span className="notification-dot"></span>
          </button>
          <div className="user-pill">
            <div className="user-avatar-small">
              <User size={16} />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest">Admin</span>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Topbar;
