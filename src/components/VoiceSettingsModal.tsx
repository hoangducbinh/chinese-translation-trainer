import React, { useState } from 'react';
import { X, Volume2, Play, Check, Headphones, Sparkles, SlidersHorizontal } from 'lucide-react';
import { speakChinese } from '../utils/audio';

interface VoiceSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  voices: SpeechSynthesisVoice[];
  selectedVoiceURI: string;
  onSelectVoice: (uri: string) => void;
  speechRate: number;
  onSelectRate: (rate: number) => void;
}

const PRESET_RATES = [
  { rate: 0.7, label: '0.7x', desc: 'Rất chậm' },
  { rate: 0.85, label: '0.85x', desc: 'Chuẩn học' },
  { rate: 1.0, label: '1.0x', desc: 'Tự nhiên' },
  { rate: 1.2, label: '1.2x', desc: 'Nhanh' },
];

function getDialectLabel(lang: string): string {
  const l = lang.toLowerCase();
  if (l.includes('zh-cn') || l.includes('zh-sg') || l.includes('cmn-hans')) {
    return 'Phổ thông (Đại lục)';
  }
  if (l.includes('zh-tw') || l.includes('cmn-hant')) {
    return 'Phổ thông (Đài Loan)';
  }
  if (l.includes('zh-hk') || l.includes('yue')) {
    return 'Quảng Đông (Hồng Kông)';
  }
  return lang;
}

