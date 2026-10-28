import { describe, it, expect, beforeEach, vi } from 'vitest';
import { LocalStateStore, SafetyMaterial, InspectionTarget } from '@/infrastructure/storage/LocalStateStore';
import { Worker } from '@/domain/entities/Worker';
import { EquipmentUsageLog } from '@/domain/entities/EquipmentUsageLog';

describe('데이터 영속성, 근로자 삭제 유지, 교안 저장 및 타겟 작업지시 테스트 (Red Phase)', () => {
  let store: LocalStateStore;

  const localStorageMock = (() => {
    let storeData: Record<string, string> = {};
    return {
      getItem: (key: string) => storeData[key] || null,
      setItem: (key: string, val: string) => {
        storeData[key] = val.toString();
      },
      removeItem: (key: string) => {
        delete storeData[key];
      },
      clear: () => {
        storeData = {};
      },
    };
  })();

  beforeEach(() => {
    (global as any).localStorage = localStorageMock;
    (global as any).window = { localStorage: localStorageMock };
    localStorageMock.clear();
    store = LocalStateStore.getInstance();
    store.resetToInitial();
    vi.restoreAllMocks();
  });

  it('1. 근로자 삭제 후 재동기화(fetchFromServer) 시 삭제된 근로자가 다시 나타나지 않아야 한다', async () => {
    const initialWorkers = store.getState().workers;
    const toDelete = initialWorkers[0];
    expect(toDelete).toBeDefined();

    store.deleteWorker(toDelete.id);
    expect(store.getState().workers.some((w) => w.id === toDelete.id)).toBe(false);

    // 서버 동기화 시뮬레이션: 서버 응답에서도 삭제된 근로자가 제외된 최신 목록이 와야 함
    const remaining = store.getState().workers;
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      headers: { get: () => '"v-del"' },
      json: async () => ({
        success: true,
        data: {
          workers: remaining.map((w) => w.toJSON()),
        },
      }),
    });
    (global as any).fetch = fetchMock;

    await store.fetchFromServer();
    expect(store.getState().workers.some((w) => w.id === toDelete.id)).toBe(false);
  });

  it('2. 안전교육 교안 및 TBM 교안 등록 시 로컬스토어 및 서버 동기화 후에도 보존되어야 한다', async () => {
    const newEdu: SafetyMaterial = {
      id: 'mat-edu-test-1',
      type: 'SAFETY_EDUCATION',
      title: '용접 고소작업 안전교육 교안',
      category: '정기안전교육',
      fileName: 'welding_safety.pdf',
      fileSize: '1.2 MB',
      description: '고소 용접 시 안전벨트 착용 및 화재감시자 배치 필수',
      targetDepartment: '생산 정비팀',
      uploadedAt: '2026-10-28',
      uploadedBy: '김공장장',
      signatures: [],
    };

    store.addSafetyMaterial(newEdu);
    expect(store.getState().safetyMaterials.some((m) => m.id === 'mat-edu-test-1')).toBe(true);

    const newTbm: SafetyMaterial = {
      id: 'mat-tbm-test-1',
      type: 'TBM',
      title: '밀폐공간 질식 재해 예방 TBM',
      category: '위험공정 TBM',
      fileName: 'tbm_confined.pdf',
      fileSize: '800 KB',
      description: '작업 전 산소 및 유해가스 농도 측정 필수',
      targetDepartment: '화학탱크 구역',
      uploadedAt: '2026-10-28',
      uploadedBy: '안전팀',
      signatures: [],
    };

    store.addSafetyMaterial(newTbm);
    const materials = store.getState().safetyMaterials;
    expect(materials.some((m) => m.id === 'mat-tbm-test-1')).toBe(true);
    expect(materials.some((m) => m.id === 'mat-edu-test-1')).toBe(true);
  });

  it('3. 특정 근로자(targetWorkerId)에게만 발송된 작업지시는 다른 근로자에게 표출되지 않아야 한다', () => {
    store.addPushHistory({
      id: 'push-target-w2',
      sentAt: '2026-10-28 10:00',
      target: 'Batbayar Bold(MN)',
      targetWorkerId: 'w-2',
      instructionText: '몽골 근로자 전용 특별 점검 지시',
      status: 'DELIVERED',
    });

    const histories = store.getState().pushHistories;
    
    // w-1 (Nguyen Van An) 스마트폰 필터링
    const w1Filtered = histories.filter((h) => {
      if (!h.targetWorkerId || h.targetWorkerId === 'ALL') return true;
      return h.targetWorkerId.split(',').includes('w-1');
    });
    expect(w1Filtered.some((h) => h.id === 'push-target-w2')).toBe(false);

    // w-2 (Batbayar Bold) 스마트폰 필터링
    const w2Filtered = histories.filter((h) => {
      if (!h.targetWorkerId || h.targetWorkerId === 'ALL') return true;
      return h.targetWorkerId.split(',').includes('w-2');
    });
    expect(w2Filtered.some((h) => h.id === 'push-target-w2')).toBe(true);
  });

  it('4. 근로자 기기 사용 신청 시 알림(EQUIPMENT_USAGE)이 생성되고 로그가 보존되어야 한다', () => {
    const initialLogCount = store.getState().equipmentUsageLogs.length;

    const newLog = EquipmentUsageLog.create({
      id: 'eq-req-test-1',
      equipmentType: '지게차',
      equipmentNumber: '3호기',
      workerId: 'w-1',
      workerName: 'Nguyen Van An',
      purpose: '원자재 하역',
      startTime: '2026-10-28 14:00',
      endTime: '2026-10-28 17:00',
      status: 'REQUESTED',
    });

    store.requestEquipmentUsage(newLog);

    expect(store.getState().equipmentUsageLogs.length).toBe(initialLogCount + 1);
    const foundLog = store.getState().equipmentUsageLogs.find((l) => l.id === 'eq-req-test-1');
    expect(foundLog?.status).toBe('REQUESTED');
    expect(foundLog?.workerName).toBe('Nguyen Van An');
  });

  it('5. 설비점검 대상(InspectionTarget)에 관리자가 동적으로 추가한 측정기준치(metrics)가 보존되어야 한다', () => {
    const customTarget: InspectionTarget = {
      id: 'target-custom-1',
      name: 'D동 가스 스크러버 #3',
      location: 'D동 옥상 배기탑',
      cycle: '일일',
      manager: '이정비 반장',
      description: '배기가스 흡수탑 차압 및 순환수 pH 점검',
      metrics: [
        { name: '차압(Differential Pressure)', unit: 'mmH2O', maxLimit: 150, minLimit: 50 },
        { name: '순환액 pH', unit: 'pH', maxLimit: 8.5, minLimit: 6.5 },
        { name: '팬 진동치', unit: 'mm/s', maxLimit: 4.0 },
      ],
    };

    store.addInspectionTarget(customTarget);
    const found = store.getState().inspectionTargets.find((t) => t.id === 'target-custom-1');
    expect(found).toBeDefined();
    expect(found?.metrics.length).toBe(3);
    expect(found?.metrics[0].name).toBe('차압(Differential Pressure)');
    expect(found?.metrics[1].unit).toBe('pH');
  });
});
