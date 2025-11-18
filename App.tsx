
import React, { useState, useCallback, useMemo } from 'react';
import type { UploadedFile } from './types';
import { generatePetPortrait, analyzeImageContent } from './services/geminiService';
import { UploadIcon, TrashIcon, SparklesIcon, DownloadIcon, WarningIcon, ArrowLeftIcon, ArrowRightIcon, ResetIcon } from './components/icons';

const THEMES = ['Pesta Ulang Tahun', 'Tema Natal', 'Kostum Halloween', 'Tema Elegan', 'Kostum Kerajaan', 'Tema Liburan', 'Buat Tema Sendiri...'];
const ASPECT_RATIOS = [
  { label: '1:1', value: '1:1' },
  { label: '3:4', value: '3:4' },
  { label: '9:16', value: '9:16' },
];
const PHOTO_CONCEPTS = [
    { label: 'Potret Klasik & Intim', value: 'classic_intimate' },
    { label: 'Set Bertema', value: 'themed_set' },
    { label: 'Konsep Imajinatif', value: 'imagination' },
];

const IMAGINATIVE_THEMES = [
    { label: 'Gaya Pahlawan Super Komik', value: 'gaya buku komik pahlawan super' },
    { label: 'Gaya Kartun Klasik', value: 'gaya kartun klasik' },
    { label: 'Animasi 3D Modern', value: 'gaya animasi 3D modern, seperti film Pixar' },
    { label: 'Dunia Balok LEGO', value: 'dunia yang terbuat dari balok LEGO' },
    { label: 'Figur Tanah Liat (Claymation)', value: 'figur claymation yang menawan di dunia buatan tangan' },
    { label: 'Seni Piksel 8-Bit', value: 'gaya seni piksel 8-bit dari video game retro' },
    { label: 'Gaya Anime Jepang', value: 'gaya anime Jepang yang bersemangat' },
    { label: 'Lukisan Cat Air', value: 'lukisan cat air yang lembut dan ekspresif' },
    { label: 'Dunia Cyberpunk Neon', value: 'pemandangan kota cyberpunk yang dibanjiri lampu neon' },
    { label: 'Kerajinan Wol/Flanel', value: 'karakter lucu dan berbulu yang terbuat dari wol dan flanel' },
];

const HOLIDAY_LOCATIONS = [
    'pantai tropis yang cerah dengan pasir putih dan air biru kehijauan',
    'pegunungan bersalju dengan kabin kayu yang nyaman dan pohon-pohon pinus',
    'pedesaan Eropa yang menawan dengan jalanan berbatu dan bangunan bersejarah',
    'safari seru di padang rumput Afrika dengan satwa liar di kejauhan',
    'kota metropolitan yang ramai seperti Tokyo atau Paris dengan landmark ikonik',
    'kapal pesiar mewah di laut Mediterania saat matahari terbenam',
    'berkemah di bawah bintang-bintang di taman nasional dengan api unggun yang hangat',
    'menjelajahi reruntuhan kuil kuno di tengah hutan lebat di Asia Tenggara',
    'pasar Natal yang meriah di kota tua Jerman dengan lampu-lampu berkelip',
    'festival musik musim panas yang ramai dengan panggung besar dan penonton yang antusias',
];

