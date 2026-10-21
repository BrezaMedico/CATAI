export interface AvatarOption {
  id: string;
  name: string;
  gender: 'male' | 'female';
  url: string;
}

export const AVATAR_OPTIONS: AvatarOption[] = [
  // Male Avatars
  {
    id: 'male-1',
    name: 'Bagas',
    gender: 'male',
    url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80',
  },
  {
    id: 'male-2',
    name: 'Dimas',
    gender: 'male',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
  },
  {
    id: 'male-3',
    name: 'Reno',
    gender: 'male',
    url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
  },
  {
    id: 'male-4',
    name: 'Fathir',
    gender: 'male',
    url: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=200&auto=format&fit=crop&q=80',
  },

  // Female Avatars
  {
    id: 'female-1',
    name: 'Nadia',
    gender: 'female',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
  },
  {
    id: 'female-2',
    name: 'Clara',
    gender: 'female',
    url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80',
  },
  {
    id: 'female-3',
    name: 'Alya',
    gender: 'female',
    url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=200&auto=format&fit=crop&q=80',
  },
  {
    id: 'female-4',
    name: 'Tiara',
    gender: 'female',
    url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
  },
];

export function getDefaultAvatar(gender: 'male' | 'female'): string {
  return gender === 'male' ? AVATAR_OPTIONS[0].url : AVATAR_OPTIONS[4].url;
}
