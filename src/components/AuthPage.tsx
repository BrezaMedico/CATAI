import React, { useState } from 'react';
import { Eye, EyeOff, Lock, Mail, MessageSquare, AlertCircle, ArrowRight } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const AuthPage: React.FC = () => {
  const { login, register } = useApp();
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim() || !password.trim()) {
      setErrorMessage('Harap isi email dan kata sandi dengan lengkap.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Kata sandi minimal harus terdiri dari 6 karakter.');
      return;
    }

    setIsLoading(true);

    try {
      if (tab === 'login') {
        const res = await login(email, password);
        if (!res.success) {
          setErrorMessage(res.error || 'Email atau kata sandi tidak cocok.');
        }
      } else {
        const res = await register(email, password);
        if (!res.success) {
          setErrorMessage(res.error || 'Pendaftaran akun tidak berhasil.');
        }
      }
    } catch {
      setErrorMessage('Terjadi kendala jaringan. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-[#07090E]">
      <div className="w-full max-w-[420px]">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-[#11151F] border border-[#1E2433] text-[#00FF66] mb-3">
            <MessageSquare className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white">
            Teman Ngobrol Virtual
          </h1>
          <p className="text-xs text-zinc-400 mt-1 max-w-[320px] mx-auto">
            Ruang obrolan santai, hangat, dan selalu ada untukmu kapan saja
          </p>
        </div>

        {/* Auth Box */}
        <div className="bg-[#11151F] border border-[#1E2433] rounded-lg p-6">
          {/* Tabs */}
          <div className="grid grid-cols-2 p-1 bg-[#090C12] border border-[#1E2433] rounded-md mb-5">
            <button
              type="button"
              onClick={() => {
                setTab('login');
                setErrorMessage(null);
              }}
              className={`py-2 text-xs font-semibold rounded transition-colors ${
                tab === 'login'
                  ? 'bg-[#161B26] text-white shadow-sm border border-[#232B3D]'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Masuk
            </button>
            <button
              type="button"
              onClick={() => {
                setTab('register');
                setErrorMessage(null);
              }}
              className={`py-2 text-xs font-semibold rounded transition-colors ${
                tab === 'register'
                  ? 'bg-[#161B26] text-white shadow-sm border border-[#232B3D]'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Daftar Akun
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                Alamat Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@email.com"
                  className="w-full pl-9 pr-3 py-2 bg-[#090C12] border border-[#1E2433] rounded-md text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-[#00FF66] focus:border-[#00FF66] transition-colors"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                Kata Sandi
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimal 6 karakter"
                  className="w-full pl-9 pr-9 py-2 bg-[#090C12] border border-[#1E2433] rounded-md text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-[#00FF66] focus:border-[#00FF66] transition-colors font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-500 hover:text-zinc-300 transition-colors"
                  aria-label="Lihat kata sandi"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Error Banner */}
            {errorMessage && (
              <div className="flex items-center gap-2 p-2.5 rounded-md bg-red-950/40 border border-red-900/60 text-red-400 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-2.5 px-4 bg-[#00FF66] hover:bg-[#00E55C] active:translate-y-[1px] disabled:opacity-50 text-[#07090E] font-semibold text-xs rounded-md transition-all flex items-center justify-center gap-2"
            >
              <span>{isLoading ? 'Memproses...' : tab === 'login' ? 'Masuk ke Obrolan' : 'Daftar & Buat Profil'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Privacy Note */}
          <div className="mt-5 pt-4 border-t border-[#1E2433] text-center">
            <p className="text-[11px] text-zinc-500 font-mono">
              Enkripsi End-to-End aktif. Privasi pesan terjaga.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
