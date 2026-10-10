import React, { useState, useEffect, useRef } from 'react';
import { Navbar } from './components/Navbar';
import { ChatMessage } from './components/ChatMessage';
import { QuickTopics } from './components/QuickTopics';
import { VoiceInputBar } from './components/VoiceInputBar';
import { AboutMayaModal } from './components/AboutMayaModal';
import { SettingsModal } from './components/SettingsModal';
import { ChatMessage as ChatMessageType, UserSettings } from './types';
import { speakText, stopSpeech, isSpeaking as checkIsSpeaking, playSound } from './utils/speech';
import { Sparkles, Bot, AlertCircle } from 'lucide-react';

const INITIAL_GREETING_TEXT = 'हाय! 😊 मैं माया हूँ। आज कैसे हो? बताओ, आज किस बारे में बात करें?';

const INITIAL_MESSAGE: ChatMessageType = {
  id: 'maya-greeting',
  role: 'assistant',
  content: INITIAL_GREETING_TEXT,
  timestamp: 'अभी',
  isGreeting: true,
};

const DEFAULT_SETTINGS: UserSettings = {
  autoSpeak: false,
  voiceRate: 1.0,
  voiceURI: '',
  soundEffectsEnabled: true,
  micLanguage: 'hi-IN',
};

export default function App() {
  const [messages, setMessages] = useState<ChatMessageType[]>(() => {
    try {
      const saved = localStorage.getItem('maya_chat_history');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // fallback
    }
    return [INITIAL_MESSAGE];
  });

  const [settings, setSettings] = useState<UserSettings>(() => {
    try {
      const saved = localStorage.getItem('maya_settings');
      if (saved) return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
    } catch {
      // fallback
    }
    return DEFAULT_SETTINGS;
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [isMayaSpeaking, setIsMayaSpeaking] = useState(false);
  const [activeSpeakingId, setActiveSpeakingId] = useState<string | null>(null);
  const [isUserListening, setIsUserListening] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Sync settings to localStorage
  useEffect(() => {
    localStorage.setItem('maya_settings', JSON.stringify(settings));
  }, [settings]);

  // Sync messages to localStorage
  useEffect(() => {
    localStorage.setItem('maya_chat_history', JSON.stringify(messages));
  }, [messages]);

  // Auto scroll to bottom
  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    chatBottomRef.current?.scrollIntoView({ behavior });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isGenerating]);

  // Handle TTS playback for a specific message
  const handleSpeakMessage = (text: string, id: string) => {
    setActiveSpeakingId(id);
    setIsMayaSpeaking(true);

    speakText(text, {
      rate: settings.voiceRate,
      voiceURI: settings.voiceURI,
      onStart: () => {
        setIsMayaSpeaking(true);
        setActiveSpeakingId(id);
      },
      onEnd: () => {
        setIsMayaSpeaking(false);
        setActiveSpeakingId(null);
      },
      onError: () => {
        setIsMayaSpeaking(false);
        setActiveSpeakingId(null);
      },
    });
  };

  const handleStopSpeech = () => {
    stopSpeech();
    setIsMayaSpeaking(false);
    setActiveSpeakingId(null);
  };

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isGenerating) return;

    // Stop ongoing speech
    handleStopSpeech();
    setErrorMessage(null);

    const timeString = new Date().toLocaleTimeString('hi-IN', {
      hour: '2-digit',
      minute: '2-digit',
    });

    const userMessage: ChatMessageType = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: timeString,
    };

    const assistantId = `assistant-${Date.now()}`;
    const assistantPlaceholder: ChatMessageType = {
      id: assistantId,
      role: 'assistant',
      content: '',
      timestamp: timeString,
    };

    const updatedMessages = [...messages, userMessage];
    setMessages([...updatedMessages, assistantPlaceholder]);
    setIsGenerating(true);

    // Abort controller
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    let accumulatedText = '';

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: updatedMessages,
          userMessage: text,
        }),
        signal: abortController.signal,
      });

      if (!response.ok) {
        throw new Error(`Server returned status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('ReadableStream not supported.');
      }

      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith('data: ')) {
            const dataStr = trimmed.replace(/^data: /, '').trim();
            if (dataStr === '[DONE]') {
              continue;
            }
            try {
              const parsed = JSON.parse(dataStr);
              if (parsed.error) {
                throw new Error(parsed.error);
              }
              if (parsed.text) {
                accumulatedText += parsed.text;
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantId ? { ...m, content: accumulatedText } : m
                  )
                );
              }
            } catch (err) {
              // Ignore non-json lines
            }
          }
        }
      }

      setIsGenerating(false);

      if (settings.soundEffectsEnabled) {
        playSound('receive');
      }

      // If auto-speak is enabled, Maya speaks her answer
      if (settings.autoSpeak && accumulatedText.trim()) {
        handleSpeakMessage(accumulatedText, assistantId);
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        setIsGenerating(false);
        return;
      }

      console.error('Chat error:', err);
      setIsGenerating(false);

      const fallbackReply =
        accumulatedText ||
        'माफ़ करना, मैं अभी कनेक्ट नहीं कर पा रही हूँ। कृपया दोबारा कोशिश करें या अपना इंटरनेट कनेक्शन चेक करें।';

      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId ? { ...m, content: fallbackReply } : m
        )
      );

      setErrorMessage('कुछ तकनीकी समस्या हुई। कृपया दोबारा पूछें।');
    } finally {
      abortControllerRef.current = null;
    }
  };

  const handleStopGenerating = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsGenerating(false);
    }
  };

  const handleClearChat = () => {
    if (window.confirm('क्या आप बातचीत को रीसेट करना चाहते हैं?')) {
      handleStopSpeech();
      handleStopGenerating();
      setMessages([INITIAL_MESSAGE]);
      localStorage.removeItem('maya_chat_history');
    }
  };

  const handleUpdateSettings = (newSettings: Partial<UserSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  return (
    <div className="flex flex-col h-screen w-full bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* Top Navbar */}
      <Navbar
        isSpeaking={isMayaSpeaking}
        isListening={isUserListening}
        isThinking={isGenerating}
        settings={settings}
        onToggleAutoSpeak={() =>
          handleUpdateSettings({ autoSpeak: !settings.autoSpeak })
        }
        onOpenSettings={() => setSettingsOpen(true)}
        onOpenAbout={() => setAboutOpen(true)}
        onClearChat={handleClearChat}
      />

      {/* Main Chat Container */}
      <main className="flex-1 overflow-y-auto px-4 py-4 md:py-6">
        <div className="max-w-3xl mx-auto flex flex-col min-h-full">
          {/* Top Greeting Banner if fresh conversation */}
          {messages.length <= 1 && (
            <div className="my-auto py-6 text-center animate-fadeIn">
              <div className="inline-flex p-3 rounded-2xl bg-gradient-to-br from-rose-500/20 via-pink-500/10 to-transparent border border-rose-500/20 mb-3 shadow-lg shadow-rose-950/20">
                <Sparkles className="w-8 h-8 text-rose-400 animate-pulse" />
              </div>
              <h2 className="text-2xl font-bold text-white font-hindi">
                नमस्ते! मैं माया हूँ ✨
              </h2>
              <p className="text-sm text-slate-400 max-w-md mx-auto mt-2 leading-relaxed">
                आपकी दोस्ताना हिंदी व हिंग्लिश AI साथी। पढ़ाई, गेमिंग, गाने या रोज़मर्रा की बातों में मुझे कभी भी याद करें।
              </p>
            </div>
          )}

          {/* Messages List */}
          <div className="flex-1 space-y-1">
            {messages.map((message) => (
              <ChatMessage
                key={message.id}
                message={message}
                isSpeakingThis={activeSpeakingId === message.id && isMayaSpeaking}
                onSpeak={handleSpeakMessage}
                onStopSpeak={handleStopSpeech}
              />
            ))}

            {/* Live generation pulse if waiting for first token */}
            {isGenerating &&
              messages[messages.length - 1]?.role === 'assistant' &&
              !messages[messages.length - 1]?.content && (
                <div className="flex items-center gap-2 text-xs text-rose-400 p-3 bg-slate-900/60 rounded-xl border border-slate-800/80 w-fit animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping" />
                  <span className="font-medium">माया सोच रही है और जवाब तैयार कर रही है...</span>
                </div>
              )}

            <div ref={chatBottomRef} />
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="my-2 p-3 rounded-xl bg-red-950/40 border border-red-500/30 text-red-200 text-xs flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400" />
                <span>{errorMessage}</span>
              </div>
              <button
                type="button"
                onClick={() => setErrorMessage(null)}
                className="text-red-300 hover:text-white"
              >
                ✕
              </button>
            </div>
          )}

          {/* Quick Topics Pill Bar */}
          <div className="mt-6 pt-3 border-t border-slate-900/80">
            <QuickTopics
              onSelectPrompt={handleSendMessage}
              disabled={isGenerating}
            />
          </div>
        </div>
      </main>

      {/* Bottom Sticky Input Area */}
      <footer className="w-full border-t border-slate-800/80 bg-slate-950/90 backdrop-blur-md px-4 py-3 shrink-0">
        <div className="max-w-3xl mx-auto">
          <VoiceInputBar
            onSendMessage={handleSendMessage}
            onStopGenerating={handleStopGenerating}
            isGenerating={isGenerating}
            onSpeechStateChange={(listening) => setIsUserListening(listening)}
            micLanguage={settings.micLanguage}
            onChangeMicLanguage={(lang) => handleUpdateSettings({ micLanguage: lang })}
            soundEffectsEnabled={settings.soundEffectsEnabled}
          />
        </div>
      </footer>

      {/* Modals */}
      <AboutMayaModal
        isOpen={aboutOpen}
        onClose={() => setAboutOpen(false)}
        onSayHello={() => handleSendMessage('हाय माया! मुझे अपने बारे में बताओ।')}
      />

      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
      />
    </div>
  );
}
