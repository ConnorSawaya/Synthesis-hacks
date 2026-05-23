import { useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Medal, Star, Users, Globe, BookOpen, Flame } from 'lucide-react';

const MOCK_LEADERBOARD = [
  { id: 1, name: 'TradeMaster99', xp: 2450, streak: 15, avatar: 'TM' },
  { id: 2, name: 'StockKid42', xp: 2100, streak: 12, avatar: 'SK' },
  { id: 3, name: 'InvestorJr', xp: 1890, streak: 20, avatar: 'IJ' },
  { id: 4, name: 'WallStWiz', xp: 1750, streak: 8, avatar: 'WW' },
  { id: 5, name: 'BullRunBoy', xp: 1600, streak: 5, avatar: 'BB' },
  { id: 6, name: 'PennyWise22', xp: 1520, streak: 11, avatar: 'PW' },
  { id: 7, name: 'ChartChamp', xp: 1400, streak: 7, avatar: 'CC' },
  { id: 8, name: 'DiviDreamer', xp: 1280, streak: 9, avatar: 'DD' },
  { id: 9, name: 'GreenTrader', xp: 1150, streak: 4, avatar: 'GT' },
  { id: 10, name: 'SafeInvestor', xp: 1050, streak: 6, avatar: 'SI' },
];

const RANK_ICONS = [
  <Trophy className="h-5 w-5 text-yellow-500" />,
  <Medal className="h-5 w-5 text-gray-400" />,
  <Medal className="h-5 w-5 text-amber-600" />,
];

export default function Leaderboard() {
  const [tab, setTab] = useState('global');

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="mb-4 text-2xl font-bold text-gray-900">Leaderboard</h1>

      <div className="mb-6 flex gap-1 rounded-lg bg-gray-100 p-1">
        {[
          { id: 'global', label: 'Global', icon: Globe },
          { id: 'friends', label: 'Friends', icon: Users },
          { id: 'classroom', label: 'Classroom', icon: BookOpen },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex flex-1 items-center justify-center gap-2 rounded-md py-2.5 text-sm font-semibold capitalize transition-colors ${
              tab === id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      <div className="mb-8 flex items-end justify-center gap-4">
        {[1, 0, 2].map((rank) => {
          const user = MOCK_LEADERBOARD[rank];
          const isFirst = rank === 0;
          return (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: rank * 0.1 }}
              className="text-center"
            >
              <div
                className={`mx-auto mb-2 flex h-16 w-16 items-center justify-center rounded-2xl text-lg font-bold ${
                  isFirst ? 'border-2 border-yellow-300 bg-yellow-50' : 'border border-gray-200 bg-gray-50'
                }`}
              >
                {user.avatar}
              </div>
              <div className="max-w-[100px] truncate text-sm font-bold text-gray-900">{user.name}</div>
              <div className="text-xs text-gray-500">{user.xp} XP</div>
              <div
                className={`mt-2 mx-auto flex w-20 items-center justify-center rounded-t-lg text-sm font-bold text-white ${
                  isFirst ? 'h-20 bg-yellow-400' : rank === 1 ? 'h-14 bg-gray-300' : 'h-10 bg-amber-600'
                }`}
              >
                #{rank + 1}
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="card">
        <div className="space-y-1">
          {MOCK_LEADERBOARD.map((user, index) => (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.03 }}
              className={`flex items-center gap-3 rounded-lg p-3 ${index < 3 ? 'bg-gray-50' : ''}`}
            >
              <div className="w-8 text-center text-sm font-bold text-gray-400">
                {index < 3 ? RANK_ICONS[index] : `#${index + 1}`}
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-sm font-bold text-gray-700">
                {user.avatar}
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold text-gray-900">{user.name}</div>
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Flame className="h-3 w-3 text-orange-500" />
                  {user.streak} day streak
                </div>
              </div>
              <div className="flex items-center gap-1 text-sm font-bold text-orange-600">
                <Star className="h-4 w-4" />
                {user.xp}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="card mt-4 border-orange-200 bg-orange-50">
        <div className="flex items-center gap-3">
          <div className="w-8 text-center text-sm font-bold text-orange-500">#42</div>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 text-sm font-bold text-orange-700">
            YOU
          </div>
          <div className="flex-1">
            <div className="text-sm font-semibold text-gray-900">You</div>
            <div className="text-xs text-gray-500">Keep learning to climb!</div>
          </div>
          <div className="flex items-center gap-1 text-sm font-bold text-orange-600">
            <Star className="h-4 w-4" />
            0
          </div>
        </div>
      </div>
    </div>
  );
}
