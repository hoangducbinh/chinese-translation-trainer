import React from 'react';

interface FooterStatusProps {
  completedCount: number;
  correctCharCount: number;
  accuracy?: number;
}

export const FooterStatus: React.FC<FooterStatusProps> = ({
}) => {
  return (
    <footer className="w-full border-t border-gray-200/70 bg-white/60 backdrop-blur-xs py-4 px-4 sm:px-8 mt-auto">
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs sm:text-sm text-gray-500">
      </div>
    </footer>
  );
};
