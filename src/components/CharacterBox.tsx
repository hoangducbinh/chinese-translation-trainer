import React from 'react';

export type CharStatus = 'idle' | 'active' | 'correct' | 'wrong';

interface CharacterBoxProps {
  char: string;
  status: CharStatus;
  userChar?: string;
  showGhost?: boolean;
}

export const CharacterBox: React.FC<CharacterBoxProps> = ({
  char,
  status,
  userChar,
  showGhost = true,
}) => {
  // Determine styles based on character status
  let boxClasses = 'w-11 h-11 sm:w-13 sm:h-13 flex items-center justify-center rounded-xl border text-xl sm:text-2xl transition-all duration-200 select-none ';
  let textClasses = 'font-hanzi font-normal ';

  switch (status) {
    case 'correct':
      boxClasses += 'border-emerald-400/80 bg-emerald-50/70 text-emerald-700 shadow-sm animate-pop';
      textClasses += 'text-emerald-700 font-medium';
      break;
    case 'wrong':
      boxClasses += 'border-rose-300 bg-rose-50/80 text-rose-600 animate-shake shadow-sm';
      textClasses += 'text-rose-600';
      break;
    case 'active':
      boxClasses += 'border-amber-400 bg-amber-50/40 text-amber-900 ring-2 ring-amber-300/60 scale-105 shadow-sm';
      textClasses += 'text-amber-950 font-medium';
      break;
    case 'idle':
    default:
      boxClasses += 'border-gray-200/90 bg-white text-gray-300 shadow-[0_1px_2px_rgba(0,0,0,0.02)]';
      textClasses += showGhost ? 'text-gray-300/80' : 'opacity-0';
      break;
  }

  // If correct or wrong, display what was typed or the target char
  const displayChar = status === 'correct' ? char : (status === 'wrong' ? (userChar || char) : char);

  return (
    <div className={boxClasses}>
      <span className={textClasses}>{displayChar}</span>
    </div>
  );
};
