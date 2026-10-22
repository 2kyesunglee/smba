import { describe, it, expect, beforeEach } from 'vitest';
import { MultiLanguageTranslationService } from '@/infrastructure/services/TranslationService';
import { PTWRequest } from '@/domain/entities/PTWRequest';
import { EquipmentUsageLog } from '@/domain/entities/EquipmentUsageLog';
import { WorkReport } from '@/domain/entities/WorkReport';
import { Inspection } from '@/domain/entities/Inspection';

describe('양방향 다국어 자동 번역 시스템 (TDD Red-Green-Refactor)', () => {
  let service: MultiLanguageTranslationService;

  beforeEach(() => {
    service = new MultiLanguageTranslationService();
  });

  describe('1. 근로자 모국어(스마트폰) -> 관리자 웹(한국어) 자동 번역', () => {
    it('기기사용 일지: 외국인 근로자가 모국어로 작성한 사용 목적/위치를 관리자 웹용 한국어로 번역해야 한다', () => {
      // 베트남어 원문
      const vnPurpose = 'Vận chuyển nguyên vật liệu kho A và bốc xếp hàng';
      const resultVN = service.translateWorkerTextToKorean(vnPurpose, 'VN');
      expect(resultVN.koreanText).toContain('원자재');
      expect(resultVN.isTranslated).toBe(true);
      expect(resultVN.sourceLang).toBe('vi');

      // 영어 원문
      const enPurpose = 'Forklift material transport in warehouse A';
      const resultEN = service.translateWorkerTextToKorean(enPurpose, 'US');
      expect(resultEN.koreanText).toContain('자재');
      expect(resultEN.isTranslated).toBe(true);

      // 이미 한국어인 경우 원문 보존
      const koPurpose = 'A동 원자재 하역 작업';
      const resultKO = service.translateWorkerTextToKorean(koPurpose, 'KR');
      expect(resultKO.koreanText).toBe(koPurpose);
      expect(resultKO.isTranslated).toBe(false);
    });

    it('PTW 작업허가: 근로자가 외국어로 작성한 위험요인 및 안전대책을 한국어로 번역해야 한다', () => {
      const hazardVN = 'Nguy cơ rơi ngã từ trên cao, rò rỉ khí độc';
      const safetyVN = 'Đeo dây an toàn hai móc, bố trí 2 bình chữa cháy';

      const translatedHazard = service.translateWorkerTextToKorean(hazardVN, 'VN');
      const translatedSafety = service.translateWorkerTextToKorean(safetyVN, 'VN');

      expect(translatedHazard.koreanText).toMatch(/추락|낙하|가스/);
      expect(translatedSafety.koreanText).toMatch(/안전대|소화기/);
    });

    it('사진갤러리(WorkReport): 외국인 근로자가 작성한 작업 설명 및 작업명을 한국어로 번역해야 한다', () => {
      const reportVN = 'Đã thay thế gioăng đệm và kiểm tra rò rỉ xong.';
      const result = service.translateWorkerTextToKorean(reportVN, 'VN');
      expect(result.koreanText).toContain('가스켓');
    });

    it('설비점검 일지(Inspection): 근로자가 외국어로 기록한 이상 메모를 한국어로 번역해야 한다', () => {
      const notesVN = 'Nhiệt độ vượt quá mức cho phép và rò rỉ hơi nước';
      const result = service.translateWorkerTextToKorean(notesVN, 'VN');
      expect(result.koreanText).toMatch(/온도|기준치|누설/);
    });
  });

  describe('2. 관리자 웹(한국어) -> 근로자 모국어(스마트폰) 자동 번역', () => {
    it('작업 지시 발송: 관리자 한국어 지시문이 16개국 언어로 자동 번역되어야 한다', () => {
      const koInstruction = '오늘 스크러버 배관 용접 작업 주의, 화재 감시자 1인 상주 필수';

      // 16개국 주요 언어 번역 검증
      const viText = service.translateAdminTextToWorkerLang(koInstruction, 'VN');
      const mnText = service.translateAdminTextToWorkerLang(koInstruction, 'MN');
      const phText = service.translateAdminTextToWorkerLang(koInstruction, 'PH');
      const thText = service.translateAdminTextToWorkerLang(koInstruction, 'TH');
      const idText = service.translateAdminTextToWorkerLang(koInstruction, 'ID');
      const uzText = service.translateAdminTextToWorkerLang(koInstruction, 'UZ');

      expect(viText).toBeTruthy();
      expect(mnText).toBeTruthy();
      expect(phText).toBeTruthy();
      expect(thText).toBeTruthy();
      expect(idText).toBeTruthy();
      expect(uzText).toBeTruthy();
      expect(viText).not.toBe(koInstruction);
    });

    it('기기사용 및 PTW 반려 사유: 관리자 한국어 사유가 해당 근로자 국적 언어로 자동 번역되어야 한다', () => {
      const koRejectReason = '자격증 사본 미제출 및 안전 보호구 미착용으로 인한 반려';
      
      const viReject = service.translateAdminTextToWorkerLang(koRejectReason, 'VN');
      const mnReject = service.translateAdminTextToWorkerLang(koRejectReason, 'MN');

      expect(viReject).toBeTruthy();
      expect(mnReject).toBeTruthy();
      expect(viReject).not.toBe(koRejectReason);
    });

    it('설비점검 대상 관리: 점검 대상 설비명, 설명, 측정 항목명이 근로자 언어로 번역되어야 한다', () => {
      const target = {
        name: 'A동 렌더링 쿠커 #1',
        description: '고온·고압 증기 렌더링 반응기 (최대 130°C 초과 시 비상)',
        metricNames: ['내부 가열 온도', '증기 공급 압력'],
      };

      const translated = service.translateInspectionTarget(target, 'VN');
      expect(translated.name).toBeTruthy();
      expect(translated.description).toBeTruthy();
      expect(translated.metricNames.length).toBe(2);
    });

    it('QR 통합관리: 설비 주의사항 및 비상조치절차가 근로자 언어로 번역되어야 한다', () => {
      const qrData = {
        name: '보일러 청관제 (알칼리계 B-402)',
        cautionNotes: '강염기성 유해화학물질, 흡입 및 피부 접촉 시 심각한 화상 위험, 내화학 장갑/보안경 필수',
        emergencyProcedures: '피부 접촉 시 흐르는 물에 15분 이상 세척, 눈 유입 시 즉시 세안기 사용 후 병원 이송',
      };

      const translated = service.translateQRInfo(qrData, 'VN');
      expect(translated.cautionNotes).toBeTruthy();
      expect(translated.emergencyProcedures).toBeTruthy();
    });

    it('스마트 체크리스트 빌더: 템플릿 질문 문항 및 안전수칙이 근로자 언어로 번역되어야 한다', () => {
      const checklistItems = [
        '안전모 턱끈을 견고히 조이고 안전그네형 안전대를 착용했습니까?',
        '작업 반경 5m 이내 가연물 제거 및 분말 소화기 2기를 배치했습니까?',
      ];

      const translated = service.translateChecklistItems(checklistItems, 'VN');
      expect(translated.length).toBe(2);
      expect(translated[0]).not.toBe(checklistItems[0]);
    });
  });
});
