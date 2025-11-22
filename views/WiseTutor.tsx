import React, { useState, useRef, useEffect } from 'react';
import { askTutor, transcribeAudio } from '../services/geminiService';
import { ChatMessage } from '../types';
import { GenerateContentResponse } from '@google/genai';

export const WiseTutor = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: "¡Hola! Soy el Profesor Banano 🍌. Pregúntame sobre historia, animales o lo que quieras. ¡Si es difícil, pensaré mucho!" }
  ]);
  const [input, setInput] = useState('');
  const [isThinkingMode, setIsThinkingMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [recording, setRecording] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: ChatMessage = { role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      // Prepare history for API
      const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));

      const stream = await askTutor(userMsg.text, history, isThinkingMode);
      
      let fullText = '';
      // Placeholder for streaming message
      setMessages(prev => [...prev, { role: 'model', text: '', isThinking: isThinkingMode }]);

      for await (const chunk of stream) {
        const c = chunk as GenerateContentResponse;
        if (c.text) {
          fullText += c.text;
          setMessages(prev => {
            const newArr = [...prev];
            newArr[newArr.length - 1] = { 
              ...newArr[newArr.length - 1], 
              text: fullText 
            };
            return newArr;
          });
        }
      }
    } catch (e) {
      console.error(e);
      setMessages(prev => [...prev, { role: 'model', text: "Me mareé un poco... ¿puedes repetir eso?" }]);
    } finally {
      setLoading(false);
    }
  };

  const handleMicClick = async () => {
    if (recording) return; // Simple toggle logic handled by media recorder events usually, simplified here
    
    setRecording(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];

      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunks, { type: 'audio/webm' }); // Browser default usually webm/ogg
        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64 = (reader.result as string).split(',')[1];
          setLoading(true);
          const text = await transcribeAudio(base64);
          setInput(text);
          setLoading(false);
        };
        reader.readAsDataURL(blob);
        
        // Stop tracks
        stream.getTracks().forEach(t => t.stop());
      };

      mediaRecorder.start();
      // Record for 5 seconds max for this demo
      setTimeout(() => {
        if (mediaRecorder.state === 'recording') {
           mediaRecorder.stop();
           setRecording(false);
        }
      }, 5000);

    } catch (e) {
      console.error("Mic error", e);
      setRecording(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto h-[calc(100vh-140px)] flex flex-col bg-white rounded-3xl shadow-xl overflow-hidden">
      {/* Header Config */}
      <div className="bg-blue-500 p-4 flex justify-between items-center text-white">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🦉</span>
          <span className="font-bold text-lg">Chat con el Profe</span>
        </div>
        <div className="flex items-center gap-2 bg-blue-600 px-3 py-1 rounded-full">
          <label className="text-xs font-bold cursor-pointer select-none flex items-center gap-2">
            <span>Modo Pensador 🤔</span>
            <input 
              type="checkbox" 
              checked={isThinkingMode} 
              onChange={(e) => setIsThinkingMode(e.target.checked)}
              className="w-4 h-4 accent-yellow-400 rounded"
            />
          </label>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-grow overflow-y-auto p-4 space-y-4 bg-slate-50">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-4 rounded-2xl shadow-sm ${
              msg.role === 'user' 
                ? 'bg-blue-500 text-white rounded-tr-none' 
                : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none'
            }`}>
              {msg.isThinking && idx === messages.length - 1 && loading && (
                 <div className="text-xs text-slate-400 italic mb-1 animate-pulse">Pensando profundamente...</div>
              )}
              <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-slate-100">
        <div className="flex items-center gap-2">
          <button
            onClick={handleMicClick}
            disabled={loading || recording}
            className={`p-3 rounded-full transition ${recording ? 'bg-red-500 text-white animate-pulse' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
          >
            🎤
          </button>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={recording ? "Escuchando..." : "Escribe tu pregunta..."}
            className="flex-grow p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-400"
            disabled={loading}
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="bg-blue-500 hover:bg-blue-600 disabled:bg-slate-300 text-white p-3 rounded-xl transition font-bold"
          >
            Enviar
          </button>
        </div>
      </div>
    </div>
  );
};