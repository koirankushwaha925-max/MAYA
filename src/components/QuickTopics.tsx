import React, { useState } from 'react';
import { BookOpen, Gamepad2, Music, Coffee, Sparkles, Smartphone, Heart } from 'lucide-react';

interface QuickTopicsProps {
  onSelectPrompt: (promptText: string) => void;
  disabled?: boolean;
}

type TopicCategory = 'all' | 'mobile' | 'study' | 'gaming' | 'music' | 'daily';

interface TopicItem {
  category: 'mobile' | 'study' | 'gaming' | 'music' | 'daily';
  label: string;
  icon: string;
  prompt: string;
}

const TOPICS: TopicItem[] = [
  // मोबाइल के सारे काम
  {
    category: 'mobile',
    icon: '📱',
    label: 'तुम्हें किसने बनाया?',
    prompt: 'माया, तुम्हें किसने बनाया है? तुम्हारा क्रिएटर कौन है?',
  },
  {
    category: 'mobile',
    icon: '⏰',
    label: 'अलार्म और रिमाइंडर प्लान',
    prompt: 'मुझे कल सुबह 6 बजे उठने और दिनभर के कामों का सही शेड्यूल व रिमाइंडर प्लान बनाकर दो।',
  },
  {
    category: 'mobile',
    icon: '💬',
    label: 'WhatsApp / SMS ड्राफ्ट',
    prompt: 'मुझे अपने दोस्त / सहकर्मी के लिए एक विनम्र और प्यारा सा हिंदी मैसेज ड्राफ्ट करके दो।',
  },
  {
    category: 'mobile',
    icon: '🔋',
    label: 'बैटरी व स्टोरेज बचाएं',
    prompt: 'मोबाइल की बैटरी लंबे समय तक चलाने और फोन स्टोरेज खाली करने के 3 आसान तरीके बताओ।',
  },
  {
    category: 'mobile',
    icon: '⚡',
    label: 'फोन काम आसान करने के टिप्स',
    prompt: 'स्मार्टफोन पर रोज़मर्रा के काम तेज़ और आसान करने के टॉप 3 टिप्स और शॉर्टकट बताओ।',
  },

  // पढ़ाई
  {
    category: 'study',
    icon: '📐',
    label: 'गणित की आसान ट्रिक',
    prompt: 'मुझे गणित का कोई ऐसा मज़ेदार और आसान कॉन्सेप्ट या शॉर्टकट ट्रिक सिखाओ जो ज़िंदगी में काम आए!',
  },
  {
    category: 'study',
    icon: '⏱️',
    label: '25-मिनट स्टडी प्लान',
    prompt: 'पढ़ाई में पूरा फोकस रखने के लिए 25 मिनट का बेस्ट पोमोडोरो रूटीन बताओ।',
  },
  {
    category: 'study',
    icon: '💻',
    label: 'AI और कोडिंग की समझ',
    prompt: 'AI और कंप्यूटर प्रोग्रामिंग की शुरुआत कैसे करें? आसान शब्दों में रोडमैप समझाओ।',
  },
  {
    category: 'study',
    icon: '🧠',
    label: 'याददाश्त बढ़ाने के टिप्स',
    prompt: 'जो पढ़ते हैं वो जल्दी भूल जाते हैं, लंबे समय तक याद रखने का आसान वैज्ञानिक तरीका बताओ।',
  },

  // गेमिंग
  {
    category: 'gaming',
    icon: '🎯',
    label: 'BGMI / शूटिंग गेम्स टिप्स',
    prompt: 'BGMI या बैटल रॉयल गेम्स में एम (aim) और रिफ्लेक्स तेज़ करने के 3 ज़बरदस्त टिप्स बताओ।',
  },
  {
    category: 'gaming',
    icon: '⛏️',
    label: 'Minecraft क्रिएटिव आइडिया',
    prompt: 'Minecraft में सर्वाइवल या क्रिएटिव मोड में एक कूल बेस या विला बनाने के लिए यूनिक आइडिया दो।',
  },
  {
    category: 'gaming',
    icon: '🕹️',
    label: 'टॉप स्टोरी गेम्स',
    prompt: 'दिल छू लेने वाली स्टोरी वाले टॉप 3 वीडियो गेम्स कौन से हैं जो हर गेमर को ज़रूर खेलने चाहिए?',
  },
  {
    category: 'gaming',
    icon: '⚡',
    label: 'गेमिंग रिफ्लेक्स और फोकस',
    prompt: 'लंबे गेमिंग सेशन्स में फोकस बनाए रखने और आंखों को रिलैक्स रखने का सही तरीका क्या है?',
  },

  // गाने और संगीत
  {
    category: 'music',
    icon: '🎧',
    label: 'मूड फ्रेश करने वाले गाने',
    prompt: 'मेरा मूड एकदम फ्रेश और पॉजिटिव कर दे, ऐसे 5 बेहतरीन हिंदी/हिंग्लिश गानों के नाम बताओ!',
  },
  {
    category: 'music',
    icon: '☕',
    label: 'लो-फाई (Lo-fi) व सुकून',
    prompt: 'रात में या पढ़ाई के दौरान सुनने के लिए बेस्ट सुकून भरे स्लो/लो-फाई गानों की लिस्ट दो।',
  },
  {
    category: 'music',
    icon: '🎤',
    label: 'आओ अंत्याक्षरी खेलें',
    prompt: 'माया, चलो मेरे साथ अंत्याक्षरी खेलते हैं! पहला गाना तुम "म" से गाओ!',
  },
  {
    category: 'music',
    icon: '🎶',
    label: 'अरिजीत सिंह के बेस्ट गाने',
    prompt: 'अरिजीत सिंह के वो 4 गाने जो सीधे दिल को छू जाते हैं, उनकी खासियत के साथ बताओ।',
  },

  // रोज़मर्रा और गपशप
  {
    category: 'daily',
    icon: '☀️',
    label: 'प्रोडक्टिव दिन की शुरुआत',
    prompt: 'आज का दिन एनर्जेटिक और प्रोडक्टिव बनाने के लिए मुझे एक छोटा सा प्यारा सा मॉर्निंग रूटीन बताओ।',
  },
  {
    category: 'daily',
    icon: '😂',
    label: 'मज़ेदार चुटकुला सुनाओ',
    prompt: 'एक बढ़िया, हंसमुख और साफ-सुथरा चुटकुला या मज़ेदार किस्सा सुनाओ जिससे चेहरे पर मुस्कान आ जाए!',
  },
  {
    category: 'daily',
    icon: '🤖',
    label: 'तुम AI कैसे हो?',
    prompt: 'माया, तुम एक AI हो तो तुम्हारी दुनिया कैसी है? तुम कैसे सोचती हो और इंसानों की मदद कैसे करती हो?',
  },
  {
    category: 'daily',
    icon: '🌿',
    label: 'तनाव कम करने का उपाय',
    prompt: 'थोड़ा दिमाग भारी लग रहा है, 2 मिनट में मन शांत करने की कोई प्यारी सी सलाह दो।',
  },
];

