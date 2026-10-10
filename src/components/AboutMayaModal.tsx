import React from 'react';
import { X, Sparkles, BookOpen, Gamepad2, Music, Coffee, Heart, Bot, Smartphone } from 'lucide-react';
import { MayaAvatar } from './MayaAvatar';

interface AboutMayaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSayHello: () => void;
}

export const AboutMayaModal: React.FC<AboutMayaModalProps> = ({
  isOpen,
  onClose,
  onSayHello,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-6 overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Avatar and Title */}
        <div className="flex flex-col items-center text-center pb-4 border-b border-slate-800">
          <MayaAvatar
            isSpeaking={false}
            isListening={false}
            isThinking={false}
            size="lg"
            showBadge
          />
          <h2 className="text-xl font-bold text-white mt-3 flex items-center gap-2">
            <span>माया (Maya)</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
              AI Assistant
            </span>
          </h2>
          <p className="text-xs text-rose-300 font-medium mt-1">
            आपकी दोस्ताना, समझदार और स्वाभाविक हिंदी व हिंग्लिश साथी
          </p>
        </div>

        {/* Creator Highlight Card */}
        <div className="my-3 p-3 rounded-xl bg-gradient-to-r from-amber-950/40 via-rose-950/30 to-purple-950/40 border border-amber-500/30 text-amber-200 text-xs flex items-center gap-2.5 shadow-inner">
          <Heart className="w-4 h-4 text-rose-400 shrink-0 fill-rose-400/30" />
          <div className="flex-1">
            <span className="font-semibold text-amber-300">निर्माता (Creator): </span>
            <span className="text-white font-medium">संदीप (Sandeep)</span>
            <p className="text-[11px] text-amber-200/80 mt-0.5 font-hindi">
              "कोई पूछे तुमको किसने बनाया? 👉 <strong>संदीप ने बनाया हमें!</strong> 😊"
            </p>
          </div>
        </div>

        {/* AI Disclaimer Highlight */}
        <div className="mb-3 p-3 rounded-xl bg-rose-950/30 border border-rose-500/30 text-rose-200 text-xs flex items-start gap-2.5">
          <Bot className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-rose-300">ज़रूरी स्पष्टता: </span>
            मैं एक <strong>AI असिस्टेंट</strong> हूँ, असली इंसान नहीं। मेरा काम आपका काम आसान करना, अच्छी बातचीत करना और आपकी मदद करना है।
          </div>
        </div>

        {/* Features / Specialties Grid */}
        <div className="space-y-2 text-xs">
          <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-800/50 border border-slate-800">
            <span className="p-2 rounded-lg bg-emerald-500/20 text-emerald-300">
              <Smartphone className="w-4 h-4" />
            </span>
            <div>
              <p className="font-semibold text-slate-200">📱 मोबाइल के सारे काम</p>
              <p className="text-slate-400 text-[11px]">अलार्म, रिमाइंडर, मैसेज/ईमेल ड्राफ्ट, ऐप्स और फोन टिप्स।</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-800/50 border border-slate-800">
            <span className="p-2 rounded-lg bg-indigo-500/20 text-indigo-300">
              <BookOpen className="w-4 h-4" />
            </span>
            <div>
              <p className="font-semibold text-slate-200">📚 पढ़ाई और समझ</p>
              <p className="text-slate-400 text-[11px]">गणित, विज्ञान, कोडिंग, एग्ज़ाम तैयारी आसान भाषा में।</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-800/50 border border-slate-800">
            <span className="p-2 rounded-lg bg-amber-500/20 text-amber-300">
              <Gamepad2 className="w-4 h-4" />
            </span>
            <div>
              <p className="font-semibold text-slate-200">🎮 गेमिंग साथी</p>
              <p className="text-slate-400 text-[11px]">BGMI, Free Fire, Minecraft, PC गेम्स टिप्स और रणनीतियाँ।</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-800/50 border border-slate-800">
            <span className="p-2 rounded-lg bg-pink-500/20 text-pink-300">
              <Music className="w-4 h-4" />
            </span>
            <div>
              <p className="font-semibold text-slate-200">🎵 गाने और संगीत</p>
              <p className="text-slate-400 text-[11px]">मूड के हिसाब से गाने, अंत्याक्षरी, और प्लेलिस्ट सुझाव।</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-800/50 border border-slate-800">
            <span className="p-2 rounded-lg bg-teal-500/20 text-teal-300">
              <Coffee className="w-4 h-4" />
            </span>
            <div>
              <p className="font-semibold text-slate-200">☕ रोज़मर्रा के काम और गपशप</p>
              <p className="text-slate-400 text-[11px]">प्रोडक्टिविटी, हंसी-मज़ाक, प्रेरणा और सच्ची बातचीत।</p>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-5 flex gap-2">
          <button
            type="button"
            onClick={() => {
              onClose();
              onSayHello();
            }}
            className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-medium text-xs shadow-lg shadow-rose-500/25 flex items-center justify-center gap-2 transition-all"
          >
            <Sparkles className="w-4 h-4" />
            <span>माया से बात शुरू करें</span>
          </button>
        </div>
      </div>
    </div>
  );
};
