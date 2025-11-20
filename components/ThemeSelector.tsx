import React from 'react';
import { STUDIO_THEMES, POPULAR_THEMES, CREATIVE_THEMES } from '../constants';
import { CheckCircle2, ChevronDown, ChevronUp, Palette } from 'lucide-react';

interface ThemeSelectorProps {
  selectedThemeId: string | null;
  onSelectTheme: (themeId: string) => void;
}

const ThemeSelector: React.FC<ThemeSelectorProps> = ({ selectedThemeId, onSelectTheme }) => {
  
  const renderThemeCard = (theme: any) => {
    const isSelected = selectedThemeId === theme.id;
    return (
        <button
            key={theme.id}
            onClick={() => onSelectTheme(theme.id)}
            className={`
            relative group rounded-xl p-3 text-left transition-all duration-300 border flex flex-col h-full
            ${isSelected 
                ? 'bg-aksen-dark border-aksen-orange shadow-[0_0_20px_-5px_rgba(249,115,22,0.3)]' 
                : 'bg-aksen-dark border-gray-800 hover:border-gray-600 hover:bg-gray-800'
            }
            `}
        >
            <div className="flex items-start justify-between mb-2">
            <div className={`
                p-2 rounded-lg transition-colors
                ${isSelected ? 'bg-gradient-to-br from-aksen-orange to-red-500 text-white' : 'bg-gray-900 text-gray-400 group-hover:text-white'}
            `}>
                {theme.icon}
            </div>
            {isSelected && (
                <CheckCircle2 className="w-5 h-5 text-aksen-orange animate-in fade-in zoom-in duration-300" />
            )}
            </div>
            
            <h4 className={`font-medium text-sm mb-1 ${isSelected ? 'text-white' : 'text-gray-300'}`}>
            {theme.name}
            </h4>
            <p className="text-[10px] text-gray-500 line-clamp-3 leading-relaxed">
            {theme.description}
            </p>

            {isSelected && (
            <div className="absolute inset-0 border-2 border-aksen-orange rounded-xl pointer-events-none" />
            )}
        </button>
    );
  };

  const selectedCreativeTheme = CREATIVE_THEMES.find(t => t.id === selectedThemeId);
  const isCreativeSelected = !!selectedCreativeTheme;

  return (
    <div className="space-y-6">
      {/* Studio Section */}
      <div className="space-y-2">
        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Studio Profesional</h3>
        <div className="grid grid-cols-2 gap-3">
            {STUDIO_THEMES.map(renderThemeCard)}
        </div>
      </div>

      {/* Event Section */}
      <div className="space-y-2">
        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Tema Perayaan & Event (Intimate)</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {POPULAR_THEMES.map(renderThemeCard)}
        </div>
      </div>

      {/* Creative Dropdown Section */}
      <div className="space-y-2">
        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Konsep Kreatif (20+)</h3>
        <div className="relative">
            <div className={`
                border rounded-xl overflow-hidden transition-all duration-300
                ${isCreativeSelected ? 'border-aksen-orange bg-aksen-dark' : 'border-gray-800 bg-aksen-dark'}
            `}>
                <select 
                    className="w-full p-4 bg-transparent text-white appearance-none cursor-pointer outline-none z-10 relative"
                    onChange={(e) => onSelectTheme(e.target.value)}
                    value={isCreativeSelected ? selectedThemeId! : ""}
                >
                    <option value="" disabled>Pilih gaya kreatif...</option>
                    {CREATIVE_THEMES.map(t => (
                        <option key={t.id} value={t.id} className="bg-gray-900 text-white">
                            {t.name}
                        </option>
                    ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                    <ChevronDown className="w-5 h-5" />
                </div>
            </div>
            
            {/* Info Box for Dropdown Selection */}
            {isCreativeSelected && selectedCreativeTheme && (
                <div className="mt-3 p-4 bg-aksen-orange/10 border border-aksen-orange/30 rounded-xl animate-in fade-in slide-in-from-top-2">
                    <div className="flex items-start gap-3">
                        <div className="p-2 bg-aksen-orange/20 rounded-lg text-aksen-orange">
                            {selectedCreativeTheme.icon}
                        </div>
                        <div>
                            <h4 className="text-sm font-bold text-white">{selectedCreativeTheme.name}</h4>
                            <p className="text-xs text-gray-400 mt-1">{selectedCreativeTheme.description}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default ThemeSelector;