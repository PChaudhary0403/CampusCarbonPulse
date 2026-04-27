import React from 'react';
import { LayoutDashboard, BarChart3, Settings, HelpCircle, Leaf } from 'lucide-react';

function Sidebar({ active, setActive }) {
  return (
    <aside className="sidebar-container animate-reveal">
      <div className="sidebar-brand animate-orbit">
        <div className="brand-logo">
          <Leaf className="text-green-500 w-6 h-6" />
        </div>
        <div className="brand-text">
          <h2 className="text-xl font-extrabold font-syne gradient-text leading-tight">Carbon Pulse</h2>
          <p className="text-[8px] font-bold text-slate-600 uppercase tracking-widest">TCET Sustains</p>
        </div>
      </div>

      <nav className="sidebar-nav">
        <NavItem id="dashboard" icon={<LayoutDashboard size={20} />} label="Overview" active={active} onClick={setActive} />
        <NavItem id="analytics" icon={<BarChart3 size={20} />} label="Analytics" active={active} onClick={setActive} />
        <NavItem id="settings" icon={<Settings size={20} />} label="Config" active={active} onClick={setActive} />
        <NavItem id="help" icon={<HelpCircle size={20} />} label="Support" active={active} onClick={setActive} />
      </nav>

      <div className="sidebar-footer">
        <div className="text-[9px] font-bold text-slate-700 uppercase tracking-[0.2em] text-center w-full pb-4">
          Engine Active
        </div>
      </div>
    </aside>
  );
}

function NavItem({ id, icon, label, active, onClick }) {
  return (
    <button 
      onClick={() => onClick(id)} 
      className={`nav-item ${active === id ? 'active' : ''}`}
    >
      {icon}
      <span className="nav-label">{label}</span>
    </button>
  );
}

export default Sidebar;
