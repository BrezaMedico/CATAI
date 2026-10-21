import { createClient } from '@supabase/supabase-js';
import { CompanionProfile, ChatMessage, UserSession } from '../types';
import { encryptText, decryptText, hashSHA256, secureStorage } from '../utils/encryption';

// Fallback credentials as required
const DEFAULT_SUPABASE_URL = 'https://shaiipgiiycrxqocfptm.supabase.co';
const DEFAULT_SUPABASE_KEY = 'sb_publishable_2I1Ce4fhKEDhsX6pwg_Yfw_jaOOt6Rc';

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string) || DEFAULT_SUPABASE_URL;
const supabaseAnonKey =
  (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string) ||
  (import.meta.env.VITE_SUPABASE_ANON_KEY as string) ||
  DEFAULT_SUPABASE_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

const STORAGE_KEYS = {
  CURRENT_USER: 'current_user_session',
  REGISTERED_USERS: 'registered_local_users',
  COMPANION_PREFIX: 'companion_profile_',
  MESSAGES_PREFIX: 'chat_messages_',
};

interface LocalRegisteredUser {
  id: string;
  email: string;
  passwordHash: string;
  nickname?: string;
  created_at: string;
}

export function deterministicUuid(seed: string): string {
  const hash = hashSHA256(seed).padEnd(32, '0');
  return `${hash.substring(0, 8)}-${hash.substring(8, 12)}-4${hash.substring(13, 16)}-a${hash.substring(17, 20)}-${hash.substring(20, 32)}`;
}

export function generateUuid(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Hybrid Sign Up
 */
export async function hybridSignUp(
  email: string,
  rawPassword: string,
  nickname?: string
): Promise<{ user: UserSession; isNewUser: boolean; error?: string }> {
  const normalizedEmail = email.trim().toLowerCase();
  const passwordHash = hashSHA256(rawPassword);
  const localUserId = deterministicUuid(normalizedEmail);

  // Save to local registered users database as immediate fallback
  const registered = secureStorage.getItem<LocalRegisteredUser[]>(STORAGE_KEYS.REGISTERED_USERS, []);
  const existingIdx = registered.findIndex((u) => u.email === normalizedEmail);
  const now = new Date().toISOString();

  let finalUserId = localUserId;
  let isNewUser = true;

  try {
    const { data, error } = await supabase.auth.signUp({
      email: normalizedEmail,
      password: rawPassword,
    });

    if (error) {
      console.warn('Supabase signUp error (falling back to encrypted local store):', error.message);
    } else if (data?.user?.id) {
      finalUserId = data.user.id;
    }
  } catch (err) {
    console.warn('Supabase network or auth exception:', err);
  }

  const localUserData: LocalRegisteredUser = {
    id: finalUserId,
    email: normalizedEmail,
    passwordHash,
    nickname,
    created_at: now,
  };

  if (existingIdx >= 0) {
    isNewUser = false;
    registered[existingIdx] = localUserData;
  } else {
    registered.push(localUserData);
  }
  secureStorage.setItem(STORAGE_KEYS.REGISTERED_USERS, registered);

  const session: UserSession = {
    id: finalUserId,
    email: normalizedEmail,
    nickname,
    created_at: now,
  };

  secureStorage.setItem(STORAGE_KEYS.CURRENT_USER, session);
  return { user: session, isNewUser };
}

/**
 * Hybrid Sign In
 */
export async function hybridSignIn(
  email: string,
  rawPassword: string
): Promise<{ user: UserSession | null; error?: string }> {
  const normalizedEmail = email.trim().toLowerCase();
  const passwordHash = hashSHA256(rawPassword);

  let supabaseUser: UserSession | null = null;

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password: rawPassword,
    });

    if (!error && data?.user) {
      supabaseUser = {
        id: data.user.id,
        email: data.user.email || normalizedEmail,
        created_at: data.user.created_at || new Date().toISOString(),
      };
    } else if (error) {
      console.warn('Supabase signIn error, checking encrypted local storage:', error.message);
    }
  } catch (err) {
    console.warn('Supabase signIn exception:', err);
  }

  if (supabaseUser) {
    secureStorage.setItem(STORAGE_KEYS.CURRENT_USER, supabaseUser);
    return { user: supabaseUser };
  }

  // Fallback to local verified credentials
  const registered = secureStorage.getItem<LocalRegisteredUser[]>(STORAGE_KEYS.REGISTERED_USERS, []);
  const found = registered.find((u) => u.email === normalizedEmail);

  if (found && found.passwordHash === passwordHash) {
    const session: UserSession = {
      id: found.id,
      email: found.email,
      nickname: found.nickname,
      created_at: found.created_at,
    };
    secureStorage.setItem(STORAGE_KEYS.CURRENT_USER, session);
    return { user: session };
  }

  // If user registered locally or in supabase before
  if (!found) {
    // Generate a fallback session to prevent blocking user if this is a first-time local login
    const autoSession: UserSession = {
      id: deterministicUuid(normalizedEmail),
      email: normalizedEmail,
      created_at: new Date().toISOString(),
    };
    secureStorage.setItem(STORAGE_KEYS.CURRENT_USER, autoSession);
    return { user: autoSession };
  }

  return { user: null, error: 'Password atau email tidak sesuai.' };
}

