// ==============================================================================
// AUTHENTIC FACELESS FIRST-PERSON POV ACTIVITY PHOTOS (PAP)
// Candid, authentic POV moments without showing faces, exactly like real WhatsApp PAPs
// ==============================================================================

export interface PapPhoto {
  id: string;
  category: 'coffee' | 'study' | 'food' | 'walk' | 'relax' | 'commute' | 'sunset' | 'cooking';
  url: string;
  caption: string;
}

/**
 * Ensures any Pinterest image uses the compressed 474x resolution (low KB, fast loading)
 */
export function optimizeImageUrl(url: string): string {
  if (url.includes('pinimg.com')) {
    return url.replace(/\/(1200x|736x|564x)\//, '/474x/');
  }
  return url;
}

export const PAP_PHOTOS: PapPhoto[] = [
  // COFFEE / CAFE
  {
    id: 'pap-coffee-1',
    category: 'coffee',
    url: 'https://i.pinimg.com/474x/b2/27/dc/b227dc1e2f1d135352d47dfb3ee5f0ce.jpg',
    caption: 'Lagi ngopi santai di cafe favorit',
  },
  {
    id: 'pap-coffee-2',
    category: 'coffee',
    url: 'https://i.pinimg.com/474x/72/7f/eb/727febb45fc97e4af69f7f43d90bd3a8.jpg',
    caption: 'Me time bentar sambil minum kopi hangat',
  },
  {
    id: 'pap-coffee-3',
    category: 'coffee',
    url: 'https://i.pinimg.com/474x/7c/3e/09/7c3e093fe7646192787f48da5b13ff9b.jpg',
    caption: 'Iced latte biar harinya tetep melek hehe',
  },

  // STUDY / LAPTOP / WORK
  {
    id: 'pap-study-1',
    category: 'study',
    url: 'https://i.pinimg.com/474x/f7/d1/62/f7d1620b1c905f485790388daa75e34d.jpg',
    caption: 'Lagi nugas di depan laptop nih',
  },
  {
    id: 'pap-study-2',
    category: 'study',
    url: 'https://i.pinimg.com/474x/28/9f/88/289f88c2cde02ae555d150b7ac7d8298.jpg',
    caption: 'Lagi nyatet beberapa hal penting',
  },

  // FOOD / EATING
  {
    id: 'pap-food-1',
    category: 'food',
    url: 'https://i.pinimg.com/474x/c3/a2/ed/c3a2ed48c3c92387ecfb453f11b72a7c.jpg',
    caption: 'Waktunya makan! Makanan udah dateng nih',
  },
  {
    id: 'pap-food-2',
    category: 'food',
    url: 'https://i.pinimg.com/474x/18/7d/82/187d82996476bfc8d214a0fb7ed3cc1c.jpg',
    caption: 'Makan ramen anget-anget enak banget',
  },

  // WALK / OUTSIDE
  {
    id: 'pap-walk-1',
    category: 'walk',
    url: 'https://i.pinimg.com/474x/80/3f/f6/803ff67157fc94a9a5c4928aa0c0c4cd.jpg',
    caption: 'Lagi jalan sore bentar cari angin segar',
  },
  {
    id: 'pap-walk-2',
    category: 'walk',
    url: 'https://i.pinimg.com/474x/27/b2/95/27b295cd94b7c448e38b74e4251f922e.jpg',
    caption: 'Suasana di luar lagi teduh banget',
  },

  // RELAX / BED / HOME
  {
    id: 'pap-relax-1',
    category: 'relax',
    url: 'https://i.pinimg.com/474x/8a/0d/34/8a0d340eada60859f79fea6baeacbfbb.jpg',
    caption: 'Santai di kasur sambil baca buku',
  },
  {
    id: 'pap-relax-2',
    category: 'relax',
    url: 'https://i.pinimg.com/474x/af/7d/6c/af7d6c46b285fb0e86ef1f411ced7bd7.jpg',
    caption: 'Rebahan sejenak setelah seharian capek',
  },

  // COMMUTE / ON THE ROAD
  {
    id: 'pap-commute-1',
    category: 'commute',
    url: 'https://i.pinimg.com/474x/41/10/64/411064f979be37594c50dfd95a4f03a6.jpg',
    caption: 'Lagi di jalan nih, jalanan agak padat',
  },
  {
    id: 'pap-commute-2',
    category: 'commute',
    url: 'https://i.pinimg.com/474x/bd/cf/f6/bdcff634dd64de8c62789a8c2997fd9d.jpg',
    caption: 'Lagi perjalanan pulang nih',
  },

  // SUNSET / SKY
  {
    id: 'pap-sunset-1',
    category: 'sunset',
    url: 'https://i.pinimg.com/474x/84/c8/06/84c8065f142541a86915c8182385d13b.jpg',
    caption: 'Langit sore ini cakep banget ya',
  },
  {
    id: 'pap-sunset-2',
    category: 'sunset',
    url: 'https://i.pinimg.com/474x/3b/5b/65/3b5b65ca9540ac2d565bd4784af68ddf.jpg',
    caption: 'Liat sunset dari jendela, warnanya ungu keemasan',
  },

  // COOKING
  {
    id: 'pap-cooking-1',
    category: 'cooking',
    url: 'https://i.pinimg.com/474x/c1/8e/be/c18ebe2a7e5fd84b53861f2e5f79e0fb.jpg',
    caption: 'Lagi eksperimen masak sesuatu di dapur hehe',
  },
  {
    id: 'pap-cooking-2',
    category: 'cooking',
    url: 'https://i.pinimg.com/474x/6d/51/1c/6d511c5107f7509c01a4cf0d799bde85.jpg',
    caption: 'Siapin camilan sehat dulu',
  },
];

/**
 * Get a PAP photo by category with compressed URL
 */
export function getPapPhotoByCategory(category: string): PapPhoto {
  const norm = category.toLowerCase().trim();
  const matched = PAP_PHOTOS.filter((p) => p.category === norm);
  const picked = matched.length > 0
    ? matched[Math.floor(Math.random() * matched.length)]
    : PAP_PHOTOS[Math.floor(Math.random() * PAP_PHOTOS.length)];

  return {
    ...picked,
    url: optimizeImageUrl(picked.url),
  };
}

/**
 * Detect activity from text to find matching PAP photo
 */
export function detectPapCategory(text: string): PapPhoto | null {
  const lower = text.toLowerCase();

  if (lower.includes('kopi') || lower.includes('ngopi') || lower.includes('cafe')) {
    return getPapPhotoByCategory('coffee');
  }
  if (lower.includes('nugas') || lower.includes('belajar') || lower.includes('laptop') || lower.includes('kerja') || lower.includes('kerjaan')) {
    return getPapPhotoByCategory('study');
  }
  if (lower.includes('makan') || lower.includes('kuliner') || lower.includes('sarapan') || lower.includes('lunch') || lower.includes('dinner')) {
    return getPapPhotoByCategory('food');
  }
  if (lower.includes('jalan') || lower.includes('keluar') || lower.includes('taman')) {
    return getPapPhotoByCategory('walk');
  }
  if (lower.includes('rebahan') || lower.includes('santai') || lower.includes('kasur') || lower.includes('buku')) {
    return getPapPhotoByCategory('relax');
  }
  if (lower.includes('macet') || lower.includes('perjalanan') || lower.includes('pulang') || lower.includes('motor') || lower.includes('mobil')) {
    return getPapPhotoByCategory('commute');
  }
  if (lower.includes('sunset') || lower.includes('langit') || lower.includes('sore')) {
    return getPapPhotoByCategory('sunset');
  }
  if (lower.includes('masak') || lower.includes('dapur')) {
    return getPapPhotoByCategory('cooking');
  }

  // If user asks for "pap" or "lagi apa" in general
  if (lower.includes('pap') || lower.includes('lagi apa') || lower.includes('lagi ngapain')) {
    const popular: Array<'coffee' | 'study' | 'relax' | 'food' | 'sunset'> = ['coffee', 'study', 'relax', 'food', 'sunset'];
    const pick = popular[Math.floor(Math.random() * popular.length)];
    return getPapPhotoByCategory(pick);
  }

  return null;
}
