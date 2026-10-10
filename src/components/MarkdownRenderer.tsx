import React, { useState } from 'react';
import { Check, Copy } from 'lucide-react';

interface MarkdownRendererProps {
  content: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopyCode = (codeText: string, index: number) => {
    navigator.clipboard.writeText(codeText);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // Split by code blocks
  const parts = content.split(/(```[\s\S]*?```)/g);

  return (
    <div className="space-y-3 leading-relaxed text-slate-100 font-normal text-[15px]">
      {parts.map((part, index) => {
        if (part.startsWith('```') && part.endsWith('```')) {
          const lines = part.slice(3, -3).trim().split('\n');
          const firstLine = lines[0].trim();
          const hasLang = /^[a-zA-Z0-9_-]+$/.test(firstLine);
          const language = hasLang ? firstLine : '';
          const codeContent = hasLang ? lines.slice(1).join('\n') : lines.join('\n');

          return (
            <div key={index} className="my-3 overflow-hidden rounded-xl bg-slate-900 border border-slate-700/60 shadow-md">
              <div className="flex items-center justify-between px-3.5 py-1.5 bg-slate-800/80 border-b border-slate-700/50 text-xs text-slate-400">
                <span className="font-mono uppercase">{language || 'code'}</span>
                <button
                  type="button"
                  onClick={() => handleCopyCode(codeContent, index)}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-slate-700/60 hover:bg-slate-700 text-slate-200 transition-colors"
                >
                  {copiedIndex === index ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400 font-medium">कॉपी किया!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>कॉपी</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="p-3.5 overflow-x-auto text-xs font-mono text-emerald-300 leading-relaxed">
                <code>{codeContent}</code>
              </pre>
            </div>
          );
        }

        // Render normal text with formatting (headings, lists, bold)
        const paragraphs = part.split(/\n\n+/);
        return (
          <React.Fragment key={index}>
            {paragraphs.map((p, pIdx) => {
              const trimmed = p.trim();
              if (!trimmed) return null;

              // Headings
              if (trimmed.startsWith('### ')) {
                return (
                  <h4 key={pIdx} className="text-base font-semibold text-rose-300 mt-2">
                    {renderInline(trimmed.replace(/^### /, ''))}
                  </h4>
                );
              }
              if (trimmed.startsWith('## ')) {
                return (
                  <h3 key={pIdx} className="text-lg font-bold text-rose-200 mt-3">
                    {renderInline(trimmed.replace(/^## /, ''))}
                  </h3>
                );
              }
              if (trimmed.startsWith('# ')) {
                return (
                  <h2 key={pIdx} className="text-xl font-bold text-white mt-3">
                    {renderInline(trimmed.replace(/^# /, ''))}
                  </h2>
                );
              }

              // List items
              const lines = trimmed.split('\n');
              const isBulletList = lines.every((line) => line.trim().startsWith('- ') || line.trim().startsWith('* '));
              const isNumberedList = lines.every((line) => /^\d+\.\s/.test(line.trim()));

              if (isBulletList) {
                return (
                  <ul key={pIdx} className="list-disc list-outside pl-5 space-y-1.5 text-slate-200">
                    {lines.map((line, lIdx) => (
                      <li key={lIdx}>{renderInline(line.trim().replace(/^[-*]\s+/, ''))}</li>
                    ))}
                  </ul>
                );
              }

              if (isNumberedList) {
                return (
                  <ol key={pIdx} className="list-decimal list-outside pl-5 space-y-1.5 text-slate-200">
                    {lines.map((line, lIdx) => (
                      <li key={lIdx}>{renderInline(line.trim().replace(/^\d+\.\s+/, ''))}</li>
                    ))}
                  </ol>
                );
              }

              return (
                <p key={pIdx} className="text-slate-200 whitespace-pre-line leading-relaxed">
                  {renderInline(p)}
                </p>
              );
            })}
          </React.Fragment>
        );
      })}
    </div>
  );
};

// Inline parsing for bold, italic, code
function renderInline(text: string): React.ReactNode {
  // Bold **text**
  const boldTokens = text.split(/(\*\*[^*]+?\*\*)/g);
  return boldTokens.map((token, i) => {
    if (token.startsWith('**') && token.endsWith('**')) {
      return (
        <strong key={i} className="font-semibold text-white">
          {token.slice(2, -2)}
        </strong>
      );
    }

    // Inline code `code`
    const codeTokens = token.split(/(`[^`]+?`)/g);
    return codeTokens.map((cToken, j) => {
      if (cToken.startsWith('`') && cToken.endsWith('`')) {
        return (
          <code
            key={`${i}-${j}`}
            className="px-1.5 py-0.5 rounded text-xs font-mono bg-slate-800 text-rose-300 border border-slate-700"
          >
            {cToken.slice(1, -1)}
          </code>
        );
      }
      return cToken;
    });
  });
}
