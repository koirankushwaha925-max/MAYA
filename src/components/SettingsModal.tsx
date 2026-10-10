import React from 'react';
import { X, Volume2, Sliders, Bell, Play } from 'lucide-react';
import { UserSettings } from '../types';
import { getAvailableVoices, speakText } from '../utils/speech';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: UserSettings;
  onUpdateSettings: (newSettings: Partial<UserSettings>) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
}) => {
  if (!isOpen) return null;

  const voices = getAvailableVoices();
  // Filter relevant voices: Hindi, Indian English, or popular ones
  const relevantVoices = voices.filter(
    (v) =>
      v.lang.startsWith('hi') ||
      v.lang.includes('IN') ||
      v.name.toLowerCase().includes('hindi') ||
      v.name.toLowerCase().includes('india')
  );

  const displayVoices = relevantVoices.length > 0 ? relevantVoices : voices.slice(0, 10);

  const testVoiceSample = () => {
    speakText('नमस्ते! मैं माया हूँ। क्या यह आवाज़ आपको पसंद आ रही है?', {
      rate: settings.voiceRate,
      voiceURI: settings.voiceURI,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-6 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-rose-400" />
            <h3 className="font-bold text-white text-base">माया की सेटिंग्स (Settings)</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-5 py-4 text-xs">
          {/* Auto speak toggle */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/40 border border-slate-800">
            <div>
              <p className="font-semibold text-slate-200">ऑटो-वॉइस (Auto-Speak)</p>
              <p className="text-slate-400 text-[11px] mt-0.5">
                माया के हर नए जवाब को अपने-आप आवाज़ में सुनें
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.autoSpeak}
                onChange={(e) => onUpdateSettings({ autoSpeak: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-10 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-rose-500" />
            </label>
          </div>

          {/* Voice rate slider */}
          <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-slate-200">बोलने की गति (Speech Speed)</span>
              <span className="font-mono text-rose-300 bg-rose-500/10 px-2 py-0.5 rounded text-[11px]">
                {settings.voiceRate.toFixed(1)}x
              </span>
            </div>
            <input
              type="range"
              min="0.7"
              max="1.3"
              step="0.05"
              value={settings.voiceRate}
              onChange={(e) => onUpdateSettings({ voiceRate: parseFloat(e.target.value) })}
              className="w-full accent-rose-500 bg-slate-700 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 mt-1">
              <span>धीमी (0.7x)</span>
              <span>सामान्य (1.0x)</span>
              <span>तेज़ (1.3x)</span>
            </div>
          </div>

          {/* Voice Selection */}
          {displayVoices.length > 0 && (
            <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-slate-200">पसंदीदा आवाज़ (Voice)</span>
                <button
                  type="button"
                  onClick={testVoiceSample}
                  className="inline-flex items-center gap-1 text-[11px] text-rose-400 hover:text-rose-300 font-medium"
                >
                  <Play className="w-3 h-3 fill-current" /> टेस्ट सुनें
                </button>
              </div>
              <select
                value={settings.voiceURI}
                onChange={(e) => onUpdateSettings({ voiceURI: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-rose-500"
              >
                <option value="">सिस्टम डिफ़ॉल्ट हिंदी आवाज़</option>
                {displayVoices.map((v) => (
                  <option key={v.voiceURI} value={v.voiceURI}>
                    {v.name} ({v.lang})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Sound Effects toggle */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/40 border border-slate-800">
            <div>
              <p className="font-semibold text-slate-200">ध्वनि प्रभाव (Sound Effects)</p>
              <p className="text-slate-400 text-[11px] mt-0.5">
                संदेश भेजने और माइक शुरू होने पर हल्की धुन
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.soundEffectsEnabled}
                onChange={(e) =>
                  onUpdateSettings({ soundEffectsEnabled: e.target.checked })
                }
                className="sr-only peer"
              />
              <div className="w-10 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-rose-500" />
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-2 pt-3 border-t border-slate-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors"
          >
            सेव करें और बंद करें
          </button>
        </div>
      </div>
    </div>
  );
};
