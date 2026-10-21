import React from 'react';
import { useApp } from './context/AppContext';
import { AuthPage } from './components/AuthPage';
import { OnboardingWizard } from './components/OnboardingWizard';
import { ChatRoom } from './components/ChatRoom';
import { MessageSquare } from 'lucide-react';

export const App: React.FC = () => {
  const { navigation, isInitializing } = useApp();

  if (isInitializing) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-[#07090E] text-white">
        <div className="w-12 h-12 rounded-lg bg-[#11151F] border border-[#1E2433] text-[#00FF66] flex items-center justify-center mb-4 animate-pulse">
          <MessageSquare className="w-6 h-6" />
        </div>
        <p className="text-xs font-mono text-zinc-400">
          Memuat Ruang Obrolan...
        </p>
      </div>
    );
  }

  switch (navigation) {
    case 'AUTH':
      return <AuthPage />;
    case 'ONBOARDING':
      return <OnboardingWizard />;
    case 'CHAT':
    default:
      return <ChatRoom />;
  }
};