export const VoiceSettingsModal: React.FC<VoiceSettingsModalProps> = ({
  isOpen,
  onClose,
  voices,
  selectedVoiceURI,
  onSelectVoice,
  speechRate,
  onSelectRate,
}) => {
  const [previewingURI, setPreviewingURI] = useState<string | null>(null);

  if (!isOpen) return null;

  const handlePreviewVoice = (voiceURI: string) => {
    setPreviewingURI(voiceURI);
    speakChinese(
      '你好！很高兴认识你。',
      voiceURI,
      speechRate,
      () => setPreviewingURI(null),
      () => setPreviewingURI(null)
    );
  };

  const handleTestCurrent = () => {
    setPreviewingURI(selectedVoiceURI || 'current');
    speakChinese(
      '今天天气真好，我们一起练习中文吧！',
      selectedVoiceURI,
      speechRate,
      () => setPreviewingURI(null),
      () => setPreviewingURI(null)
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-lg">Cài đặt giọng đọc tiếng Trung</h3>
              <p className="text-xs text-gray-400">Chọn giọng phát âm và điều chỉnh tốc độ</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Section: Select Voice */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-500">
                Giọng phát âm ({voices.length > 0 ? `${voices.length} giọng có sẵn` : 'Mặc định'})
              </label>
              {voices.length > 0 && (
                <span className="text-[11px] text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full font-medium">
                  Web Speech TTS
                </span>
              )}
            </div>

            {voices.length > 0 ? (
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {voices.map((voice) => {
                  const isSelected =
                    selectedVoiceURI === voice.voiceURI || selectedVoiceURI === voice.name;
                  const isPreviewing = previewingURI === voice.voiceURI;

                  return (
                    <div
                      key={voice.voiceURI}
                      onClick={() => onSelectVoice(voice.voiceURI)}
                      className={`flex items-center justify-between p-3 rounded-2xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'border-amber-400 bg-amber-50/50 shadow-xs'
                          : 'border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50/50'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1 mr-2">
                        <div
                          className={`w-5 h-5 rounded-full flex items-center justify-center border transition-colors ${
                            isSelected
                              ? 'bg-amber-500 border-amber-500 text-white'
                              : 'border-gray-300 bg-white'
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3" />}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">
                            {voice.name.replace(/(Google|Microsoft|Apple)\s*/gi, '')}
                          </p>
                          <p className="text-[11px] text-gray-400 flex items-center gap-1.5 truncate">
                            <span>{getDialectLabel(voice.lang)}</span>
                            {voice.localService && (
                              <span className="text-gray-300">• Ngoại tuyến</span>
                            )}
                          </p>
                        </div>
                      </div>

                      {/* Preview audio button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePreviewVoice(voice.voiceURI);
                        }}
                        title="Nghe thử giọng này"
                        className={`p-2 rounded-xl text-xs font-medium flex items-center gap-1 transition-all cursor-pointer ${
                          isPreviewing
                            ? 'bg-amber-200 text-amber-900 scale-95'
                            : 'bg-gray-100 hover:bg-amber-100 text-gray-600 hover:text-amber-800'
                        }`}
                      >
                        {isPreviewing ? (
                          <Volume2 className="w-3.5 h-3.5 animate-pulse" />
                        ) : (
                          <Play className="w-3.5 h-3.5" />
                        )}
                        <span className="text-[11px]">Thử</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 text-xs text-gray-500 leading-relaxed">
                <p className="font-semibold text-gray-700 mb-1">
                  Đang dùng giọng đọc tiếng Trung mặc định của thiết bị.
                </p>
                <p>
                  Trình duyệt sẽ tự động phát âm tiếng Trung theo bộ tổng hợp giọng nói mặc định. Để có
                  nhiều lựa chọn giọng tự nhiên hơn (như Tingting, Xiaoxiao), bạn có thể bật/tải thêm
                  gói ngôn ngữ <em>Chinese (Simplified)</em> trong cài đặt Speech của máy tính hoặc điện thoại.
                </p>
              </div>
            )}
          </div>

          {/* Section: Speech Rate */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Tốc độ đọc</span>
              </label>
              <span className="text-xs font-bold text-amber-700 bg-amber-100/70 px-2 py-0.5 rounded-md">
                {speechRate.toFixed(2)}x
              </span>
            </div>

            {/* Preset rate buttons */}
            <div className="grid grid-cols-4 gap-2 mb-3">
              {PRESET_RATES.map((item) => (
                <button
                  key={item.rate}
                  type="button"
                  onClick={() => onSelectRate(item.rate)}
                  className={`py-2 px-2 text-center rounded-xl border transition-all cursor-pointer ${
                    Math.abs(speechRate - item.rate) < 0.01
                      ? 'bg-neutral-900 text-white border-neutral-900 shadow-xs'
                      : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <div className="text-xs font-bold">{item.label}</div>
                  <div
                    className={`text-[10px] ${
                      Math.abs(speechRate - item.rate) < 0.01 ? 'text-gray-300' : 'text-gray-400'
                    }`}
                  >
                    {item.desc}
                  </div>
                </button>
              ))}
            </div>

            {/* Slider */}
            <input
              type="range"
              min="0.5"
              max="1.5"
              step="0.05"
              value={speechRate}
              onChange={(e) => onSelectRate(Number(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-gray-400 mt-1">
              <span>0.5x (Chậm)</span>
              <span>1.0x (Bình thường)</span>
              <span>1.5x (Nhanh)</span>
            </div>
          </div>

          {/* Section: Test Sentence Preview */}
          <div className="p-4 bg-amber-50/60 rounded-2xl border border-amber-100 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold text-amber-900 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>Nghe thử câu mẫu</span>
              </p>
              <p className="text-xs text-amber-800/80 mt-0.5">
                今天天气真好，我们一起练习中文吧！
              </p>
            </div>
            <button
              type="button"
              onClick={handleTestCurrent}
              className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-all active:scale-95 cursor-pointer shrink-0"
            >
              <Volume2 className="w-4 h-4" />
              <span>Phát âm</span>
            </button>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 bg-neutral-900 hover:bg-black text-white text-xs sm:text-sm font-semibold rounded-full shadow-xs transition-all cursor-pointer active:scale-95"
          >
            Hoàn tất
          </button>
        </div>
      </div>
    </div>
  );
};
