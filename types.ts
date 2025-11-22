import { Type } from "@google/genai";

export enum AppMode {
  HOME = 'HOME',
  QUIZ = 'QUIZ',
  ART = 'ART',
  TUTOR = 'TUTOR',
  LIVE = 'LIVE'
}

export enum Topic {
  HISTORY = 'Historia y Personajes',
  GEOGRAPHY = 'Geografía y Capitales',
  BIBLE = 'Historia Bíblica',
  SCIENCE = 'Cuerpo Humano y Animales',
  FLAGS = 'Banderas del Mundo'
}

export interface UserStats {
  name: string;
  level: number;
  xp: number;
  streak: number;
  badges: string[];
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  factSource?: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  isThinking?: boolean;
  sources?: Array<{ uri: string; title: string }>;
}

// Audio Types
export interface AudioConfig {
  sampleRate: number;
  numChannels: number;
}

export interface LiveSessionState {
  isConnected: boolean;
  isSpeaking: boolean;
  volume: number;
}