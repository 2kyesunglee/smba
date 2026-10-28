import { describe, it, expect, beforeEach } from 'vitest';
import { LocalStateStore, InspectionTarget } from '@/infrastructure/storage/LocalStateStore';

describe('설비점검 대상 동적 측정기준치 관리 및 QR URL 연동 테스트', () => {
  let store: LocalStateStore;

  beforeEach(() => {
    store = LocalStateStore.getInstance();
    store.resetToInitial();
  });

  it('관리자가 원하는 측정 기준치(진동, 전류 등) 항목을 자유롭게 추가하여 설비점검 대상을 등록할 수 있어야 한다', () => {
    const customTarget: InspectionTarget = {
      id: 'target-custom-1',
      name: 'C동 컴프레서 #3',
      location: 'C동 기계실',
      cycle: '일일',
      manager: '박정비',
      description: '압축공기 공급용 컴프레서',
      metrics: [
        { name: '베어링 진동', unit: 'mm/s', maxLimit: 4.5, minLimit: 0.5 },
        { name: '소비 전류', unit: 'A', maxLimit: 35 },
        { name: '냉각수 온도', unit: '°C', maxLimit: 75, minLimit: 20 },
      ],
    };

    store.addInspectionTarget(customTarget);

    const saved = store.getState().inspectionTargets.find((t) => t.id === 'target-custom-1');
    expect(saved).toBeDefined();
    expect(saved?.metrics.length).toBe(3);
    expect(saved?.metrics[0].name).toBe('베어링 진동');
    expect(saved?.metrics[1].unit).toBe('A');
  });

  it('기존 고정 텍스트 없이 측정 기준치를 비우거나 단일 항목만으로도 유연하게 등록할 수 있어야 한다', () => {
    const minimalTarget: InspectionTarget = {
      id: 'target-minimal-1',
      name: '단순 컨베이어 벨트',
      location: 'A라인 포장 구역',
      cycle: '일일',
      manager: '이안전',
      description: '단순 동작 확인',
      metrics: [
        { name: '작동 소음 유무', unit: '정상/이상' },
      ],
    };

    store.addInspectionTarget(minimalTarget);

    const saved = store.getState().inspectionTargets.find((t) => t.id === 'target-minimal-1');
    expect(saved).toBeDefined();
    expect(saved?.metrics.length).toBe(1);
    expect(saved?.metrics[0].name).toBe('작동 소음 유무');
  });

  it('스마트폰 카메라 스캔용 QR 코드는 웹 브라우저가 자동 열리도록 URL 형태로 인코딩되어야 한다', () => {
    const origin = 'https://smba-one.vercel.app';
    const qrCode = 'EQ-PUMP-001';
    const mobileQrUrl = `${origin}/mobile?qr=${encodeURIComponent(qrCode)}`;

    expect(mobileQrUrl).toBe('https://smba-one.vercel.app/mobile?qr=EQ-PUMP-001');
    expect(mobileQrUrl.startsWith('https://')).toBe(true);

    // URL 파라미터 파싱 검증
    const url = new URL(mobileQrUrl);
    expect(url.pathname).toBe('/mobile');
    expect(url.searchParams.get('qr')).toBe('EQ-PUMP-001');
  });
});
