import React, { useEffect, useState } from 'react';
import { Layers, Database, ArrowRight } from 'lucide-react';

interface TitleCardAnimationProps {
  onComplete: () => void;
}

export const TitleCardAnimation: React.FC<TitleCardAnimationProps> = ({ onComplete }) => {
  const [stage, setStage] = useState<'fade-in' | 'active' | 'fade-out'>('fade-in');

  useEffect(() => {
    // 0-300ms fade in
    const activeTimer = setTimeout(() => {
      setStage('active');
    }, 200);

    // 2400ms begin smooth fade out
    const fadeOutTimer = setTimeout(() => {
      setStage('fade-out');
    }, 2400);

    // 2800ms complete transition
    const endTimer = setTimeout(() => {
      onComplete();
    }, 2850);

    return () => {
      clearTimeout(activeTimer);
      clearTimeout(fadeOutTimer);
      clearTimeout(endTimer);
    };
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-slate-950 text-white transition-opacity duration-500 ${
        stage === 'fade-out' ? 'opacity-0 scale-[0.98]' : 'opacity-100 scale-100'
      }`}
    >
      <div className="max-w-md w-full mx-6 text-center flex flex-col items-center">
        {/* Minimal Animated Knowledge & Multi-Agent Symbol */}
        <div className="relative mb-6 flex items-center justify-center">
          <div className="w-16 h-16 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shadow-lg shadow-blue-500/10">
            <Layers className="w-8 h-8 transition-transform duration-700 ease-out transform" />
          </div>
          <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-[10px] text-white font-semibold ring-4 ring-slate-950">
            <Database className="w-3 h-3" />
          </div>
        </div>

        {/* Project Title */}
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white mb-2 font-sans">
          Enterprise AI Knowledge Assistant
        </h1>

        {/* Subtitle */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-950/80 border border-blue-800/60 text-blue-300 text-xs font-medium tracking-wide uppercase mb-4">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
          RAG &amp; Multi-Agent AI
        </div>

        {/* Tagline */}
        <p className="text-slate-400 text-sm sm:text-base font-normal mb-8">
          Intelligent access to enterprise knowledge
        </p>

        {/* Progress line */}
        <div className="w-48 h-1 bg-slate-800 rounded-full overflow-hidden mb-6">
          <div className="h-full bg-blue-500 rounded-full animate-[progress_2.4s_ease-in-out_forwards]" />
        </div>

        {/* Skip button for seamless evaluator/user experience */}
        <button
          onClick={onComplete}
          className="text-xs text-slate-500 hover:text-slate-300 transition-colors flex items-center gap-1 cursor-pointer py-1 px-2"
        >
          Skip intro <ArrowRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};
