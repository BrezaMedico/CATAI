import React, { createContext, useContext, useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  NavigationState,
  UserSession,
  CompanionProfile,
  ChatMessage,
  TypingSpeedPreference,
} from '../types';
import {
  getActiveUser,
  hybridSignIn,
  hybridSignUp,
  hybridSignOut,
  getCompanionProfile,
  saveCompanionProfile,
  getChatMessages,
  saveChatMessage,
  clearChatHistory,
} from '../services/supabase';
import {
  sendChatMessageToCompanion,
  generateProactiveMessage,
  parseCompanionResponse,
  CompanionStep,
} from '../services/aiRouter';
import { secureStorage } from '../utils/encryption';
import { formatLastSeen } from '../utils/timeFormatter';

interface AppContextType {
  navigation: NavigationState;
  setNavigation: (nav: NavigationState) => void;
  currentUser: UserSession | null;
  companion: CompanionProfile | null;
  messages: ChatMessage[];
  isTyping: boolean;
  isWaitingToRead: boolean;
  isCompanionOnline: boolean;
  lastSeenText: string;
  typingSpeed: TypingSpeedPreference;
  setTypingSpeed: (speed: TypingSpeedPreference) => void;
  skipWaitingReply: () => void;
  isInitializing: boolean;
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  register: (email: string, pass: string, nickname?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateCompanion: (profile: CompanionProfile) => Promise<void>;
  sendMessage: (text: string, imageBase64?: string) => Promise<void>;
  pokeCompanion: () => Promise<void>;
  clearChat: () => Promise<void>;
  resetIdleTimer: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [navigation, setNavigation] = useState<NavigationState>('AUTH');
  const [currentUser, setCurrentUser] = useState<UserSession | null>(null);
  const [companion, setCompanion] = useState<CompanionProfile | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [isWaitingToRead, setIsWaitingToRead] = useState<boolean>(false);
  const [isCompanionOnline, setIsCompanionOnline] = useState<boolean>(false);
  const [lastSeenTimestamp, setLastSeenTimestamp] = useState<number>(() => {
    const saved = secureStorage.getItem('last_seen_ts', null);
    return saved ? Number(saved) : Date.now() - 8 * 60 * 1000;
  });
  const [typingSpeed, setTypingSpeedState] = useState<TypingSpeedPreference>(() =>
    secureStorage.getItem('typing_speed_pref', 'realistic')
  );
  const [isInitializing, setIsInitializing] = useState<boolean>(true);

  const skipTimerRef = useRef<(() => void) | null>(null);
  const goOfflineTimerRef = useRef<number | null>(null);

  const updateLastSeen = useCallback((ts: number) => {
    setLastSeenTimestamp(ts);
    secureStorage.setItem('last_seen_ts', ts.toString());
  }, []);

  const setCompanionOnlineBriefly = useCallback(
    (durationMs = 15000) => {
      if (goOfflineTimerRef.current) {
        clearTimeout(goOfflineTimerRef.current);
        goOfflineTimerRef.current = null;
      }
      setIsCompanionOnline(true);
      goOfflineTimerRef.current = window.setTimeout(() => {
        setIsCompanionOnline(false);
        updateLastSeen(Date.now());
        goOfflineTimerRef.current = null;
      }, durationMs);
    },
    [updateLastSeen]
  );

  const lastSeenText = useMemo(() => {
    return formatLastSeen(lastSeenTimestamp);
  }, [lastSeenTimestamp]);

  const setTypingSpeed = (speed: TypingSpeedPreference) => {
    setTypingSpeedState(speed);
    secureStorage.setItem('typing_speed_pref', speed);
  };

  const skipWaitingReply = useCallback(() => {
    if (skipTimerRef.current) {
      skipTimerRef.current();
      skipTimerRef.current = null;
    }
  }, []);

  // Batch queue & processing refs
  const pendingUserMessagesRef = useRef<ChatMessage[]>([]);
  const isProcessingBatchRef = useRef<boolean>(false);
  const companionRef = useRef<CompanionProfile | null>(companion);
  companionRef.current = companion;
  const currentUserRef = useRef<UserSession | null>(currentUser);
  currentUserRef.current = currentUser;
  const messagesRef = useRef<ChatMessage[]>(messages);
  messagesRef.current = messages;
  const typingSpeedRef = useRef<TypingSpeedPreference>(typingSpeed);
  typingSpeedRef.current = typingSpeed;
  const isCompanionOnlineRef = useRef<boolean>(isCompanionOnline);
  isCompanionOnlineRef.current = isCompanionOnline;
  const isTypingRef = useRef<boolean>(isTyping);
  isTypingRef.current = isTyping;

  // Spontaneous Proactive Outreach Engine (Random 5 minutes to 6 hours)
  const getRandomOutreachDelay = () =>
    Math.floor(5 * 60 * 1000 + Math.random() * (6 * 3600 * 1000 - 5 * 60 * 1000));
  const hasProactivelyContactedRef = useRef<boolean>(false);
  const nextProactiveTimeRef = useRef<number>(Date.now() + getRandomOutreachDelay());

  // Idle tracking
  const lastActivityRef = useRef<number>(Date.now());
  const idleCheckIntervalRef = useRef<number | null>(null);

  // Reset idle activity tracker
  const resetIdleTimer = useCallback(() => {
    lastActivityRef.current = Date.now();
  }, []);

  // Deliver steps sequentially (multi-bubble text, faceless PAP, cute stickers)
  const deliverCompanionSteps = useCallback(
    async (steps: CompanionStep[], _targetCompanion: CompanionProfile, userId: string) => {
      for (let idx = 0; idx < steps.length; idx++) {
        const step = steps[idx];
        const currentSpeed = typingSpeedRef.current;

        if (step.type === 'text' && step.content) {
          let typingDurationMs = 0;

          if (currentSpeed === 'instant') {
            typingDurationMs = 200;
          } else if (currentSpeed === 'natural') {
            typingDurationMs = Math.min(Math.max(step.content.length * 100, 1000), 5000);
          } else {
            // 'realistic': 0.5 detik per huruf (500ms per character)
            typingDurationMs = Math.max(step.content.length * 500, 1500);
          }

          setIsTyping(true);
          await new Promise<void>((resolve) => {
            const timeoutId = window.setTimeout(() => {
              skipTimerRef.current = null;
              resolve();
            }, typingDurationMs);
            skipTimerRef.current = () => {
              clearTimeout(timeoutId);
              resolve();
            };
          });
          setIsTyping(false);

          const textMsg: ChatMessage = {
            id: `msg_${Date.now()}_${idx}_${Math.random().toString(36).substring(2, 7)}`,
            user_id: userId,
            sender: 'companion',
            content: step.content,
            message_type: 'text',
            status: 'read',
            created_at: new Date().toISOString(),
          };

          await saveChatMessage(textMsg);
          setMessages((prev) => [...prev, textMsg]);

          // Pause between bubbles
          if (idx < steps.length - 1) {
            await new Promise((r) => setTimeout(r, 1200));
          }
        } else if (step.type === 'image' && step.mediaUrl) {
          setIsTyping(true);
          await new Promise<void>((resolve) => {
            const timeoutId = window.setTimeout(() => {
              skipTimerRef.current = null;
              resolve();
            }, 1800);
            skipTimerRef.current = () => {
              clearTimeout(timeoutId);
              resolve();
            };
          });
          setIsTyping(false);

          const imgMsg: ChatMessage = {
            id: `msg_${Date.now()}_${idx}_pap`,
            user_id: userId,
            sender: 'companion',
            content: step.content || '',
            media_url: step.mediaUrl,
            message_type: 'image',
            status: 'read',
            created_at: new Date().toISOString(),
          };

          await saveChatMessage(imgMsg);
          setMessages((prev) => [...prev, imgMsg]);

          if (idx < steps.length - 1) {
            await new Promise((r) => setTimeout(r, 1000));
          }
        } else if (step.type === 'sticker' && step.stickerUrl) {
          await new Promise((r) => setTimeout(r, 800));

          const stkMsg: ChatMessage = {
            id: `msg_${Date.now()}_${idx}_stk`,
            user_id: userId,
            sender: 'companion',
            content: '',
            sticker_url: step.stickerUrl,
            message_type: 'sticker',
            status: 'read',
            created_at: new Date().toISOString(),
          };

          await saveChatMessage(stkMsg);
          setMessages((prev) => [...prev, stkMsg]);

          if (idx < steps.length - 1) {
            await new Promise((r) => setTimeout(r, 800));
          }
        }
      }
    },
    []
  );

  // Trigger spontaneous proactive outreach (5 min - 6 hours)
  const triggerSpontaneousOutreach = useCallback(async () => {
    const comp = companionRef.current;
    const user = currentUserRef.current;
    if (!comp || !user || isTyping || isWaitingToRead) return;

    try {
      setIsCompanionOnline(true);
      updateLastSeen(Date.now());
      const raw = await generateProactiveMessage(comp, messagesRef.current, 'spontaneous_outreach');
      const steps = parseCompanionResponse(raw);
      await deliverCompanionSteps(steps, comp, user.id);
      setCompanionOnlineBriefly(15000);
    } catch (err) {
      console.warn('Spontaneous outreach error:', err);
    }
  }, [deliverCompanionSteps, isTyping, isWaitingToRead, setCompanionOnlineBriefly, updateLastSeen]);

  // Process message batch queue: seen delay, batch read (centang 2), single consolidated reply
  const processMessageBatchQueue = useCallback(async () => {
    const comp = companionRef.current;
    const user = currentUserRef.current;
    if (!comp || !user || pendingUserMessagesRef.current.length === 0) {
      isProcessingBatchRef.current = false;
      return;
    }

    // 1. Calculate unread / seen delay (0 - 5 minutes, mostly 0 - 2 minutes)
    // If companion is already looking at phone (online), seen delay is brief (800ms - 2500ms)
    let seenDelayMs = 0;
    const currentSpeed = typingSpeedRef.current;
    if (currentSpeed === 'instant') {
      seenDelayMs = 0;
    } else if (isCompanionOnline) {
      seenDelayMs = Math.floor(800 + Math.random() * 1500);
    } else if (currentSpeed === 'natural') {
      seenDelayMs = Math.floor(1500 + Math.random() * 3000);
    } else {
      const isUnderTwoMin = Math.random() < 0.85; // 85% chance under 2 min
      if (isUnderTwoMin) {
        seenDelayMs = Math.floor(4000 + Math.random() * Math.random() * 116000);
      } else {
        seenDelayMs = Math.floor(120000 + Math.random() * 180000);
      }
    }

    if (seenDelayMs > 0 && !isCompanionOnline) {
      setIsWaitingToRead(true);
      await new Promise<void>((resolve) => {
        const timeoutId = window.setTimeout(() => {
          skipTimerRef.current = null;
          resolve();
        }, seenDelayMs);
        skipTimerRef.current = () => {
          clearTimeout(timeoutId);
          resolve();
        };
      });
      setIsWaitingToRead(false);
    }

    // 2. BATCH READ: Companion opens phone, comes online, records last seen!
    setIsCompanionOnline(true);
    updateLastSeen(Date.now());

    const batchToProcess = [...pendingUserMessagesRef.current];
    pendingUserMessagesRef.current = [];

    // Mark ALL unread user messages as read (Centang 2 ✓✓) SIMULTANEOUSLY!
    setMessages((prev) =>
      prev.map((m) => (m.sender === 'user' && m.status !== 'read' ? { ...m, status: 'read' } : m))
    );

    // Combine all unread user text so companion responds to the whole conversation at once
    const combinedUserText = batchToProcess
      .map((m) => m.content)
      .filter(Boolean)
      .join('\n');
    const lastImage = batchToProcess.find((m) => !!m.media_url)?.media_url;

    // Filter out current unread batch from history so the turn is only sent once as newMessage!
    const historyBeforeBatch = messagesRef.current.filter(
      (m) => !batchToProcess.some((b) => b.id === m.id)
    );

    // 3. Request AI reply for entire batch
    let rawReply = '';
    try {
      rawReply = await sendChatMessageToCompanion(
        comp,
        historyBeforeBatch,
        combinedUserText || 'Hai!',
        lastImage
      );
    } catch (err) {
      console.warn('Companion brain error:', err);
      rawReply = `Eh ${comp.user_nickname}, sinyalku barusan agak lemot nih hehe. Tadi kamu bilang apa ya?`;
    }

    // 4. Parse steps (multi-bubble, cute stickers, faceless PAP)
    const steps = parseCompanionResponse(rawReply, combinedUserText);

    // 5. Deliver steps sequentially with character typing duration
    await deliverCompanionSteps(steps, comp, user.id);

    // If new user messages arrived while companion was typing, process next batch!
    if (pendingUserMessagesRef.current.length > 0) {
      await processMessageBatchQueue();
    } else {
      isProcessingBatchRef.current = false;
      // Stays online for 15s after finishing, then goes offline and updates lastSeen
      setCompanionOnlineBriefly(15000);
    }
  }, [deliverCompanionSteps, isCompanionOnline, setCompanionOnlineBriefly, updateLastSeen]);

  // Initialize session on mount
  useEffect(() => {
    async function init() {
      try {
        const user = await getActiveUser();
        if (user) {
          setCurrentUser(user);
          const comp = await getCompanionProfile(user.id);
          if (comp) {
            setCompanion(comp);
            const chatList = await getChatMessages(user.id);
            setMessages(chatList);
            setNavigation('CHAT');
          } else {
            setNavigation('ONBOARDING');
          }
        } else {
          setNavigation('AUTH');
        }
      } catch (err) {
        console.warn('Initialization error:', err);
        setNavigation('AUTH');
      } finally {
        setIsInitializing(false);
      }
    }
    init();
  }, []);

  // Trigger proactive greeting
  const triggerFirstGreeting = useCallback(
    async (targetCompanion: CompanionProfile, userId: string) => {
      try {
        const reply = await generateProactiveMessage(targetCompanion, [], 'first_greeting');
        const steps = parseCompanionResponse(reply);
        await deliverCompanionSteps(steps, targetCompanion, userId);
      } catch (err) {
        console.warn('Proactive greeting failed:', err);
      }
    },
    [deliverCompanionSteps]
  );

  // Proactive check interval (5 min - 6 hours outreach, once only per idle period)
  useEffect(() => {
    if (navigation !== 'CHAT' || !companion || !currentUser) {
      if (idleCheckIntervalRef.current) {
        clearInterval(idleCheckIntervalRef.current);
        idleCheckIntervalRef.current = null;
      }
      return;
    }

    idleCheckIntervalRef.current = window.setInterval(() => {
      // 1. Spontaneous outreach (5 min - 6 hours delay, once only)
      if (
        !hasProactivelyContactedRef.current &&
        Date.now() >= nextProactiveTimeRef.current &&
        !isTyping &&
        !isWaitingToRead &&
        pendingUserMessagesRef.current.length === 0
      ) {
        hasProactivelyContactedRef.current = true; // "cukup sekali saja"
        triggerSpontaneousOutreach();
      }
    }, 15000); // Check every 15s

    return () => {
      if (idleCheckIntervalRef.current) {
        clearInterval(idleCheckIntervalRef.current);
        idleCheckIntervalRef.current = null;
      }
    };
  }, [navigation, companion, currentUser, isTyping, isWaitingToRead, triggerSpontaneousOutreach]);

  // Auth: Login
  const login = async (email: string, pass: string) => {
    try {
      const res = await hybridSignIn(email, pass);
      if (res.user) {
        setCurrentUser(res.user);
        const comp = await getCompanionProfile(res.user.id);
        if (comp) {
          setCompanion(comp);
          const chatList = await getChatMessages(res.user.id);
          setMessages(chatList);
          setNavigation('CHAT');
        } else {
          setNavigation('ONBOARDING');
        }
        return { success: true };
      }
      return { success: false, error: res.error || 'Login gagal.' };
    } catch {
      return { success: false, error: 'Terjadi kesalahan saat masuk.' };
    }
  };

  // Auth: Register
  const register = async (email: string, pass: string, nickname?: string) => {
    try {
      const res = await hybridSignUp(email, pass, nickname);
      if (res.user) {
        setCurrentUser(res.user);
        setNavigation('ONBOARDING');
        return { success: true };
      }
      return { success: false, error: res.error || 'Pendaftaran gagal.' };
    } catch {
      return { success: false, error: 'Terjadi kendala saat pendaftaran.' };
    }
  };

  // Auth: Logout
  const logout = async () => {
    await hybridSignOut();
    setCurrentUser(null);
    setCompanion(null);
    setMessages([]);
    setNavigation('AUTH');
  };

  // Update or Save Companion
  const updateCompanion = async (profile: CompanionProfile) => {
    const saved = await saveCompanionProfile(profile);
    setCompanion(saved);
    if (currentUser && !currentUser.nickname) {
      setCurrentUser({ ...currentUser, nickname: profile.user_nickname });
    }

    // If chat is empty, fire proactive first greeting!
    if (messages.length === 0) {
      triggerFirstGreeting(saved, saved.user_id);
    }
  };

  // Send Message with Batch Queue, Simultaneous Centang 2, and Multi-Bubble Output
  const sendMessage = async (text: string, imageBase64?: string) => {
    if (!currentUser || !companion) return;
    if (!text.trim() && !imageBase64) return;

    resetIdleTimer();
    hasProactivelyContactedRef.current = false;
    nextProactiveTimeRef.current = Date.now() + getRandomOutreachDelay();

    // If companion is already active in chat (typing, online, or currently processing reply),
    // incoming message is read IMMEDIATELY with centang 2 hijau (✓✓)!
    const isActivelyLooking =
      isCompanionOnlineRef.current ||
      isTypingRef.current ||
      isProcessingBatchRef.current;

    const initialStatus: 'sent' | 'read' = isActivelyLooking ? 'read' : 'sent';

    const userMsg: ChatMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      user_id: currentUser.id,
      sender: 'user',
      content: text.trim(),
      media_url: imageBase64,
      message_type: imageBase64 ? 'image' : 'text',
      status: initialStatus,
      created_at: new Date().toISOString(),
    };

    if (isActivelyLooking) {
      updateLastSeen(Date.now());
      setIsCompanionOnline(true);
      // Mark all past user messages as read simultaneously
      setMessages((prev) => [
        ...prev.map((m) => (m.sender === 'user' && m.status !== 'read' ? { ...m, status: 'read' as const } : m)),
        userMsg,
      ]);
    } else {
      setMessages((prev) => [...prev, userMsg]);
    }

    await saveChatMessage(userMsg);

    // Enqueue message into pending batch
    pendingUserMessagesRef.current.push(userMsg);

    // If batch processor is already running, the new message will be read together!
    if (!isProcessingBatchRef.current) {
      isProcessingBatchRef.current = true;
      processMessageBatchQueue();
    }
  };

