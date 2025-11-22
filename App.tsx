import React, { useState } from 'react';
import { HashRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Home } from './views/Home';
import { QuizArena } from './views/QuizArena';
import { ArtStudio } from './views/ArtStudio';
import { WiseTutor } from './views/WiseTutor';
import { LiveConversation } from './views/LiveConversation';
import { AppMode, UserStats } from './types';

interface LayoutProps {
  children: React.ReactNode;
  stats: UserStats;
}

const Layout = ({ children, stats }: LayoutProps) => {
  const location = useLocation();
  
  const navItems = [
    { path: '/', label: '🏠 Inicio', color: 'bg-yellow-400' },
    { path: '/quiz', label: '🧠 Desafío', color: 'bg-purple-400' },
    { path: '/art', label: '🎨 Arte', color: 'bg-pink-400' },
    { path: '/tutor', label: '🦉 Profe', color: 'bg-blue-400' },
    { path: '/live', label: '🗣️ Hablar', color: 'bg-green-400' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-sky-100">
      {/* Top Bar */}
      <header className="bg-white shadow-md p-4 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-3xl">🚀</span>
            <h1 className="text-2xl font-bold text-indigo-600 tracking-tighter">APRENDOM</h1>
          </div>
          
          <div className="flex items-center gap-4 bg-slate-100 px-4 py-2 rounded-full">
             <div className="flex flex-col items-end">
               <span className="text-xs font-bold text-slate-500">NIVEL {stats.level}</span>
               <div className="w-24 h-2 bg-slate-200 rounded-full mt-1">
                 <div 
                   className="h-full bg-green-500 rounded-full transition-all duration-500"
                   style={{ width: `${(stats.xp % 100)}%` }} 
                 />
               </div>
             </div>
             <div className="bg-yellow-400 text-yellow-900 font-bold w-10 h-10 rounded-full flex items-center justify-center border-2 border-yellow-200">
                {stats.level}
             </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow p-4 md:p-6 max-w-5xl mx-auto w-full">
        {children}
      </main>

      {/* Bottom Nav (Mobile Friendly) */}
      <nav className="bg-white border-t p-2 sticky bottom-0 pb-6 md:pb-2">
        <div className="flex justify-around max-w-md mx-auto">
          {navItems.map((item) => (
            <Link 
              key={item.path} 
              to={item.path}
              className={`flex flex-col items-center p-2 rounded-xl transition-transform active:scale-95 ${location.pathname === item.path ? 'bg-slate-100' : ''}`}
            >
              <div className={`w-10 h-10 rounded-full ${item.color} flex items-center justify-center shadow-sm mb-1`}>
                {item.label.split(' ')[0]}
              </div>
              <span className="text-[10px] font-bold text-slate-600 uppercase">{item.label.split(' ')[1] || 'Inicio'}</span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default function App() {
  const [stats, setStats] = useState<UserStats>({
    name: 'Explorador',
    level: 1,
    xp: 0,
    streak: 3,
    badges: []
  });

  const addXp = (amount: number) => {
    setStats(prev => {
      const newXp = prev.xp + amount;
      const newLevel = Math.floor(newXp / 100) + 1;
      return { ...prev, xp: newXp, level: newLevel };
    });
  };

  return (
    <HashRouter>
      <Layout stats={stats}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/quiz" element={<QuizArena onScore={addXp} />} />
          <Route path="/art" element={<ArtStudio />} />
          <Route path="/tutor" element={<WiseTutor />} />
          <Route path="/live" element={<LiveConversation />} />
        </Routes>
      </Layout>
    </HashRouter>
  );
}