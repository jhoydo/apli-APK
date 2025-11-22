import React from 'react';
import { Link } from 'react-router-dom';

const FeatureCard = ({ to, color, icon, title, desc }: { to: string, color: string, icon: string, title: string, desc: string }) => (
  <Link to={to} className="block group">
    <div className={`h-full ${color} rounded-3xl p-6 shadow-lg transform transition hover:scale-105 hover:rotate-1`}>
      <div className="bg-white/30 w-16 h-16 rounded-2xl flex items-center justify-center text-4xl mb-4 backdrop-blur-sm">
        {icon}
      </div>
      <h3 className="text-2xl font-black text-white mb-2">{title}</h3>
      <p className="text-white/90 font-medium leading-snug">{desc}</p>
    </div>
  </Link>
);

export const Home = () => {
  return (
    <div className="space-y-8">
      <div className="text-center space-y-4 mt-4">
        <h2 className="text-4xl md:text-5xl font-black text-indigo-600">¡Hola, Explorador! 👋</h2>
        <p className="text-xl text-slate-600 font-medium">¿Qué quieres descubrir hoy?</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FeatureCard 
          to="/quiz" 
          color="bg-gradient-to-br from-purple-500 to-indigo-600" 
          icon="🧠" 
          title="Desafío Trivia"
          desc="Pon a prueba tus conocimientos sobre geografía, historia y ciencia."
        />
        <FeatureCard 
          to="/art" 
          color="bg-gradient-to-br from-pink-500 to-rose-500" 
          icon="🎨" 
          title="Estudio de Arte"
          desc="Crea dibujos increíbles y edítalos con tus palabras mágicas."
        />
        <FeatureCard 
          to="/tutor" 
          color="bg-gradient-to-br from-blue-400 to-cyan-500" 
          icon="🦉" 
          title="Profesor Banano"
          desc="Pregunta cualquier cosa. ¡Puedo pensar mucho para respuestas difíciles!"
        />
        <FeatureCard 
          to="/live" 
          color="bg-gradient-to-br from-green-400 to-emerald-600" 
          icon="🗣️" 
          title="Conversación en Vivo"
          desc="Habla conmigo en tiempo real. Practiquemos tu pronunciación."
        />
      </div>

      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
        <h3 className="text-xl font-bold text-slate-700 mb-4">Tus Logros 🏆</h3>
        <div className="flex gap-4 overflow-x-auto pb-2">
           {[1,2,3].map(i => (
             <div key={i} className="flex-shrink-0 w-24 h-24 bg-yellow-100 rounded-2xl flex flex-col items-center justify-center text-yellow-700 border-2 border-yellow-200 grayscale opacity-50">
               <span className="text-3xl mb-1">🥇</span>
               <span className="text-xs font-bold">Nivel {i*5}</span>
             </div>
           ))}
        </div>
      </div>
    </div>
  );
};