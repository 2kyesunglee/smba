import { describe, it, expect, beforeEach } from 'vitest';
import { Worker } from '@/domain/entities/Worker';
import { LocalStateStore } from '@/infrastructure/storage/LocalStateStore';

describe('Worker Approval & Master DB Persistence (Red-Green-Refactor)', () => {
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
    (global as any).window = {
      localStorage: localStorageMock,
      addEventListener: () => {},
      removeEventListener: () => {},
    };
    localStorageMock.clear();
    store = LocalStateStore.getInstance();
    store.resetToInitial();
  });

  it('Worker 인스턴스를 approve() 한 뒤 JSON 직렬화 및 역직렬화(Worker.create) 시 status가 ACTIVE로 온전히 유지되어야 한다 (Red test)', () => {
    const worker = Worker.create({
      id: 'w-test-101',
      name: 'Nguyen Van Test',
      phoneNumber: '010-1234-5678',
      nationality: 'VN',
      visaType: 'E-9',
      contractStartDate: '2026-10-21',
      contractEndDate: '2027-12-31',
      status: 'PENDING_APPROVAL',
    });

    expect(worker.status).toBe('PENDING_APPROVAL');

    // 관리자 연동 승인
    worker.approve();
    expect(worker.status).toBe('ACTIVE');

    // JSON 직렬화 (localStorage 또는 /api/sync 전송)
    const jsonStr = JSON.stringify(worker);
    const parsed = JSON.parse(jsonStr);

    // 역직렬화 복원
    const restored = Worker.create(parsed);

    // [핵심 검증]: 역직렬화 후에도 PENDING_APPROVAL로 되돌아가지 않고 ACTIVE여야 함!
    expect(restored.status).toBe('ACTIVE');
  });

  it('LocalStateStore에서 승인 대기 중인 근로자를 approveWorker 후 loadFromStorage() 해도 전체 마스터 탭(ACTIVE)에 영구 보존되어야 한다', () => {
    const newPendingWorker = Worker.create({
      id: 'w-mobile-signup-999',
      name: 'Mobile Newbie',
      phoneNumber: '010-9999-8888',
      nationality: 'ID',
      visaType: 'E-9',
      contractStartDate: '2026-10-21',
      contractEndDate: '2027-12-31',
      status: 'PENDING_APPROVAL',
    });

    // 1. 모바일에서 가입 요청 접수
    store.addWorker(newPendingWorker);

    // 대기열에 있는지 확인
    let state = store.getState();
    const foundPending = state.workers.find((w) => w.id === 'w-mobile-signup-999');
    expect(foundPending).toBeDefined();
    expect(foundPending?.status).toBe('PENDING_APPROVAL');

    // 2. 관리자가 웹에서 연동 승인 처리
    store.approveWorker('w-mobile-signup-999');
    store.updateWorker('w-mobile-signup-999', {
      koreanName: '모바일 뉴비',
      alienRegNumber: '960101-5999888',
      status: 'ACTIVE',
    });

    // 3. 브라우저 새로고침 / 서버 동기화 시뮬레이션
    store.loadFromStorage();

    // 4. 전체 근로자 마스터 DB(status !== 'PENDING_APPROVAL')에 포함되어 있는지 확인
    state = store.getState();
    const approvedWorker = state.workers.find((w) => w.id === 'w-mobile-signup-999');
    expect(approvedWorker).toBeDefined();
    expect(approvedWorker?.status).toBe('ACTIVE');
    expect(approvedWorker?.alienRegNumber).toBe('960101-5999888');

    // 전체 근로자 마스터 목록에 필터링되는지 검증
    const activeMasterWorkers = state.workers.filter((w) => w.status !== 'PENDING_APPROVAL');
    expect(activeMasterWorkers.some((w) => w.id === 'w-mobile-signup-999')).toBe(true);
  });
});
