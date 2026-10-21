// ==============================================================================
// CUTE ANIMATED STICKERS COLLECTION
// Official Google Noto Animated WebP Stickers (Ultra lightweight: ~8KB - 15KB)
// ==============================================================================

export interface CuteSticker {
  id: string;
  category: 'laugh' | 'cute' | 'love' | 'shocked' | 'cry' | 'coffee' | 'food' | 'sleepy' | 'wave' | 'cheer' | 'thumbsup';
  url: string;
  name: string;
}

export const CUTE_STICKERS: CuteSticker[] = [
  // Laughing / Funny
  { id: 'stk-laugh-1', category: 'laugh', url: 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f602/512.webp', name: 'Tears of Joy' },
  { id: 'stk-laugh-2', category: 'laugh', url: 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f606/512.webp', name: 'Squinting Laugh' },
  { id: 'stk-laugh-3', category: 'laugh', url: 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f639/512.webp', name: 'Cat Laugh' },

  // Cute / Pleading / Imut
  { id: 'stk-cute-1', category: 'cute', url: 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f97a/512.webp', name: 'Pleading Eyes' },
  { id: 'stk-cute-2', category: 'cute', url: 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f431/512.webp', name: 'Cute Cat' },
  { id: 'stk-cute-3', category: 'cute', url: 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f638/512.webp', name: 'Grinning Cat' },
  { id: 'stk-cute-4', category: 'cute', url: 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f63a/512.webp', name: 'Smiling Cat' },

  // Love / Warmth / Sweet
  { id: 'stk-love-1', category: 'love', url: 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f970/512.webp', name: 'In Love 3 Hearts' },
  { id: 'stk-love-2', category: 'love', url: 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f63b/512.webp', name: 'Heart Eyes Cat' },
  { id: 'stk-love-3', category: 'love', url: 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f917/512.webp', name: 'Warm Hug' },
  { id: 'stk-love-4', category: 'love', url: 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f60a/512.webp', name: 'Blushing Smile' },

  // Shocked / Surprised
  { id: 'stk-shocked-1', category: 'shocked', url: 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f92f/512.webp', name: 'Mind Blown' },
  { id: 'stk-shocked-2', category: 'shocked', url: 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f640/512.webp', name: 'Weary Shocked Cat' },
  { id: 'stk-shocked-3', category: 'shocked', url: 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f633/512.webp', name: 'Flushed' },

  // Cry / Sad / Touched
  { id: 'stk-cry-1', category: 'cry', url: 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f62d/512.webp', name: 'Loud Crying' },

  // Coffee / Chill
  { id: 'stk-coffee-1', category: 'coffee', url: 'https://fonts.gstatic.com/s/e/notoemoji/latest/2615/512.webp', name: 'Hot Steaming Coffee' },

  // Food / Hungry
  { id: 'stk-food-1', category: 'food', url: 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f924/512.webp', name: 'Drooling Delicious' },

  // Sleepy / Night
  { id: 'stk-sleepy-1', category: 'sleepy', url: 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f634/512.webp', name: 'Sleeping Zzz' },

  // Waving / Greeting
  { id: 'stk-wave-1', category: 'wave', url: 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f44b/512.webp', name: 'Waving Hand' },

  // Cheer / Party
  { id: 'stk-cheer-1', category: 'cheer', url: 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f389/512.webp', name: 'Party Popper' },

  // Thumbs Up / Respect
  { id: 'stk-thumbsup-1', category: 'thumbsup', url: 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f44d/512.webp', name: 'Thumbs Up' },
  { id: 'stk-thumbsup-2', category: 'thumbsup', url: 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f64f/512.webp', name: 'Folded Hands' },
];

/**
 * Get a contextual cute sticker based on category or message sentiment
 */
export function getStickerByCategory(cat: string): CuteSticker {
  const normalized = cat.toLowerCase().trim();
  const matched = CUTE_STICKERS.filter((s) => s.category === normalized);
  if (matched.length > 0) {
    return matched[Math.floor(Math.random() * matched.length)];
  }
  // Fallback to random cute sticker
  return CUTE_STICKERS[Math.floor(Math.random() * CUTE_STICKERS.length)];
}

/**
 * Detect appropriate sticker category from text content
 */
export function detectStickerCategory(text: string): CuteSticker | null {
  const lower = text.toLowerCase();

  if (lower.includes('wkwk') || lower.includes('haha') || lower.includes('hehe') || lower.includes('lucu')) {
    return getStickerByCategory('laugh');
  }
  if (lower.includes('kopi') || lower.includes('ngopi') || lower.includes('cafe')) {
    return getStickerByCategory('coffee');
  }
  if (lower.includes('makan') || lower.includes('laper') || lower.includes('kenyang') || lower.includes('enak')) {
    return getStickerByCategory('food');
  }
  if (lower.includes('sayang') || lower.includes('semangat ya') || lower.includes('makasih') || lower.includes('seneng')) {
    return getStickerByCategory('love');
  }
  if (lower.includes('capek') || lower.includes('sedih') || lower.includes('hiks') || lower.includes('nangis')) {
    return getStickerByCategory('cry');
  }
  if (lower.includes('kaget') || lower.includes('astaga') || lower.includes('waduh') || lower.includes('wah')) {
    return getStickerByCategory('shocked');
  }
  if (lower.includes('ngantuk') || lower.includes('tidur') || lower.includes('bobok') || lower.includes('night')) {
    return getStickerByCategory('sleepy');
  }
  if (lower.includes('halo') || lower.includes('hai') || lower.includes('hei') || lower.includes('pagi')) {
    return getStickerByCategory('wave');
  }
  if (lower.includes('oke') || lower.includes('siap') || lower.includes('mantap') || lower.includes('sip')) {
    return getStickerByCategory('thumbsup');
  }

  // 40% chance of random cute sticker if general
  if (Math.random() < 0.4) {
    return getStickerByCategory('cute');
  }

  return null;
}
