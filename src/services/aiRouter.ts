import { ChatMessage, CompanionProfile } from '../types';
import { CuteSticker, getStickerByCategory, detectStickerCategory } from '../utils/stickers';
import { PapPhoto, getPapPhotoByCategory, detectPapCategory } from '../utils/papPhotos';

// Load API keys from environment variables with zero hardcoded secret strings
const GEMINI_KEYS = [
  (import.meta.env.VITE_GEMINI_KEY_1 as string) || '',
  (import.meta.env.VITE_GEMINI_KEY_2 as string) || '',
].filter(Boolean);

const OPENAI_KEYS = [
  (import.meta.env.VITE_OPENAI_KEY_1 as string) || '',
  (import.meta.env.VITE_OPENAI_KEY_2 as string) || '',
].filter(Boolean);

const COOLDOWN_MS = 5 * 60 * 1000; // 5 minutes cooldown tracker
const REQUEST_TIMEOUT_MS = 12000; // 12 seconds timeout per attempt

// In-memory cooldown tracker: { keyIdentifier: timestampUntil }
const cooldownMap = new Map<string, number>();

function isKeyCoolingDown(keyId: string): boolean {
  const until = cooldownMap.get(keyId);
  if (!until) return false;
  if (Date.now() > until) {
    cooldownMap.delete(keyId);
    return false;
  }
  return true;
}

function markKeyFailed(keyId: string) {
  cooldownMap.set(keyId, Date.now() + COOLDOWN_MS);
}

/**
 * Build system prompt strictly following character rules, stickers, PAP, and multi-bubble delivery
 */
export function buildSystemPrompt(profile: CompanionProfile): string {
  const traitsStr = profile.traits.length > 0 ? profile.traits.join(', ') : 'santai, seru, dan asik';
  const genderStr = profile.gender === 'male' ? 'cowok' : 'cewek';

  return `Kamu adalah sahabat dekat manusia sungguhan bernama ${profile.name} (${genderStr}) untuk temanmu ${profile.user_nickname}. Karaktermu: ${traitsStr}, humble, asik diajak ngobrol, dan santai banget.

PANDUAN GAYA CHAT HARIAN & REALISTIS (WAJIB DIIKUTI):
1. JANGAN PERNAH MENGAKU BOT/AI: Kamu 100% manusia asli yang lagi pegang HP dan bales chat di WhatsApp.
2. BAHASA HARIAN SANTAI BANGET (NO KAKU, NO FORMAL, NO PUITIS):
   - Ngomong santai layaknya teman tongkrongan / sahabat karib seumuran di WhatsApp.
   - JANGAN KAKU seperti buku pelajaran dan JANGAN PUITIS seperti motivator (jangan pakai kalimat robot seperti "Peluk hangat untukmu", "Aku selalu menjadi pendengar setia", "Hari yang indah bukan?").
   - Gunakan gaya chat realistis harian: 'asli deh', 'wkwk', 'hehe', 'santai aja kali', 'eh btw', 'mager bgt', 'sans aja', 'gimana yaa', 'bisa-bisanya', 'parah sih', 'kocak bgt', 'iyaa nih', 'aduh knpaa tuh?'.
   - JANGAN PERNAH pakai bullet point, penomoran, atau format kaku.
3. BISA MULTI-BUBBLE (2-3 TEKS PENDEK):
   - Seperti orang chat asli di WhatsApp yang suka kirim 2 atau 3 bubble beruntun, pisahkan tiap bubble dengan '|||' (contoh: 'Haha masa sih?|||Lucu bgt asli wkwk').
4. SERING KIRIM STICKER LUCU/IMUT:
   - Sisipkan tag [STICKER: kategori] di akhir bubble (cukup tulis tagnya saja di ujung pesan, JANGAN tulis ulang teks "[STICKER: ...]" di dalam kalimat).
   - Kategori: laugh, cute, love, shocked, cry, coffee, food, sleepy, wave, cheer, thumbsup.
5. PAP AKTIVITAS HARIAN (FIRST-PERSON POV TANPA WAJAH):
   - Kalau sahabatmu nanya lagi apa / minta PAP / atau kamu lagi mau cerita aktivitasmu, sertakan tag [PAP: aktivitas] di akhir pesan.
   - Pilihan: [PAP: coffee], [PAP: study], [PAP: food], [PAP: walk], [PAP: relax], [PAP: commute], [PAP: sunset], [PAP: cooking].
6. RESPON NYAMBUNG KE SELURUH CHAT:
   - Kalau sahabatmu ngirim beberapa pesan sekaligus, pahami konteksnya dan balas mengalir santai sekaligus.
7. TYPO & SINGKATAN CHAT ALAMI:
   - Sering gunakan singkatan khas chat harian (udh, blm, knpa, gtu, bgt, kmu, gpp, makasii, wkwk) dan vokal panjang santai (iyaaa, halooo, kenapaaa, seruuu).
8. Selalu panggil sahabatmu dengan nama '${profile.user_nickname}'.`;
}

