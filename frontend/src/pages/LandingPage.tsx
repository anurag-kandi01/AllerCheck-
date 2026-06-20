import React, { useEffect, useRef } from 'react';
import { Stethoscope, Zap, Shield, Brain, ArrowRight, CheckCircle, Activity, Scan, MessageSquare, ChevronRight } from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
  onLogin: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted, onLogin }) => {
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!heroRef.current) return;
      const { clientX, clientY } = e;
      const { width, height } = heroRef.current.getBoundingClientRect();
      const x = (clientX / width - 0.5) * 20;
      const y = (clientY / height - 0.5) * 20;
      heroRef.current.style.setProperty('--mouse-x', `${x}px`);
      heroRef.current.style.setProperty('--mouse-y', `${y}px`);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const features = [
    {
      icon: <Scan className="w-6 h-6" />,
      title: 'AI Skin Analysis',
      desc: 'EfficientNet-powered classification of 8+ dermatological conditions with confidence scoring.',
      color: 'from-cyan-500 to-blue-500',
    },
    {
      icon: <Activity className="w-6 h-6" />,
      title: 'Allergy Predictor',
      desc: 'Symptom-based allergy detection covering food, skin, dust, drug, and pollen sensitivities.',
      color: 'from-purple-500 to-pink-500',
    },
    {
      icon: <MessageSquare className="w-6 h-6" />,
      title: 'AI Companion Chat',
      desc: 'Consult our Gemini-powered dermatologist assistant for personalized skin & allergy guidance.',
      color: 'from-amber-500 to-orange-500',
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: 'Clinical-Grade Reports',
      desc: 'Structured diagnostic dossiers with probability breakdowns and hygiene protocols.',
      color: 'from-emerald-500 to-teal-500',
    },
  ];

  const stats = [
    { value: '95%+', label: 'Model Accuracy' },
    { value: '8+', label: 'Skin Conditions' },
    { value: '5', label: 'Allergy Types' },
    { value: '<2s', label: 'Analysis Time' },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0f] overflow-x-hidden">
      {/* Navigation */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-3.5"
        style={{
          background: 'rgba(8,8,16,0.85)',
          backdropFilter: 'blur(24px) saturate(180%)',
          WebkitBackdropFilter: 'blur(24px) saturate(180%)',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
          boxShadow: '0 1px 0 rgba(0,212,255,0.04)',
        }}
      >
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg,#00d4ff,#7c3aed)', boxShadow: '0 0 16px rgba(0,212,255,0.3)' }}
          >
            <Stethoscope className="w-4 h-4 text-white" />
          </div>
          <div>
            <span className="font-bold text-base tracking-tight text-white">
              Aller<span style={{ color: '#00d4ff' }}>Check</span>
            </span>
            <span className="text-[10px] font-bold tracking-[0.1em] uppercase ml-1.5" style={{ color: 'rgba(139,92,246,0.9)' }}>AI</span>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm text-slate-400">
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a>
          <a href="#about" className="hover:text-white transition-colors">About</a>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onLogin}
            className="text-sm text-slate-300 hover:text-white transition-colors px-4 py-2"
          >
            Sign In
          </button>
          <button
            onClick={onGetStarted}
            className="text-sm text-white font-semibold px-4 py-2 rounded-lg transition-all"
            style={{
              background: 'linear-gradient(135deg, #00d4ff, #7c3aed)',
              boxShadow: '0 0 20px rgba(0,212,255,0.25), 0 4px 12px rgba(0,0,0,0.3)',
            }}
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section
        ref={heroRef}
        className="relative min-h-screen flex items-center justify-center hero-grid overflow-hidden pt-20"
      >
        {/* Background Orbs */}
        <div className="orb-1" style={{ top: '-100px', left: '-100px' }} />
        <div className="orb-2" style={{ bottom: '-50px', right: '-50px' }} />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0a0a0f]" />

        <div className="relative z-10 text-center max-w-5xl mx-auto px-6">
          {/* Badge */}
          <div
            className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[11px] font-semibold mb-8 tracking-wide"
            style={{
              background: 'rgba(0,212,255,0.07)',
              border: '1px solid rgba(0,212,255,0.2)',
              color: '#00d4ff',
              boxShadow: '0 0 20px rgba(0,212,255,0.08)',
            }}
          >
            <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#00d4ff', boxShadow: '0 0 6px #00d4ff' }} />
            AI-Powered Dermatological Screening Platform
          </div>

          {/* Main Headline */}
          <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-6">
            <span className="text-white">Detect Skin</span>
            <br />
            <span className="shimmer-text">Conditions & Allergies</span>
            <br />
            <span className="text-white">Instantly</span>
          </h1>

          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Upload a photo or answer a few questions. Our advanced AI analyzes your skin condition and allergy indicators in seconds — backed by clinical intelligence.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-16">
            <button
              onClick={onGetStarted}
              className="group flex items-center justify-center gap-2 text-white px-8 py-3.5 rounded-xl font-semibold text-base transition-all hover:-translate-y-0.5"
              style={{
                background: 'linear-gradient(135deg, #00d4ff 0%, #7c3aed 100%)',
                boxShadow: '0 0 40px rgba(0,212,255,0.25), 0 8px 24px rgba(0,0,0,0.4)',
              }}
            >
              Start Free Analysis
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={onLogin}
              className="flex items-center justify-center gap-2 text-slate-300 hover:text-white px-8 py-3.5 rounded-xl font-semibold text-base transition-all"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.1)',
              }}
            >
              Sign In to Dashboard
            </button>
          </div>

          {/* Stats */}
          <div
            className="inline-grid grid-cols-4 gap-0 rounded-2xl overflow-hidden"
            style={{ border: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.02)' }}
          >
            {stats.map((stat, i) => (
              <div
                key={stat.label}
                className="text-center px-6 py-4"
                style={{ borderLeft: i > 0 ? '1px solid rgba(255,255,255,0.07)' : 'none' }}
              >
                <div className="text-2xl font-bold stat-value text-gradient mb-0.5">{stat.value}</div>
                <div className="text-[11px] text-slate-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 text-xs text-purple-400 font-medium mb-4">
              <Zap className="w-3 h-3" />
              Core Capabilities
            </div>
            <h2 className="text-4xl font-bold text-white mb-4">
              Everything You Need for
              <br />
              <span className="text-gradient">Skin & Allergy Intelligence</span>
            </h2>
            <p className="text-slate-400 max-w-xl mx-auto">
              From real-time image analysis to AI-guided consultations, AllerCheck covers the full spectrum of dermatological screening.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="glass rounded-2xl p-6 card-hover group cursor-pointer"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center text-white mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{feature.desc}</p>
                <div className="flex items-center gap-1 text-cyan-400 text-xs font-medium mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  Learn more <ChevronRight className="w-3 h-3" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 px-6 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-900/5 to-transparent" />
        <div className="max-w-5xl mx-auto relative">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">How It Works</h2>
            <p className="text-slate-400">Three simple steps to your personalized skin analysis</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Upload or Capture', desc: 'Take a photo or upload an existing image of your skin condition', icon: '📷' },
              { step: '02', title: 'AI Analyzes', desc: 'Our EfficientNet model processes your image in under 2 seconds', icon: '🧠' },
              { step: '03', title: 'Get Results', desc: 'Receive detailed classification, probabilities, and AI-generated insights', icon: '📊' },
            ].map((item) => (
              <div key={item.step} className="text-center relative">
                <div className="text-6xl mb-4">{item.icon}</div>
                <div className="text-xs text-cyan-400 font-bold tracking-widest mb-2">{item.step}</div>
                <h3 className="text-xl font-semibold text-white mb-2">{item.title}</h3>
                <p className="text-slate-400 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="glass rounded-3xl p-12 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-purple-500/5 to-transparent rounded-3xl" />
            <div className="relative">
              <h2 className="text-4xl font-bold text-white mb-4">
                Ready to get your
                <br />
                <span className="text-gradient">skin assessed?</span>
              </h2>
              <p className="text-slate-400 mb-8">Join thousands of users who trust AllerCheck for early-stage dermatological screening.</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={onGetStarted}
                  className="flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white px-8 py-4 rounded-xl font-semibold transition-all shadow-xl shadow-cyan-500/25"
                >
                  <Brain className="w-5 h-5" />
                  Start Analysis Now
                </button>
              </div>
              <div className="flex items-center justify-center gap-6 mt-8 text-xs text-slate-500">
                {['No account required', 'Results in 2 seconds', 'Privacy-first'].map((item) => (
                  <div key={item} className="flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center">
              <Stethoscope className="w-3 h-3 text-white" />
            </div>
            <span className="text-sm font-semibold text-slate-300">AllerCheck AI</span>
          </div>
          <p className="text-xs text-slate-600 text-center">
            Educational purposes only. Not a substitute for professional medical advice. Always consult a qualified doctor.
          </p>
          <p className="text-xs text-slate-600">© 2026 AllerCheck</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
