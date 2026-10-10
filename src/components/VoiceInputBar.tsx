import React, { useState, useEffect, useRef } from 'react';
import { Send, Mic, MicOff, Square, Globe } from 'lucide-react';
import { playSound } from '../utils/speech';

interface VoiceInputBarProps {
  onSendMessage: (text: string) => void;
  onStopGenerating: () => void;
  isGenerating: boolean;
  onSpeechStateChange?: (isListening: boolean) => void;
  micLanguage: 'hi-IN' | 'en-IN';
  onChangeMicLanguage: (lang: 'hi-IN' | 'en-IN') => void;
  soundEffectsEnabled: boolean;
}

export const VoiceInputBar: React.FC<VoiceInputBarProps> = ({
  onSendMessage,
  onStopGenerating,
  isGenerating,
  onSpeechStateChange,
  micLanguage,
  onChangeMicLanguage,
  soundEffectsEnabled,
}) => {
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Check Web Speech API support
  const isSpeechSupported =
    typeof window !== 'undefined' &&
    ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${Math.min(scrollHeight, 120)}px`;
    }
  }, [input]);

  const startListening = () => {
    if (!isSpeechSupported) {
      setSpeechError('आपके ब्राउज़र में वॉइस इनपुट सपोर्ट नहीं है।');
      setTimeout(() => setSpeechError(null), 3000);
      return;
    }

    try {
      const SpeechRecognitionClass =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognitionClass();
      recognitionRef.current = recognition;

      recognition.lang = micLanguage;
      recognition.continuous = false;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setIsListening(true);
        onSpeechStateChange?.(true);
        if (soundEffectsEnabled) playSound('mic-start');
        setSpeechError(null);
      };

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        if (transcript) {
          setInput((prev) => {
            // If empty, set transcript; otherwise append
            return transcript;
          });
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
        onSpeechStateChange?.(false);
        if (event.error !== 'no-speech') {
          setSpeechError('आवाज़ साफ़ सुनाई नहीं दी, कृपया दोबारा बोलें।');
          setTimeout(() => setSpeechError(null), 3500);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
        onSpeechStateChange?.(false);
        if (soundEffectsEnabled) playSound('mic-stop');
      };

      recognition.start();
    } catch (err) {
      console.error('Speech recognition failed to start:', err);
      setIsListening(false);
      onSpeechStateChange?.(false);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
    onSpeechStateChange?.(false);
  };

  const handleToggleMic = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    const trimmed = input.trim();
    if (!trimmed || isGenerating) return;

    if (isListening) {
      stopListening();
    }

    if (soundEffectsEnabled) {
      playSound('send');
    }

    onSendMessage(trimmed);
    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  return (
    <div className="w-full relative">
      {/* Listening overlay banner */}
      {isListening && (
        <div className="mb-2 p-2 rounded-xl bg-emerald-950/80 border border-emerald-500/40 flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
            </span>
            <span className="text-xs font-medium text-emerald-300">
              माया आपकी आवाज़ सुन रही है... ({micLanguage === 'hi-IN' ? 'हिंदी' : 'Hinglish / English'})
            </span>
          </div>
          <button
            type="button"
            onClick={stopListening}
            className="text-[11px] px-2 py-0.5 rounded bg-emerald-800/80 hover:bg-emerald-700 text-emerald-100 font-medium"
          >
            बोलना समाप्त करें
          </button>
        </div>
      )}

      {/* Error alert */}
      {speechError && (
        <div className="mb-2 p-2 rounded-xl bg-amber-950/60 border border-amber-600/40 text-xs text-amber-200 flex items-center justify-between">
          <span>{speechError}</span>
          <button
            type="button"
            onClick={() => setSpeechError(null)}
            className="text-amber-400 hover:text-amber-100 text-xs ml-2"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main input wrapper */}
      <div className="flex items-end gap-2 p-2 rounded-2xl bg-slate-900 border border-slate-800 focus-within:border-rose-500/60 focus-within:ring-2 focus-within:ring-rose-500/20 shadow-xl transition-all">
        {/* Language switcher button */}
        <button
          type="button"
          onClick={() => onChangeMicLanguage(micLanguage === 'hi-IN' ? 'en-IN' : 'hi-IN')}
          className="p-2.5 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors flex items-center gap-1 shrink-0"
          title={`माइक भाषा बदलें (वर्तमान: ${micLanguage === 'hi-IN' ? 'हिंदी' : 'हिंग्लिश / English'})`}
        >
          <Globe className="w-4 h-4 text-rose-400" />
          <span className="text-[10px] font-semibold text-slate-300">
            {micLanguage === 'hi-IN' ? 'HI' : 'EN'}
          </span>
        </button>

        {/* Text Area */}
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="माया से कुछ भी पूछें... (हिंदी या Hinglish में)"
          rows={1}
          disabled={isGenerating}
          className="flex-1 bg-transparent border-0 text-slate-100 placeholder-slate-500 text-sm focus:outline-none resize-none max-h-32 py-2 px-1 leading-relaxed"
        />

        {/* Mic Button */}
        {isSpeechSupported && (
          <button
            type="button"
            onClick={handleToggleMic}
            disabled={isGenerating}
            className={`p-2.5 rounded-xl transition-all shrink-0 ${
              isListening
                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 animate-pulse'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
            title={isListening ? 'माइक बंद करें' : 'बोलकर पूछें (Voice Input)'}
          >
            {isListening ? (
              <MicOff className="w-4 h-4 text-white" />
            ) : (
              <Mic className="w-4 h-4" />
            )}
          </button>
        )}

        {/* Action Button: Send or Stop */}
        {isGenerating ? (
          <button
            type="button"
            onClick={onStopGenerating}
            className="p-2.5 rounded-xl bg-amber-600/90 hover:bg-amber-600 text-white shadow-md shadow-amber-600/30 transition-all shrink-0"
            title="रोकें (Stop generation)"
          >
            <Square className="w-4 h-4 fill-current" />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!input.trim()}
            className={`p-2.5 rounded-xl transition-all shrink-0 ${
              input.trim()
                ? 'bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-md shadow-rose-500/30 hover:scale-105 active:scale-95'
                : 'bg-slate-800 text-slate-600 cursor-not-allowed'
            }`}
            title="भेजें (Enter)"
          >
            <Send className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="flex items-center justify-between px-2 pt-1.5 text-[11px] text-slate-500">
        <span>Enter दबाकर भेजें • Shift+Enter नई पंक्ति</span>
        <span className="hidden sm:inline">माया • आपकी समझदार और दोस्ताना AI साथी</span>
      </div>
    </div>
  );
};