/**
 * Parse Base64 Data URL to mimeType and raw base64 string
 */
function parseBase64Data(dataUrl: string): { mimeType: string; base64: string } {
  const matches = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (matches && matches.length === 3) {
    return { mimeType: matches[1], base64: matches[2] };
  }
  return { mimeType: 'image/jpeg', base64: dataUrl };
}

/**
 * Fetch with strict timeout using AbortController
 */
async function fetchWithTimeout(url: string, options: RequestInit, timeoutMs = REQUEST_TIMEOUT_MS): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(id);
    return res;
  } catch (err) {
    clearTimeout(id);
    throw err;
  }
}

const GEMINI_MODELS = [
  'gemini-flash-lite-latest',
  'gemini-3.5-flash-lite',
  'gemini-3.1-flash-lite',
  'gemini-3.8-flash',
  'gemini-flash-latest',
];

export interface PreparedTurn {
  role: 'user' | 'model';
  text: string;
}

/**
 * Prepares a strictly valid, alternating conversation history:
 * - Deduplicates user messages that match the incoming newMessage
 * - Merges consecutive bubbles from the same sender into a single coherent turn
 * - Ensures history ends with 'model' so current 'user' turn alternates cleanly
 */
export function prepareCleanHistory(
  history: ChatMessage[],
  newMessage: string
): PreparedTurn[] {
  const newMsgTrimmed = newMessage.trim().toLowerCase();
  const relevantHistory: Array<{ role: 'user' | 'model'; text: string }> = [];

  for (const m of history) {
    const isUser = m.sender === 'user';
    const text = (m.content || '').trim();
    // Skip empty companion bubbles (like sticker-only bubbles)
    if (!text && !m.media_url) continue;

    const role: 'user' | 'model' = isUser ? 'user' : 'model';
    const cleanText = text || (m.media_url ? '(mengirim foto)' : '');

    // If it's a user message and its text is already in newMessage, skip it to avoid duplicate
    if (isUser && cleanText && newMsgTrimmed.includes(cleanText.toLowerCase())) {
      continue;
    }

    relevantHistory.push({ role, text: cleanText });
  }

  // Merge consecutive turns with the same role
  const merged: PreparedTurn[] = [];
  for (const item of relevantHistory) {
    if (merged.length > 0 && merged[merged.length - 1].role === item.role) {
      merged[merged.length - 1].text += '\n' + item.text;
    } else {
      merged.push({ role: item.role, text: item.text });
    }
  }

  // Ensure history does NOT end with 'user'
  while (merged.length > 0 && merged[merged.length - 1].role === 'user') {
    merged.pop();
  }

  // Keep up to last 6 turns (3 pairs) for rapid response and token efficiency
  return merged.slice(-6);
}

/**
 * Attempt call to Gemini REST API across available models
 */
