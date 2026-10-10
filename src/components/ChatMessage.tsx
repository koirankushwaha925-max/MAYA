import React, { useState } from 'react';
import { Volume2, Square, Copy, Check, Sparkles, User } from 'lucide-react';
import { ChatMessage as ChatMessageType } from '../types';
import { MarkdownRenderer } from './MarkdownRenderer';
import { MayaAvatar } from './MayaAvatar';

interface ChatMessageProps {
  message: ChatMessageType;
  isSpeakingThis: boolean;
  onSpeak: (text: string, id: string) => void;
  onStopSpeak: () => void;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  isSpeakingThis,
  onSpeak,
  onStopSpeak,
}) => {
  const [copied, setCopied] = useState(false);
  const isAssistant = message.role === 'assistant';

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleToggleSpeak = () => {
    if (isSpeakingThis) {
      onStopSpeak();
    } else {
      onSpeak(message.content, message.id);
    }
  };

  return (
    <div
      className={`flex gap-3 my-4 group ${
        isAssistant ? 'justify-start' : 'justify-end'
      }`}
    >
      {/* Assistant Avatar */}
      {isAssistant && (
        <div className="shrink-0 mt-1">
          <MayaAvatar
            isSpeaking={isSpeakingThis}
            isListening={false}
            isThinking={false}
            size="sm"
            showBadge={false}
          />
        </div>
      )}

      {/* Bubble Container */}
      <div
        className={`max-w-[85%] md:max-w-[75%] rounded-2xl p-4 transition-all duration-200 ${
          isAssistant
            ? 'bg-slate-900/90 text-slate-100 border border-slate-800/80 shadow-md shadow-slate-950/40 rounded-tl-sm'
            : 'bg-gradient-to-br from-rose-600 to-pink-700 text-white shadow-md shadow-rose-950/30 rounded-tr-sm'
        } ${message.isGreeting ? 'border-rose-500/30 bg-slate-900/95 ring-1 ring-rose-500/20' : ''}`}
      >
        {/* Assistant Header Name */}
        {isAssistant && (
          <div className="flex items-center justify-between gap-2 mb-2 pb-1.5 border-b border-slate-800/60">
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-xs text-rose-300 font-hindi">माया</span>
              <span className="text-[10px] text-slate-400 bg-slate-800/80 px-1.5 py-0.5 rounded-full border border-slate-700/50">
                AI Assistant
              </span>
              {message.isGreeting && (
                <span className="text-[10px] text-amber-300 bg-amber-950/40 border border-amber-800/50 px-1.5 py-0.2 rounded-full inline-flex items-center gap-0.5">
                  <Sparkles className="w-2.5 h-2.5" /> नमस्ते!
                </span>
              )}
            </div>

            <span className="text-[11px] text-slate-500">{message.timestamp}</span>
          </div>
        )}

        {/* Content */}
        {isAssistant ? (
          <MarkdownRenderer content={message.content} />
        ) : (
          <div className="whitespace-pre-wrap leading-relaxed text-[15px] font-normal">
            {message.content}
          </div>
        )}

        {/* Bottom Actions for Assistant Message */}
        {isAssistant && (
          <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleToggleSpeak}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                  isSpeakingThis
                    ? 'bg-rose-500 text-white shadow-sm shadow-rose-500/30 animate-pulse'
                    : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white'
                }`}
                title={isSpeakingThis ? 'आवाज़ रोकें' : 'माया की आवाज़ में सुनें'}
              >
                {isSpeakingThis ? (
                  <>
                    <Square className="w-3.5 h-3.5 fill-current" />
                    <span>रोकें</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-3.5 h-3.5 text-rose-400" />
                    <span>सुनें</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
                title="टेक्स्ट कॉपी करें"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">कॉपी हुआ</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>कॉपी</span>
                  </>
                )}
              </button>
            </div>

            {/* Speaking wave animation indicator */}
            {isSpeakingThis && (
              <div className="flex items-center gap-1 text-rose-400 text-xs">
                <span className="text-[11px]">माया बोल रही है...</span>
                <span className="w-1 h-3 bg-rose-400 rounded-full animate-wave-1" />
                <span className="w-1 h-4 bg-rose-400 rounded-full animate-wave-2" />
                <span className="w-1 h-2 bg-rose-400 rounded-full animate-wave-3" />
              </div>
            )}
          </div>
        )}

        {/* User Message Footer */}
        {!isAssistant && (
          <div className="mt-1 flex justify-end text-[10px] text-rose-200/70">
            <span>{message.timestamp}</span>
          </div>
        )}
      </div>

      {/* User Avatar */}
      {!isAssistant && (
        <div className="shrink-0 mt-1">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-slate-700 to-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 shadow-md">
            <User className="w-4 h-4" />
          </div>
        </div>
      )}
    </div>
  );
};
