import React, { useEffect, useRef, useState } from 'react';
import { createLiveSession } from '../services/geminiService';
import { LiveServerMessage } from '@google/genai';
import { decodeAudioData, arrayBufferToBase64, base64ToUint8Array } from '../services/audioUtils';

export const LiveConversation = () => {
  const [connected, setConnected] = useState(false);
  const [status, setStatus] = useState('Listo para hablar');
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Audio Contexts
  const inputCtxRef = useRef<AudioContext | null>(null);
  const outputCtxRef = useRef<AudioContext | null>(null);
  
  // Refs for cleanup
  const sessionPromiseRef = useRef<Promise<any> | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  const startSession = async () => {
    setStatus('Conectando...');
    
    try {
      // 1. Setup Audio Contexts
      const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const outputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      
      inputCtxRef.current = inputCtx;
      outputCtxRef.current = outputCtx;

      // 2. Get Microphone Stream
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // 3. Initialize Live API
      const sessionPromise = createLiveSession({
        onOpen: () => {
          setConnected(true);
          setStatus('¡En línea! Habla conmigo.');
          
          // Stream Input Audio
          const source = inputCtx.createMediaStreamSource(stream);
          // Use ScriptProcessor for simplicity in single-file React (AudioWorklet requires separate file/url)
          const processor = inputCtx.createScriptProcessor(4096, 1, 1);
          
          processor.onaudioprocess = (e) => {
            const inputData = e.inputBuffer.getChannelData(0);
            // Convert Float32 to PCM 16-bit
            const pcmData = new Int16Array(inputData.length);
            for (let i = 0; i < inputData.length; i++) {
              pcmData[i] = inputData[i] * 32768;
            }
            
            // Send
            const base64 = arrayBufferToBase64(pcmData.buffer);
            
            if (sessionPromiseRef.current) {
              sessionPromiseRef.current.then(session => {
                 session.sendRealtimeInput({
                   media: {
                     mimeType: 'audio/pcm;rate=16000',
                     data: base64
                   }
                 });
              });
            }
          };
          
          source.connect(processor);
          processor.connect(inputCtx.destination);
        },
        onMessage: async (msg: LiveServerMessage) => {
            // Handle Audio Output
            const base64Audio = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (base64Audio && outputCtxRef.current) {
               const ctx = outputCtxRef.current;
               const bytes = base64ToUint8Array(base64Audio);
               
               // Decode custom raw PCM
               const audioBuffer = await decodeAudioData(bytes, ctx, 24000, 1);
               
               // Schedule playback
               nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
               
               const source = ctx.createBufferSource();
               source.buffer = audioBuffer;
               source.connect(ctx.destination);
               source.start(nextStartTimeRef.current);
               
               nextStartTimeRef.current += audioBuffer.duration;
               sourcesRef.current.add(source);
               
               source.onended = () => sourcesRef.current.delete(source);
            }

            if (msg.serverContent?.interrupted) {
               sourcesRef.current.forEach(s => s.stop());
               sourcesRef.current.clear();
               nextStartTimeRef.current = 0;
            }
        },
        onError: (err) => {
          console.error(err);
          setStatus("Error de conexión");
          setConnected(false);
        },
        onClose: () => {
          setConnected(false);
          setStatus("Desconectado");
        }
      });
      
      sessionPromiseRef.current = sessionPromise;

    } catch (e) {
      console.error(e);
      setStatus('Error al iniciar (Microfono requerido)');
    }
  };

  const stopSession = () => {
    if (sessionPromiseRef.current) {
       sessionPromiseRef.current.then(s => s.close());
    }
    if (inputCtxRef.current) inputCtxRef.current.close();
    if (outputCtxRef.current) outputCtxRef.current.close();
    setConnected(false);
    setStatus("Finalizado");
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopSession();
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-full p-4 space-y-8">
       <div className="text-center space-y-2">
          <h2 className="text-3xl font-black text-green-600">Sala de Conversación</h2>
          <p className="text-slate-500 text-lg">Practica hablando con la IA más rápida</p>
       </div>

       <div className={`w-64 h-64 rounded-full flex items-center justify-center transition-all duration-500 ${connected ? 'bg-green-100 shadow-[0_0_60px_rgba(74,222,128,0.4)] scale-110' : 'bg-slate-100'}`}>
          <div className={`text-8xl transition-transform ${connected ? 'animate-bounce' : ''}`}>
             {connected ? '🎙️' : '🔇'}
          </div>
       </div>

       <div className="text-xl font-bold text-slate-600 animate-pulse">
         {status}
       </div>

       <button
         onClick={connected ? stopSession : startSession}
         className={`px-8 py-4 rounded-2xl text-xl font-bold text-white shadow-lg transition-all active:scale-95 ${connected ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}`}
       >
         {connected ? 'Colgar Llamada' : 'Comenzar Llamada'}
       </button>

       <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-xl max-w-md text-sm text-yellow-800">
         <span className="font-bold">Tip:</span> Usa audífonos para la mejor experiencia. Habla claro y pregunta sobre el mundo.
       </div>
    </div>
  );
};