import React, { useState, useRef } from 'react';
import { Check, ChevronRight, ChevronLeft, ArrowRight, Camera } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CompanionGender, CompanionProfile } from '../types';
import { AVATAR_OPTIONS, getDefaultAvatar } from '../utils/avatars';
import { compressImageToBase64 } from '../utils/imageCompressor';

const MALE_TRAITS = [
  'Humoris & Receh',
  'Pendengar Setia',
  'Cool tapi Perhatian',
  'Suportif & Dewasa',
  'Teman Deep Talk',
  'Humble & Santai',
];

const FEMALE_TRAITS = [
  'Ceria & Asik',
  'Lembut & Perhatian',
  'Humoris & Seru',
  'Pendengar yang Baik',
  'Suportif & Humble',
  'Teman Curhat Setia',
];

export const OnboardingWizard: React.FC = () => {
  const { currentUser, updateCompanion, setNavigation } = useApp();

  const [step, setStep] = useState<number>(1);
  const [userNickname, setUserNickname] = useState<string>(currentUser?.nickname || '');
  const [gender, setGender] = useState<CompanionGender>('female');
  const [selectedTraits, setSelectedTraits] = useState<string[]>(['Ceria & Asik', 'Pendengar yang Baik']);
  const [companionName, setCompanionName] = useState<string>('Nadia');
  const [selectedAvatar, setSelectedAvatar] = useState<string>(getDefaultAvatar('female'));
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState<boolean>(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingAvatar(true);
    setValidationError(null);
    try {
      const compressed = await compressImageToBase64(file, 400, 400, 0.8);
      setSelectedAvatar(compressed);
    } catch (err) {
      console.warn('Failed to compress avatar:', err);
      setValidationError('Gagal memproses foto. Coba pilih foto lain.');
    } finally {
      setIsUploadingAvatar(false);
      if (avatarInputRef.current) avatarInputRef.current.value = '';
    }
  };

  // Handle trait toggling (1 to 3 traits max)
  const toggleTrait = (trait: string) => {
    setValidationError(null);
    if (selectedTraits.includes(trait)) {
      if (selectedTraits.length === 1) {
        setValidationError('Pilih minimal 1 sifat karakter temanmu.');
        return;
      }
      setSelectedTraits(selectedTraits.filter((t) => t !== trait));
    } else {
      if (selectedTraits.length >= 3) {
        setValidationError('Maksimal memilih 3 sifat karakter.');
        return;
      }
      setSelectedTraits([...selectedTraits, trait]);
    }
  };

  // Gender switch helper
  const handleGenderChange = (newGender: CompanionGender) => {
    setGender(newGender);
    if (newGender === 'male') {
      setSelectedTraits(['Humoris & Receh', 'Pendengar Setia']);
      setCompanionName('Bagas');
      setSelectedAvatar(getDefaultAvatar('male'));
    } else {
      setSelectedTraits(['Ceria & Asik', 'Pendengar yang Baik']);
      setCompanionName('Nadia');
      setSelectedAvatar(getDefaultAvatar('female'));
    }
  };

  const handleNext = () => {
    setValidationError(null);
    if (step === 1) {
      if (!userNickname.trim()) {
        setValidationError('Silakan masukkan nama panggilan kamu terlebih dahulu.');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    } else if (step === 3) {
      if (selectedTraits.length === 0) {
        setValidationError('Pilih minimal 1 sifat teman.');
        return;
      }
      setStep(4);
    }
  };

  const handlePrev = () => {
    setValidationError(null);
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleFinish = async () => {
    if (!companionName.trim()) {
      setValidationError('Beri nama untuk teman ngobrolmu.');
      return;
    }
    if (!currentUser) return;

    setIsSubmitting(true);
    try {
      const profile: CompanionProfile = {
        id: `comp_${Date.now()}`,
        user_id: currentUser.id,
        name: companionName.trim(),
        gender,
        traits: selectedTraits,
        avatar: selectedAvatar,
        user_nickname: userNickname.trim(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      await updateCompanion(profile);
      setNavigation('CHAT');
    } catch (err) {
      console.warn('Failed to save profile:', err);
      setNavigation('CHAT');
    } finally {
      setIsSubmitting(false);
    }
  };

  const availableTraits = gender === 'male' ? MALE_TRAITS : FEMALE_TRAITS;
  const filteredAvatars = AVATAR_OPTIONS.filter((a) => a.gender === gender);

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-[#07090E]">
      <div className="w-full max-w-[520px]">
        {/* Wizard Container */}
        <div className="bg-[#11151F] border border-[#1E2433] rounded-lg p-6 sm:p-8">
          {/* Top Monospace Progress Indicator */}
          <div className="flex items-center justify-between mb-4">
            <span className="font-mono text-xs font-semibold text-[#00FF66] tracking-wider">
              LANGKAH 0{step} / 04
            </span>
            <span className="text-xs text-zinc-400">
              {step === 1 && 'Nama Panggilan'}
              {step === 2 && 'Pilih Karakter'}
              {step === 3 && 'Tentukan Sifat'}
              {step === 4 && 'Nama & Foto'}
            </span>
          </div>

          {/* Neon Green Progress Bar */}
          <div className="w-full h-1.5 bg-[#161B26] rounded-full overflow-hidden mb-6">
            <div
              className="h-full bg-[#00FF66] transition-all duration-300"
              style={{ width: `${(step / 4) * 100}%` }}
            />
          </div>

          {/* STEP 1: User Nickname */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-base font-semibold text-white">
                  Siapa nama panggilanmu?
                </h2>
                <p className="text-xs text-zinc-400 mt-1">
                  Teman ngobrolmu akan selalu menyapa dan memanggilmu dengan nama ini.
                </p>
              </div>

              <div className="pt-2">
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                  Nama Panggilan
                </label>
                <input
                  type="text"
                  autoFocus
                  value={userNickname}
                  onChange={(e) => setUserNickname(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleNext()}
                  placeholder="Contoh: Raka, Budi, Salsa, Kakak..."
                  className="w-full px-3.5 py-2.5 bg-[#090C12] border border-[#1E2433] rounded-md text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-[#00FF66] focus:border-[#00FF66] transition-colors"
                />
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                {['Raka', 'Dimas', 'Nadia', 'Budi', 'Kakak'].map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => setUserNickname(suggestion)}
                    className="px-2.5 py-1 text-xs rounded bg-[#161B26] hover:bg-[#1E2536] border border-[#232B3D] text-zinc-300 hover:text-white transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 2: Gender Selection */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-base font-semibold text-white">
                  Pilih Teman yang Ingin Diajak Ngobrol
                </h2>
                <p className="text-xs text-zinc-400 mt-1">
                  Pilih sosok yang paling membuatmu merasa nyaman untuk bercerita.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3.5 pt-2">
                {/* Cowok */}
                <button
                  type="button"
                  onClick={() => handleGenderChange('male')}
                  className={`p-4 rounded-lg border text-left transition-all ${
                    gender === 'male'
                      ? 'bg-[#141A26] border-[#00FF66] ring-1 ring-[#00FF66]/30'
                      : 'bg-[#090C12] border-[#1E2433] hover:border-zinc-700'
                  }`}
                >
                  <div className="w-12 h-12 rounded-md overflow-hidden mb-3 border border-[#262F40]">
                    <img
                      src={getDefaultAvatar('male')}
                      alt="Sahabat Cowok"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-white">Sahabat Cowok</p>
                      <p className="text-[11px] text-zinc-400 mt-0.5">Santai & Humble</p>
                    </div>
                    {gender === 'male' && (
                      <div className="w-4 h-4 rounded-full bg-[#00FF66] text-[#07090E] flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    )}
                  </div>
                </button>

                {/* Cewek */}
                <button
                  type="button"
                  onClick={() => handleGenderChange('female')}
                  className={`p-4 rounded-lg border text-left transition-all ${
                    gender === 'female'
                      ? 'bg-[#141A26] border-[#00FF66] ring-1 ring-[#00FF66]/30'
                      : 'bg-[#090C12] border-[#1E2433] hover:border-zinc-700'
                  }`}
                >
                  <div className="w-12 h-12 rounded-md overflow-hidden mb-3 border border-[#262F40]">
                    <img
                      src={getDefaultAvatar('female')}
                      alt="Sahabat Cewek"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-white">Sahabat Cewek</p>
                      <p className="text-[11px] text-zinc-400 mt-0.5">Hangat & Ceria</p>
                    </div>
                    {gender === 'female' && (
                      <div className="w-4 h-4 rounded-full bg-[#00FF66] text-[#07090E] flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    )}
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Trait Selection */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-base font-semibold text-white">
                  Pilih Sifat Temanmu
                </h2>
                <p className="text-xs text-zinc-400 mt-1">
                  Pilih 1 sampai 3 sifat agar gaya bahasanya sesuai dengan yang kamu sukai.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2.5 pt-1">
                {availableTraits.map((trait) => {
                  const isSelected = selectedTraits.includes(trait);
                  return (
                    <button
                      key={trait}
                      type="button"
                      onClick={() => toggleTrait(trait)}
                      className={`p-3 rounded-md border text-left text-xs font-medium transition-colors flex items-center justify-between gap-2 ${
                        isSelected
                          ? 'bg-[#141A26] border-[#00FF66] text-white'
                          : 'bg-[#090C12] border-[#1E2433] text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                      }`}
                    >
                      <span>{trait}</span>
                      {isSelected && (
                        <Check className="w-3.5 h-3.5 text-[#00FF66] shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="text-[11px] text-zinc-500 font-mono">
                Terpilih: {selectedTraits.length} / 3
              </div>
            </div>
          )}

          {/* STEP 4: Name and Avatar */}
          {step === 4 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-base font-semibold text-white">
                  Beri Nama dan Pilih Foto Temanmu
                </h2>
                <p className="text-xs text-zinc-400 mt-1">
                  Kustomisasi identitas teman ngobrol favoritmu.
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                  Nama Teman
                </label>
                <input
                  type="text"
                  value={companionName}
                  onChange={(e) => setCompanionName(e.target.value)}
                  placeholder="Contoh: Nadia, Bagas, Clara, Dimas..."
                  className="w-full px-3.5 py-2.5 bg-[#090C12] border border-[#1E2433] rounded-md text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-[#00FF66] focus:border-[#00FF66] transition-colors"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-medium text-zinc-300">
                    Pilihan Foto Profil
                  </label>
                  <button
                    type="button"
                    disabled={isUploadingAvatar}
                    onClick={() => avatarInputRef.current?.click()}
                    className="text-[11px] text-[#00FF66] hover:underline flex items-center gap-1 font-mono"
                  >
                    <Camera className="w-3 h-3" />
                    <span>{isUploadingAvatar ? 'Mengompres...' : 'Unggah Foto Sendiri'}</span>
                  </button>
                </div>

                {/* Hidden File Input */}
                <input
                  type="file"
                  ref={avatarInputRef}
                  onChange={handleAvatarUpload}
                  accept="image/*"
                  className="hidden"
                />

                <div className="grid grid-cols-4 gap-2.5">
                  {/* Custom Uploaded Avatar */}
                  {selectedAvatar.startsWith('data:image') && (
                    <button
                      type="button"
                      onClick={() => setSelectedAvatar(selectedAvatar)}
                      className="aspect-square rounded-md overflow-hidden border relative border-[#00FF66] ring-1 ring-[#00FF66] bg-[#161B26]"
                      title="Foto Kustom Anda"
                    >
                      <img
                        src={selectedAvatar}
                        alt="Foto Kustom"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-[#00FF66] text-[#07090E] flex items-center justify-center">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </div>
                    </button>
                  )}

                  {filteredAvatars.map((avatar) => {
                    const isSelected = selectedAvatar === avatar.url;
                    return (
                      <button
                        key={avatar.id}
                        type="button"
                        onClick={() => setSelectedAvatar(avatar.url)}
                        className={`aspect-square rounded-md overflow-hidden border relative transition-all ${
                          isSelected
                            ? 'border-[#00FF66] ring-1 ring-[#00FF66]'
                            : 'border-[#1E2433] hover:border-zinc-600 opacity-80 hover:opacity-100'
                        }`}
                      >
                        <img
                          src={avatar.url}
                          alt={avatar.name}
                          className="w-full h-full object-cover"
                        />
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
            </div>
          )}

          {/* Validation Error Message */}
          {validationError && (
            <div className="mt-4 p-2.5 rounded-md bg-red-950/40 border border-red-900/60 text-red-400 text-xs">
              {validationError}
            </div>
          )}

          {/* Navigation Controls */}
          <div className="mt-8 pt-4 border-t border-[#1E2433] flex items-center justify-between gap-3">
            {step > 1 ? (
              <button
                type="button"
                onClick={handlePrev}
                className="py-2.5 px-4 rounded-md border border-[#1E2433] bg-[#090C12] hover:bg-[#161B26] text-xs font-semibold text-zinc-300 transition-colors flex items-center gap-1.5"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Kembali</span>
              </button>
            ) : (
              <div />
            )}

            {step < 4 ? (
              <button
                type="button"
                onClick={handleNext}
                className="py-2.5 px-5 bg-[#00FF66] hover:bg-[#00E55C] active:translate-y-[1px] text-[#07090E] font-semibold text-xs rounded-md transition-all flex items-center gap-1.5 ml-auto"
              >
                <span>Lanjut</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleFinish}
                className="py-2.5 px-5 bg-[#00FF66] hover:bg-[#00E55C] active:translate-y-[1px] disabled:opacity-50 text-[#07090E] font-semibold text-xs rounded-md transition-all flex items-center gap-2 ml-auto"
              >
                <span>{isSubmitting ? 'Menyiapkan...' : 'Mulai Ngobrol'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
