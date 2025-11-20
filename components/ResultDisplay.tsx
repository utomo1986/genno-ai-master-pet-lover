import React, { useState } from 'react';
import { Download, RefreshCw, Sparkles, Send, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';

interface ResultDisplayProps {
  imageUrl: string;
  onReset: () => void;
  onRefine: (prompt: string) => void;
  isRevising: boolean;
  // History props
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  historyIndex: number;
  historyLength: number;
}

const ResultDisplay: React.FC<ResultDisplayProps> = ({ 
  imageUrl, 
  onReset, 
  onRefine,
  isRevising,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  historyIndex,
  historyLength
}) => {
  const [refinePrompt, setRefinePrompt] = useState('');

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `genno-ai-pet-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleRefineSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (refinePrompt.trim()) {
      onRefine(refinePrompt);
      setRefinePrompt('');
    }
  };

  return (
    <div className="w-full h-full flex flex-col animate-in fade-in slide-in-from-bottom-10 duration-700">
      
      {/* Image Container */}
      <div className="bg-gradient-to-r from-aksen-orange to-red-500 p-[2px] rounded-2xl shadow-2xl shadow-orange-500/20 mb-6 relative mx-auto w-full max-w-md">
        <div className="bg-black rounded-[14px] overflow-hidden relative group flex items-center justify-center bg-gray-900/50 aspect-[3/4]">
          <img 
            src={imageUrl} 
            alt="Generated Masterpiece" 
            className="w-full h-full object-cover"
          />
          
          {/* History Navigation (Back/Forward) */}
          <div className="absolute top-4 right-4 flex items-center gap-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <button 
                onClick={onUndo}
                disabled={!canUndo}
                className={`
                    p-2 rounded-full backdrop-blur-md border border-white/20 transition-all
                    ${!canUndo ? 'bg-black/20 text-gray-500 cursor-not-allowed' : 'bg-black/60 text-white hover:bg-aksen-orange hover:border-aksen-orange'}
                `}
                title="Undo / Sebelumnya"
            >
                <ChevronLeft className="w-5 h-5" />
            </button>
             <div className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-xs font-bold border border-white/20">
                {historyIndex + 1} / {historyLength}
            </div>
            <button 
                onClick={onRedo}
                disabled={!canRedo}
                className={`
                    p-2 rounded-full backdrop-blur-md border border-white/20 transition-all
                    ${!canRedo ? 'bg-black/20 text-gray-500 cursor-not-allowed' : 'bg-black/60 text-white hover:bg-aksen-orange hover:border-aksen-orange'}
                `}
                 title="Redo / Selanjutnya"
            >
                <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Revision Input */}
      <form onSubmit={handleRefineSubmit} className="mb-6">
        <div className="relative">
            <input 
                type="text"
                value={refinePrompt}
                onChange={(e) => setRefinePrompt(e.target.value)}
                placeholder="Lakukan revisi (cth: 'Ubah background jadi biru', 'Perbaiki mata')"
                disabled={isRevising}
                className="w-full bg-gray-900 border border-gray-700 rounded-xl py-3 pl-4 pr-12 text-sm text-white placeholder-gray-500 focus:border-aksen-orange focus:ring-1 focus:ring-aksen-orange outline-none transition-all"
            />
            <button 
                type="submit"
                disabled={!refinePrompt.trim() || isRevising}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-aksen-orange text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:hover:bg-aksen-orange transition-colors"
            >
                {isRevising ? <Sparkles className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
        </div>
        <p className="text-[10px] text-gray-500 mt-2 ml-1">
            Tip: Jelaskan secara spesifik apa yang ingin diubah. Bagian lain akan tetap natural.
        </p>
      </form>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button 
          type="button"
          onClick={handleDownload}
          className="flex items-center justify-center gap-2 bg-white text-black hover:bg-gray-100 py-3 px-6 rounded-xl font-bold transition-transform active:scale-95 text-sm"
        >
          <Download className="w-4 h-4" />
          Download HD (3:4)
        </button>
        <button 
          type="button"
          onClick={(e) => { e.preventDefault(); onReset(); }}
          className="flex items-center justify-center gap-2 bg-red-900/20 text-red-400 border border-red-900/50 hover:bg-red-900/40 hover:text-red-300 py-3 px-6 rounded-xl font-semibold transition-colors text-sm"
        >
          <Trash2 className="w-4 h-4" />
          Hapus & Mulai Awal
        </button>
      </div>
      
    </div>
  );
};

export default ResultDisplay;