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
 * Varied, natural, colloquial Indonesian photo captions tailored to each activity category
 */
export const CATEGORY_CAPTIONS: Record<string, string[]> = {
  coffee: [
    'Kopi dulu biar ga puyeng wkwk',
    'Me time bentar sambil ngopi santai',
    'Secangkir latte penolong hari ini hehe',
    'Vibes cafenya lagi asik bgt nih',
    'Ngopi tipis-tipis biar harinya tetep melek',
    'Cafe langganan emang paling bener suasananya',
    'Santai sejenak sambil ngopi enak bgt',
    'Kopi hangat penenang pikiran hari ini',
  ],
  study: [
    'Lagi nugas bentar nih di depan laptop wkwk',
    'Ditemani laptop seharian, tetep semangaatt',
    'Beresin beberapa deadline kerjaan dulu yaa',
    'Lagi fokus nyelesein catatan penting nih',
    'Meja kerja hari ini lumayan sibuk haha',
    'Ngerjain tugas dulu biar cepet beres',
    'Sedikit progres hari ini di depan laptop',
  ],
  food: [
    'Waktunya makan! Akhirnya makanan nyampe',
    'Makan enak dulu biar ga oleng wkwk',
    'Nyam! Aromanya enak bgt parah ga tahan',
    'Laper bgt dari tadi, mari makan!',
    'Menu hari ini mantep sih ga boong',
    'Makan dulu yaa, kamu jangan lupa makan juga!',
    'Porsi kenyang buat isi tenaga hari ini hehe',
  ],
  walk: [
    'Jalan sore bentar cari angin seger',
    'Keluar bentar biar pikiran ga suntuk hehe',
    'Suasana di luar lagi teduh bgt enak',
    'Cari udara luar dulu, adem bgt harinya',
    'Jalan-jalan santai bentar hilangkan penat',
    'Enak bgt udaranya sore ini, adem',
  ],
  relax: [
    'Rebahan di kasur, mager bgt asli wkwk',
    'Udah paling bener santai di kamar',
    'Kasur emang tempat terbaik setelah seharian aktivitas',
    'Me time santai di kasur sambil leha-leha',
    'Rebahan sejenak biar badan enakan hehe',
    'Mager mode on, kasur memanggil wkwk',
  ],
  commute: [
    'Lagi di jalan nih, jalanan agak padat',
    'Otw pulang, lumayan macet tapi santai aja',
    'Lagi di perjalanan, semoga cepet nyampe hehe',
    'Di jalan nih, bentar lagi nyampe kok',
    'Perjalanan pulang, ditemani lalu lintas sore',
  ],
  sunset: [
    'Liat langit sore ini, warnanya cakep parah',
    'Sunset sore ini adem bgt diliatnya',
    'Langitnya lagi estetik bgt ga boong',
    'Pemandangan langit sore bikin hati tenang',
    'Cakep bgt ya langitnya sore ini',
  ],
  cooking: [
    'Lagi eksperimen masak sesuatu di dapur nih hehe',
    'Bikin camilan bentar di dapur',
    'Masak ala-ala dulu biar hemat wkwk',
    'Lagi bikin yang anget-anget di dapur',
    'Uji coba resep baru di dapur hari ini',
  ],
};

/**
 * Generates a randomized, authentic Indonesian caption matching the ongoing conversation topic
 */
