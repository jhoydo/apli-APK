import React, { useState, useRef } from 'react';
import { generateEducationalImage, editEducationalImage } from '../services/geminiService';

export const ArtStudio = () => {
  const [prompt, setPrompt] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'GENERATE' | 'EDIT'>('GENERATE');
  
  // Configs
  const [aspectRatio, setAspectRatio] = useState<"1:1" | "4:3" | "16:9">("1:1");
  const [size, setSize] = useState<"1K" | "2K">("1K");

  // File input ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleGenerate = async () => {
    if (!prompt) return;
    setLoading(true);
    const result = await generateEducationalImage(prompt, aspectRatio, size);
    if (result) {
      setImage(result);
    }
    setLoading(false);
  };

  const handleEdit = async () => {
    if (!prompt || !image) return;
    setLoading(true);
    const result = await editEducationalImage(image, prompt);
    if (result) {
      setImage(result);
    }
    setLoading(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setMode('EDIT');
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header & Mode Toggle */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h2 className="text-3xl font-black text-pink-600">Estudio de Arte Mágico 🎨</h2>
        <div className="bg-white p-1 rounded-xl shadow-sm inline-flex">
          <button 
            onClick={() => setMode('GENERATE')}
            className={`px-4 py-2 rounded-lg font-bold text-sm transition ${mode === 'GENERATE' ? 'bg-pink-500 text-white' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            ✨ Crear Nuevo
          </button>
          <button 
            onClick={() => setMode('EDIT')}
            className={`px-4 py-2 rounded-lg font-bold text-sm transition ${mode === 'EDIT' ? 'bg-pink-500 text-white' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            🪄 Editar Imagen
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Controls Panel */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white p-6 rounded-3xl shadow-md space-y-4">
            {mode === 'GENERATE' && (
              <>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase block mb-2">Forma (Aspect Ratio)</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['1:1', '4:3', '16:9'].map((r) => (
                      <button 
                        key={r}
                        onClick={() => setAspectRatio(r as any)}
                        className={`py-2 rounded-lg text-sm font-bold border-2 ${aspectRatio === r ? 'border-pink-500 bg-pink-50 text-pink-700' : 'border-slate-100 text-slate-500'}`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase block mb-2">Calidad</label>
                  <div className="flex gap-2">
                     {['1K', '2K'].map((s) => (
                      <button 
                        key={s}
                        onClick={() => setSize(s as any)}
                        className={`flex-1 py-2 rounded-lg text-sm font-bold border-2 ${size === s ? 'border-pink-500 bg-pink-50 text-pink-700' : 'border-slate-100 text-slate-500'}`}
                      >
                        {s}
                      </button>
                     ))}
                  </div>
                </div>
              </>
            )}

            {mode === 'EDIT' && !image && (
               <div 
                 onClick={() => fileInputRef.current?.click()}
                 className="border-dashed border-4 border-slate-200 rounded-2xl h-32 flex items-center justify-center cursor-pointer hover:bg-slate-50 transition"
               >
                  <div className="text-center text-slate-400">
                    <span className="text-2xl block mb-1">📂</span>
                    <span className="font-bold text-sm">Subir Foto</span>
                  </div>
                  <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" className="hidden" />
               </div>
            )}

            <div>
              <label className="text-xs font-bold text-slate-400 uppercase block mb-2">
                {mode === 'GENERATE' ? 'Describe tu imaginación' : '¿Qué cambiamos?'}
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={mode === 'GENERATE' ? "Un dinosaurio astronauta en la luna..." : "Ponle un sombrero, quita el fondo..."}
                className="w-full p-3 bg-slate-50 rounded-xl border-2 border-slate-200 focus:border-pink-400 outline-none resize-none h-32 font-medium text-slate-700"
              />
            </div>

            <button
              onClick={mode === 'GENERATE' ? handleGenerate : handleEdit}
              disabled={loading || !prompt || (mode === 'EDIT' && !image)}
              className="w-full bg-pink-500 hover:bg-pink-600 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl shadow-lg shadow-pink-200 transition-all active:scale-95"
            >
              {loading ? '✨ Trabajando la magia...' : (mode === 'GENERATE' ? '🎨 Dibujar' : '🪄 Transformar')}
            </button>
          </div>
        </div>

        {/* Canvas / Result Area */}
        <div className="lg:col-span-2">
          <div className="bg-slate-800 rounded-3xl h-[500px] flex items-center justify-center overflow-hidden shadow-inner relative group">
            {image ? (
              <>
                 <img src={image} alt="Generated art" className="w-full h-full object-contain" />
                 {mode === 'EDIT' && (
                    <button 
                      onClick={() => setImage(null)} 
                      className="absolute top-4 right-4 bg-black/50 text-white p-2 rounded-full hover:bg-red-500 transition opacity-0 group-hover:opacity-100"
                    >
                      ✖️
                    </button>
                 )}
              </>
            ) : (
              <div className="text-center text-white/20">
                <div className="text-6xl mb-4">🖼️</div>
                <p className="font-bold text-xl">Tu lienzo está vacío</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};