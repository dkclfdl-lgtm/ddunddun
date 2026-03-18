import { jsPDF } from 'jspdf';

// Multiple CDN sources for Korean font fallback
const FONT_URLS = [
  'https://fonts.gstatic.com/ea/nanumgothic/v5/NanumGothic-Regular.ttf',
  'https://cdn.jsdelivr.net/gh/niceplugin/NanumGothicCoding@master/fonts/NanumGothicCoding-Regular.ttf',
  'https://fastly.jsdelivr.net/gh/niceplugin/NanumGothicCoding@master/fonts/NanumGothicCoding-Regular.ttf',
];

let cachedFontBase64: string | null = null;

async function loadKoreanFont(): Promise<string | null> {
  if (cachedFontBase64) return cachedFontBase64;

  for (const url of FONT_URLS) {
    try {
      const res = await fetch(url, { mode: 'cors' });
      if (!res.ok) continue;
      const buf = await res.arrayBuffer();
      if (buf.byteLength < 1000) continue; // too small, not a real font
      const bytes = new Uint8Array(buf);
      let binary = '';
      for (let i = 0; i < bytes.length; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      cachedFontBase64 = btoa(binary);
      return cachedFontBase64;
    } catch {
      continue;
    }
  }
  console.warn('[pdf-utils] 한국어 폰트를 불러올 수 없습니다. 기본 폰트를 사용합니다.');
  return null;
}

/**
 * Create a jsPDF instance with Korean font pre-loaded.
 * Falls back to default font if all CDN fetches fail.
 * IMPORTANT: After calling setFontSize(), always call ensureKoreanFont(doc) before text operations.
 */
export async function createKoreanPdf(options?: {
  orientation?: 'portrait' | 'landscape';
  format?: string;
}): Promise<jsPDF> {
  const doc = new jsPDF({
    orientation: options?.orientation ?? 'portrait',
    unit: 'mm',
    format: options?.format ?? 'a4',
  });

  const fontData = await loadKoreanFont();
  if (fontData) {
    doc.addFileToVFS('NanumGothic.ttf', fontData);
    doc.addFont('NanumGothic.ttf', 'NanumGothic', 'normal');
    doc.setFont('NanumGothic');
    // Mark on the doc that Korean font is available
    (doc as any).__hasKoreanFont = true;
  }

  return doc;
}

/**
 * Ensure the Korean font is active on the doc.
 * Call this after any operation that might reset the font (like addPage).
 */
export function ensureKoreanFont(doc: jsPDF): void {
  if ((doc as any).__hasKoreanFont) {
    doc.setFont('NanumGothic');
  }
}

/**
 * Apply Korean font to an existing jsPDF doc instance.
 */
export async function setKoreanFont(doc: jsPDF): Promise<void> {
  const fontData = await loadKoreanFont();
  if (fontData) {
    doc.addFileToVFS('NanumGothic.ttf', fontData);
    doc.addFont('NanumGothic.ttf', 'NanumGothic', 'normal');
    doc.setFont('NanumGothic');
  }
}