export function getRandomPapCaption(category: string, contextHint = ''): string {
  const norm = category.toLowerCase().trim();
  const lowerContext = contextHint.toLowerCase();

  // Contextual matching if hints are present in discussion
  if (norm === 'coffee') {
    if (lowerContext.includes('pusing') || lowerContext.includes('mumet') || lowerContext.includes('capek') || lowerContext.includes('lelah')) {
      const picks = [
        'Kopi dulu biar pikiran ga puyeng wkwk',
        'Butuh asupan kafein biar capeknya berkurang hehe',
        'Kopi penolong pas kepala lagi mumet bgt',
        'Secangkir kopi hangat biar agak tenang nih pikirannya',
      ];
      return picks[Math.floor(Math.random() * picks.length)];
    }
    if (lowerContext.includes('hujan') || lowerContext.includes('dingin') || lowerContext.includes('adem')) {
      const picks = [
        'Kopi hangat pas bgt nih nemenin hawa dingin',
        'Hawa dingin gini emang paling pas megang cangkir anget',
        'Lagi adem bgt suasananya, ditemani kopi panas hehe',
      ];
      return picks[Math.floor(Math.random() * picks.length)];
    }
    if (lowerContext.includes('ngantuk') || lowerContext.includes('melek') || lowerContext.includes('tidur')) {
      const picks = [
        'Kopi penolong biar ga ketiduran wkwk',
        'Butuh dorongan kafein biar matanya melek lagi',
        'Kopi dulu biar ga oleng wkwk',
      ];
      return picks[Math.floor(Math.random() * picks.length)];
    }
  }

  if (norm === 'food') {
    if (lowerContext.includes('laper') || lowerContext.includes('lapar') || lowerContext.includes('kelaparan')) {
      const picks = [
        'Makanan penolong pas lagi laper-lapernya wkwk',
        'Akhirnya makan juga setelah perut keroncongan haha',
        'Menu penyelamat perut laper hari ini',
        'Gak kuat nahan laper, mari makan dulu!',
      ];
      return picks[Math.floor(Math.random() * picks.length)];
    }
    if (lowerContext.includes('hujan') || lowerContext.includes('dingin')) {
      const picks = [
        'Makan anget-anget pas bgt hawanya dingin',
        'Kuah anget paling juara pas cuaca lagi adem gini',
        'Anget-anget gini pas bgt dinikmatin santai',
      ];
      return picks[Math.floor(Math.random() * picks.length)];
    }
    if (lowerContext.includes('siang') || lowerContext.includes('lunch')) {
      const picks = [
        'Makan siang dulu biar tetep bertenaga!',
        'Menu makan siang hari ini mantep bgt hehe',
        'Isi amunisi siang dulu biar ga lemes',
      ];
      return picks[Math.floor(Math.random() * picks.length)];
    }
    if (lowerContext.includes('malam') || lowerContext.includes('dinner')) {
      const picks = [
        'Makan malam santai dulu nih',
        'Menu dinner penutup hari yang melelahkan hehe',
      ];
      return picks[Math.floor(Math.random() * picks.length)];
    }
  }

  if (norm === 'relax') {
    if (lowerContext.includes('capek') || lowerContext.includes('lelah') || lowerContext.includes('pegel') || lowerContext.includes('pusing')) {
      const picks = [
        'Rebahan dulu bentar biar capeknya luntur hehe',
        'Kasur emang tempat paling juara pas badan pegel wkwk',
        'Istirahat sejenak meluruskan badan setelah seharian',
        'Rebahan bentar, rasanya nikmat bgt pas capek gini',
      ];
      return picks[Math.floor(Math.random() * picks.length)];
    }
    if (lowerContext.includes('mager') || lowerContext.includes('malas')) {
      const picks = [
        'Mager mode on, kasur emang paling juara wkwk',
        'Santai sejenak di kamar, adem bgt suasananya',
        'Lagi menikmati rebahan santai tanpa beban hehe',
      ];
      return picks[Math.floor(Math.random() * picks.length)];
    }
  }

  if (norm === 'study') {
    if (lowerContext.includes('deadline') || lowerContext.includes('tugas') || lowerContext.includes('kerja') || lowerContext.includes('skripsi')) {
      const picks = [
        'Ditemani laptop seharian, beresin deadline dulu yaa',
        'Kejar deadline dikit lagi biar tenang wkwk',
        'Fokus di depan laptop dulu bentar, semangat!',
        'Nugas tipis-tipis biar ga numpuk besok',
      ];
      return picks[Math.floor(Math.random() * picks.length)];
    }
  }

  if (norm === 'walk') {
    if (lowerContext.includes('sore') || lowerContext.includes('senja')) {
      const picks = [
        'Jalan sore bentar cari angin seger biar adem',
        'Suasana sore di luar lagi teduh bgt',
        'Jalan santai bentar sambil ngeliat langit sore',
      ];
      return picks[Math.floor(Math.random() * picks.length)];
    }
    if (lowerContext.includes('suntuk') || lowerContext.includes('bosan') || lowerContext.includes('mumet')) {
      const picks = [
        'Keluar bentar biar pikiran ga suntuk hehe',
        'Cari angin di luar, segerr bgt suasananya',
        'Jalan santai bentar hilangkan penat',
      ];
      return picks[Math.floor(Math.random() * picks.length)];
    }
  }

  if (norm === 'commute') {
    if (lowerContext.includes('pulang') || lowerContext.includes('balik')) {
      const picks = [
        'Otw perjalanan pulang nih, lumayan padat tapi sans aja',
        'Perjalanan pulang nih, santai aja nikmatin jalanan',
        'Lagi di jalan balik ke rumah hehe',
      ];
      return picks[Math.floor(Math.random() * picks.length)];
    }
    if (lowerContext.includes('macet') || lowerContext.includes('padat')) {
      const picks = [
        'Jalanan lumayan ramai, dinikmatin aja sambil denger lagu',
        'Macet dikit tapi gapapa sambil santai',
      ];
      return picks[Math.floor(Math.random() * picks.length)];
    }
  }

  if (norm === 'sunset') {
    const picks = [
      'Liat langit sore ini, warnanya cakep parah',
      'Sunset sore ini bikin hati adem bgt',
      'Langitnya lagi estetik bgt sore ini, liat deh',
      'Pemandangan langit sore favorit nih',
      'Cakep bgt ya langitnya sore ini',
    ];
    return picks[Math.floor(Math.random() * picks.length)];
  }

  if (norm === 'cooking') {
    const picks = [
      'Lagi eksperimen masak sesuatu di dapur nih hehe',
      'Bikin camilan bentar di dapur biar ga gabut',
      'Masak sendiri dulu, semoga rasanya pas wkwk',
      'Aroma masakannya udah wangi bgt nih di dapur',
    ];
    return picks[Math.floor(Math.random() * picks.length)];
  }

  // Random pick from authentic captions for this category
  const list = CATEGORY_CAPTIONS[norm] || CATEGORY_CAPTIONS['relax'];
  return list[Math.floor(Math.random() * list.length)];
}