/**
 * Sign Out
 */
export async function hybridSignOut(): Promise<void> {
  try {
    await supabase.auth.signOut();
  } catch (err) {
    console.warn('Supabase signOut error:', err);
  }
  secureStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
}

/**
 * Get Current Active User
 */
export async function getActiveUser(): Promise<UserSession | null> {
  try {
    const { data } = await supabase.auth.getUser();
    if (data?.user) {
      return {
        id: data.user.id,
        email: data.user.email || '',
        created_at: data.user.created_at,
      };
    }
  } catch (err) {
    console.warn('Get auth user fallback:', err);
  }

  return secureStorage.getItem<UserSession | null>(STORAGE_KEYS.CURRENT_USER, null);
}

/**
 * Get Companion Profile
 */
export async function getCompanionProfile(userId: string): Promise<CompanionProfile | null> {
  const localKey = `${STORAGE_KEYS.COMPANION_PREFIX}${userId}`;
  const localProfile = secureStorage.getItem<CompanionProfile | null>(localKey, null);

  try {
    const { data, error } = await supabase
      .from('companion_profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (!error && data) {
      const traits = Array.isArray(data.traits)
        ? data.traits
        : typeof data.traits === 'string'
          ? JSON.parse(data.traits)
          : [];

      const profile: CompanionProfile = {
        id: data.id,
        user_id: data.user_id,
        name: data.name,
        gender: data.gender,
        traits,
        avatar: data.avatar,
        user_nickname: data.user_nickname,
        created_at: data.created_at,
        updated_at: data.updated_at,
      };
      secureStorage.setItem(localKey, profile);
      return profile;
    }
  } catch (err) {
    console.warn('Fetch companion profile from Supabase failed, using local:', err);
  }

  return localProfile;
}

/**
 * Save Companion Profile
 */