export const QuickTopics: React.FC<QuickTopicsProps> = ({ onSelectPrompt, disabled }) => {
  const [activeTab, setActiveTab] = useState<TopicCategory>('all');

  const filteredTopics =
    activeTab === 'all' ? TOPICS : TOPICS.filter((t) => t.category === activeTab);

  return (
    <div className="w-full">
      {/* Category Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none text-xs">
        <button
          type="button"
          onClick={() => setActiveTab('all')}
          className={`px-3 py-1.5 rounded-full font-medium transition-all shrink-0 flex items-center gap-1.5 ${
            activeTab === 'all'
              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm'
              : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 border border-slate-700/40'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>सभी विषय</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('mobile')}
          className={`px-3 py-1.5 rounded-full font-medium transition-all shrink-0 flex items-center gap-1.5 ${
            activeTab === 'mobile'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
              : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 border border-slate-700/40'
          }`}
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>📱 मोबाइल काम</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('study')}
          className={`px-3 py-1.5 rounded-full font-medium transition-all shrink-0 flex items-center gap-1.5 ${
            activeTab === 'study'
              ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 shadow-sm'
              : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 border border-slate-700/40'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>📚 पढ़ाई</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('gaming')}
          className={`px-3 py-1.5 rounded-full font-medium transition-all shrink-0 flex items-center gap-1.5 ${
            activeTab === 'gaming'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
              : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 border border-slate-700/40'
          }`}
        >
          <Gamepad2 className="w-3.5 h-3.5" />
          <span>🎮 गेमिंग</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('music')}
          className={`px-3 py-1.5 rounded-full font-medium transition-all shrink-0 flex items-center gap-1.5 ${
            activeTab === 'music'
              ? 'bg-pink-500/20 text-pink-300 border border-pink-500/40 shadow-sm'
              : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 border border-slate-700/40'
          }`}
        >
          <Music className="w-3.5 h-3.5" />
          <span>🎵 गाने व संगीत</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('daily')}
          className={`px-3 py-1.5 rounded-full font-medium transition-all shrink-0 flex items-center gap-1.5 ${
            activeTab === 'daily'
              ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40 shadow-sm'
              : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 border border-slate-700/40'
          }`}
        >
          <Coffee className="w-3.5 h-3.5" />
          <span>☕ रोज़मर्रा & गपशप</span>
        </button>
      </div>

      {/* Pill Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
        {filteredTopics.slice(0, 4).map((topic, index) => (
          <button
            key={index}
            type="button"
            disabled={disabled}
            onClick={() => onSelectPrompt(topic.prompt)}
            className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-900/60 hover:bg-slate-800/80 active:scale-[0.98] border border-slate-800/70 hover:border-rose-500/30 text-left transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed group shadow-sm"
          >
            <span className="text-lg p-1 rounded-lg bg-slate-800/80 group-hover:bg-rose-500/10 transition-colors">
              {topic.icon}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-200 group-hover:text-rose-300 truncate">
                {topic.label}
              </p>
              <p className="text-[11px] text-slate-400 truncate mt-0.5">
                {topic.prompt}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
