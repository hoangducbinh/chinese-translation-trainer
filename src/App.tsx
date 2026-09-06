import { useState, useMemo, useEffect, useCallback } from 'react';
import { SENTENCE_LIST } from './data/sentences';
import type { SentenceItem } from './data/sentences';
import { Header } from './components/Header';
import { PracticeCard } from './components/PracticeCard';
import { FooterStatus } from './components/FooterStatus';
import { triggerConfetti } from './utils/confetti';
import { fetchSentencesFromSheet } from './services/sheetsService';

function App() {
  const [selectedLevel, setSelectedLevel] = useState<string>('Tất cả');
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [showPinyin, setShowPinyin] = useState<boolean>(true);
  const [showGhost, setShowGhost] = useState<boolean>(true);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Statistics
  const [completedCount, setCompletedCount] = useState<number>(0);
  const [correctCharCount, setCorrectCharCount] = useState<number>(0);

  // Fetch sentences from Google Sheets on mount
  const [sentences, setSentences] = useState<SentenceItem[]>(SENTENCE_LIST);
  const [isLoading, setIsLoading] = useState<boolean>(true);


  useEffect(() => {
    fetchSentencesFromSheet()
      .then((data) => setSentences(data))
      .finally(() => setIsLoading(false));
  }, []);

  // Filter sentences according to selected level
  const filteredSentences = useMemo(() => {
    if (selectedLevel === 'Tất cả') return SENTENCE_LIST;
    return SENTENCE_LIST.filter((s) => s.level === selectedLevel);
  }, [selectedLevel]);

  // Current sentence (fallback to first if index is out of range)
  const currentSentence: SentenceItem = useMemo(() => {
    return filteredSentences[currentIndex] || filteredSentences[0] || SENTENCE_LIST[0];
  }, [filteredSentences, currentIndex]);

  // Reset index if level changes
  const handleSelectLevel = (level: string) => {
    setSelectedLevel(level);
    setCurrentIndex(0);
  };

  // Next sentence
  const handleNextSentence = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % filteredSentences.length);
  }, [filteredSentences.length]);

  // When a sentence is completed
  const handleCompleteSentence = useCallback(() => {
    setCompletedCount((prev) => prev + 1);
    triggerConfetti();
  }, []);

  // When characters are counted
  const handleCharCorrect = useCallback((count: number) => {
    setCorrectCharCount((prev) => prev + count);
  }, []);

  // Reset statistics
  const handleResetStats = useCallback(() => {
    if (window.confirm('Bạn có chắc muốn đặt lại toàn bộ thống kê luyện tập không?')) {
      setCompletedCount(0);
      setCorrectCharCount(0);
      setCurrentIndex(0);
    }
  }, []);

  // Global keydown handler for Tab (next sentence)
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        e.preventDefault();
        handleNextSentence();
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [handleNextSentence]);

  return (
    <div className="min-h-screen flex flex-col bg-[#f4f6f8] text-[#16202a] selection:bg-[#f8c8b8] selection:text-[#642515]">
      {/* Top Navigation */}
      <Header
        currentLevel={selectedLevel}
        onSelectLevel={handleSelectLevel}
        showPinyin={showPinyin}
        onTogglePinyin={() => setShowPinyin((p) => !p)}
        showGhost={showGhost}
        onToggleGhost={() => setShowGhost((g) => !g)}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled((s) => !s)}
        onResetStats={handleResetStats}
      />

      {/* Main Practice Area (Centered) */}
      <main className="flex-1 flex items-center justify-center px-4 py-8 sm:px-8 lg:py-12">
        <PracticeCard
          key={currentSentence.id}
          sentence={currentSentence}
          showPinyin={showPinyin}
          showGhost={showGhost}
          soundEnabled={soundEnabled}
          onNext={handleNextSentence}
          onCharCorrect={handleCharCorrect}
          onCompleteSentence={handleCompleteSentence}
        />
      </main>

      {/* Bottom Status Bar */}
      <FooterStatus
        completedCount={completedCount}
        correctCharCount={correctCharCount}
      />
    </div>
  );
}

export default App;
