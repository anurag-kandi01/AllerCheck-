import React from 'react';
import {
  LayoutDashboard,
  ScanLine,
  Leaf,
  MessageSquareHeart,
  ClipboardList,
  BookOpen,
  LogOut,
  Stethoscope,
} from 'lucide-react';

type PageKey = 'dashboard' | 'skin-analysis' | 'allergy-predictor' | 'ai-chat' | 'reports' | 'info';

interface SidebarProps {
  activePage: PageKey;
  onNavigate: (page: PageKey) => void;
  userEmail: string;
  onLogout: () => void;
}

const navItems: { key: PageKey; label: string; icon: React.ReactNode }[] = [
  { key: 'dashboard',         label: 'Dashboard',         icon: <LayoutDashboard className="w-[15px] h-[15px]" /> },
  { key: 'skin-analysis',     label: 'Skin Analysis',     icon: <ScanLine className="w-[15px] h-[15px]" /> },
  { key: 'allergy-predictor', label: 'Allergy Predictor', icon: <Leaf className="w-[15px] h-[15px]" /> },
  { key: 'ai-chat',           label: 'AI Companion Chat', icon: <MessageSquareHeart className="w-[15px] h-[15px]" /> },
  { key: 'reports',           label: 'Reports & History', icon: <ClipboardList className="w-[15px] h-[15px]" /> },
  { key: 'info',              label: 'Info & Remedies',   icon: <BookOpen className="w-[15px] h-[15px]" /> },
];

const Sidebar: React.FC<SidebarProps> = ({ activePage, onNavigate, userEmail, onLogout }) => {
  const initials = userEmail ? userEmail.substring(0, 2).toUpperCase() : 'GU';
  const isGuest = userEmail === 'guest@allercheck.ai';

  return (
    <aside
      className="fixed left-0 top-0 h-screen w-[190px] flex flex-col z-40"
      style={{
        background: 'linear-gradient(180deg, rgba(10,10,20,0.97) 0%, rgba(8,8,16,0.98) 100%)',
        borderRight: '1px solid rgba(255,255,255,0.05)',
        boxShadow: '4px 0 30px rgba(0,0,0,0.4)',
      }}
    >
      {/* Logo */}
      <div className="px-4 pt-5 pb-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{
              background: 'linear-gradient(135deg, #00d4ff, #7c3aed)',
              boxShadow: '0 0 16px rgba(0,212,255,0.35), 0 2px 8px rgba(0,0,0,0.4)',
            }}
          >
            <Stethoscope className="w-4 h-4 text-white" />
          </div>
          <div className="leading-none">
            <div className="text-[15px] font-bold tracking-tight text-white">
              Aller<span style={{ color: '#00d4ff' }}>Check</span>
            </div>
            <div
              className="text-[9px] font-semibold tracking-[0.12em] uppercase mt-0.5"
              style={{ color: 'rgba(139,92,246,0.9)' }}
            >
              AI Platform
            </div>
          </div>
        </div>
      </div>

      {/* Nav Section */}
      <nav className="flex-1 px-2.5 py-3 space-y-0.5 overflow-y-auto scrollbar-thin">
        <div className="section-label mb-2">Navigation</div>
        {navItems.map((item) => {
          const isActive = activePage === item.key;
          return (
            <button
              key={item.key}
              onClick={() => onNavigate(item.key)}
              className={`sidebar-item${isActive ? ' active' : ''}`}
            >
              <span className="flex-shrink-0">{item.icon}</span>
              <span className="truncate">{item.label}</span>
              {isActive && (
                <span
                  className="ml-auto w-1 h-1 rounded-full flex-shrink-0"
                  style={{ background: '#00d4ff', boxShadow: '0 0 6px #00d4ff' }}
                />
              )}
            </button>
          );
        })}
      </nav>

      {/* User footer */}
      <div className="px-2.5 pb-4 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        {/* User card */}
        <div
          className="flex items-center gap-2.5 mb-2 px-2 py-2 rounded-xl"
          style={{ background: 'rgba(255,255,255,0.03)' }}
        >
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0"
            style={{
              background: isGuest
                ? 'linear-gradient(135deg, #475569, #334155)'
                : 'linear-gradient(135deg, #8b5cf6, #ec4899)',
              boxShadow: isGuest ? 'none' : '0 0 12px rgba(139,92,246,0.3)',
            }}
          >
            {initials}
          </div>
          <div className="min-w-0">
            <div className="text-[11px] font-semibold text-slate-200 truncate leading-tight">
              {isGuest ? 'Guest Session' : 'User Session'}
            </div>
            <div className="text-[10px] text-slate-600 truncate">{userEmail}</div>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={onLogout}
          className="sidebar-item w-full text-left group"
          style={{ color: 'rgba(239,68,68,0.7)' }}
        >
          <LogOut className="w-[14px] h-[14px] group-hover:text-red-400 transition-colors" />
          <span className="group-hover:text-red-400 transition-colors text-[12px]">Log Out Portal</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
export type { PageKey };
