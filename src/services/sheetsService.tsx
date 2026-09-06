import { SENTENCE_LIST, type SentenceItem } from '../data/sentences';
const GOOGLE_SHEET_API_URL = 'https://script.google.com/macros/s/AKfycbwRLzap31kPXONpvrDjSYlGAZqlq89qZx9c_IsB8o9YMrRwXUOjOleqdy0_qWYwEzgPBw/exec';

export async function fetchSentencesFromSheet(): Promise<SentenceItem[]> {
  try {
    const res = await fetch(GOOGLE_SHEET_API_URL);
    if (!res.ok) throw new Error('Không thể tải dữ liệu từ Google Sheets');
    
    const data = await res.json();
    if (Array.isArray(data) && data.length > 0) {
      return data as SentenceItem[];
    }
    return SENTENCE_LIST;
  } catch (error) {
    console.warn('Lỗi khi tải từ Google Sheet, sử dụng dữ liệu mặc định:', error);
    return SENTENCE_LIST;
  }
}