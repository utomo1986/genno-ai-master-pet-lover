import React, { useState, useRef } from 'react';
import { UploadCloud, Image as ImageIcon, X, User, PawPrint, Loader2, Plus } from 'lucide-react';

interface UploadAreaProps {
  type: 'pet' | 'human';
  onImageSelected: (base64: string) => Promise<void>;
  onRemoveImage?: (index: number) => void;
  currentImages: string[]; 
  disabled?: boolean;
}

const UploadArea: React.FC<UploadAreaProps> = ({ type, onImageSelected, onRemoveImage, currentImages, disabled }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;
    const file = e.dataTransfer.files[0];
    processFile(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Mohon upload file gambar.');
      return;
    }
    
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      setIsValidating(true);
      try {
        await onImageSelected(base64);
      } finally {
        setIsValidating(false);
        // Reset input so same file can be selected again if needed
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.readAsDataURL(file);
  };

  const Icon = type === 'pet' ? PawPrint : User;
  const label = type === 'pet' ? 'Foto Hewan' : 'Foto Anda (Opsional)';
  const maxItems = 5; // Allow up to 5 images for both types
  const isFull = currentImages.length >= maxItems;

  // Render for when we have images (Grid view)
  if (currentImages.length > 0) {
    return (
      <div className="w-full rounded-2xl border-2 border-aksen-orange/50 bg-aksen-dark p-3">
         <div className="flex items-center justify-between mb-2 px-1">
            <div className="flex items-center gap-2 text-xs font-semibold text-gray-300">
                <Icon className="w-3 h-3 text-aksen-orange" />
                {type === 'pet' ? `Hewan (${currentImages.length})` : `Manusia (${currentImages.length})`}
            </div>
            {!isFull && (
                <button 
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isValidating}
                    className="text-[10px] bg-aksen-orange text-white px-2 py-1 rounded flex items-center gap-1 hover:bg-orange-600 transition-colors"
                >
                   {isValidating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />} Tambah
                </button>
            )}
         </div>

         <div className={`grid ${currentImages.length > 1 ? 'grid-cols-2' : 'grid-cols-1'} gap-2`}>
            {currentImages.map((img, idx) => (
                <div key={idx} className="relative group aspect-square rounded-lg overflow-hidden bg-black/50 border border-gray-700">
                    <img src={img} alt="Uploaded" className="w-full h-full object-cover" />
                    <button 
                        onClick={() => onRemoveImage && onRemoveImage(idx)}
                        className="absolute top-1 right-1 bg-red-500/80 hover:bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                        <X className="w-3 h-3" />
                    </button>
                </div>
            ))}
         </div>
         <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/*" 
            onChange={handleFileChange}
            disabled={disabled || isValidating}
         />
      </div>
    );
  }

  // Empty State
  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => !disabled && !isValidating && fileInputRef.current?.click()}
      className={`
        w-full h-48 rounded-2xl border-2 border-dashed transition-all duration-300 
        flex flex-col items-center justify-center gap-3 relative overflow-hidden
        ${disabled ? 'opacity-50 cursor-not-allowed border-gray-800 bg-gray-900' : 'cursor-pointer'}
        ${isDragging 
          ? 'border-aksen-orange bg-aksen-orange/10 scale-[1.02]' 
          : 'border-gray-700 bg-aksen-dark hover:border-gray-500 hover:bg-gray-800'
        }
      `}
    >
      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        accept="image/*" 
        onChange={handleFileChange}
        disabled={disabled || isValidating}
      />
      
      {isValidating ? (
        <div className="flex flex-col items-center text-aksen-orange animate-pulse">
            <Loader2 className="w-8 h-8 animate-spin mb-2" />
            <span className="text-xs font-medium">Menganalisa...</span>
        </div>
      ) : (
        <>
            <div className={`
                p-3 rounded-full transition-all duration-500
                ${isDragging ? 'bg-aksen-orange text-white' : 'bg-gray-800 text-gray-400'}
            `}>
                {isDragging ? <UploadCloud className="w-6 h-6 animate-bounce" /> : <Icon className="w-6 h-6" />}
            </div>
            
            <div className="text-center space-y-1 z-10 px-4">
                <p className="text-sm font-semibold text-gray-300">
                {isDragging ? 'Lepaskan file' : `Upload ${label}`}
                </p>
                <p className="text-[10px] text-gray-500">JPG, PNG, WEBP</p>
            </div>
        </>
      )}
    </div>
  );
};

export default UploadArea;