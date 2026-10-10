import React from 'react';
import { Volume2, VolumeX, Sliders, Info, Trash2, Sparkles } from 'lucide-react';
import { MayaAvatar } from './MayaAvatar';
import { UserSettings } from '../types';

interface NavbarProps {
  isSpeaking: boolean;
  isListening: boolean;
  isThinking: boolean;
  settings: UserSettings;
  onToggleAutoSpeak: () => void;
  onOpenSettings: () => void;
  onOpenAbout: () => void;
  onClearChat: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  isSpeaking,
  isListening,
  isThinking,
  settings,
  onToggleAutoSpeak,
  onOpenSettings,
  onOpenAbout,
  onClearChat,
}) => {
  return (
    <header className="sticky top-0 z-30 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md px-4 py-3">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        {/* Left: Maya Avatar & Brand */}
        <div className="flex items-center gap-3">
          <MayaAvatar
            isSpeaking={isSpeaking}
            isListening={isListening}
            isThinking={isThinking}
            size="md"
            showBadge
            onAvatarClick={onOpenAbout}
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-white tracking-tight flex items-center gap-1 font-hindi">
                <span>माया</span>
                <span className="text-xs text-rose-400 font-normal">Maya AI</span>
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] bg-rose-500/10 text-rose-300 border border-rose-500/20 font-medium">
                <Sparkles className="w-2.5 h-2.5 text-amber-300" />
                हिंदी & Hinglish
              </span>
            </div>
            <p className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
              {isListening ? (
                <span className="text-emerald-400 font-medium animate-pulse">
                  ● आपकी बात सुन रही हूँ...
                </span>
              ) : isSpeaking ? (
                <span className="text-rose-400 font-medium animate-pulse">
                  ● बोल रही हूँ...
                </span>
              ) : isThinking ? (
                <span className="text-amber-400 font-medium">
                  ● सोच रही हूँ...
                </span>
              ) : (
                <span className="text-slate-400">
                  सुलझी, समझदार व मददगार साथी
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1.5">
          {/* Quick Auto-Speak Toggle */}
          <button
            type="button"
            onClick={onToggleAutoSpeak}
            className={`p-2 rounded-xl transition-all ${
              settings.autoSpeak
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
            title={settings.autoSpeak ? 'ऑटो-वॉइस चालू है (बंद करने के लिए क्लिक करें)' : 'ऑटो-वॉइस बंद है (चालू करने के लिए क्लिक करें)'}
          >
            {settings.autoSpeak ? (
              <Volume2 className="w-4 h-4 text-rose-400" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-500" />
            )}
          </button>

          {/* Info Button */}
          <button
            type="button"
            onClick={onOpenAbout}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            title="माया के बारे में जानें"
          >
            <Info className="w-4 h-4" />
          </button>

          {/* Settings Button */}
          <button
            type="button"
            onClick={onOpenSettings}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            title="आवाज़ व सेटिंग्स"
          >
            <Sliders className="w-4 h-4" />
          </button>

          {/* Clear Chat Button */}
          <button
            type="button"
            onClick={onClearChat}
            className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
            title="बातचीत नई शुरू करें"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
