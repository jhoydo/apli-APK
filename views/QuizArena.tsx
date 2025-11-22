import React, { useState, useEffect } from 'react';
import { Topic, QuizQuestion } from '../types';
import { generateQuizQuestions } from '../services/geminiService';

export const QuizArena = ({ onScore }: { onScore: (xp: number) => void }) => {
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const startGame = async (topic: Topic) => {
    setSelectedTopic(topic);
    setLoading(true);
    setScore(0);
    setCurrentIndex(0);
    setShowResult(false);
    const qs = await generateQuizQuestions(topic, 'Intermedio');
    setQuestions(qs);
    setLoading(false);
  };

  const handleAnswer = (option: string) => {
    if (selectedAnswer) return; // Prevent double click
    setSelectedAnswer(option);
    
    const currentQ = questions[currentIndex];
    if (option === currentQ.correctAnswer) {
      setScore(s => s + 1);
      setFeedback("¡Correcto! 🎉");
      onScore(10);
    } else {
      setFeedback(`¡Ups! La respuesta era: ${currentQ.correctAnswer}`);
    }

    setTimeout(() => {
      if (currentIndex < questions.length - 1) {
        setCurrentIndex(prev => prev + 1);
        setSelectedAnswer(null);
        setFeedback(null);
      } else {
        setShowResult(true);
      }
    }, 2500);
  };

  if (!selectedTopic) {
    return (
      <div className="max-w-2xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-8 text-purple-700">Elige tu Aventura</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Object.values(Topic).map((t) => (
            <button
              key={t}
              onClick={() => startGame(t)}
              className="bg-white border-b-4 border-slate-200 active:border-b-0 active:translate-y-1 hover:bg-purple-50 p-6 rounded-2xl text-lg font-bold text-slate-700 shadow-sm transition-all"
            >
              {t}
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
        <p className="text-lg font-medium text-purple-600 animate-pulse">Generando desafío con IA...</p>
      </div>
    );
  }

  if (showResult) {
    return (
      <div className="bg-white rounded-3xl p-8 shadow-xl text-center max-w-md mx-auto">
        <div className="text-6xl mb-4">🏆</div>
        <h2 className="text-3xl font-black text-slate-800 mb-2">¡Juego Terminado!</h2>
        <p className="text-xl text-slate-600 mb-6">Puntuación: {score} / {questions.length}</p>
        <button 
          onClick={() => setSelectedTopic(null)}
          className="w-full bg-purple-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-purple-700 transition-colors"
        >
          Jugar de nuevo
        </button>
      </div>
    );
  }

  const currentQ = questions[currentIndex];
  if (!currentQ) return <div>Error al cargar.</div>;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
        {/* Progress */}
        <div className="bg-slate-100 h-2 w-full">
          <div className="bg-purple-500 h-full transition-all duration-500" style={{width: `${((currentIndex + 1) / questions.length) * 100}%`}}></div>
        </div>

        <div className="p-8">
          {/* Question Info */}
          <div className="flex justify-between text-sm font-bold text-slate-400 mb-4">
            <span>PREGUNTA {currentIndex + 1} DE {questions.length}</span>
            {currentQ.factSource && (
              <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">Fuente: {currentQ.factSource}</span>
            )}
          </div>

          <h3 className="text-2xl font-bold text-slate-800 mb-8">{currentQ.question}</h3>

          <div className="space-y-3">
            {currentQ.options.map((opt, idx) => (
              <button
                key={idx}
                onClick={() => handleAnswer(opt)}
                disabled={!!selectedAnswer}
                className={`w-full p-4 rounded-xl text-left font-semibold text-lg transition-all border-2
                  ${selectedAnswer === opt 
                    ? (opt === currentQ.correctAnswer ? 'bg-green-100 border-green-500 text-green-800' : 'bg-red-100 border-red-500 text-red-800')
                    : 'bg-slate-50 border-transparent hover:bg-slate-100 hover:border-purple-200'
                  }
                  ${!!selectedAnswer && opt === currentQ.correctAnswer ? 'bg-green-100 border-green-500 text-green-800' : ''}
                `}
              >
                {opt}
              </button>
            ))}
          </div>

          {/* Explanation / Feedback Area */}
          {feedback && (
            <div className={`mt-6 p-4 rounded-xl animate-bounce-in ${selectedAnswer === currentQ.correctAnswer ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              <p className="font-bold text-lg mb-1">{feedback}</p>
              <p className="text-sm opacity-90">{currentQ.explanation}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};