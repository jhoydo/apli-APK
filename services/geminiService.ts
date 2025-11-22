import { GoogleGenAI, Type, LiveServerMessage, Modality } from "@google/genai";
import { Topic, QuizQuestion } from "../types";
import { arrayBufferToBase64 } from "./audioUtils";

// Helper to ensure we always get a fresh instance with the environment key
const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

/* -------------------------------------------------------------------------- */
/*                               QUIZ GENERATION                              */
/* -------------------------------------------------------------------------- */
export const generateQuizQuestions = async (topic: Topic, difficulty: string): Promise<QuizQuestion[]> => {
  const ai = getAI();
  
  // Using Flash for speed and Search for accuracy
  // Note: When using tools like googleSearch, we cannot use responseMimeType: "application/json"
  // We must ask for JSON in the prompt and parse it manually.
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: `Genera 3 preguntas de trivia educativa sobre ${topic} para niños de nivel ${difficulty}. 
               Asegúrate de que los datos sean reales y verificados.
               Incluye una explicación divertida.
               Responde estrictamente con un array JSON válido con la siguiente estructura, sin markdown ni texto adicional:
               [
                 {
                   "question": "string",
                   "options": ["string", "string", "string", "string"],
                   "correctAnswer": "string",
                   "explanation": "string"
                 }
               ]`,
    config: {
      tools: [{ googleSearch: {} }],
      // responseMimeType and responseSchema are not allowed with googleSearch
    }
  });

  if (response.text) {
    try {
      // Clean up markdown code blocks if present
      let cleanText = response.text.trim();
      if (cleanText.startsWith('```json')) {
        cleanText = cleanText.replace(/^```json/, '').replace(/```$/, '');
      } else if (cleanText.startsWith('```')) {
        cleanText = cleanText.replace(/^```/, '').replace(/```$/, '');
      }
      
      const questions = JSON.parse(cleanText) as QuizQuestion[];
      // Attach search sources if available
      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
      if (chunks) {
         // Just attach the first source to the first question for simplicity in this demo
         const source = chunks.find(c => c.web?.uri);
         if (source && questions.length > 0) {
           questions[0].factSource = source.web?.title;
         }
      }
      return questions;
    } catch (e) {
      console.error("Failed to parse quiz JSON", e);
      return [];
    }
  }
  return [];
};

/* -------------------------------------------------------------------------- */
/*                             IMAGE GENERATION                               */
/* -------------------------------------------------------------------------- */
export const generateEducationalImage = async (
  prompt: string, 
  aspectRatio: "1:1" | "3:4" | "4:3" | "9:16" | "16:9", 
  size: "1K" | "2K" | "4K"
): Promise<string | null> => {
  const ai = getAI();
  
  try {
    // Use Nano Banana Pro (Gemini 3 Pro Image Preview)
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: {
        parts: [{ text: prompt }]
      },
      config: {
        imageConfig: {
          aspectRatio: aspectRatio,
          imageSize: size
        }
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
  } catch (e) {
    console.error("Image gen error", e);
  }
  return null;
};

/* -------------------------------------------------------------------------- */
/*                               IMAGE EDITING                                */
/* -------------------------------------------------------------------------- */
export const editEducationalImage = async (base64Image: string, prompt: string): Promise<string | null> => {
  const ai = getAI();
  
  try {
    // Remove header if present
    const cleanBase64 = base64Image.replace(/^data:image\/(png|jpeg|jpg);base64,/, "");
    
    // Use Gemini 2.5 Flash Image for editing
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: cleanBase64,
              mimeType: 'image/png'
            }
          },
          { text: prompt }
        ]
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
  } catch (e) {
    console.error("Image edit error", e);
  }
  return null;
};

/* -------------------------------------------------------------------------- */
/*                           TUTOR CHAT (THINKING)                            */
/* -------------------------------------------------------------------------- */
export const askTutor = async (
  message: string, 
  history: {role: string, parts: {text: string}[]}[],
  useThinking: boolean
) => {
  const ai = getAI();
  
  // Model selection based on complexity
  const model = 'gemini-3-pro-preview'; // Using 3 pro for best chat exp
  
  const config: any = {
    systemInstruction: "Eres un profesor amable y divertido llamado 'Profesor Banano'. Explicas cosas complejas de forma sencilla para niños."
  };

  if (useThinking) {
    config.thinkingConfig = { thinkingBudget: 32768 }; // Max for Pro
  }

  const chat = ai.chats.create({
    model,
    history: history,
    config
  });

  const result = await chat.sendMessageStream({ message });
  return result;
};

/* -------------------------------------------------------------------------- */
/*                           AUDIO TRANSCRIPTION                              */
/* -------------------------------------------------------------------------- */
export const transcribeAudio = async (audioBase64: string): Promise<string> => {
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          {
             inlineData: {
               mimeType: 'audio/wav', // Assuming wav/webm container from browser
               data: audioBase64
             }
          },
          { text: "Transcribe exactamente lo que se dice en este audio." }
        ]
      }
    });
    return response.text || "";
  } catch (e) {
    console.error("Transcription error", e);
    return "";
  }
};

/* -------------------------------------------------------------------------- */
/*                           LIVE API CONNECTION                              */
/* -------------------------------------------------------------------------- */
export const createLiveSession = async (
  callbacks: {
    onOpen: () => void,
    onMessage: (msg: LiveServerMessage) => void,
    onError: (err: any) => void,
    onClose: () => void
  }
) => {
  const ai = getAI();
  
  return ai.live.connect({
    model: 'gemini-2.5-flash-native-audio-preview-09-2025',
    callbacks: {
      onopen: callbacks.onOpen,
      onmessage: callbacks.onMessage,
      onerror: callbacks.onError,
      onclose: callbacks.onClose,
    },
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Puck' } },
      },
      systemInstruction: "Eres un compañero de estudio entusiasta. Hablas español. Ayudas al niño a practicar pronunciación y respondes preguntas curiosas de forma breve.",
    },
  });
};