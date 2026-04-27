import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import Dashboard from './Dashboard';

function Layout() {
  const [activeView, setActiveView] = useState('dashboard');

  const renderContent = () => {
    switch (activeView) {
      case 'dashboard':
        return <Dashboard />;
      case 'analytics':
        return <PlaceholderView title="Advanced Analytics" description="Detailed emission patterns and predictive modeling." />;
      case 'settings':
        return <PlaceholderView title="System Settings" description="Configure campus parameters and emission factors." />;
      case 'help':
        return <PlaceholderView title="Support Center" description="Access documentation and system help." />;
      default:
        return <Dashboard />;
    }
  };

  const getTitle = () => {
    switch (activeView) {
      case 'dashboard': return 'Campus Overview';
      case 'analytics': return 'Data Analytics';
      case 'settings': return 'Configuration';
      case 'help': return 'Support';
      default: return 'Carbon Pulse';
    }
  };

  return (
    <div className="layout-root">
      <Sidebar 
        active={activeView} 
        setActive={setActiveView} 
      />
      <div className="layout-main">
        <Topbar title={getTitle()} />
        <main className="layout-content-outlet">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}

function PlaceholderView({ title, description }) {
  return (
    <div className="flex flex-col items-center justify-center h-[60vh] text-center animate-reveal">
      <div className="glass-card p-16 max-w-lg">
        <h2 className="text-3xl font-bold mb-4 font-syne gradient-text uppercase tracking-tighter">{title}</h2>
        <p className="text-slate-500 text-sm leading-relaxed mb-8">{description}</p>
        <div className="p-4 bg-white/5 rounded-2xl border border-white/5 italic text-xs text-slate-600">
          Advanced modular submodule currently synchronizing with campus roadmap...
        </div>
      </div>
    </div>
  );
}

export default Layout;
