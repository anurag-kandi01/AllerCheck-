import React from 'react';
import { ScanLine, Leaf, MessageSquareHeart, ClipboardList, TrendingUp, Activity, Clock, ShieldCheck, ArrowRight } from 'lucide-react';
import type { PageKey } from '../components/Sidebar';

interface DashboardPageProps {
  onNavigate: (page: PageKey) => void;
  userEmail: string;
}

const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate, userEmail }) => {
  const isGuest = userEmail === 'guest@allercheck.ai';

  const quickActions = [
    {
      title: 'Skin Analysis',
      desc: 'Upload or capture a photo for AI-powered classification',
      icon: <ScanLine className="w-5 h-5" />,
      page: 'skin-analysis' as PageKey,
      accent: '#00d4ff',
      gradientBg: 'linear-gradient(135deg, rgba(0,212,255,0.12) 0%, rgba(0,120,200,0.06) 100%)',
      borderColor: 'rgba(0,212,255,0.18)',
    },
    {
      title: 'Allergy Predictor',
      desc: 'Answer symptom questions to identify your allergy type',
      icon: <Leaf className="w-5 h-5" />,
      page: 'allergy-predictor' as PageKey,
      accent: '#a78bfa',
      gradientBg: 'linear-gradient(135deg, rgba(139,92,246,0.12) 0%, rgba(109,40,217,0.06) 100%)',
      borderColor: 'rgba(139,92,246,0.18)',
    },
    {
      title: 'AI Companion Chat',
      desc: 'Ask our Gemini-powered dermatologist assistant anything',
      icon: <MessageSquareHeart className="w-5 h-5" />,
      page: 'ai-chat' as PageKey,
      accent: '#fbbf24',
      gradientBg: 'linear-gradient(135deg, rgba(251,191,36,0.1) 0%, rgba(217,119,6,0.05) 100%)',
      borderColor: 'rgba(251,191,36,0.16)',
    },
    {
      title: 'Reports & History',
      desc: 'View and export all your past diagnostic records',
      icon: <ClipboardList className="w-5 h-5" />,
      page: 'reports' as PageKey,
      accent: '#34d399',
      gradientBg: 'linear-gradient(135deg, rgba(52,211,153,0.1) 0%, rgba(16,185,129,0.05) 100%)',
      borderColor: 'rgba(52,211,153,0.16)',
    },
  ];

  const platformStats = [
    { label: 'Conditions Detected', value: '8+',  icon: <Activity className="w-3.5 h-3.5" />, color: '#00d4ff' },
    { label: 'Allergy Categories',  value: '5',   icon: <ShieldCheck className="w-3.5 h-3.5" />, color: '#a78bfa' },
    { label: 'Avg Analysis Time',   value: '<2s', icon: <Clock className="w-3.5 h-3.5" />, color: '#fbbf24' },
    { label: 'AI Accuracy',         value: '95%+',icon: <TrendingUp className="w-3.5 h-3.5" />, color: '#34d399' },
  ];

  const supportedConditions = [
    { name: 'Acne',      emoji: '😣', sub: 'Follicular blockage' },
    { name: 'Eczema',    emoji: '🔴', sub: 'Inflammatory reaction' },
    { name: 'Psoriasis', emoji: '🌿', sub: 'Autoimmune condition' },
    { name: 'Ringworm',  emoji: '⭕', sub: 'Fungal infection' },
    { name: 'Melanoma',  emoji: '⚠️', sub: 'Skin cancer type' },
    { name: 'Vitiligo',  emoji: '✨', sub: 'Pigmentation loss' },
    { name: 'Warts',     emoji: '🦠', sub: 'HPV-caused growths' },
    { name: 'Impetigo',  emoji: '🔶', sub: 'Bacterial infection' },
  ];

  return (
    <div className="p-7 max-w-5xl">
      {/* Header */}
      <div className="mb-8">
        <div className="page-accent mb-2" style={{ color: '#00d4ff' }}>Control Center</div>
        <h1 className="text-[28px] font-bold text-white mb-1.5 tracking-tight">Dashboard</h1>
        <p className="text-sm text-slate-500">
          {isGuest
            ? 'Running as Guest — sign in to save history and reports.'
            : 'Welcome back. Your dermatological portal is ready.'}
        </p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {platformStats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl p-4 card-hover relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)',
              border: '1px solid rgba(255,255,255,0.06)',
              boxShadow: '0 1px 0 rgba(255,255,255,0.04) inset',
            }}
          >
            {/* Accent top line */}
            <div
              className="absolute top-0 left-4 right-4 h-px rounded-full"
              style={{ background: `linear-gradient(90deg, transparent, ${stat.color}50, transparent)` }}
            />
            <div className="flex items-center gap-1.5 mb-3" style={{ color: stat.color }}>
              {stat.icon}
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">{stat.label}</span>
            </div>
            <div
              className="text-2xl font-bold stat-value"
              style={{ color: stat.color }}
            >
              {stat.value}
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <div className="section-label mb-3">Quick Access</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {quickActions.map((action) => (
            <button
              key={action.title}
              onClick={() => onNavigate(action.page)}
              className="flex items-center gap-4 p-5 rounded-2xl text-left group card-hover relative overflow-hidden"
              style={{
                background: action.gradientBg,
                border: `1px solid ${action.borderColor}`,
              }}
            >
              {/* Subtle glow blob */}
              <div
                className="absolute -top-6 -right-6 w-24 h-24 rounded-full opacity-20 group-hover:opacity-30 transition-opacity"
                style={{ background: `radial-gradient(circle, ${action.accent}, transparent)` }}
              />
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110"
                style={{
                  background: `rgba(${action.accent === '#00d4ff' ? '0,212,255' : action.accent === '#a78bfa' ? '167,139,250' : action.accent === '#fbbf24' ? '251,191,36' : '52,211,153'},0.15)`,
                  border: `1px solid ${action.borderColor}`,
                  color: action.accent,
                }}
              >
                {action.icon}
              </div>
              <div className="relative z-10 flex-1 min-w-0">
                <div className="text-[14px] font-semibold text-white mb-0.5">{action.title}</div>
                <div className="text-xs text-slate-500 leading-relaxed">{action.desc}</div>
              </div>
              <ArrowRight
                className="w-4 h-4 text-slate-600 flex-shrink-0 group-hover:translate-x-1 group-hover:text-slate-400 transition-all"
              />
            </button>
          ))}
        </div>
      </div>

      {/* Conditions Grid */}
      <div className="mb-6">
        <div className="section-label mb-3">Supported Skin Conditions</div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
          {supportedConditions.map((cond) => (
            <div
              key={cond.name}
              className="rounded-xl p-3.5 card-hover cursor-pointer group"
              style={{
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.05)',
              }}
            >
              <div className="text-xl mb-2 group-hover:scale-110 transition-transform inline-block">{cond.emoji}</div>
              <div className="text-[13px] font-semibold text-white mb-0.5">{cond.name}</div>
              <div className="text-[11px] text-slate-600">{cond.sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Advisory */}
      <div
        className="rounded-xl p-4 flex items-start gap-3"
        style={{
          background: 'rgba(239,68,68,0.06)',
          border: '1px solid rgba(239,68,68,0.12)',
        }}
      >
        <ShieldCheck className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
        <div>
          <div className="text-[10px] font-bold text-red-400 uppercase tracking-widest mb-0.5">Medical Advisory</div>
          <p className="text-[12px] text-slate-500 leading-relaxed">
            AllerCheck AI provides early-stage screening support only. It is not a replacement for formal doctor consultations, diagnoses, or prescribed medication.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