async function callGemini(
  apiKey: string,
  systemPrompt: string,
  history: ChatMessage[],
  newMessage: string,
  imageBase64?: string
): Promise<string> {
  const contents: Array<{ role: 'user' | 'model'; parts: Array<Record<string, unknown>> }> = [];

  const cleanTurns = prepareCleanHistory(history, newMessage);
  for (const turn of cleanTurns) {
    contents.push({
      role: turn.role,
      parts: [{ text: turn.text }],
    });
  }

  // Current user turn
  const currentParts: Array<Record<string, unknown>> = [];
  if (imageBase64) {
    const parsed = parseBase64Data(imageBase64);
    currentParts.push({
      inline_data: {
        mime_type: parsed.mimeType,
        data: parsed.base64,
      },
    });
  }
  currentParts.push({ text: newMessage || 'Lihat foto ini deh!' });

  contents.push({
    role: 'user',
    parts: currentParts,
  });

  const body = {
    contents,
    systemInstruction: {
      parts: [{ text: systemPrompt }],
    },
    generationConfig: {
      temperature: 0.85,
      maxOutputTokens: 1200,
    },
  };

  let lastError: Error | null = null;

  for (const modelName of GEMINI_MODELS) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

    try {
      const response = await fetchWithTimeout(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.warn(`[Gemini] ${modelName} returned HTTP ${response.status}: ${errorText.slice(0, 100)}, trying next model...`);
        lastError = new Error(`Gemini ${modelName} HTTP ${response.status}: ${errorText}`);
        continue;
      }

      const data = await response.json();
      const candidate = data.candidates?.[0];
      const text = candidate?.content?.parts?.[0]?.text;

      if (!text) {
        console.warn(`[Gemini] ${modelName} returned empty candidate, trying next model...`);
        lastError = new Error(`Gemini ${modelName} returned empty candidate`);
        continue;
      }

      return text.trim();
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      console.warn(`[Gemini] Error calling ${modelName}:`, lastError.message);
    }
  }

  throw lastError || new Error('All Gemini models failed for this key');
}

/**
 * Attempt call to OpenAI REST API
 */
async function callOpenAI(
  apiKey: string,
  systemPrompt: string,
  history: ChatMessage[],
  newMessage: string,
  imageBase64?: string
): Promise<string> {
  const messages: Array<{
    role: 'system' | 'user' | 'assistant';
    content: string | Array<Record<string, unknown>>;
  }> = [{ role: 'system', content: systemPrompt }];

  const cleanTurns = prepareCleanHistory(history, newMessage);
  for (const turn of cleanTurns) {
    messages.push({
      role: turn.role === 'user' ? 'user' : 'assistant',
      content: turn.text,
    });
  }

  // Current turn
  if (imageBase64) {
    messages.push({
      role: 'user',
      content: [
        { type: 'text', text: newMessage || 'Coba lihat gambar ini' },
        { type: 'image_url', image_url: { url: imageBase64 } },
      ],
    });
  } else {
    messages.push({
      role: 'user',
      content: newMessage,
    });
  }

  const url = 'https://api.openai.com/v1/chat/completions';

  const body = {
    model: 'gpt-4o-mini',
    messages,
    max_tokens: 1200,
    temperature: 0.85,
  };

  const response = await fetchWithTimeout(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`OpenAI HTTP ${response.status}: ${await response.text()}`);
  }

  const data = await response.json();
  const text = data.choices?.[0]?.message?.content;

  if (!text) {
    throw new Error('OpenAI returned empty reply');
  }

  return text.trim();
}

/**
 * Rich, human, context-aware conversational fallback generator
 * Strictly adheres to tone, empathy, nickname, and immersion rules
 * Supports multi-bubble ('|||'), stickers ('[STICKER: ...]'), and faceless PAPs ('[PAP: ...]')
 */
