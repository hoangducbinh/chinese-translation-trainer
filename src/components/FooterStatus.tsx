import React from 'react';

interface FooterStatusProps {
  completedCount: number;
  correctCharCount: number;
  accuracy?: number;
}

export const FooterStatus: React.FC<FooterStatusProps> = ({
  completedCount,
  correctCharCount,
}) => {
  return (
    <footer className="w-full border-t border-gray-200/70 bg-white/60 backdrop-blur-xs py-4 px-4 sm:px-8 mt-auto">
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs sm:text-sm text-gray-500">
        <div className="flex items-center gap-6">
          <span>
            Đã hoàn thành: <strong className="text-gray-800 font-semibold">{completedCount}</strong> câu
          </span>
          <span>
            Ký tự đúng: <strong className="text-gray-800 font-semibold">{correctCharCount}</strong>
          </span>
        </div>
        <div className="text-xs text-gray-400">
          Mẹo: Dùng phím <kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-300 rounded text-gray-600 font-mono">Tab</kbd> để chuyển câu nhanh
        </div>
      </div>
    </footer>
  );
};
