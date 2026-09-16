import React from 'react';

interface PlateGraphicProps {
  city?: string;
  letters?: string;
  numbers?: string;
  isFront?: boolean;
  interactive?: boolean;
}

export const PlateGraphic: React.FC<PlateGraphicProps> = ({
  city = 'B',
  letters = 'MW',
  numbers = '1234',
  isFront = false,
}) => {
  const displayCity = (city || 'B').toUpperCase();
  const displayLetters = (letters || 'MW').toUpperCase();
  const displayNumbers = numbers || '1234';

  return (
    <div className="inline-flex items-stretch bg-white border-3 border-black rounded-md shadow-md overflow-hidden font-sans select-none max-w-full">
      {/* Euro Strip */}
      <div className="bg-blue-700 w-8 sm:w-10 flex flex-col items-center justify-between py-1 px-1 text-white shrink-0">
        {/* EU Stars circle */}
        <div className="text-[9px] leading-tight text-amber-300 font-bold tracking-tighter">
          ★★★★★
        </div>
        <div className="text-xs sm:text-sm font-black tracking-wider text-white">
          D
        </div>
      </div>

      {/* Main Plate Area */}
      <div className="px-3 sm:px-4 py-1.5 flex items-center gap-2 sm:gap-3 bg-white tracking-widest text-black">
        {/* City prefix */}
        <span className="font-extrabold text-xl sm:text-2xl tracking-wider font-mono">
          {displayCity}
        </span>

        {/* Badges / Stickers simulation */}
        <div className="flex flex-col items-center justify-center gap-0.5 px-0.5">
          {/* TÜV Badge (on rear plate) or Inspection */}
          <div 
            className={`w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full border border-slate-700 flex items-center justify-center text-[7px] font-bold ${
              isFront ? 'bg-slate-200 text-slate-500' : 'bg-amber-400 text-slate-900 shadow-2xs'
            }`}
            title={isFront ? 'Vorderes Kennzeichen' : 'TÜV Prüfplakette (Hinteres Kennzeichen)'}
          >
            {isFront ? '·' : '26'}
          </div>

          {/* Official Stempelplakette (with security code under it) */}
          <div 
            className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-blue-100 border border-blue-600 flex items-center justify-center text-[6px] font-bold text-blue-900"
            title="Stempelplakette Zulassungsbehörde mit Sicherheitscode"
          >
            §
          </div>
        </div>

        {/* Random letters & numbers */}
        <span className="font-extrabold text-xl sm:text-2xl tracking-wider font-mono">
          {displayLetters} {displayNumbers}
        </span>
      </div>
    </div>
  );
};
