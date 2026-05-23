import { motion } from 'framer-motion';
import { Flame, Heart } from 'lucide-react';

function getBadgeLabel(badge) {
  return badge?.name
    ?.split(' ')
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase() || 'BD';
}

export function HeartsDisplay({ hearts }) {
  const empty = hearts <= 0;
  return (
    <div className="flex items-center gap-1.5">
      <Heart
        className={`h-6 w-6 transition-colors ${empty ? 'text-gray-300' : 'text-red-500'}`}
        fill={empty ? 'none' : 'currentColor'}
        strokeWidth={2}
      />
      <span className={`text-sm font-bold tabular-nums ${empty ? 'text-gray-300' : 'text-red-500'}`}>
        {hearts}
      </span>
    </div>
  );
}

export function XPBar({ xp, className = '' }) {
  const level = Math.floor(xp / 100) + 1;
  const progress = (xp % 100) / 100;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-yellow-400 text-xs font-black text-white shadow-sm">
        {level}
      </span>
      <div className="flex-1">
        <div className="h-3.5 overflow-hidden rounded-full border border-gray-200 bg-gray-100">
          <motion.div
            className="h-full rounded-full bg-[#00c896]"
            initial={{ width: 0 }}
            animate={{ width: `${progress * 100}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>
      </div>
      <span className="whitespace-nowrap text-xs font-bold tabular-nums text-gray-400">
        {xp % 100} / 100
      </span>
    </div>
  );
}

export function StreakBadge({ count }) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-warning-100 bg-warning-50 px-4 py-2">
      <Flame className="h-6 w-6 text-warning-500" />
      <div>
        <div className="text-sm font-bold text-warning-600">{count} day streak</div>
        <div className="text-xs text-warning-500">Keep it going!</div>
      </div>
    </div>
  );
}

export function BadgeCard({ badge, earned = false }) {
  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      className={`card p-4 text-center ${earned ? '' : 'grayscale opacity-40'}`}
    >
      <span className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-sm font-bold text-gray-700">
        {getBadgeLabel(badge)}
      </span>
      <div className="text-sm font-semibold text-gray-900">{badge.name}</div>
      <div className="mt-1 text-xs text-gray-500">{badge.description}</div>
      {earned && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="mt-2 text-xs font-medium text-success-500"
        >
          Earned
        </motion.div>
      )}
    </motion.div>
  );
}

export function StatCard({ icon, label, value, color = 'primary' }) {
  const colorMap = {
    primary: 'bg-orange-50 text-orange-600',
    success: 'bg-success-50 text-success-500',
    danger: 'bg-danger-50 text-danger-500',
    warning: 'bg-warning-50 text-warning-500',
  };

  return (
    <div className="card flex items-center gap-4">
      <div className={`flex h-12 w-12 items-center justify-center rounded-xl text-xl ${colorMap[color]}`}>
        {icon}
      </div>
      <div>
        <div className="text-2xl font-bold text-gray-900">{value}</div>
        <div className="text-sm text-gray-500">{label}</div>
      </div>
    </div>
  );
}

export function ProgressRing({ progress, size = 60, strokeWidth = 5, children }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - progress * circumference;

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="rotate-[-90deg]">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#E5E7EB"
          strokeWidth={strokeWidth}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#00c896"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          strokeDasharray={circumference}
        />
      </svg>
      <div className="absolute text-xs font-bold text-gray-700">{children}</div>
    </div>
  );
}
