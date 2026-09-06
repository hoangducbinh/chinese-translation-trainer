import { Volume2, VolumeX, Eye, EyeOff, RotateCcw, Headphones } from 'lucide-react';

interface HeaderProps {
  levels?: string[];
  currentLevel: string;
  onSelectLevel: (level: string) => void;
  showPinyin: boolean;
  onTogglePinyin: () => void;
  showGhost: boolean;
  onToggleGhost: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onResetStats: () => void;
  isLoading?: boolean;
  onOpenVoiceSettings: () => void;
  speechRate?: number;
}

export const Header: React.FC<HeaderProps> = ({
  levels,
  currentLevel,
  onSelectLevel,
  showPinyin,
  onTogglePinyin,
  showGhost,
  onToggleGhost,
  soundEnabled,
  onToggleSound,
  onResetStats,
  isLoading,
  onOpenVoiceSettings,
  speechRate,
}) => {

  return (
    <header className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-gray-100">
      {/* Left controls: Level filter & sync status */}
      <div className="flex flex-wrap items-center gap-1.5">
        {levels?.map((level) => (
          <button
            key={level}
            onClick={() => onSelectLevel(level)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              currentLevel === level
                ? 'bg-neutral-900 text-white shadow-xs'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {level}
          </button>
        ))}
        {isLoading && (
          <span className="text-[11px] text-amber-700 bg-amber-50 px-2 py-1 rounded-md border border-amber-200 animate-pulse">
            Đang tải dữ liệu...
          </span>
        )}
      </div>

      {/* Right controls: toggles & reset */}
      <div className="flex items-center gap-1.5">
        {/* Toggle Pinyin */}
        <button
          onClick={onTogglePinyin}
          title={showPinyin ? 'Ẩn phiên âm Pinyin' : 'Hiện phiên âm Pinyin'}
          className={`p-2 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition-all ${
            showPinyin
              ? 'bg-amber-50/70 border-amber-200 text-amber-800'
              : 'bg-white border-gray-200 text-gray-400 hover:text-gray-600'
          }`}
        >
          <span className="text-[11px] font-mono font-bold">Pīnyīn</span>
        </button>

        {/* Toggle Ghost Characters */}
        <button
          onClick={onToggleGhost}
          title={showGhost ? 'Ẩn nét chữ mẫu' : 'Hiện nét chữ mẫu'}
          className={`p-2 rounded-lg border text-xs font-medium flex items-center gap-1 transition-all ${
            showGhost
              ? 'bg-amber-50/70 border-amber-200 text-amber-800'
              : 'bg-white border-gray-200 text-gray-400 hover:text-gray-600'
          }`}
        >
          {showGhost ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          <span className="hidden md:inline text-xs">Chữ mờ</span>
        </button>

        {/* Toggle Sound */}
        <button
          onClick={onToggleSound}
          title={soundEnabled ? 'Tắt âm thanh hiệu ứng' : 'Bật âm thanh hiệu ứng'}
          className={`p-2 rounded-lg border text-xs font-medium transition-all ${
            soundEnabled
              ? 'bg-gray-50 border-gray-200 text-gray-700'
              : 'bg-white border-gray-200 text-gray-300 hover:text-gray-500'
          }`}
        >
          {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>

        {/* Voice Settings */}
        <button
          onClick={onOpenVoiceSettings}
          title="Đổi giọng đọc tiếng Trung & tốc độ"
          className="p-2 rounded-lg border border-gray-200 bg-white text-gray-600 hover:text-amber-800 hover:bg-amber-50 hover:border-amber-200 text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer"
        >
          <Headphones className="w-4 h-4 text-amber-600" />
          {speechRate && (
            <span className="hidden sm:inline text-[11px] font-mono font-medium text-gray-500">
              {speechRate.toFixed(2)}x
            </span>
          )}
        </button>

        {/* Reset stats */}
        <button
          onClick={onResetStats}
          title="Đặt lại thống kê"
          className="p-2 rounded-lg border border-gray-200 bg-white text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-all"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