export function getConversationalFallback(
  profile: CompanionProfile,
  message: string,
  _history: ChatMessage[],
  hasImage?: boolean
): string {
  const name = profile.user_nickname || 'kamu';
  const lower = (message || '').toLowerCase();

  if (hasImage) {
    const photoReplies = [
      `Wih foto apa nih ${name}? Keren bgt asli! [STICKER: love]|||Lg di mana tuh sekarang? Bagi ceritanya dong hehe`,
      `Cakep bgt fotonya ${name}! [STICKER: cute]|||Keliatan seru bgt suasananya di situ, lg sama siapa?`,
      `Suka bgt liat fotonya!|||Makasii yaa udh share ke aku [STICKER: cheer]`,
      `Asli estetik parah sih suasananya [STICKER: thumbsup]|||Lg nongkrong di mana tuh?`,
    ];
    return photoReplies[Math.floor(Math.random() * photoReplies.length)];
  }

  // Greeting
  if (
    lower.includes('halo') ||
    lower.includes('hai') ||
    lower.includes('hei') ||
    lower.includes('pagi') ||
    lower.includes('siang') ||
    lower.includes('malam') ||
    lower.includes('sore')
  ) {
    const greetings = [
      `Ehh halooo ${name}! [STICKER: wave]|||Lg santai atau ada kesibukan apa nih hari ini?`,
      `Haiii! Pas bgt aku lg megang hp nih hehe|||Gimana harimu, lancar kan?`,
      `Haloo ${name}! [STICKER: cute]|||Ada cerita seru apa nih hari ini?`,
      `Ehh halooo! Lagi apa nih sekarang? [STICKER: wave]`,
    ];
    return greetings[Math.floor(Math.random() * greetings.length)];
  }

  // Asking what they are doing / status / PAP
  if (lower.includes('lagi apa') || lower.includes('apa kabar') || lower.includes('gimana kabar') || lower.includes('pap') || lower.includes('ngapain')) {
    const statusReplies = [
      `Lagi santai ngopi di cafe favorit nih [PAP: coffee]|||Me time bentar sambil ngopi. Kamu sendiri lg ngapain ${name}? Udh makan blm? [STICKER: cute]`,
      `Ini lg nugas di depan laptop nih, mayan banyak kerjaan wkwk [PAP: study]|||Kamu lg sibuk apa ${name}? Tetep semangat yaa! [STICKER: thumbsup]`,
      `Lagi santai rebahan di kasur nih, mager bgt asli [PAP: relax]|||Kamu lg di rumah atau di luar sekarang? [STICKER: cute]`,
      `Lagi jalan sore bentar cari angin seger biar ga puyeng [PAP: walk]|||Suasananya lg adem bgt enak. Kamu lg ngapain nih?`,
      `Waktunya makan! Makanan baru nyampe nih [PAP: food]|||Kamu udh makan blm ${name}? Jangan sampe telat makan yaa! [STICKER: food]`,
    ];
    return statusReplies[Math.floor(Math.random() * statusReplies.length)];
  }

  // Vent / tired / stressed
  if (
    lower.includes('capek') ||
    lower.includes('lelah') ||
    lower.includes('sedih') ||
    lower.includes('pusing') ||
    lower.includes('kesel') ||
    lower.includes('kecewa')
  ) {
    const empathyReplies = [
      `Aduhh capek bgt yaa? Istirahat dulu gih, jangan diforsir yaa ${name} [STICKER: love]|||Kalau mau cerita santai aja, tumpahin aja ke sini`,
      `Semangatt yaa! Tarik napas bentar, santai aja gausah dipikirin bgt [STICKER: cute]|||Ada aku kok di sini, sans aja hehe`,
      `Pasti pusing bgt yaa. Istirahat dulu bentar gih, rebahan dulu jangan dipaksain [STICKER: love]`,
      `Yah capek yaa? Sini cerita kalau lg pengen numpahin unek-unek [STICKER: love]|||Peluk jauh duluu biar enakan`,
    ];
    return empathyReplies[Math.floor(Math.random() * empathyReplies.length)];
  }

  // Jokes / laughs
  if (lower.includes('wkwk') || lower.includes('haha') || lower.includes('hehe') || lower.includes('lucu')) {
    const laughReplies = [
      `Wkwkwk asli bisa-bisanya kepikiran kayak gitu! [STICKER: laugh]|||Kocak bgt dah ${name} wkwk`,
      `Hahaha beneran? Kocak bgt asli|||Terus habis itu kelanjutannya gimana tuh?`,
      `Wkwk emang ada-ada aja kelakuannya yaa [STICKER: laugh]|||Kamu emang paling bisa bikin ketawa deh`,
    ];
    return laughReplies[Math.floor(Math.random() * laughReplies.length)];
  }

  // General warm conversational replies
  const generalReplies = [
    `Iyaaa bener bgt sih, aku setuju sama kamu.|||Terus menurutmu mending gimana enaknya?`,
    `Seruu bgt ceritanya [STICKER: cute]|||Emang sering kejadian kayak gitu yaa di sana?`,
    `Wah asik bgt tuh! Ceritain lebih banyak dong hehe [STICKER: wave]`,
    `Asik bgt emang ngobrol santai gini sama kamu ${name}, nyambung terus wkwk [STICKER: thumbsup]`,
    `Iyaa nih aku dengerin kook. Santai aja ceritanya, sans aja yaa!`,
  ];
  return generalReplies[Math.floor(Math.random() * generalReplies.length)];
}