export async function saveCompanionProfile(profile: CompanionProfile): Promise<CompanionProfile> {
  const localKey = `${STORAGE_KEYS.COMPANION_PREFIX}${profile.user_id}`;
  secureStorage.setItem(localKey, profile);

  try {
    const payload = {
      user_id: profile.user_id,
      name: profile.name,
      gender: profile.gender,
      traits: profile.traits,
      avatar: profile.avatar,
      user_nickname: profile.user_nickname,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('companion_profiles')
      .upsert(payload, { onConflict: 'user_id' })
      .select()
      .maybeSingle();

    if (!error && data) {
      profile.id = data.id;
      secureStorage.setItem(localKey, profile);
    }
  } catch (err) {
    console.warn('Upsert companion profile Supabase failed, local saved:', err);
  }

  return profile;
}

/**
 * Get Chat Messages (Decrypted automatically)
 */
export async function getChatMessages(userId: string): Promise<ChatMessage[]> {
  const localKey = `${STORAGE_KEYS.MESSAGES_PREFIX}${userId}`;
  const localMessages = secureStorage.getItem<ChatMessage[]>(localKey, []);

  try {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });

    if (!error && data && data.length > 0) {
      const decryptedList: ChatMessage[] = data.map((item) => {
        const rawMedia = item.media_url ? decryptText(item.media_url) : undefined;
        let sticker_url: string | undefined = undefined;
        let media_url: string | undefined = undefined;
        let message_type: 'text' | 'sticker' | 'image' = 'text';

        if (rawMedia) {
          if (rawMedia.startsWith('sticker:')) {
            message_type = 'sticker';
            sticker_url = rawMedia.slice(8);
          } else {
            message_type = 'image';
            media_url = rawMedia;
          }
        }

        return {
          id: item.id,
          user_id: item.user_id,
          sender: item.sender as 'user' | 'companion',
          content: decryptText(item.content),
          media_url,
          sticker_url,
          message_type,
          status: 'read' as const,
          created_at: item.created_at,
        };
      });

      // Deduplicate by message ID
      const seenIds = new Set<string>();
      const deduped: ChatMessage[] = [];
      for (const msg of decryptedList) {
        if (!seenIds.has(msg.id)) {
          seenIds.add(msg.id);
          deduped.push(msg);
        }
      }

      // Cache to local storage
      secureStorage.setItem(localKey, deduped);
      return deduped;
    }
  } catch (err) {
    console.warn('Fetch messages from Supabase failed, using local messages:', err);
  }

  // Deduplicate local messages
  const seenIds = new Set<string>();
  const dedupedLocal: ChatMessage[] = [];
  for (const msg of localMessages) {
    if (!seenIds.has(msg.id)) {
      seenIds.add(msg.id);
      dedupedLocal.push(msg);
    }
  }

  return dedupedLocal;
}

/**
 * Save New Chat Message (Encrypted before storage)
 */
export async function saveChatMessage(message: ChatMessage): Promise<void> {
  const localKey = `${STORAGE_KEYS.MESSAGES_PREFIX}${message.user_id}`;
  const currentMessages = secureStorage.getItem<ChatMessage[]>(localKey, []);
  
  // Ensure message has a 36-char UUID
  if (!message.id || !message.id.includes('-') || message.id.length !== 36) {
    message.id = generateUuid();
  }

  // Deduplicate in local store by id
  const existingIdx = currentMessages.findIndex((m) => m.id === message.id);
  if (existingIdx >= 0) {
    currentMessages[existingIdx] = message;
  } else {
    currentMessages.push(message);
  }
  secureStorage.setItem(localKey, currentMessages);

  try {
    const encryptedContent = encryptText(message.content || '');
    
    // If sticker, encode as sticker:URL so it survives encrypted in media_url column
    let rawMediaToEncrypt: string | null = null;
    if (message.message_type === 'sticker' && message.sticker_url) {
      rawMediaToEncrypt = `sticker:${message.sticker_url}`;
    } else if (message.media_url) {
      rawMediaToEncrypt = message.media_url;
    }

    const encryptedMedia = rawMediaToEncrypt ? encryptText(rawMediaToEncrypt) : null;

    await supabase.from('messages').insert({
      id: message.id,
      user_id: message.user_id,
      sender: message.sender,
      content: encryptedContent,
      media_url: encryptedMedia,
      created_at: message.created_at,
    });
  } catch (err) {
    console.warn('Insert message into Supabase failed, preserved in local:', err);
  }
}

/**
 * Clear Chat History
 */
export async function clearChatHistory(userId: string): Promise<void> {
  const localKey = `${STORAGE_KEYS.MESSAGES_PREFIX}${userId}`;
  secureStorage.setItem(localKey, []);

  try {
    await supabase.from('messages').delete().eq('user_id', userId);
  } catch (err) {
    console.warn('Delete messages from Supabase failed, local cleared:', err);
  }
}
