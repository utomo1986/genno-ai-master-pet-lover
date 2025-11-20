import React, { useState } from 'react';
import Header from './components/Header';
import UploadArea from './components/UploadArea';
import ThemeSelector from './components/ThemeSelector';
import ResultDisplay from './components/ResultDisplay';
import { STUDIO_THEMES, POPULAR_THEMES, CREATIVE_THEMES, APP_NAME, APP_TAGLINE } from './constants';
import { AppState } from './types';
import { generatePetPortrait, validateImageContent, refineImage } from './services/geminiService';
import { Wand2, Loader2, AlertCircle, UserCheck, RefreshCcw } from 'lucide-react';

const App: React.FC = () => {
  // State for uploads
  const [petImages, setPetImages] = useState<string[]>([]);
  const [humanImages, setHumanImages] = useState<string[]>([]);
  
  const [selectedThemeId, setSelectedThemeId] = useState<string>(STUDIO_THEMES[0].id);
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  
  // History State
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [toast, setToast] = useState<{msg: string, type: 'error' | 'success'} | null>(null);
  
  // Key to force remount of upload areas on reset
  const [resetKey, setResetKey] = useState(0);

  const currentGeneratedImage = historyIndex >= 0 ? history[historyIndex] : null;

  const showToast = (msg: string, type: 'error' | 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 5000);
  };

  const handlePetImageSelect = async (base64: string) => {
    // Validate it's a pet
    const isValid = await validateImageContent(base64, 'pet');
    if (!isValid) {
        showToast("Peringatan: Kami tidak mendeteksi hewan di foto ini. Hasil mungkin kurang akurat.", 'error');
    }
    setPetImages(prev => [...prev, base64]);
    if (appState === AppState.IDLE) setAppState(AppState.READY_TO_GENERATE);
  };

  const handleRemovePet = (index: number) => {
    setPetImages(prev => prev.filter((_, i) => i !== index));
    if (petImages.length <= 1 && humanImages.length === 0 && appState !== AppState.SUCCESS) {
        setAppState(AppState.IDLE); 
    }
  };

  const handleHumanImageSelect = async (base64: string) => {
    // Validate it's a human
    const isValid = await validateImageContent(base64, 'human');
    if (!isValid) {
        showToast("Peringatan: Wajah tidak terdeteksi dengan jelas. Pastikan foto terang dan jelas.", 'error');
    }
    setHumanImages(prev => [...prev, base64]);
    if (appState === AppState.IDLE) setAppState(AppState.READY_TO_GENERATE);
  };

  const handleRemoveHuman = (index: number) => {
    setHumanImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleGenerate = async () => {
    if (petImages.length === 0 || !selectedThemeId) return;

    // Find the theme
    const allThemes = [...STUDIO_THEMES, ...POPULAR_THEMES, ...CREATIVE_THEMES];
    const theme = allThemes.find(t => t.id === selectedThemeId);
    if (!theme) return;

    setAppState(AppState.GENERATING);
    setErrorMsg(null);

    try {
      const result = await generatePetPortrait(petImages, humanImages, theme.promptModifier);
      
      // Append to history instead of replacing, preserving past edits if branching from end
      // Or start new branch if in middle (standard undo/redo behavior)
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(result);
      
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
      
      setAppState(AppState.SUCCESS);
    } catch (err: any) {
      console.error(err);
      setAppState(AppState.ERROR);
      setErrorMsg(err.message || "Gagal membuat gambar. Silakan coba lagi.");
    }
  };

  const handleRefine = async (prompt: string) => {
    if (!currentGeneratedImage) return;
    
    setAppState(AppState.REVISING);
    try {
        const refinedResult = await refineImage(currentGeneratedImage, prompt);
        
        // Add to history
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push(refinedResult);
        
        setHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);

        setAppState(AppState.SUCCESS);
    } catch (err: any) {
        console.error(err);
        showToast("Gagal merevisi gambar. Silakan coba lagi.", 'error');
        setAppState(AppState.SUCCESS); 
    }
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
        setHistoryIndex(historyIndex - 1);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
        setHistoryIndex(historyIndex + 1);
    }
  };

  const handleFullReset = () => {
    if (window.confirm("Apakah Anda yakin ingin menghapus semua foto dan memulai dari awal?")) {
        setPetImages([]);
        setHumanImages([]);
        setHistory([]);
        setHistoryIndex(-1);
        setSelectedThemeId(STUDIO_THEMES[0].id); // Reset to default theme
        setErrorMsg(null); // Clear any previous errors
        setToast(null);
        setAppState(AppState.IDLE);
        setResetKey(prev => prev + 1); // Force clean remount of upload components
    }
  };

  const isGenerating = appState === AppState.GENERATING || appState === AppState.REVISING;
  const hasResult = appState === AppState.SUCCESS || appState === AppState.REVISING || history.length > 0;

  return (
    <div className="min-h-screen bg-black text-gray-100 selection:bg-aksen-orange selection:text-white flex flex-col font-sans">
      <Header />

      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-24 right-4 z-50 p-4 rounded-xl shadow-2xl border flex items-center gap-3 animate-in slide-in-from-right ${toast.type === 'error' ? 'bg-red-900/90 border-red-500 text-white' : 'bg-green-900/90 border-green-500 text-white'}`}>
            <AlertCircle className="w-5 h-5" />
            <p className="text-sm font-medium">{toast.msg}</p>
        </div>
      )}

      <main className="flex-grow container mx-auto px-4 py-8 md:py-12 max-w-6xl">
        
        {/* Hero Section */}
        <div className="text-center mb-10 space-y-4">
          <h2 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight">
            Jadikan Foto Hewan Kesayangan <br className="md:hidden" />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-aksen-orange via-amber-500 to-red-500">
              Jadi Mahakarya
            </span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">
            Upload foto hewan peliharaan Anda (bisa lebih dari satu!) untuk membuat potret AI profesional yang menakjubkan.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* Left Column: Controls */}
          {/* REMOVED: opacity-50 pointer-events-none logic to unlock features */}
          <div className={`lg:col-span-5 space-y-8 transition-all duration-500 ${isGenerating ? 'opacity-70 pointer-events-none' : 'opacity-100'}`}>
            
            {/* Step 1: Uploads */}
            <section className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-bold text-gray-500 uppercase tracking-wider">
                <span className="w-6 h-6 rounded-full bg-gray-800 text-white flex items-center justify-center text-xs">1</span>
                Upload Foto
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                 <UploadArea 
                    key={`pet-${resetKey}`}
                    type="pet"
                    onImageSelected={handlePetImageSelect} 
                    onRemoveImage={handleRemovePet}
                    currentImages={petImages} 
                 />
                 <UploadArea 
                    key={`human-${resetKey}`}
                    type="human"
                    onImageSelected={handleHumanImageSelect} 
                    onRemoveImage={handleRemoveHuman}
                    currentImages={humanImages} 
                 />
              </div>
              {petImages.length > 0 && humanImages.length > 0 && (
                <div className="text-xs text-aksen-orange flex items-center gap-1 bg-aksen-orange/10 p-2 rounded border border-aksen-orange/20">
                    <UserCheck className="w-3 h-3" />
                    Mode Combo Aktif: Membuat potret {humanImages.length > 1 ? 'kalian' : 'Anda'} bersama hewan kesayangan!
                </div>
              )}
            </section>

            {/* Step 2: Theme Selection */}
            <section className="space-y-3">
               <div className="flex items-center gap-2 text-sm font-bold text-gray-500 uppercase tracking-wider">
                <span className="w-6 h-6 rounded-full bg-gray-800 text-white flex items-center justify-center text-xs">2</span>
                Pilih Gaya
              </div>
              <ThemeSelector 
                selectedThemeId={selectedThemeId} 
                onSelectTheme={setSelectedThemeId} 
              />
            </section>

            {/* Step 3: Generate Button */}
            <div className="pt-2">
              <button
                onClick={handleGenerate}
                disabled={isGenerating || (petImages.length === 0 && appState === AppState.IDLE)}
                className={`
                  w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-all duration-300
                  ${isGenerating 
                    ? 'bg-gray-800 text-gray-400 cursor-not-allowed' 
                    : petImages.length > 0 
                      ? 'bg-gradient-to-r from-aksen-orange to-red-600 hover:from-orange-400 hover:to-red-500 text-white shadow-lg shadow-orange-900/50 hover:shadow-orange-600/50 hover:-translate-y-1' 
                      : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                  }
                `}
              >
                {appState === AppState.GENERATING ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    Sedang Melukis...
                  </>
                ) : hasResult ? (
                  <>
                    <RefreshCcw className="w-6 h-6" />
                    Buat Lagi (Remake)
                  </>
                ) : (
                  <>
                    <Wand2 className="w-6 h-6" />
                    Buat Potret
                  </>
                )}
              </button>
              {hasResult && !isGenerating && (
                 <p className="text-center text-xs text-gray-500 mt-2">
                    Tips: Ubah gaya di atas atau tambah foto, lalu klik 'Buat Lagi'.
                 </p>
              )}
              {errorMsg && (
                <div className="mt-4 p-4 bg-red-900/20 border border-red-900/50 rounded-xl flex items-start gap-3 text-red-400 text-sm">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <p>{errorMsg}</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Preview / Result */}
          <div className="lg:col-span-7 min-h-[400px] lg:min-h-[600px] flex flex-col relative">
            
            {/* Initial State / Placeholder */}
            {!hasResult && (
              <div className="absolute inset-0 border border-gray-800 bg-aksen-dark/30 rounded-3xl flex flex-col items-center justify-center p-8 text-center space-y-6 border-dashed">
                {appState === AppState.GENERATING ? (
                  <div className="flex flex-col items-center space-y-6">
                     <div className="relative w-24 h-24">
                        <div className="absolute inset-0 rounded-full border-4 border-gray-800"></div>
                        <div className="absolute inset-0 rounded-full border-4 border-t-aksen-orange border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
                     </div>
                     <div className="space-y-2">
                       <h3 className="text-2xl font-bold text-white animate-pulse">Menciptakan Keajaiban...</h3>
                       <p className="text-gray-400">AI sedang menganalisa fitur dan menerapkan gaya pilihan Anda.</p>
                     </div>
                  </div>
                ) : (
                  <>
                    <div className="w-24 h-24 rounded-full bg-gray-900 flex items-center justify-center">
                      <Wand2 className="w-10 h-10 text-gray-700" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-xl font-semibold text-gray-300">Foto Anda akan muncul di sini</h3>
                      <p className="text-sm text-gray-500 max-w-md mx-auto">
                        Pilih foto dan gaya di sebelah kiri untuk memulai. 
                        {humanImages.length > 0 ? " Kami akan menggabungkan Anda dan hewan peliharaan Anda!" : ""}
                      </p>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Success State */}
            {hasResult && currentGeneratedImage && (
               <div className="relative w-full">
                   {appState === AppState.REVISING && (
                       <div className="absolute inset-0 z-50 bg-black/50 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center text-white gap-3">
                           <Loader2 className="w-10 h-10 animate-spin text-aksen-orange" />
                           <p className="font-semibold">Memperbaiki gambar...</p>
                       </div>
                   )}
                   <ResultDisplay 
                        imageUrl={currentGeneratedImage} 
                        onReset={handleFullReset}
                        onRefine={handleRefine}
                        isRevising={appState === AppState.REVISING}
                        canUndo={historyIndex > 0}
                        canRedo={historyIndex < history.length - 1}
                        onUndo={handleUndo}
                        onRedo={handleRedo}
                        historyIndex={historyIndex}
                        historyLength={history.length}
                    />
               </div>
            )}
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-900 py-8 mt-12 bg-black">
        <div className="container mx-auto px-4 text-center text-gray-600 text-sm">
          <p>&copy; {new Date().getFullYear()} {APP_NAME} - {APP_TAGLINE}. Powered by AI.</p>
        </div>
      </footer>
    </div>
  );
};

export default App;