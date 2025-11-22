import React, { useState, PropsWithChildren } from 'react';
import { HashRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Home } from './views/Home';
import { QuizArena } from './views/QuizArena';
import { ArtStudio } from './views/ArtStudio';
import { WiseTutor } from './views/WiseTutor';
import { LiveConversation } from './views/LiveConversation';
import { AppMode, UserStats } from './types';

interface LayoutProps {
  stats: UserStats;
}

const Layout = ({ children, stats }: PropsWithChildren<LayoutProps>) => {
  const location = useLocation();
  
  const navItems = [
    { path: '/', label: '🏠 Inicio', color: 'bg-yellow-400' },
    { path: '/quiz', label: '🧠 Desafío', color: 'bg-purple-400' },
    { path: '/art', label: '🎨 Arte', color: 'bg-pink-400' },
    { path: '/tutor', label: '🦉 Profe', color: 'bg-blue-400' },
    { path: '/live', label: '🗣️ Hablar', color: 'bg-green-400' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-blue-950 text-slate-100">
      {/* Top Bar */}
      <header className="bg-blue-900/90 backdrop-blur shadow-lg border-b border-blue-800 p-4 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-3xl">🚀</span>
            <h1 className="text-2xl font-bold text-yellow-400 tracking-tighter">APRENDOM</h1>
          </div>
          
          <div className="flex items-center gap-4 bg-blue-800/50 px-4 py-2 rounded-full border border-blue-700">
             <div className="flex flex-col items-end">
               <span className="text-xs font-bold text-blue-200">NIVEL {stats.level}</span>
               <div className="w-24 h-2 bg-blue-900 rounded-full mt-1">
                 <div 
                   className="h-full bg-green-400 rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(74,222,128,0.5)]"
                   style={{ width: `${(stats.xp % 100)}%` }} 
                 />
               </div>
             </div>
             <div className="bg-yellow-400 text-yellow-900 font-bold w-10 h-10 rounded-full flex items-center justify-center border-2 border-yellow-200 shadow-lg">
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
      <nav className="bg-blue-900 border-t border-blue-800 p-2 sticky bottom-0 pb-6 md:pb-2 shadow-2xl">
        <div className="flex justify-around max-w-md mx-auto">
          {navItems.map((item) => (
            <Link 
              key={item.path} 
              to={item.path}
              className={`flex flex-col items-center p-2 rounded-xl transition-all active:scale-95 ${location.pathname === item.path ? 'bg-blue-800' : ''}`}
            >
              <div className={`w-10 h-10 rounded-full ${item.color} flex items-center justify-center shadow-lg mb-1 text-slate-900 text-lg`}>
                {item.label.split(' ')[0]}
              </div>
              <span className={`text-[10px] font-bold uppercase ${location.pathname === item.path ? 'text-white' : 'text-blue-300'}`}>
                {item.label.split(' ')[1] || 'Inicio'}
              </span>
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