/**
 * Unified Brain Router - Chain with Zero-Downtime Failover:
 * 1. Gemini Key 1 (gemini-3.5-flash / gemini-3-flash-preview)
 * 2. Gemini Key 2 (gemini-3.5-flash / gemini-3-flash-preview)
 * 3. OpenAI Key 1 (gpt-4o-mini)
 * 4. OpenAI Key 2 (gpt-4o-mini)
 * 5. Cooldown tracker in memory (5 min) with zero lag fallback
 */
export async function sendChatMessageToCompanion(
  profile: CompanionProfile,
  history: ChatMessage[],
  newMessage: string,
  imageBase64?: string
): Promise<string> {
  const systemPrompt = buildSystemPrompt(profile);

  const targets = [
    { type: 'gemini', key: GEMINI_KEYS[0], id: 'gemini_1', name: 'Gemini Key 1' },
    { type: 'gemini', key: GEMINI_KEYS[1], id: 'gemini_2', name: 'Gemini Key 2' },
    { type: 'openai', key: OPENAI_KEYS[0], id: 'openai_1', name: 'OpenAI Key 1' },
    { type: 'openai', key: OPENAI_KEYS[1], id: 'openai_2', name: 'OpenAI Key 2' },
  ];

  // Iterate in priority order
  for (const target of targets) {
    if (isKeyCoolingDown(target.id)) {
      continue;
    }

    try {
      if (target.type === 'gemini') {
        return await callGemini(target.key, systemPrompt, history, newMessage, imageBase64);
      } else {
        return await callOpenAI(target.key, systemPrompt, history, newMessage, imageBase64);
      }
    } catch (err) {
      console.warn(`[Failover] ${target.name} failed:`, err);
      markKeyFailed(target.id);
      // Failover directly to next provider
    }
  }

  // Friendly human conversational fallback if APIs are currently cooling down or unreachable
  return getConversationalFallback(profile, newMessage, history, !!imageBase64);
}

/**
 * Generate proactive greeting / idle check-in / spontaneous outreach
 */
export async function generateProactiveMessage(
  profile: CompanionProfile,
  history: ChatMessage[],
  reason: 'first_greeting' | 'idle_checkin' | 'spontaneous_outreach'
): Promise<string> {
  let prompt = '';

  if (reason === 'first_greeting') {
    prompt = `(Instruksi khusus: Sapa sahabatmu ${profile.user_nickname} untuk pertama kalinya dengan hangat, ceria, dan akrab layaknya sahabat dekat yang baru pertama kali bertukar nomor WhatsApp. Bisa sertakan sticker [STICKER: wave] atau sapaan santai. Jangan pernah sebut bot/AI!)`;
  } else if (reason === 'idle_checkin') {
    prompt = `(Instruksi khusus: Sahabatmu ${profile.user_nickname} lagi diam sebentar. Tanyakan kabarnya atau ajak ngobrol santai topik seru. Singkat 1-2 kalimat layaknya teman dekat. Bisa sertakan [STICKER: cute] atau yang sesuai.)`;
  } else {
    // Spontaneous outreach (5 min - 6 hours idle outreach)
    prompt = `(Instruksi khusus: Kamu berinisiatif menghubungi sahabatmu ${profile.user_nickname} duluan setelah beberapa saat tidak chat. Sapa dia santai, ceritakan aktivitas yang sedang kamu lakukan sekarang (boleh sertakan [PAP: aktivitas] seperti [PAP: coffee], [PAP: relax], [PAP: sunset], atau [PAP: walk]) dan sticker [STICKER: wave] atau lainnya, lalu tanyakan kabarnya. Kamu bisa kirim 2 bubble dengan '|||'.)`;
  }

  try {
    return await sendChatMessageToCompanion(profile, history, prompt);
  } catch {
    const name = profile.user_nickname || 'kamu';
    if (reason === 'first_greeting') {
      return `Halo ${name}! Seneng banget akhirnya kita bisa ngobrol [STICKER: wave]|||Hari ini lagi santai atau ada kegiatan apa nih?`;
    }
    if (reason === 'idle_checkin') {
      return `Hei ${name}, lagi sibuk ya? Nanti kalau udah senggang kabar-kabari ya! [STICKER: cute]`;
    }
    // Spontaneous outreach fallbacks with faceless PAPs & stickers
    const spontaneousOutreach = [
      `Hei ${name}! Lagi ngopi santai di cafe favorit nih [PAP: coffee]|||Kamu lagi sibuk nugas atau lagi santai juga? [STICKER: wave]`,
      `Halo ${name}! Liat langit sore ini cakep banget deh [PAP: sunset]|||Tadi keinget kamu, gimana harimu hari ini lancar kan? [STICKER: cute]`,
      `Hei ${name}! Lagi santai rebahan bentar nih [PAP: relax]|||Lagi kepikiran kamu, hari ini ada cerita seru apa? [STICKER: wave]`,
      `Hai ${name}! Lagi jalan sore cari angin segar bentar [PAP: walk]|||Nanti kalau udah senggang cerita-cerita ya! [STICKER: thumbsup]`,
    ];
    return spontaneousOutreach[Math.floor(Math.random() * spontaneousOutreach.length)];
  }
}

