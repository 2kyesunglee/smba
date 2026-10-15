import { describe, it, expect } from 'vitest';
import { MultiLanguageTranslationService, SUPPORTED_LANGUAGES } from '@/infrastructure/services/TranslationService';

describe('MultiLanguageTranslationService (16 Countries + KO/EN)', () => {
  const service = new MultiLanguageTranslationService();

  it('should support 16 foreign worker countries plus KO and EN', () => {
    expect(SUPPORTED_LANGUAGES.length).toBeGreaterThanOrEqual(18); // 16 foreign + ko + en
    const codes = SUPPORTED_LANGUAGES.map((l) => l.code);
    expect(codes).toContain('vi');
    expect(codes).toContain('ph');
    expect(codes).toContain('mn');
    expect(codes).toContain('th');
    expect(codes).toContain('id');
    expect(codes).toContain('uz');
    expect(codes).toContain('km');
    expect(codes).toContain('ne');
    expect(codes).toContain('mm');
  });

  it('should translate safety terms into Vietnamese', () => {
    const translated = service.translate('작업 전 안전점검을 반드시 실시하세요.', 'vi');
    expect(translated).toBeTruthy();
    expect(translated.length).toBeGreaterThan(0);
  });

  it('should translate dynamic instruction into target language', () => {
    const text = '오늘 스크러버 배관 용접 작업 주의';
    const translatedVN = service.translateInstruction(text, 'vi');
    const translatedMN = service.translateInstruction(text, 'mn');
    expect(translatedVN).toContain('hàn'); // 용접 (hàn in Vietnamese)
    expect(translatedMN).toBeTruthy();
  });
});
