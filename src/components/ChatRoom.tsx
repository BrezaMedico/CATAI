import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  ImagePlus,
  Smile,
  Settings as SettingsIcon,
  Hand,
  X,
  Shield,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { compressImageToBase64 } from '../utils/imageCompressor';
import { extractUrls } from '../utils/urlHelper';
import { LinkPreviewCard } from './LinkPreviewCard';
import { ProfileDrawer } from './ProfileDrawer';

const QUICK_EMOJIS = ['😊', '😂', '🥰', '👍', '🙏', '❤️', '☕', '🔥', '🥺', '✨', '👋', '🎉'];

export const ChatRoom: React.FC = () => {
  const {
    companion,
    messages,
    isTyping,
    isCompanionOnline,
    lastSeenText,
    sendMessage,
    pokeCompanion,
    resetIdleTimer,
    navigation,
    setNavigation,
  } = useApp();

  const [inputText, setInputText] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(navigation === 'SETTINGS');
  const [viewingPhoto, setViewingPhoto] = useState<{ url: string; caption?: string } | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setViewingPhoto(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (navigation === 'SETTINGS') {
      setIsSettingsOpen(true);
    }
  }, [navigation]);

  const handleOpenSettings = () => {
    setIsSettingsOpen(true);
    setNavigation('SETTINGS');
  };

  const handleCloseSettings = () => {
    setIsSettingsOpen(false);
    setNavigation('CHAT');
  };

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textInputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom whenever messages or typing change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  if (!companion) return null;

  // Handle image upload and compression
  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsCompressing(true);
    try {
      const base64 = await compressImageToBase64(file, 720, 960, 0.75);
      setSelectedImage(base64);
    } catch (err) {
      console.warn('Image compression failed:', err);
    } finally {
      setIsCompressing(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Handle message sending
  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() && !selectedImage) return;

    const textToSend = inputText;
    const imgToSend = selectedImage || undefined;

    setInputText('');
    setSelectedImage(null);
    setShowEmojiPicker(false);

    await sendMessage(textToSend, imgToSend);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    resetIdleTimer();
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const addEmoji = (emoji: string) => {
    setInputText((prev) => prev + emoji);
    resetIdleTimer();
    textInputRef.current?.focus();
  };

  // Recent shared photos in sidebar
  const mediaItems = messages.filter((m) => !!m.media_url);

  return (
    <div className="h-screen w-full flex bg-[#07090E] overflow-hidden text-white font-sans">
      {/* =========================================================================
          DESKTOP SIDEBAR (>= 768px)
      ========================================================================= */}
      <aside className="hidden md:flex w-80 lg:w-96 flex-col bg-[#0B0E17] border-r border-[#1E2433] shrink-0 h-full">
        {/* Sidebar Header */}
        <div className="p-4 border-b border-[#1E2433] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-[#00FF66] animate-pulse" />
            <span className="text-xs font-mono font-semibold text-zinc-300">
              TEMAN NGOBROL VIRTUAL
            </span>
          </div>
          <button
            onClick={handleOpenSettings}
            className="p-1.5 rounded-md hover:bg-[#161B26] text-zinc-400 hover:text-white transition-colors"
            title="Buka Pengaturan"
          >
            <SettingsIcon className="w-4 h-4" />
          </button>
        </div>

        {/* Companion Card */}
        <div className="p-5 border-b border-[#1E2433] text-center">
          <div className="relative w-20 h-20 mx-auto mb-3">
            <img
              src={companion.avatar}
              alt={companion.name}
              className="w-full h-full object-cover rounded-lg border-2 border-[#1E2433]"
            />
            <div
              className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-[#0B0E17] ${
                isCompanionOnline || isTyping ? 'bg-[#00FF66]' : 'bg-zinc-600'
              }`}
            />
          </div>

          <h2 className="text-base font-bold text-white">{companion.name}</h2>
          <div className="mt-1 flex items-center justify-center gap-1.5 text-xs">
            {isTyping ? (
              <span className="text-[#00FF66] font-medium font-mono text-[11px] animate-pulse">
                sedang mengetik...
              </span>
            ) : isCompanionOnline ? (
              <span className="text-[#00FF66] font-medium font-mono text-[11px] flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00FF66] animate-pulse" />
                Online
              </span>
            ) : (
              <span className="text-zinc-500 font-mono text-[11px] truncate">
                {lastSeenText}
              </span>
            )}
          </div>

          <div className="mt-3 flex flex-wrap justify-center gap-1.5">
            {companion.traits.map((trait) => (
              <span
                key={trait}
                className="px-2 py-0.5 text-[11px] font-mono rounded bg-[#131926] border border-[#20293D] text-[#10B981]"
              >
                {trait}
              </span>
            ))}
          </div>
        </div>

        {/* Quick Poke Button */}
        <div className="p-4 border-b border-[#1E2433]">
          <button
            onClick={pokeCompanion}
            disabled={isTyping}
            className="w-full py-2.5 px-3 rounded-md bg-[#11151F] hover:bg-[#161B26] border border-[#1E2433] hover:border-[#00FF66]/50 text-xs font-semibold text-white flex items-center justify-center gap-2 transition-all active:translate-y-[1px]"
          >
            <Hand className="w-3.5 h-3.5 text-[#00FF66]" />
            <span>Panggil Sapaan (Colek Teman)</span>
          </button>
        </div>

        {/* Media Highlights in Sidebar */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span className="font-semibold text-zinc-300">Foto Bersama</span>
            <span className="font-mono text-[11px]">{mediaItems.length} Foto</span>
          </div>

          {mediaItems.length === 0 ? (
            <div className="p-6 text-center border border-dashed border-[#1E2433] rounded-md text-xs text-zinc-500">
              Kirim foto untuk melihat galeri di sini
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {mediaItems.slice(0, 6).map((item) => (
                <div
                  key={item.id}
                  onClick={() => setViewingPhoto({ url: item.media_url!, caption: item.content })}
                  className="aspect-square rounded-md overflow-hidden border border-[#1E2433] bg-[#07090E] cursor-pointer hover:border-[#00FF66] transition-colors"
                  title="Klik untuk perbesar"
                >
                  <img
                    src={item.media_url}
                    alt="shared"
                    className="w-full h-full object-cover hover:scale-105 transition-transform"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Encryption Footer Note */}
        <div className="p-3 bg-[#080B12] border-t border-[#1E2433] flex items-center gap-2">
          <Shield className="w-3.5 h-3.5 text-[#00FF66] shrink-0" />
          <span className="text-[10px] font-mono text-zinc-400 truncate">
            AES-256 Terenkripsi End-to-End
          </span>
        </div>
      </aside>

      {/* =========================================================================
          MAIN CHAT PANEL (Mobile & Desktop)
      ========================================================================= */}
      <main className="flex-1 flex flex-col h-full bg-[#07090E] relative overflow-hidden">
        {/* Sticky Chat Header */}
        <header className="h-14 px-4 bg-[#0B0E17] border-b border-[#1E2433] flex items-center justify-between shrink-0 z-20">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="relative w-9 h-9 shrink-0 cursor-pointer"
              onClick={handleOpenSettings}
            >
              <img
                src={companion.avatar}
                alt={companion.name}
                className="w-full h-full object-cover rounded-md border border-[#1E2433]"
              />
              <div
                className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-[#0B0E17] ${
                  isTyping
                    ? 'bg-[#00FF66] animate-pulse'
                    : isCompanionOnline
                    ? 'bg-[#00FF66]'
                    : 'bg-zinc-600'
                }`}
              />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-xs sm:text-sm font-bold text-white truncate">
                  {companion.name}
                </h1>
                <span className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-[#141A26] border border-[#20293D] text-zinc-400 rounded">
                  {companion.gender === 'male' ? 'Sahabat' : 'Sahabat'}
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 font-mono flex items-center gap-1 min-w-0">
                {isTyping ? (
                  <span className="text-[#00FF66] font-medium animate-pulse">
                    sedang mengetik...
                  </span>
                ) : isCompanionOnline ? (
                  <>
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#00FF66]" />
                    <span>Online</span>
                  </>
                ) : (
                  <span className="text-zinc-400 truncate">
                    {lastSeenText}
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Header Action Buttons */}
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={pokeCompanion}
              disabled={isTyping}
              className="px-2.5 py-1.5 rounded-md bg-[#11151F] hover:bg-[#161B26] border border-[#1E2433] text-xs font-medium text-zinc-300 hover:text-white flex items-center gap-1.5 transition-colors active:translate-y-[1px]"
              title="Panggil Sapaan"
            >
              <Hand className="w-3.5 h-3.5 text-[#00FF66]" />
              <span className="hidden sm:inline">Colek</span>
            </button>

            <button
              onClick={handleOpenSettings}
              className="p-2 rounded-md hover:bg-[#161B26] border border-transparent hover:border-[#1E2433] text-zinc-400 hover:text-white transition-colors"
              title="Profil & Pengaturan"
            >
              <SettingsIcon className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Message Feed Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Welcome Intro Banner */}
          <div className="max-w-md mx-auto my-2 p-3.5 bg-[#0C101A] border border-[#1E2433] rounded-lg text-center">
            <p className="text-xs text-zinc-300 font-medium">
              Obrolan santai bersama <span className="text-[#00FF66]">{companion.name}</span>
            </p>
            <p className="text-[11px] text-zinc-500 mt-1">
              Semua percakapan tersimpan secara privat dengan enkripsi AES-256.
            </p>
          </div>

          {/* Messages List */}
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            const detectedUrls = extractUrls(msg.content);

            return (
              <div
                key={msg.id}
                className={`flex gap-2.5 max-w-[85%] sm:max-w-[70%] ${
                  isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'
                }`}
              >
                {/* Companion Avatar on chat bubble */}
                {!isUser && (
                  <img
                    src={companion.avatar}
                    alt={companion.name}
                    className="w-7 h-7 rounded-md object-cover border border-[#1E2433] shrink-0 self-end mb-1"
                  />
                )}

                <div className="space-y-1 min-w-0">
                  {/* Sticker or Standard Bubble Content */}
                  {msg.message_type === 'sticker' || msg.sticker_url ? (
                    <div className="py-1 px-0.5">
                      <img
                        src={msg.sticker_url}
                        alt="Sticker lucu"
                        className="w-24 h-24 sm:w-28 sm:h-28 object-contain select-none pointer-events-none drop-shadow-md animate-fadeIn"
                        loading="lazy"
                      />
                    </div>
                  ) : (
                    <div
                      className={`rounded-lg overflow-hidden text-xs sm:text-[13px] leading-relaxed break-words shadow-sm ${
                        isUser
                          ? 'bg-[#14231E] border border-[#10B981]/30 text-zinc-100'
                          : 'bg-[#11151F] border border-[#1E2433] text-zinc-100'
                      }`}
                    >
                      {/* Attached Image / First-Person POV PAP Photo */}
                      {msg.media_url && (
                        <div
                          className="relative w-64 sm:w-72 max-w-full cursor-pointer group bg-[#0A0D14]"
                          onClick={() => setViewingPhoto({ url: msg.media_url!, caption: msg.content })}
                        >
                          <img
                            src={msg.media_url}
                            alt={msg.content || 'Foto'}
                            className="w-full h-auto block transition-transform group-hover:scale-[1.01]"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-colors flex items-center justify-center pointer-events-none">
                            <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-black/75 text-white text-[10px] px-2.5 py-1 rounded backdrop-blur-sm font-mono flex items-center gap-1 shadow">
                              🔍 Klik untuk perbesar
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Text content */}
                      {msg.content && (
                        <div className="p-3">
                          <p className="whitespace-pre-wrap">{msg.content}</p>

                          {/* Auto-detected Link Cards */}
                          {detectedUrls.map((item, idx) => (
                            <LinkPreviewCard key={idx} url={item.url} domain={item.domain} />
                          ))}
                        </div>
                      )}

                      {/* Fallback if no text but detected links */}
                      {!msg.content && detectedUrls.length > 0 && (
                        <div className="p-3 pt-0">
                          {detectedUrls.map((item, idx) => (
                            <LinkPreviewCard key={idx} url={item.url} domain={item.domain} />
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Timestamp & Read Receipts */}
                  <div
                    className={`text-[10px] font-mono text-zinc-500 px-1 flex items-center gap-1.5 ${
                      isUser ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <span>
                      {new Date(msg.created_at).toLocaleTimeString('id-ID', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    {isUser && (
                      <span
                        className={`text-[11px] font-mono tracking-tighter ${
                          msg.status === 'read' ? 'text-[#00FF66] font-bold' : 'text-zinc-500'
                        }`}
                        title={msg.status === 'read' ? 'Sudah dibaca (Centang 2)' : 'Terkirim, belum dibaca (Centang 1)'}
                      >
                        {msg.status === 'read' ? '✓✓' : '✓'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Natural Companion Typing Indicator */}
          {isTyping && (
            <div className="flex gap-2.5 mr-auto max-w-[70%] animate-fadeIn">
              <img
                src={companion.avatar}
                alt={companion.name}
                className="w-7 h-7 rounded-md object-cover border border-[#1E2433] shrink-0 self-end mb-1"
              />
              <div className="p-3 bg-[#11151F] border border-[#1E2433] rounded-lg flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00FF66] animate-bounce" />
                <span
                  className="w-1.5 h-1.5 rounded-full bg-[#00FF66] animate-bounce"
                  style={{ animationDelay: '150ms' }}
                />
                <span
                  className="w-1.5 h-1.5 rounded-full bg-[#00FF66] animate-bounce"
                  style={{ animationDelay: '300ms' }}
                />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Selected Image Preview (Above Input) */}
        {selectedImage && (
          <div className="px-4 py-2 bg-[#0C101A] border-t border-[#1E2433] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src={selectedImage}
                alt="Selected"
                className="w-12 h-12 object-cover rounded border border-[#1E2433]"
              />
              <div>
                <p className="text-xs font-medium text-white">Foto siap dikirim</p>
                <p className="text-[11px] text-zinc-400">
                  {companion.name} bisa langsung melihat dan mengomentarinya
                </p>
              </div>
            </div>
            <button
              onClick={() => setSelectedImage(null)}
              className="p-1 rounded text-zinc-400 hover:text-white hover:bg-[#161B26]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Quick Emoji Drawer / Popover */}
        {showEmojiPicker && (
          <div className="px-4 py-2 bg-[#0C101A] border-t border-[#1E2433] flex items-center gap-2 overflow-x-auto">
            {QUICK_EMOJIS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => addEmoji(emoji)}
                className="text-base p-1.5 rounded hover:bg-[#161B26] transition-transform active:scale-110"
              >
                {emoji}
              </button>
            ))}
          </div>
        )}

        {/* Bottom Sticky Input Bar */}
        <div className="p-3 sm:p-4 bg-[#0B0E17] border-t border-[#1E2433] shrink-0">
          <form onSubmit={handleSend} className="flex items-center gap-2">
            {/* Hidden File Input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageSelect}
              accept="image/*"
              className="hidden"
            />

            {/* Image Upload Button */}
            <button
              type="button"
              disabled={isCompressing}
              onClick={() => fileInputRef.current?.click()}
              className="p-2 sm:p-2.5 rounded-md bg-[#11151F] hover:bg-[#161B26] border border-[#1E2433] text-zinc-400 hover:text-[#00FF66] transition-colors shrink-0"
              title="Kirim Foto"
            >
              <ImagePlus className="w-4 h-4" />
            </button>

            {/* Quick Emoji Toggle Button */}
            <button
              type="button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className={`p-2 sm:p-2.5 rounded-md border text-zinc-400 hover:text-[#00FF66] transition-colors shrink-0 ${
                showEmojiPicker
                  ? 'bg-[#14231E] border-[#10B981] text-[#00FF66]'
                  : 'bg-[#11151F] hover:bg-[#161B26] border-[#1E2433]'
              }`}
              title="Emoji"
            >
              <Smile className="w-4 h-4" />
            </button>

            {/* Text Input */}
            <div className="flex-1 relative">
              <input
                ref={textInputRef}
                type="text"
                value={inputText}
                onChange={(e) => {
                  setInputText(e.target.value);
                  resetIdleTimer();
                }}
                onKeyDown={handleKeyPress}
                placeholder={`Ketik pesan ke ${companion.name}...`}
                className="w-full py-2.5 px-3.5 bg-[#090C12] border border-[#1E2433] rounded-md text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-[#00FF66] focus:border-[#00FF66] transition-colors"
              />
            </div>

            {/* Send Button */}
            <button
              type="submit"
              disabled={(!inputText.trim() && !selectedImage) || isTyping}
              className="py-2.5 px-3 sm:px-4 bg-[#00FF66] hover:bg-[#00E55C] active:translate-y-[1px] disabled:opacity-30 disabled:pointer-events-none text-[#07090E] font-semibold text-xs rounded-md transition-all flex items-center justify-center gap-1.5 shrink-0"
            >
              <span className="hidden sm:inline">Kirim</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </main>

      {/* Settings / Profile Drawer */}
      <ProfileDrawer isOpen={isSettingsOpen} onClose={handleCloseSettings} />

      {/* Fullscreen Photo Lightbox Modal */}
      {viewingPhoto && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex flex-col items-center justify-center p-4 animate-fadeIn"
          onClick={() => setViewingPhoto(null)}
        >
          {/* Close button */}
          <button
            type="button"
            onClick={() => setViewingPhoto(null)}
            className="absolute top-4 right-4 p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-10"
            title="Tutup (ESC)"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Full uncropped image */}
          <div
            className="relative max-w-4xl max-h-[85vh] flex flex-col items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={viewingPhoto.url}
              alt={viewingPhoto.caption || 'Foto Fullscreen'}
              className="max-w-full max-h-[80vh] w-auto h-auto object-contain rounded-lg shadow-2xl border border-[#1E2433]"
            />
            {viewingPhoto.caption && (
              <p className="mt-3 text-xs sm:text-sm text-zinc-300 text-center max-w-xl font-medium px-4 py-2 bg-[#11151F]/90 rounded-full border border-[#1E2433] shadow">
                {viewingPhoto.caption}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