const App: React.FC = () => {
  const [petFiles, setPetFiles] = useState<UploadedFile[]>([]);
  const [ownerFiles, setOwnerFiles] = useState<UploadedFile[]>([]);
  const [selectedTheme, setSelectedTheme] = useState<string>(THEMES[0]);
  const [customTheme, setCustomTheme] = useState<string>('');
  const [customPrompt, setCustomPrompt] = useState<string>('');
  const [revisionPrompt, setRevisionPrompt] = useState<string>('');
  const [aspectRatio, setAspectRatio] = useState<string>(ASPECT_RATIOS[0].value);
  const [photoConcept, setPhotoConcept] = useState<string>(PHOTO_CONCEPTS[0].value);
  const [imaginativeTheme, setImaginativeTheme] = useState<string>(IMAGINATIVE_THEMES[0].value);
  const [imageHistory, setImageHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const currentImage = imageHistory[historyIndex];

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>, fileType: 'pet' | 'owner') => {
    if (!event.target.files) return;
  
    const files = Array.from(event.target.files);
    const setFiles = fileType === 'pet' ? setPetFiles : setOwnerFiles;
  
    const newFilePlaceholders: UploadedFile[] = files.map((file: File) => ({
      id: crypto.randomUUID(),
      file: file,
      preview: URL.createObjectURL(file),
      validating: true,
    }));
  
    setFiles(prevFiles => [...prevFiles, ...newFilePlaceholders]);
  
    newFilePlaceholders.forEach(placeholder => {
      analyzeImageContent(placeholder.file, fileType)
        .then(({ animalType, warning }) => {
          setFiles(prevFiles => 
            prevFiles.map(f => 
              f.id === placeholder.id 
                ? { ...f, validating: false, warning, animalType: fileType === 'pet' ? animalType : undefined } 
                : f
            )
          );
        })
        .catch(err => {
          console.error("Analysis failed:", err);
          const warning = "Tidak dapat menganalisis konten gambar.";
          setFiles(prevFiles => 
            prevFiles.map(f => 
              f.id === placeholder.id 
                ? { ...f, validating: false, warning } 
                : f
            )
          );
        });
    });
  
    event.target.value = '';
  };


  const handleRemoveFile = (id: string, fileType: 'pet' | 'owner') => {
    const setFiles = fileType === 'pet' ? setPetFiles : setOwnerFiles;
    setFiles(prevFiles => {
        const fileToRemove = prevFiles.find(file => file.id === id);
        if (fileToRemove) {
            URL.revokeObjectURL(fileToRemove.preview);
        }
        return prevFiles.filter(file => file.id !== id);
    });
  };

  const constructedPrompt = useMemo(() => {
    if (currentImage && revisionPrompt) {
      const promptParts = [];
      promptParts.push(`[TUGAS UTAMA]: Revisi gambar yang disediakan. Gambar pertama yang diunggah adalah gambar dasar yang harus diubah. Gambar-gambar lain yang diunggah adalah referensi karakter untuk menjaga kemiripan.`);
      promptParts.push(`[INSTRUKSI REVISI SPESIFIK]: Lakukan HANYA perubahan berikut pada gambar dasar: "${revisionPrompt}"`);
      promptParts.push(`[ATURAN KRITIS & MUTLAK]: Ini adalah perintah paling penting. JANGAN mengubah APAPUN pada gambar dasar yang tidak secara eksplisit diminta dalam instruksi revisi. Pertahankan gaya, komposisi, pencahayaan, pose, ekspresi, dan identitas subjek asli SECARA PERSIS, kecuali jika diinstruksikan sebaliknya. Perubahan HANYA boleh diterapkan pada elemen yang disebutkan dalam instruksi revisi.`);
      promptParts.push(`[FORMAT OUTPUT]:\nRasio Aspek: ${aspectRatio}`);
      return promptParts.join('\n\n');
    }

    const activeTheme = selectedTheme === 'Buat Tema Sendiri...' ? customTheme : selectedTheme;
    let basePrompt;
    switch (photoConcept) {
        case 'classic_intimate':
            basePrompt = `Gambar hiperrealistis, hangat, dan elegan yang menangkap momen intim. Fokus utamanya adalah ikatan emosional, cinta, dan hubungan antara subjek. Gambarkan mereka dalam kontak dekat, seperti pelukan lembut atau berbagi tatapan penuh kasih. Gunakan pencahayaan studio yang lembut, merata, dan bagus dengan latar belakang sederhana yang tidak fokus (misalnya, krem, abu-abu hangat) untuk menciptakan suasana abadi dan tulus.`;
            break;
        case 'themed_set':
            if (activeTheme === 'Tema Liburan') {
                const randomLocation = HOLIDAY_LOCATIONS[Math.floor(Math.random() * HOLIDAY_LOCATIONS.length)];
                basePrompt = `Ciptakan foto hiperrealistis yang menampilkan subjek sedang menikmati liburan. Tempatkan mereka di lokasi liburan yang khas seperti ${randomLocation}. Suasananya harus santai dan ceria, menangkap esensi dari sebuah liburan. Subjek (manusia dan hewan) harus mengenakan pakaian dan/atau aksesori yang sesuai dan realistis untuk suasana liburan, BUKAN diubah menjadi karakter non-realistis. Fokus pada detail, pencahayaan alami, dan material yang realistis untuk membuat adegan terasa seperti foto liburan nyata.`;
            } else {
                basePrompt = `Ciptakan foto hiperrealistis yang diambil di lokasi atau set studio yang realistis, didekorasi sesuai tema "${activeTheme}". Subjek (manusia dan hewan) harus mengenakan kostum, pakaian, dan/atau aksesori yang sesuai dan realistis untuk tema tersebut, BUKAN diubah menjadi karakter non-realistis. Fokus pada detail, pencahayaan, dan material yang realistis untuk membuat adegan terasa seperti sesi foto nyata.`;
            }
            break;
        case 'imagination':
        default:
            basePrompt = `Ubah seluruh gambar—termasuk subjek dan latar belakang—menjadi gaya artistik yang khas dari: "${imaginativeTheme}". Subjek harus dapat dikenali tetapi digambar ulang sepenuhnya dalam gaya imajinatif ini. Adegan harus kohesif secara artistik.`;
            break;
    }

    const promptParts = [];
    
    let finalSceneDescription = basePrompt;
    if (customPrompt) {
        finalSceneDescription += `\n\n[DETAIL TAMBAHAN DARI PENGGUNA]: Harap gabungkan detail spesifik berikut ke dalam adegan secara alami dan kreatif: "${customPrompt}"`;
    }
    promptParts.push(`[DESKRIPSI ADEGAN]:\n${finalSceneDescription}`);

    if (ownerFiles.length > 0 && !currentImage) {
        promptParts.push(`[ARAH PANDANG AWAL]: Untuk pembuatan gambar pertama ini, semua subjek manusia HARUS diposisikan menghadap lurus ke depan, menatap langsung ke arah kamera (kontak mata).`);
    }

    if (petFiles.length > 0 || ownerFiles.length > 0) {
        const petDescriptions = petFiles.map((file, index) => {
            const animalType = file.animalType ? file.animalType : 'hewan peliharaan';
            return `- Hewan peliharaan ${index + 1} adalah ${animalType.toLowerCase()}.`;
        }).join('\n');
        
        const subjectDescription = `[SUBJEK]:
Karakter utama untuk adegan ini disediakan dalam gambar yang diunggah. Ini adalah *satu-satunya* subjek yang harus Anda gunakan.
${petDescriptions}
Pastikan SEMUA subjek yang diunggah (manusia dan hewan) muncul bersama dalam satu bingkai gambar yang sama.`;
        promptParts.push(subjectDescription);
    }
    
    promptParts.push('[INSTRUKSI KREATIVITAS]: Untuk setiap pembuatan gambar baru, ciptakan komposisi, pose, interaksi karakter, dan detail latar belakang yang unik dan berbeda secara signifikan. Berikan kejutan dengan interpretasi kreatif yang baru setiap saat.');

    promptParts.push(`[FORMAT OUTPUT]:\nRasio Aspek: ${aspectRatio}`);

    const rules = `[!!! ATURAN WAJIB & MUTLAK !!!]:
1. **HANYA GUNAKAN SUBJEK YANG DISEDIAKAN.** Gambar akhir HANYA boleh berisi orang dan hewan spesifik yang ditampilkan di foto yang diunggah. JANGAN MENAMBAHKAN KARAKTER EKSTRA, baik manusia maupun hewan, ke dalam adegan.
2. **PERTAHANKAN IDENTITAS SUBJEK DENGAN KETAT (ATURAN PALING KRUSIAL):** Ini adalah prioritas tertinggi.
   - **Replikasi Fotorealistik:** Anda HARUS mereplikasi setiap orang dan hewan dari foto yang diunggah agar **100% IDENTIK** di gambar akhir. Ini bukan interpretasi artistik; ini adalah tuntutan untuk replikasi yang tepat.
   - **Elemen yang Tidak Boleh Diubah (Immutable):** Jangan mengubah **sama sekali** elemen-elemen berikut:
     - **Wajah & Fitur Manusia:** Wajah harus menjadi replika fotorealistik. Pertahankan dengan akurat: bentuk dan warna mata, struktur hidung, bentuk bibir, garis rahang, struktur tulang pipi, warna kulit, serta tanda lahir, bekas luka, atau lesung pipi yang terlihat. JANGAN 'mempercantik' atau mengubah fitur wajah.
     - **Proporsi Tubuh:** Bentuk tubuh, berat badan, tinggi, dan proporsi umum dari manusia dan hewan harus dijaga dengan akurat agar sesuai dengan foto referensi.
     - **Detail Hewan:** Untuk hewan, pertahankan dengan tepat warna bulu/kulit, pola bulu (belang, bintik), tekstur, bentuk mata, dan fitur unik lainnya.
   - **Elemen yang Boleh Diubah (Mutable):** Anda memiliki kebebasan kreatif untuk mengubah elemen-elemen berikut agar sesuai dengan tema dan konsep adegan:
     - **Pakaian & Aksesori:** Ganti pakaian dan tambahkan aksesori yang relevan dengan tema.
     - **Pose & Gestur:** Ciptakan pose dan gestur baru yang dinamis, ekspresif, dan natural untuk subjek. Jangan hanya meniru pose dari foto asli. Pose hewan harus selalu sesuai dengan spesiesnya (misalnya, jangan membuat anjing berdiri dengan dua kaki seperti manusia).
     - **Lingkungan & Properti:** Rancang latar belakang dan properti yang sesuai dengan adegan.
3. **KUALITAS OUTPUT TINGGI.** Gambar akhir harus berkualitas tinggi, dengan pencahayaan yang baik, dan komposisi artistik.`;
    
    promptParts.push(rules);
    
    return promptParts.join('\n\n');
  }, [selectedTheme, customTheme, aspectRatio, petFiles, ownerFiles, customPrompt, revisionPrompt, currentImage, photoConcept, imaginativeTheme]);

  const dataURLtoFile = (dataurl: string, filename: string): File => {
    const arr = dataurl.split(',');
    const mimeMatch = arr[0]?.match(/:(.*?);/);
    if (!arr[0] || !arr[1] || !mimeMatch) {
      throw new Error("Format data URL tidak valid untuk konversi file.");
    }
    const mime = mimeMatch[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  };

  const handleGenerate = useCallback(async () => {
    if (petFiles.length === 0 && !currentImage) {
      setError('Harap unggah setidaknya satu foto hewan peliharaan Anda.');
      return;
    }
    if (photoConcept === 'themed_set' && selectedTheme === 'Buat Tema Sendiri...' && !customTheme.trim()) {
        setError('Harap masukkan deskripsi untuk tema kustom Anda.');
        return;
    }
    setIsLoading(true);
    setError(null);
    try {
      let allFiles = [...petFiles, ...ownerFiles];

      if (currentImage && revisionPrompt) {
        const imageToReviseFile = dataURLtoFile(currentImage, 'image-to-revise.png');
        const revisionFile: UploadedFile = {
          id: 'revision-image-' + crypto.randomUUID(),
          file: imageToReviseFile,
          preview: currentImage
        };
        allFiles.unshift(revisionFile);
      }

      const imageUrl = await generatePetPortrait(constructedPrompt, allFiles);
      
      const newHistory = imageHistory.slice(0, historyIndex + 1);
      newHistory.push(imageUrl);
      setImageHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
      setRevisionPrompt('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Terjadi kesalahan yang tidak diketahui.');
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, [constructedPrompt, petFiles, ownerFiles, customTheme, selectedTheme, photoConcept, imageHistory, historyIndex, currentImage, revisionPrompt]);
  
  const handleDownload = () => {
    if (!currentImage) return;
    const link = document.createElement('a');
    link.href = currentImage;
    link.download = 'GENNO AI-PETLOVER.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleBackPreview = () => {
    if (historyIndex > 0) {
      setHistoryIndex(prev => prev - 1);
    }
  };

  const handleForwardPreview = () => {
    if (historyIndex < imageHistory.length - 1) {
      setHistoryIndex(prev => prev - 1);
    }
  };
  
  const handleReset = () => {
    // Revoke object URLs to prevent memory leaks
    [...petFiles, ...ownerFiles].forEach(file => URL.revokeObjectURL(file.preview));
    
    // Reset all state to initial values
    setPetFiles([]);
    setOwnerFiles([]);
    setSelectedTheme(THEMES[0]);
    setCustomTheme('');
    setCustomPrompt('');
    setRevisionPrompt('');
    setAspectRatio(ASPECT_RATIOS[0].value);
    setPhotoConcept(PHOTO_CONCEPTS[0].value);
    setImaginativeTheme(IMAGINATIVE_THEMES[0].value);
    setImageHistory([]);
    setHistoryIndex(-1);
    setIsLoading(false);
    setError(null);
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-gray-900 text-gray-200 font-sans">
      <aside className="w-full lg:w-[450px] bg-gray-900/80 backdrop-blur-sm border-r border-gray-700/50 p-6 flex flex-col space-y-6 overflow-y-auto">
        <header className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-yellow-500">GENNO AI-MASTER PET LOVER</h1>
              <p className="text-sm text-gray-400">Kreasikan kenangan bersama anabul kesayangan kamu</p>
            </div>
        </header>

        <section>
            <h2 className="text-lg font-semibold text-orange-400 mb-3">1. Unggah Karakter</h2>
            <div className='mb-4'>
                <h3 className="text-md font-semibold text-gray-300 mb-2">Foto Hewan Peliharaan</h3>
                <label htmlFor="pet-file-upload" className="w-full flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-600 rounded-lg cursor-pointer hover:bg-gray-800/50 hover:border-orange-500 transition-colors">
                    <UploadIcon className="w-8 h-8 text-gray-500 mb-2" />
                    <span className="text-sm text-gray-400 text-center">Klik untuk mengunggah foto hewan peliharaan</span>
                    <span className="text-xs text-gray-500 mt-1">Anda dapat memilih beberapa gambar.</span>
                    <input id="pet-file-upload" type="file" multiple accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={(e) => handleFileChange(e, 'pet')} />
                </label>
                {petFiles.length > 0 && (
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-4 mt-4">
                    {petFiles.map(file => (
                        <div key={file.id} className="relative group">
                            <div className="aspect-square">
                                <img src={file.preview} alt="pratinjau unggahan hewan peliharaan" className={`w-full h-full object-cover rounded-md transition-all duration-300 ${file.validating || file.warning ? 'opacity-40 filter grayscale' : ''}`} />
                                {file.validating && (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 text-white p-1 rounded-md">
                                        <svg className="animate-spin h-6 w-6 text-white mb-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        <p className="text-xs text-center font-semibold">Menganalisa...</p>
                                    </div>
                                )}
                                {!file.validating && file.warning && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/60" title={file.warning}>
                                        <WarningIcon className="w-8 h-8 text-yellow-400" />
                                    </div>
                                )}
                                {!file.validating && (
                                    <button onClick={() => handleRemoveFile(file.id, 'pet')} className="absolute top-1 right-1 p-1 bg-black/60 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                        <TrashIcon className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                    </div>
                )}
            </div>
            <div>
                <h3 className="text-md font-semibold text-gray-300 mb-2">Foto Pemilik (Opsional)</h3>
                <label htmlFor="owner-file-upload" className="w-full flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-600 rounded-lg cursor-pointer hover:bg-gray-800/50 hover:border-orange-500 transition-colors">
                    <UploadIcon className="w-8 h-8 text-gray-500 mb-2" />
                    <span className="text-sm text-gray-400 text-center">Klik untuk mengunggah foto pemilik</span>
                    <span className="text-xs text-gray-500 mt-1">Anda dapat memilih beberapa gambar.</span>
                    <input id="owner-file-upload" type="file" multiple accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={(e) => handleFileChange(e, 'owner')} />
                </label>
                {ownerFiles.length > 0 && (
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mt-4">
                    {ownerFiles.map(file => (
                        <div key={file.id} className="relative group aspect-square">
                            <img src={file.preview} alt="pratinjau unggahan pemilik" className={`w-full h-full object-cover rounded-md transition-all duration-300 ${file.validating || file.warning ? 'opacity-40 filter grayscale' : ''}`} />
                            {file.validating && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 text-white p-1 rounded-md">
                                    <svg className="animate-spin h-6 w-6 text-white mb-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    <p className="text-xs text-center font-semibold">Menganalisa...</p>
                                </div>
                            )}
                            {!file.validating && file.warning && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/60" title={file.warning}>
                                    <WarningIcon className="w-8 h-8 text-yellow-400" />
                                </div>
                            )}
                            {!file.validating && (
                                <button onClick={() => handleRemoveFile(file.id, 'owner')} className="absolute top-1 right-1 p-1 bg-black/60 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                    <TrashIcon className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    ))}
                    </div>
                )}
            </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-orange-400 mb-3">2. Pilih Gaya & Ukuran</h2>
           <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">Konsep Foto</label>
            <div className="grid grid-cols-2 gap-2">
              {PHOTO_CONCEPTS.map(({ label, value }) => (
                <button key={value} onClick={() => setPhotoConcept(value)} className={`text-center py-2 px-2 text-sm rounded-md transition-all ${photoConcept === value ? 'bg-gradient-to-r from-orange-500 to-yellow-500 text-white font-semibold shadow-lg' : 'bg-gray-700 hover:bg-gray-600'}`}>
                  {label}
                </button>
              ))}
            </div>
          </div>
          
          {photoConcept === 'themed_set' && (
            <div className="mb-4 p-4 bg-gray-800/50 rounded-lg">
                <label htmlFor="theme" className="block text-sm font-medium text-gray-300 mb-1">Pilih Tema</label>
                <select id="theme" value={selectedTheme} onChange={e => setSelectedTheme(e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 focus:ring-orange-500 focus:border-orange-500 transition">
                {THEMES.map(theme => <option key={theme} value={theme}>{theme}</option>)}
                </select>
                {selectedTheme === 'Buat Tema Sendiri...' && (
                    <div className="mt-4">
                    <label htmlFor="custom-theme" className="block text-sm font-medium text-gray-300 mb-1">Jelaskan Tema Anda</label>
                    <input 
                        id="custom-theme" 
                        type="text" 
                        value={customTheme} 
                        onChange={e => setCustomTheme(e.target.value)} 
                        className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-sm focus:ring-orange-500 focus:border-orange-500 transition" 
                        placeholder="misal: Pesta teh di negeri dongeng..."
                    />
                    </div>
                )}
            </div>
          )}

          {photoConcept === 'imagination' && (
            <div className="mb-4 p-4 bg-gray-800/50 rounded-lg">
                <label htmlFor="imaginative-theme" className="block text-sm font-medium text-gray-300 mb-1">Pilih Gaya Imajinatif</label>
                <select 
                    id="imaginative-theme" 
                    value={imaginativeTheme} 
                    onChange={e => setImaginativeTheme(e.target.value)} 
                    className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 focus:ring-orange-500 focus:border-orange-500 transition"
                >
                    {IMAGINATIVE_THEMES.map(theme => <option key={theme.value} value={theme.value}>{theme.label}</option>)}
                </select>
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Rasio Aspek</label>
            <div className="flex space-x-2">
              {ASPECT_RATIOS.map(({ label, value }) => (
                <button key={value} onClick={() => setAspectRatio(value)} className={`flex-1 py-2 text-sm rounded-md transition-all ${aspectRatio === value ? 'bg-gradient-to-r from-orange-500 to-yellow-500 text-white font-semibold shadow-lg' : 'bg-gray-700 hover:bg-gray-600'}`}>
                  {label}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-orange-400 mb-3">3. Detail Tambahan</h2>
          <div>
            <label htmlFor="custom-prompt" className="block text-sm font-medium text-gray-300 mb-1">Instruksi Tambahan</label>
            <textarea id="custom-prompt" rows={3} value={customPrompt} onChange={e => setCustomPrompt(e.target.value)} className="w-full bg-gray-800 border border-gray-600 rounded-md px-3 py-2 text-sm focus:ring-orange-500 focus:border-orange-500 transition" placeholder="contoh: kucing saya memakai mahkota kecil, duduk di singgasana beludru..."></textarea>
          </div>
        </section>
        
        <div className="flex-grow flex items-end">
            <button
                onClick={handleGenerate}
                disabled={isLoading || (petFiles.length === 0 && !currentImage)}
                className="w-full flex items-center justify-center gap-2 text-lg font-bold text-white px-6 py-3 rounded-lg bg-gradient-to-br from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 shadow-lg shadow-orange-500/20"
            >
            {isLoading ? (
                <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Membuat...
                </>
            ) : (
                <>
                <SparklesIcon className="w-6 h-6" />
                {currentImage ? 'Buat Lagi' : 'Buat Mahakarya'}
                </>
            )}
            </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col items-center justify-center p-6 bg-black/30">
        <div className="w-full max-w-4xl h-full flex flex-col items-center justify-center">
        {error && !isLoading && (
            <div className="text-center p-8 bg-red-900/20 border border-red-500/50 rounded-lg">
                <h3 className="text-xl font-semibold text-red-400">Gagal Membuat Gambar</h3>
                <p className="text-red-300 mt-2 max-w-md">{error}</p>
            </div>
        )}

        {!currentImage && !isLoading && !error && (
            <div className="text-center p-8 border-2 border-dashed border-gray-700 rounded-lg">
                <SparklesIcon className="w-16 h-16 text-gray-600 mx-auto mb-4"/>
                <h2 className="text-2xl font-bold text-gray-400">Potret Hewan Peliharaan Anda Menanti</h2>
                <p className="text-gray-500 mt-2 max-w-md">Unggah foto dan atur adegan Anda di sebelah kiri, lalu klik "Buat Mahakarya" untuk memulai.</p>
            </div>
        )}
        
        {currentImage && (
            <div className="w-full flex flex-col items-center gap-4">
                <div className="relative w-full">
                  <img src={currentImage} alt="Potret hewan peliharaan yang dihasilkan" className="w-full h-full max-h-[70vh] object-contain rounded-lg shadow-2xl shadow-black/50" />
                  {isLoading && (
                    <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center rounded-lg backdrop-blur-sm">
                      <div className="relative w-24 h-24 mx-auto">
                          <div className="absolute inset-0 border-4 border-orange-500/30 rounded-full"></div>
                          <div className="absolute inset-0 border-t-4 border-orange-500 rounded-full animate-spin"></div>
                      </div>
                      <h3 className="text-2xl font-semibold mt-6 text-gray-300">Merevisi mahakarya Anda...</h3>
                      <p className="text-gray-400 mt-2">AI sedang melukis ulang!</p>
                    </div>
                  )}
                </div>

                <div className="w-full max-w-2xl mt-4">
                    <div className="flex items-center justify-center gap-4 mb-4">
                      <button onClick={handleBackPreview} disabled={historyIndex <= 0 || isLoading} className="p-2 bg-gray-700 rounded-full hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                        <ArrowLeftIcon className="w-6 h-6" />
                      </button>
                      <span className="text-sm font-medium text-gray-400">
                        Gambar {historyIndex + 1} dari {imageHistory.length}
                      </span>
                      <button onClick={handleForwardPreview} disabled={historyIndex >= imageHistory.length - 1 || isLoading} className="p-2 bg-gray-700 rounded-full hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                        <ArrowRightIcon className="w-6 h-6" />
                      </button>
                    </div>

                  <label htmlFor="revision-prompt" className="block text-sm font-medium text-gray-300 mb-1">Revisi (Opsional)</label>
                  <textarea id="revision-prompt" rows={2} value={revisionPrompt} onChange={e => setRevisionPrompt(e.target.value)} className="w-full bg-gray-800 border border-gray-600 rounded-md px-3 py-2 text-sm focus:ring-orange-500 focus:border-orange-500 transition" placeholder="contoh: ubah mahkota menjadi topi penyihir, buat latar belakang lebih gelap..."></textarea>
                  <div className="flex items-center gap-4 mt-3">
                    <button
                      onClick={handleGenerate}
                      disabled={isLoading}
                      className="flex-1 flex items-center justify-center gap-2 text-md font-bold text-white px-4 py-2 rounded-lg bg-gradient-to-br from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105"
                    >
                      <SparklesIcon className="w-5 h-5" />
                      Buatkan Revisinya
                    </button>
                    <button
                      onClick={handleDownload}
                      className="flex items-center gap-2 text-white font-semibold px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition-all transform hover:scale-105"
                      aria-label="Unduh Gambar"
                    >
                      <DownloadIcon className="w-5 h-5" />
                      Unduh
                    </button>
                  </div>
                   <button
                    onClick={handleReset}
                    className="w-full flex items-center justify-center gap-2 mt-4 text-md font-bold text-white px-4 py-2 rounded-lg bg-gradient-to-br from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 transition-all transform hover:scale-105"
                    aria-label="Mulai dari Awal"
                  >
                    <ResetIcon className="w-5 h-5" />
                    Mulai dari Awal
                  </button>
                </div>
            </div>
        )}
        </div>
      </main>
    </div>
  );
};

export default App;
