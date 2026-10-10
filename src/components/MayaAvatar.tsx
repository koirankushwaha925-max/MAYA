import React from 'react';
import { Volume2, Mic, Sparkles } from 'lucide-react';

interface MayaAvatarProps {
  isSpeaking: boolean;
  isListening: boolean;
  isThinking: boolean;
  size?: 'sm' | 'md' | 'lg';
  showBadge?: boolean;
  onAvatarClick?: () => void;
}

export const MayaAvatar: React.FC<MayaAvatarProps> = ({
  isSpeaking,
  isListening,
  isThinking,
  size = 'md',
  showBadge = false,
  onAvatarClick,
}) => {
  const sizeClasses = {
    sm: 'w-9 h-9 text-xs',
    md: 'w-12 h-12 text-sm',
    lg: 'w-20 h-20 text-base',
  }[size];

  return (
    <div className="relative inline-flex items-center justify-center select-none" onClick={onAvatarClick}>
      {/* Outer ambient glow rings */}
      {isSpeaking && (
        <>
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-rose-500 to-amber-500 opacity-60 blur-md animate-pulse" />
          <div className="absolute -inset-1 rounded-full border-2 border-rose-400/50 animate-ping opacity-30" />
        </>
      )}

      {isListening && (
        <>
          <div className="absolute inset-0 rounded-full bg-emerald-500 opacity-60 blur-md animate-pulse" />
          <div className="absolute -inset-1 rounded-full border-2 border-emerald-400/60 animate-ping opacity-40" />
        </>
      )}

      {isThinking && (
        <div className="absolute inset-0 rounded-full bg-indigo-500 opacity-50 blur-md animate-spin" />
      )}

      {/* Main Avatar Bubble */}
      <div
        className={`relative ${sizeClasses} rounded-2xl bg-gradient-to-br from-rose-500 via-pink-600 to-amber-600 p-[2px] shadow-lg shadow-rose-950/40 transition-all duration-300 ${
          onAvatarClick ? 'cursor-pointer hover:scale-105 active:scale-95' : ''
        }`}
      >
        <div className="w-full h-full rounded-[14px] bg-slate-950 flex flex-col items-center justify-center overflow-hidden relative">
          {/* Subtle gradient interior */}
          <div className="absolute inset-0 bg-gradient-to-br from-rose-500/20 via-pink-500/10 to-transparent pointer-events-none" />

          {/* Icon or Face */}
          {isSpeaking ? (
            <div className="flex items-center gap-[2px] h-4 z-10">
              <span className="w-1 bg-rose-400 rounded-full animate-wave-1 inline-block" />
              <span className="w-1 bg-amber-300 rounded-full animate-wave-2 inline-block" />
              <span className="w-1 bg-pink-400 rounded-full animate-wave-3 inline-block" />
              <span className="w-1 bg-rose-300 rounded-full animate-wave-4 inline-block" />
            </div>
          ) : isListening ? (
            <Mic className="w-1/2 h-1/2 text-emerald-400 animate-pulse z-10" />
          ) : isThinking ? (
            <Sparkles className="w-1/2 h-1/2 text-amber-300 animate-spin z-10" />
          ) : (
            <div className="flex flex-col items-center justify-center z-10">
              <span className="font-bold text-white tracking-wider font-hindi">माया</span>
              {size === 'lg' && (
                <span className="text-[10px] text-rose-300/80 font-medium tracking-normal mt-0.5">
                  AI Companion
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Status Badge */}
      {showBadge && (
        <span
          className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-slate-950 transition-colors ${
            isListening
              ? 'bg-emerald-400 animate-pulse'
              : isSpeaking
              ? 'bg-rose-500 animate-pulse'
              : isThinking
              ? 'bg-amber-400 animate-pulse'
              : 'bg-emerald-500'
          }`}
          title={
            isListening
              ? 'सुन रही हूँ...'
              : isSpeaking
              ? 'बोल रही हूँ...'
              : isThinking
              ? 'सोच रही हूँ...'
              : 'सक्रिय (Online)'
          }
        />
      )}
    </div>
  );
};
