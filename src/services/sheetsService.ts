import type { SentenceItem } from '../types/sentence';

const GOOGLE_SHEET_API_URL =
  'https://script.google.com/macros/s/AKfycbwRLzap31kPXONpvrDjSYlGAZqlq89qZx9c_IsB8o9YMrRwXUOjOleqdy0_qWYwEzgPBw/exec';

export async function fetchSentencesFromSheet(): Promise<SentenceItem[]> {
  const res = await fetch(GOOGLE_SHEET_API_URL);
  if (!res.ok) {
    throw new Error(`Không thể kết nối đến cơ sở dữ liệu (Mã lỗi: ${res.status})`);
  }

  const data = await res.json();
  if (!Array.isArray(data)) {
    throw new Error('Định dạng dữ liệu trả về từ cơ sở dữ liệu không hợp lệ');
  }

  return data
    .filter((item) => item && (item.chinese || item.vietnamese))
    .map((item, idx) => ({
      id: String(item.id || `s-${idx + 1}`).trim(),
      vietnamese: String(item.vietnamese || '').trim(),
      chinese: String(item.chinese || '').trim(),
      pinyin: String(item.pinyin || '').trim(),
      pinyinRaw: String(item.pinyinRaw || item.pinyin || '').trim(),
      level: String(item.level || 'HSK 1').trim(),
      category: String(item.category || 'Chung').trim(),
    }));
}