  // Poke companion (Colek)
  const pokeCompanion = async () => {
    if (!companion || !currentUser) return;
    resetIdleTimer();
    hasProactivelyContactedRef.current = false;
    nextProactiveTimeRef.current = Date.now() + getRandomOutreachDelay();

    // If waiting to read, skip wait immediately
    if (skipTimerRef.current) {
      skipTimerRef.current();
      skipTimerRef.current = null;
    }

    setIsWaitingToRead(false);
    setIsCompanionOnline(true);
    updateLastSeen(Date.now());

    // Mark any unread user messages as read
    setMessages((prev) =>
      prev.map((m) => (m.sender === 'user' && m.status !== 'read' ? { ...m, status: 'read' } : m))
    );
    pendingUserMessagesRef.current = [];

    try {
      const prompt = `(Instruksi khusus: ${companion.user_nickname} baru saja menyapamu / mencolekmu 'Poke'. Tanggapi dengan hangat, ceria, dan tanya kabarnya atau lemparkan topik seru khas sahabat dekat. Boleh sertakan [STICKER: wave] atau lainnya. Jangan sebut bot/AI!)`;
      const reply = await sendChatMessageToCompanion(companion, messagesRef.current, prompt);
      const steps = parseCompanionResponse(reply);
      await deliverCompanionSteps(steps, companion, currentUser.id);
      setCompanionOnlineBriefly(15000);
    } catch (err) {
      console.warn('Poke failed:', err);
    }
  };

  // Clear Chat
  const clearChat = async () => {
    if (!currentUser) return;
    await clearChatHistory(currentUser.id);
    setMessages([]);
    resetIdleTimer();
  };

  return (
    <AppContext.Provider
      value={{
        navigation,
        setNavigation,
        currentUser,
        companion,
        messages,
        isTyping,
        isWaitingToRead,
        isCompanionOnline,
        lastSeenText,
        typingSpeed,
        setTypingSpeed,
        skipWaitingReply,
        isInitializing,
        login,
        register,
        logout,
        updateCompanion,
        sendMessage,
        pokeCompanion,
        clearChat,
        resetIdleTimer,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
