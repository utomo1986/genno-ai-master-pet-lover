import React from 'react';
import { Camera } from 'lucide-react';
import { APP_NAME, APP_TAGLINE } from '../constants';

const Header: React.FC = () => {
  return (
    <header className="w-full py-6 px-4 md:px-8 flex items-center justify-between border-b border-aksen-dark bg-aksen-black/50 backdrop-blur-md sticky top-0 z-50">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-aksen-orange to-red-600 flex items-center justify-center shadow-lg shadow-orange-900/20">
          <Camera className="text-white w-6 h-6" />
        </div>
        <h1 className="text-2xl font-bold flex gap-2 items-baseline">
          <span className="text-gray-100">{APP_NAME}</span>
          <span className="text-lg md:text-2xl bg-clip-text text-transparent bg-gradient-to-r from-aksen-orange via-amber-500 to-red-500 font-extrabold italic">
            - {APP_TAGLINE}
          </span>
        </h1>
      </div>
      <div className="w-10"></div> {/* Spacer to balance layout since login is gone */}
    </header>
  );
};

export default Header;