import React, { useState, useRef } from 'react';
import {
  X,
  User,
  Shield,
  Trash2,
  LogOut,
  Image as ImageIcon,
  Link as LinkIcon,
  Check,
  ExternalLink,
  Edit3,
  Camera,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CompanionGender, CompanionProfile } from '../types';
import { AVATAR_OPTIONS } from '../utils/avatars';
import { extractUrls, formatUrlForDisplay } from '../utils/urlHelper';
import { compressImageToBase64 } from '../utils/imageCompressor';

interface ProfileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileDrawer: React.FC<ProfileDrawerProps> = ({ isOpen, onClose }) => {
  const { companion, updateCompanion, logout, clearChat, messages, typingSpeed, setTypingSpeed } = useApp();

  const [activeTab, setActiveTab] = useState<'profile' | 'media' | 'links'>('profile');

  // Edit states
  const [userName, setUserName] = useState(companion?.user_nickname || '');
  const [compName, setCompName] = useState(companion?.name || '');
  const [gender, setGender] = useState<CompanionGender>(companion?.gender || 'female');
  const [traits, setTraits] = useState<string[]>(companion?.traits || []);
  const [avatar, setAvatar] = useState(companion?.avatar || '');
  const [isSaved, setIsSaved] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const [selectedMediaPhoto, setSelectedMediaPhoto] = useState<string | null>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingAvatar(true);
    try {
      const compressed = await compressImageToBase64(file, 400, 400, 0.8);
      setAvatar(compressed);
    } catch (err) {
      console.warn('Failed to compress avatar:', err);
    } finally {
      setIsUploadingAvatar(false);
      if (avatarInputRef.current) avatarInputRef.current.value = '';
    }
  };

  if (!isOpen || !companion) return null;

  // Extract media and links from messages
  const mediaItems = messages.filter((m) => !!m.media_url);

  const linkItems: Array<{ url: string; domain: string; date: string }> = [];
  messages.forEach((m) => {
    const urls = extractUrls(m.content);
    urls.forEach((u) => {
      linkItems.push({
        url: u.url,
        domain: u.domain,
        date: m.created_at,
      });
    });
  });

  const availableTraits =
    gender === 'male'
      ? [
          'Humoris & Receh',
          'Pendengar Setia',
          'Cool tapi Perhatian',
          'Suportif & Dewasa',
          'Teman Deep Talk',
          'Humble & Santai',
        ]
      : [
          'Ceria & Asik',
          'Lembut & Perhatian',
          'Humoris & Seru',
          'Pendengar yang Baik',
          'Suportif & Humble',
          'Teman Curhat Setia',
        ];

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim() || !compName.trim()) return;

    const updated: CompanionProfile = {
      ...companion,
      user_nickname: userName.trim(),
      name: compName.trim(),
      gender,
      traits: traits.length > 0 ? traits : companion.traits,
      avatar: avatar || companion.avatar,
      updated_at: new Date().toISOString(),
    };

    await updateCompanion(updated);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const toggleTrait = (trait: string) => {
    if (traits.includes(trait)) {
      if (traits.length > 1) {
        setTraits(traits.filter((t) => t !== trait));
      }
    } else {
      if (traits.length < 3) {
        setTraits([...traits, trait]);
      }
    }
  };

  const handleClearHistory = async () => {
    await clearChat();
    setConfirmClear(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/75 animate-fadeIn">
      {/* Drawer Container */}
      <div className="w-full max-w-md h-full bg-[#11151F] border-l border-[#1E2433] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-[#1E2433] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-white">Profil & Pengaturan</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-zinc-400 hover:text-white hover:bg-[#161B26] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="grid grid-cols-3 border-b border-[#1E2433] bg-[#0A0D14]">
          <button
            onClick={() => setActiveTab('profile')}
            className={`py-2.5 text-xs font-medium border-b-2 transition-colors flex items-center justify-center gap-1.5 ${
              activeTab === 'profile'
                ? 'border-[#00FF66] text-[#00FF66] bg-[#11151F]'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Profil</span>
          </button>
          <button
            onClick={() => setActiveTab('media')}
            className={`py-2.5 text-xs font-medium border-b-2 transition-colors flex items-center justify-center gap-1.5 ${
              activeTab === 'media'
                ? 'border-[#00FF66] text-[#00FF66] bg-[#11151F]'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Foto ({mediaItems.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('links')}
            className={`py-2.5 text-xs font-medium border-b-2 transition-colors flex items-center justify-center gap-1.5 ${
              activeTab === 'links'
                ? 'border-[#00FF66] text-[#00FF66] bg-[#11151F]'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <LinkIcon className="w-3.5 h-3.5" />
            <span>Tautan ({linkItems.length})</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* TAB 1: EDIT PROFILE */}
          {activeTab === 'profile' && (
            <form onSubmit={handleSaveProfile} className="space-y-4">
              {/* Security Badge */}
              <div className="p-3 rounded-md bg-[#090C12] border border-[#1E2433] flex items-center gap-2.5">
                <div className="w-7 h-7 rounded bg-[#161B26] border border-[#262F40] text-[#00FF66] flex items-center justify-center shrink-0">
                  <Shield className="w-3.5 h-3.5" />
                </div>
                <div>
                  <p className="text-xs font-medium text-white">Privasi Terproteksi</p>
                  <p className="text-[11px] font-mono text-[#00FF66] flex items-center gap-1">
                    <span>🔒 End-to-End AES-256 Encrypted</span>
                  </p>
                </div>
              </div>

              {/* User Nickname */}
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">
                  Nama Panggilan Kamu
                </label>
                <input
                  type="text"
                  required
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full px-3 py-2 bg-[#090C12] border border-[#1E2433] rounded-md text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#00FF66]"
                />
              </div>

              {/* Companion Name */}
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">
                  Nama Teman
                </label>
                <input
                  type="text"
                  required
                  value={compName}
                  onChange={(e) => setCompName(e.target.value)}
                  className="w-full px-3 py-2 bg-[#090C12] border border-[#1E2433] rounded-md text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#00FF66]"
                />
              </div>

              {/* Gender */}
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">
                  Karakter Teman
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setGender('male')}
                    className={`py-2 px-3 text-xs rounded border text-center transition-colors ${
                      gender === 'male'
                        ? 'bg-[#141A26] border-[#00FF66] text-white'
                        : 'bg-[#090C12] border-[#1E2433] text-zinc-400'
                    }`}
                  >
                    Sahabat Cowok
                  </button>
                  <button
                    type="button"
                    onClick={() => setGender('female')}
                    className={`py-2 px-3 text-xs rounded border text-center transition-colors ${
                      gender === 'female'
                        ? 'bg-[#141A26] border-[#00FF66] text-white'
                        : 'bg-[#090C12] border-[#1E2433] text-zinc-400'
                    }`}
                  >
                    Sahabat Cewek
                  </button>
                </div>
              </div>

              {/* Traits */}
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">
                  Sifat Teman (Maksimal 3)
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {availableTraits.map((t) => {
                    const sel = traits.includes(t);
                    return (
                      <button
                        key={t}
                        type="button"
                        onClick={() => toggleTrait(t)}
                        className={`p-2 text-[11px] rounded border text-left flex items-center justify-between ${
                          sel
                            ? 'bg-[#141A26] border-[#00FF66] text-white'
                            : 'bg-[#090C12] border-[#1E2433] text-zinc-400'
                        }`}
                      >
                        <span className="truncate">{t}</span>
                        {sel && <Check className="w-3 h-3 text-[#00FF66] shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Avatar Selector & Custom PP Upload */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-medium text-zinc-300">
                    Foto Profil Teman (PP)
                  </label>
                  <span className="text-[10px] text-zinc-400 font-mono">Bisa upload foto sendiri</span>
                </div>

                {/* Hidden File Input for Custom Avatar */}
                <input
                  type="file"
                  ref={avatarInputRef}
                  onChange={handleAvatarUpload}
                  accept="image/*"
                  className="hidden"
                />

                {/* Active PP & Upload Action Banner */}
                <div className="p-3 bg-[#090C12] border border-[#1E2433] rounded-lg mb-2.5 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden border-2 border-[#00FF66] shrink-0 bg-[#161B26]">
                      <img
                        src={avatar || companion.avatar}
                        alt="Current PP"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-white truncate">{compName || companion.name}</p>
                      <p className="text-[11px] text-[#00FF66] font-mono">
                        {avatar.startsWith('data:image') ? 'Foto Kustom Aktif' : 'Avatar Terpilih'}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={isUploadingAvatar}
                    onClick={() => avatarInputRef.current?.click()}
                    className="px-3 py-1.5 rounded-md bg-[#161B26] hover:bg-[#202738] active:scale-95 border border-[#262F40] text-[#00FF66] text-xs font-medium flex items-center gap-1.5 transition-all shrink-0"
                    title="Ganti Foto Profil dari Galeri"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>{isUploadingAvatar ? 'Mengompres...' : 'Ganti PP'}</span>
                  </button>
                </div>

                {/* Preset Avatars Grid */}
                <div className="grid grid-cols-4 gap-2">
                  {/* If user uploaded a custom avatar, display it as first option */}
                  {avatar.startsWith('data:image') && (
                    <button
                      type="button"
                      onClick={() => setAvatar(avatar)}
                      className="aspect-square rounded-md overflow-hidden border relative border-[#00FF66] ring-1 ring-[#00FF66] bg-[#161B26]"
                      title="Foto Kustom Anda"
                    >
                      <img src={avatar} alt="Foto Kustom" className="w-full h-full object-cover" />
                      <div className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-[#00FF66] text-[#07090E] flex items-center justify-center">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </div>
                    </button>
                  )}

                  {AVATAR_OPTIONS.filter((a) => a.gender === gender).map((a) => {
                    const isSelected = avatar === a.url;
                    return (
                      <button
                        key={a.id}
                        type="button"
                        onClick={() => setAvatar(a.url)}
                        className={`aspect-square rounded-md overflow-hidden border relative transition-all ${
                          isSelected ? 'border-[#00FF66] ring-1 ring-[#00FF66]' : 'border-[#1E2433] opacity-80 hover:opacity-100'
                        }`}
                      >
                        <img src={a.url} alt={a.name} className="w-full h-full object-cover" />
                        {isSelected && (
                          <div className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-[#00FF66] text-[#07090E] flex items-center justify-center">
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Response Speed & Typing Delay Preference */}
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">
                  Kecepatan & Waktu Balas
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setTypingSpeed('realistic')}
                    className={`p-2 rounded border text-center transition-colors ${
                      typingSpeed === 'realistic'
                        ? 'bg-[#141A26] border-[#00FF66] text-white'
                        : 'bg-[#090C12] border-[#1E2433] text-zinc-400'
                    }`}
                  >
                    <p className="text-[11px] font-semibold">Realistis</p>
                    <p className="text-[9px] text-[#00FF66] font-mono mt-0.5">0.5s / huruf</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTypingSpeed('natural')}
                    className={`p-2 rounded border text-center transition-colors ${
                      typingSpeed === 'natural'
                        ? 'bg-[#141A26] border-[#00FF66] text-white'
                        : 'bg-[#090C12] border-[#1E2433] text-zinc-400'
                    }`}
                  >
                    <p className="text-[11px] font-semibold">Santai</p>
                    <p className="text-[9px] text-zinc-500 font-mono mt-0.5">0.1s / huruf</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTypingSpeed('instant')}
                    className={`p-2 rounded border text-center transition-colors ${
                      typingSpeed === 'instant'
                        ? 'bg-[#141A26] border-[#00FF66] text-white'
                        : 'bg-[#090C12] border-[#1E2433] text-zinc-400'
                    }`}
                  >
                    <p className="text-[11px] font-semibold">Instan</p>
                    <p className="text-[9px] text-zinc-500 font-mono mt-0.5">Tanpa jeda</p>
                  </button>
                </div>
                <p className="text-[10px] text-zinc-500 mt-1 leading-relaxed">
                  {typingSpeed === 'realistic' && 'Teman membaca dengan jeda alami (0-2 menit) dan mengetik 0.5 detik per huruf.'}
                  {typingSpeed === 'natural' && 'Jeda membaca santai dan mengetik dengan ritme wajar.'}
                  {typingSpeed === 'instant' && 'Pesan langsung dibaca dan dibalas seketika.'}
                </p>
              </div>

              {/* Save Button */}
              <button
                type="submit"
                className="w-full py-2.5 bg-[#00FF66] hover:bg-[#00E55C] active:translate-y-[1px] text-[#07090E] font-semibold text-xs rounded-md transition-all flex items-center justify-center gap-1.5"
              >
                {isSaved ? <Check className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
                <span>{isSaved ? 'Perubahan Disimpan!' : 'Simpan Perubahan'}</span>
              </button>
            </form>
          )}

          {/* TAB 2: MEDIA GALLERY */}
          {activeTab === 'media' && (
            <div className="space-y-3">
              {mediaItems.length === 0 ? (
                <div className="py-12 text-center text-zinc-500 text-xs">
                  Belum ada foto yang dibagikan dalam obrolan.
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2.5">
                  {mediaItems.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => setSelectedMediaPhoto(item.media_url || null)}
                      className="aspect-square bg-[#090C12] border border-[#1E2433] hover:border-[#00FF66] rounded-md overflow-hidden group relative cursor-pointer transition-colors"
                      title="Klik untuk perbesar"
                    >
                      <img
                        src={item.media_url}
                        alt="Media obrolan"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute bottom-0 inset-x-0 p-1.5 bg-black/80 text-[10px] text-zinc-300 font-mono truncate">
                        {new Date(item.created_at).toLocaleDateString('id-ID')}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: LINKS GALLERY */}
          {activeTab === 'links' && (
            <div className="space-y-2.5">
              {linkItems.length === 0 ? (
                <div className="py-12 text-center text-zinc-500 text-xs">
                  Belum ada tautan yang dikirim dalam obrolan.
                </div>
              ) : (
                linkItems.map((link, idx) => (
                  <a
                    key={idx}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 bg-[#090C12] hover:bg-[#141A26] border border-[#1E2433] rounded-md flex items-center justify-between gap-3 text-left transition-colors group block"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-white group-hover:text-[#00FF66] truncate transition-colors">
                        {link.domain}
                      </p>
                      <p className="text-[11px] text-zinc-400 font-mono truncate">
                        {formatUrlForDisplay(link.url)}
                      </p>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-zinc-500 group-hover:text-[#00FF66] shrink-0 transition-colors" />
                  </a>
                ))
              )}
            </div>
          )}

          {/* Bottom Actions */}
          <div className="pt-4 border-t border-[#1E2433] space-y-2">
            {confirmClear ? (
              <div className="p-3 rounded-md bg-red-950/30 border border-red-900/50 space-y-2">
                <p className="text-xs text-red-300">
                  Hapus seluruh riwayat pesan dengan {companion.name}?
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={handleClearHistory}
                    className="py-1 px-3 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded"
                  >
                    Ya, Bersihkan
                  </button>
                  <button
                    onClick={() => setConfirmClear(false)}
                    className="py-1 px-3 bg-[#161B26] text-zinc-300 text-xs font-medium rounded border border-[#262F40]"
                  >
                    Batal
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmClear(true)}
                className="w-full py-2 px-3 rounded-md bg-[#090C12] hover:bg-[#161B26] border border-[#1E2433] text-zinc-300 hover:text-red-400 text-xs flex items-center justify-center gap-2 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Hapus Riwayat Obrolan</span>
              </button>
            )}

            <button
              type="button"
              onClick={logout}
              className="w-full py-2 px-3 rounded-md bg-[#090C12] hover:bg-[#161B26] border border-[#1E2433] text-zinc-400 hover:text-white text-xs flex items-center justify-center gap-2 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Keluar dari Akun</span>
            </button>
          </div>
        </div>
      </div>

      {/* Fullscreen Photo Lightbox from Media Gallery */}
      {selectedMediaPhoto && (
        <div
          className="fixed inset-0 z-[60] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setSelectedMediaPhoto(null)}
        >
          <button
            type="button"
            onClick={() => setSelectedMediaPhoto(null)}
            className="absolute top-4 right-4 p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-10"
            title="Tutup (ESC)"
          >
            <X className="w-5 h-5" />
          </button>
          <img
            src={selectedMediaPhoto}
            alt="Media Fullscreen"
            className="max-w-full max-h-[85vh] w-auto h-auto object-contain rounded-lg shadow-2xl border border-[#1E2433]"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
};
