import { describe, it, expect } from 'vitest';
import { WorkReport } from '@/domain/entities/WorkReport';
import { LocalStateStore, SafetyMaterial } from '@/infrastructure/storage/LocalStateStore';

describe('Safety Education & WorkReport 4 Photos (안전교육 서명 & 4장 사진 보고서)', () => {
  it('WorkReport는 작업전 사진 2장(beforeImgs), 작업후 사진 2장(afterImgs)을 정확히 유지해야 한다', () => {
    const report = new WorkReport({
      id: 'rep-4-photos',
      workerId: 'w-1',
      workerName: 'Nguyen Van An',
      taskName: '보일러실 배관 보온재 교체 및 밸브 실링',
      location: 'B동 보일러실',
      beforeImgs: ['data:image/jpeg;base64,before1', 'data:image/jpeg;base64,before2'],
      afterImgs: ['data:image/jpeg;base64,after1', 'data:image/jpeg;base64,after2'],
      description: '보온재 교체 및 밸브 누설 방지 완료',
      beforeDescription: '배관 노후 및 미세 누기 발생',
      afterDescription: '고효율 보온재 및 신규 패킹 교체 완료',
    });

    expect(report.beforeImgs.length).toBe(2);
    expect(report.afterImgs.length).toBe(2);
    expect(report.beforeImgs[0]).toBe('data:image/jpeg;base64,before1');
    expect(report.beforeImgs[1]).toBe('data:image/jpeg;base64,before2');
    expect(report.afterImgs[0]).toBe('data:image/jpeg;base64,after1');
    expect(report.afterImgs[1]).toBe('data:image/jpeg;base64,after2');
    expect(report.beforeDescription).toBe('배관 노후 및 미세 누기 발생');
    expect(report.afterDescription).toBe('고효율 보온재 및 신규 패킹 교체 완료');
  });

  it('근로자가 안전교육 교안에 서명하면 해당 교안의 서명자 목록에 즉시 추가되어야 한다', () => {
    const store = LocalStateStore.getInstance();
    
    // 교안 등록
    const material: SafetyMaterial = {
      id: 'mat-edu-test-1',
      type: 'SAFETY_EDUCATION',
      title: '2026 현장 밀폐공간 안전작업 교육',
      category: '특별안전교육',
      fileName: '밀폐공간_교안.pdf',
      fileSize: '3.2 MB',
      description: '산소농도 측정 및 송기마스크 착용 요령',
      targetDepartment: '생산1라인',
      uploadedAt: '2026-10-21',
      uploadedBy: '김공장장',
      signatures: [],
    };
    store.addSafetyMaterial(material);

    // 근로자 서명 제출
    store.signSafetyMaterial('mat-edu-test-1', {
      id: 'sig-test-1',
      workerId: 'w-1',
      workerName: 'Nguyen Van An',
      nationality: 'VN',
      signedAt: '2026-10-21 14:00',
      signatureDataUrl: 'data:image/png;base64,signaturesample',
    });

    const targetMaterial = store.getState().safetyMaterials.find((m) => m.id === 'mat-edu-test-1');
    expect(targetMaterial).toBeDefined();
    expect(targetMaterial?.signatures.length).toBe(1);
    expect(targetMaterial?.signatures[0].workerName).toBe('Nguyen Van An');
  });
});