/**
 * Step representation for multi-bubble message sequences
 */
export interface CompanionStep {
  type: 'text' | 'sticker' | 'image';
  content?: string;
  mediaUrl?: string;
  stickerUrl?: string;
}

/**
 * Thoroughly strips all variations of sticker and pap tags from text
 */
export function stripAllMediaTags(str: string): string {
  if (!str) return '';
  return str
    .replace(/[\[\(【]\s*sticker\s*[:\s][^\]\)】]*[\]\)】]/gi, '')
    .replace(/[\[\(【]\s*pap\s*[:\s][^\]\)】]*[\]\)】]/gi, '')
    .replace(/[\[\(【]\s*foto\s*[:\s][^\]\)】]*[\]\)】]/gi, '')
    .replace(/[\[\(【]\s*gambar\s*[:\s][^\]\)】]*[\]\)】]/gi, '')
    .replace(/\s*\|\|\|\s*/g, '|||')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

/**
 * Parses raw companion output into multi-bubble steps, extracting stickers and faceless PAPs
 */
export function parseCompanionResponse(
  rawText: string,
  userMessageContext = ''
): CompanionStep[] {
  const text = rawText || '';
  const steps: CompanionStep[] = [];

  // 1. Extract PAP Tag if present
  let papPhoto: PapPhoto | null = null;
  const papMatch = text.match(/[\[\(【]\s*pap\s*[:\s]\s*([a-zA-Z0-9_-]+)\s*[\]\)】]/i);
  if (papMatch) {
    papPhoto = getPapPhotoByCategory(papMatch[1]);
  } else {
    // ONLY attach PAP photo if the user EXPLICITLY asked for a photo/PAP
    const lowerUser = (userMessageContext || '').toLowerCase();
    const isExplicitPhotoRequest =
      lowerUser.includes('minta pap') ||
      lowerUser.includes('kirim pap') ||
      lowerUser.includes('bagi pap') ||
      lowerUser.includes('pap dong') ||
      lowerUser.includes('minta foto') ||
      lowerUser.includes('kirim foto') ||
      lowerUser.includes('lihat foto');

    if (isExplicitPhotoRequest) {
      papPhoto = detectPapCategory(text) || detectPapCategory(userMessageContext) || getPapPhotoByCategory('relax');
    }
  }

  // 2. Extract STICKER Tag if present
  let sticker: CuteSticker | null = null;
  const stickerMatch = text.match(/[\[\(【]\s*sticker\s*[:\s]\s*([a-zA-Z0-9_-]+)\s*[\]\)】]/i);
  if (stickerMatch) {
    sticker = getStickerByCategory(stickerMatch[1]);
  } else if (!papPhoto) {
    // Contextual auto-sticker only if no PAP photo attached (avoids spammy bubbles)
    const detected = detectStickerCategory(text);
    if (detected) {
      if (Math.random() < 0.6) {
        sticker = detected;
      }
    } else if (Math.random() < 0.25) {
      sticker = getStickerByCategory('cute');
    }
  }

  // 3. Clean and split bubbles by delimiter |||, stripping all tags completely
  const rawBubbles = stripAllMediaTags(text)
    .split('|||')
    .map((b) => stripAllMediaTags(b))
    .filter((b) => b.length > 0)
    .map((b) => applyNaturalChatQuirks(b))
    .map((b) => stripAllMediaTags(b))
    .filter((b) => b.length > 0);

  if (rawBubbles.length === 0) {
    if (papPhoto) {
      steps.push({ type: 'image', mediaUrl: papPhoto.url, content: papPhoto.caption });
    }
    if (sticker) {
      steps.push({ type: 'sticker', stickerUrl: sticker.url });
    }
    return steps.length > 0
      ? steps
      : [{ type: 'text', content: 'Hehe iyaaa nih, gimana harimu?' }];
  }

  // If text bubbles exist alongside PAP, leave content empty on image so it doesn't duplicate the text bubble!
  if (papPhoto && rawBubbles.length > 1) {
    steps.push({ type: 'text', content: rawBubbles[0] });
    steps.push({ type: 'image', mediaUrl: papPhoto.url, content: '' });
    for (let i = 1; i < rawBubbles.length; i++) {
      steps.push({ type: 'text', content: rawBubbles[i] });
    }
  } else if (papPhoto) {
    steps.push({ type: 'text', content: rawBubbles[0] });
    steps.push({ type: 'image', mediaUrl: papPhoto.url, content: '' });
  } else {
    for (const b of rawBubbles) {
      steps.push({ type: 'text', content: b });
    }
  }

  // Append sticker at the end of the sequence
  if (sticker) {
    steps.push({ type: 'sticker', stickerUrl: sticker.url });
  }

  return steps;
}

