import { useState } from 'react';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import Sidebar from './components/Sidebar';
import type { PageKey } from './components/Sidebar';
import DashboardPage from './pages/DashboardPage';
import SkinAnalysisPage from './pages/SkinAnalysisPage';
import AllergyPredictorPage from './pages/AllergyPredictorPage';
import AIChatPage from './pages/AIChatPage';
import ReportsPage from './pages/ReportsPage';
import InfoPage from './pages/InfoPage';
import type { HistoryItem } from './components/HistoryPanel';

type AppView = 'landing' | 'login' | 'dashboard';

function App() {
  const [appView, setAppView] = useState<AppView>('landing');
  const [activePage, setActivePage] = useState<PageKey>('dashboard');
  const [userEmail, setUserEmail] = useState<string>('guest@allercheck.ai');
  const [history, setHistory] = useState<HistoryItem[]>([]);

  const handleLogin = (email: string) => {
    setUserEmail(email);
    setAppView('dashboard');
    setActivePage('dashboard');
  };

  const handleGuestLogin = () => {
    setUserEmail('guest@allercheck.ai');
    setAppView('dashboard');
    setActivePage('dashboard');
  };

  const handleLogout = () => {
    setAppView('landing');
    setActivePage('dashboard');
  };

  const handleGetStarted = () => {
    // Go directly to dashboard as guest
    handleGuestLogin();
  };

  if (appView === 'landing') {
    return (
      <LandingPage
        onGetStarted={handleGetStarted}
        onLogin={() => setAppView('login')}
      />
    );
  }

  if (appView === 'login') {
    return (
      <LoginPage
        onLogin={handleLogin}
        onGuestLogin={handleGuestLogin}
        onBack={() => setAppView('landing')}
      />
    );
  }

  // Dashboard layout
  return (
    <div className="flex min-h-screen bg-[#0a0a0f]">
      <Sidebar
        activePage={activePage}
        onNavigate={setActivePage}
        userEmail={userEmail}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <main className="flex-1 ml-[190px] min-h-screen overflow-y-auto scrollbar-thin">
        {activePage === 'dashboard' && (
          <DashboardPage onNavigate={setActivePage} userEmail={userEmail} />
        )}
        {activePage === 'skin-analysis' && (
          <SkinAnalysisPage history={history} setHistory={setHistory} />
        )}
        {activePage === 'allergy-predictor' && (
          <AllergyPredictorPage />
        )}
        {activePage === 'ai-chat' && (
          <AIChatPage />
        )}
        {activePage === 'reports' && (
          <ReportsPage history={history} setHistory={setHistory} onNavigate={setActivePage} />
        )}
        {activePage === 'info' && (
          <InfoPage />
        )}
      </main>
    </div>
  );
}

export default App;
