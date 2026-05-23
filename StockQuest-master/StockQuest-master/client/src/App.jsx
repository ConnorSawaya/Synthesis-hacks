import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useStore } from './store/useStore';
import Navbar from './components/Navbar';
import SignIn from './pages/SignIn';
import Dashboard from './pages/Dashboard';
import LessonsPage from './pages/LessonsPage';
import LessonScreen from './pages/LessonScreen';
import TradingSimulator from './pages/TradingSimulator';
import Leaderboard from './pages/Leaderboard';
import Profile from './pages/Profile';
import SettingsPage from './pages/SettingsPage';
import ParentalDashboard from './pages/ParentalDashboard';
import MarketChallenge from './pages/MarketChallenge';

function AppLayout({ children }) {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="px-4 pb-24 pt-20 md:ml-72 md:px-10 md:pb-10 md:pt-8">{children}</main>
    </div>
  );
}

function LevelGate({ minLevel, children }) {
  const { xp, adminMode } = useStore();
  const level = Math.floor(xp / 100) + 1;

  if (level < minLevel && !adminMode) return <Navigate to="/" replace />;

  return children;
}

export default function App() {
  const { user, tickHeartRefill } = useStore();

  useEffect(() => {
    const id = setInterval(tickHeartRefill, 30_000);
    tickHeartRefill();
    return () => clearInterval(id);
  }, [tickHeartRefill]);

  if (!user) {
    return (
      <Routes>
        <Route path="/" element={<Navigate to="/signin" replace />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="*" element={<Navigate to="/signin" replace />} />
      </Routes>
    );
  }

  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/challenge" element={<MarketChallenge />} />
        <Route path="/challenge/:challengeId" element={<MarketChallenge />} />
        <Route path="/lessons" element={<LessonsPage />} />
        <Route path="/lessons/:lessonId" element={<LessonScreen />} />
        <Route
          path="/trade"
          element={
            <LevelGate minLevel={2}>
              <TradingSimulator />
            </LevelGate>
          }
        />
        <Route
          path="/leaderboard"
          element={
            <LevelGate minLevel={3}>
              <Leaderboard />
            </LevelGate>
          }
        />
        <Route path="/profile" element={<Profile />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/parental" element={<ParentalDashboard />} />
        <Route path="*" element={<Dashboard />} />
      </Routes>
    </AppLayout>
  );
}