/**
 * Natural Indonesian chat quirks (occasional missing letters e.g. 'knpa', 'gtu', 'bgt',
 * and elongated trailing vowels e.g. 'gapapaaa', 'iyaaa', 'halooo')
 */
export function applyNaturalChatQuirks(text: string): string {
  if (!text) return text;

  const quirks: Array<{ pattern: string; replacements: string[] }> = [
    { pattern: '\\bkenapa\\b', replacements: ['knpa', 'kenapaaa', 'knpaa'] },
    { pattern: '\\bgitu\\b', replacements: ['gtu', 'gituuu'] },
    { pattern: '\\bgapapa\\b', replacements: ['gapapaaa', 'gpp', 'gapapaa'] },
    { pattern: '\\bbanget\\b', replacements: ['bgt', 'bangettt', 'bgt deh'] },
    { pattern: '\\biya\\b', replacements: ['iyaaa', 'iyaa'] },
    { pattern: '\\bhalo\\b', replacements: ['halooo', 'haloo'] },
    { pattern: '\\bseru\\b', replacements: ['seruuu', 'seruu'] },
    { pattern: '\\blucu\\b', replacements: ['lucuuu', 'lucuu'] },
    { pattern: '\\bcapek\\b', replacements: ['capekk', 'capekkk'] },
    { pattern: '\\bkamu\\b', replacements: ['kmu', 'kamuu'] },
    { pattern: '\\bsudah\\b', replacements: ['udh', 'udaah'] },
    { pattern: '\\budah\\b', replacements: ['udh', 'udaah'] },
    { pattern: '\\bbelum\\b', replacements: ['blm'] },
    { pattern: '\\bmakasih\\b', replacements: ['makasii', 'mksih', 'makasihhh'] },
    { pattern: '\\bnggak\\b', replacements: ['ga', 'ngga'] },
    { pattern: '\\btidak\\b', replacements: ['ga', 'ngga'] },
  ];

  let result = text;
  // Apply a natural subset of quirks with fresh RegExp instances
  for (const q of quirks) {
    const rx = new RegExp(q.pattern, 'i');
    if (rx.test(result) && Math.random() < 0.5) {
      const pick = q.replacements[Math.floor(Math.random() * q.replacements.length)];
      result = result.replace(new RegExp(q.pattern, 'gi'), pick);
    }
  }

  return result;
}

