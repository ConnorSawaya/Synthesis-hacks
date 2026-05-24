import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { User, Bell, Shield, ChevronRight, Gauge, LogOut } from 'lucide-react';

function getInitials(name) {
  if (!name) return 'ST';

  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('');
}

export default function SettingsPage() {
  const { user, difficulty, setDifficulty, notifications, setNotifications, logout } = useStore();
  const navigate = useNavigate();
  const isDemoMode = Boolean(user?.demoMode || user?.email === 'demo@stockpilot.app');

  const handleLogout = () => {
    logout();
    navigate('/signin', { replace: true });
  };

  const Section = ({ title, icon: Icon, children }) => (
    <div className="card mb-4">
      <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-900">
        <Icon className="h-5 w-5 text-orange-500" />
        {title}
      </h2>
      {children}
    </div>
  );

  const Toggle = ({ label, description, value, onChange }) => (
    <div className="flex items-center justify-between border-b border-gray-100 py-3 last:border-0">
      <div>
        <div className="text-sm font-medium text-gray-900">{label}</div>
        {description && <div className="text-xs text-gray-500">{description}</div>}
      </div>
      <button
        onClick={() => onChange(!value)}
        className={`relative h-6 w-11 rounded-full transition-colors ${value ? 'bg-orange-500' : 'bg-gray-300'}`}
      >
        <span
          className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${value ? 'translate-x-5' : ''}`}
        />
      </button>
    </div>
  );

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-2 text-2xl font-bold text-gray-900">Settings</h1>
      <p className="mb-6 text-sm leading-6 text-gray-500">
        Keep your account preferences here so the main student experience stays focused on learning.
      </p>

      <Section title="Account" icon={User}>
        <div className="flex items-center gap-4 border-b border-gray-100 py-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-orange-100 text-lg font-bold text-orange-700">
            {getInitials(user?.name)}
          </div>
          <div className="flex-1">
            <div className="font-semibold text-gray-900">{user?.name || 'Stock Trader'}</div>
            <div className="text-sm text-gray-500">{user?.email || 'student@example.com'}</div>
          </div>
          <Link to="/profile" className="btn-secondary px-4 py-2 text-sm">Back to Profile</Link>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="mt-4 inline-flex items-center gap-2 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-2 text-sm font-semibold text-gray-900 transition hover:bg-gray-100"
        >
          <LogOut className="h-4 w-4 text-orange-500" />
          {isDemoMode ? 'Leave demo mode' : 'Log out'}
        </button>
      </Section>

      <Section title="Difficulty" icon={Gauge}>
        <div className="grid grid-cols-3 gap-3">
          {['beginner', 'intermediate', 'advanced'].map((level) => (
            <button
              key={level}
              onClick={() => setDifficulty(level)}
              className={`rounded-xl border-2 p-3 text-center capitalize transition-colors ${
                difficulty === level
                  ? 'border-orange-500 bg-orange-50 text-orange-700'
                  : 'border-gray-200 text-gray-600 hover:border-gray-300'
              }`}
            >
              <div className="mb-1 text-2xl">{level === 'beginner' ? '1' : level === 'intermediate' ? '2' : '3'}</div>
              <div className="text-sm font-semibold">{level}</div>
            </button>
          ))}
        </div>
        <p className="mt-3 text-xs text-gray-400">
          {difficulty === 'beginner' && 'Guided hints, simpler choices, and a calmer first trading experience.'}
          {difficulty === 'intermediate' && 'Fewer hints, standard pacing, and more independence.'}
          {difficulty === 'advanced' && 'Less guidance and more independent decision-making.'}
        </p>
      </Section>

      <Section title="Notifications" icon={Bell}>
        <Toggle
          label="Push Notifications"
          description="Daily reminders and learning alerts"
          value={notifications}
          onChange={setNotifications}
        />
        <Toggle
          label="Streak Reminders"
          description="Get reminded to keep your streak alive"
          value={true}
          onChange={() => {}}
        />
        <Toggle
          label="Weekly Reports"
          description="Receive weekly progress summaries"
          value={true}
          onChange={() => {}}
        />
      </Section>

      <Section title="Parental Controls" icon={Shield}>
        <Link to="/parental" className="btn-secondary inline-flex items-center gap-1 text-sm">
          Open Parental Dashboard <ChevronRight className="h-4 w-4" />
        </Link>
      </Section>
    </div>
  );
}
