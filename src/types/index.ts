export type NavigationState = 'AUTH' | 'ONBOARDING' | 'CHAT' | 'SETTINGS';

export interface UserSession {
  id: string;
  email: string;
  nickname?: string;
  created_at: string;
}

export type CompanionGender = 'male' | 'female';

export interface CompanionProfile {
  id: string;
  user_id: string;
  name: string;
  gender: CompanionGender;
  traits: string[];
  avatar: string;
  user_nickname: string;
  created_at: string;
  updated_at: string;
}

export type TypingSpeedPreference = 'realistic' | 'natural' | 'instant';

export interface ChatMessage {
  id: string;
  user_id: string;
  sender: 'user' | 'companion';
  content: string;
  media_url?: string; // Encrypted base64 data URL or external verified image URL
  sticker_url?: string; // Cute animated transparent sticker URL
  message_type?: 'text' | 'sticker' | 'image';
  created_at: string;
  is_error?: boolean;
  status?: 'sent' | 'read';
}

export interface SharedMediaItem {
  id: string;
  type: 'image' | 'link';
  url: string;
  title?: string;
  created_at: string;
}

export interface ApiFailoverStatus {
  keyId: string;
  name: string;
  failedAt: number;
  cooldownUntil: number;
  lastError?: string;
}