/**
 * Get a PAP photo by category with compressed URL and randomized contextual caption
 */
export function getPapPhotoByCategory(category: string, contextHint = ''): PapPhoto {
  const norm = category.toLowerCase().trim();
  const matched = PAP_PHOTOS.filter((p) => p.category === norm);
  const picked = matched.length > 0
    ? matched[Math.floor(Math.random() * matched.length)]
    : PAP_PHOTOS[Math.floor(Math.random() * PAP_PHOTOS.length)];

  return {
    ...picked,
    url: optimizeImageUrl(picked.url),
    caption: getRandomPapCaption(norm, contextHint),
  };
}

/**
 * Detect activity from text to find matching PAP photo
 */
export function detectPapCategory(text: string, contextHint = ''): PapPhoto | null {
  const lower = text.toLowerCase();

  if (lower.includes('kopi') || lower.includes('ngopi') || lower.includes('cafe')) {
    return getPapPhotoByCategory('coffee', contextHint);
  }
  if (lower.includes('nugas') || lower.includes('belajar') || lower.includes('laptop') || lower.includes('kerja') || lower.includes('kerjaan')) {
    return getPapPhotoByCategory('study', contextHint);
  }
  if (lower.includes('makan') || lower.includes('kuliner') || lower.includes('sarapan') || lower.includes('lunch') || lower.includes('dinner')) {
    return getPapPhotoByCategory('food', contextHint);
  }
  if (lower.includes('jalan') || lower.includes('keluar') || lower.includes('taman')) {
    return getPapPhotoByCategory('walk', contextHint);
  }
  if (lower.includes('rebahan') || lower.includes('santai') || lower.includes('kasur') || lower.includes('buku')) {
    return getPapPhotoByCategory('relax', contextHint);
  }
  if (lower.includes('macet') || lower.includes('perjalanan') || lower.includes('pulang') || lower.includes('motor') || lower.includes('mobil')) {
    return getPapPhotoByCategory('commute', contextHint);
  }
  if (lower.includes('sunset') || lower.includes('langit') || lower.includes('sore')) {
    return getPapPhotoByCategory('sunset', contextHint);
  }
  if (lower.includes('masak') || lower.includes('dapur')) {
    return getPapPhotoByCategory('cooking', contextHint);
  }

  // If user asks for "pap" in general, pick a popular category
  if (lower.includes('pap') || lower.includes('foto')) {
    const popular: Array<'coffee' | 'study' | 'relax' | 'food' | 'sunset'> = ['coffee', 'study', 'relax', 'food', 'sunset'];
    const pick = popular[Math.floor(Math.random() * popular.length)];
    return getPapPhotoByCategory(pick, contextHint);
  }

  return null;
}
