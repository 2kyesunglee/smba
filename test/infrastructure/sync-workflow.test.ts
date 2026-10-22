import { describe, it, expect, beforeEach, vi } from 'vitest';
import { LocalStateStore, PushHistoryItem } from '@/infrastructure/storage/LocalStateStore';
import { PTWRequest } from '@/domain/entities/PTWRequest';
import { EquipmentUsageLog } from '@/domain/entities/EquipmentUsageLog';

describe('서버 동기화 및 작업지시/기기사용/PTW 연동 테스트 (Red-Green-Refactor)', () => {
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
    localStorageMock.clear();
    store = LocalStateStore.getInstance();
    store.resetToInitial();
    vi.restoreAllMocks();
  });

  it('1. 관리자가 발송한 작업지시서(PushHistory)가 서버 동기화(fetchFromServer) 시 스마트폰 state에 정상 반영되어야 한다', async () => {
    // Mock server returning pushHistories
    const mockServerData = {
      success: true,
      data: {
        pushHistories: [
          {
            id: 'push-test-101',
            sentAt: '2026-10-22 11:00:00',
            target: '전체 현장 근로자',
            targetWorkerId: 'ALL',
            instructionText: '스크러버 밸브 점검 시 보호구 착용 필수',
            status: 'DELIVERED',
          },
        ],
      },
    };

    (global as any).fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockServerData,
    });

    await store.fetchFromServer();

    const pushList = store.getState().pushHistories;
    const found = pushList.find((p) => p.id === 'push-test-101');
    expect(found).toBeDefined();
    expect(found?.instructionText).toBe('스크러버 밸브 점검 시 보호구 착용 필수');
  });

  it('2. 기기 사용 일지에서 관리자가 승인(approveEquipmentUsage)하면 상태가 APPROVED가 되고 서버 동기화 시 보존되어야 한다', async () => {
    // 1) 근로자가 기기 사용 신청
    const newLog = EquipmentUsageLog.create({
      id: 'eq-test-log-1',
      equipmentType: '지게차',
      workerId: 'w-1',
      workerName: 'Nguyen Van An',
      purpose: '자재 하역',
      startTime: '2026-10-22 13:00',
      endTime: '2026-10-22 15:00',
      status: 'REQUESTED',
    });
    store.requestEquipmentUsage(newLog);

    // 2) 관리자가 승인
    store.approveEquipmentUsage('eq-test-log-1', '김공장장 (안전관리자)');
    const approvedItem = store.getState().equipmentUsageLogs.find((l) => l.id === 'eq-test-log-1');
    expect(approvedItem?.status).toBe('APPROVED');
    expect(approvedItem?.approvedBy).toBe('김공장장 (안전관리자)');

    // 3) 서버 동기화 시 서버의 최신 승인 상태가 유지되어야 함
    const mockServerData = {
      success: true,
      data: {
        equipmentUsageLogs: [approvedItem?.toJSON()],
      },
    };

    (global as any).fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockServerData,
    });

    await store.fetchFromServer();

    const refreshed = store.getState().equipmentUsageLogs.find((l) => l.id === 'eq-test-log-1');
    expect(refreshed?.status).toBe('APPROVED');
    expect(refreshed?.approvedBy).toBe('김공장장 (안전관리자)');
  });

  it('3. 근로자가 스마트폰에서 요청한 PTW가 등록되고, 관리자가 승인 시 APPROVED 상태가 되어야 한다', async () => {
    const ptw = PTWRequest.create({
      id: 'ptw-test-301',
      ptwNumber: 'PTW-2026-9999',
      workerId: 'w-1',
      workerName: 'Nguyen Van An',
      taskName: '배관 용접 작업',
      location: 'A동 화학탱크',
      workDate: '2026-10-22',
      hazardFactors: '화재 위험',
      safetyMeasures: '소화기 2기 배치',
      status: 'REQUESTED',
    });

    store.addPTW(ptw);
    expect(store.getState().ptwList.some((p) => p.id === 'ptw-test-301')).toBe(true);

    // 관리자 승인
    store.approvePTW('ptw-test-301', '김공장장');
    const approvedPTW = store.getState().ptwList.find((p) => p.id === 'ptw-test-301');
    expect(approvedPTW?.status).toBe('APPROVED');

    // 서버 동기화 후에도 APPROVED 상태가 유지되어야 함
    const mockServerData = {
      success: true,
      data: {
        ptwList: [approvedPTW?.toJSON()],
      },
    };

    (global as any).fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockServerData,
    });

    await store.fetchFromServer();

    const refreshedPTW = store.getState().ptwList.find((p) => p.id === 'ptw-test-301');
    expect(refreshedPTW?.status).toBe('APPROVED');
  });

  it('4. fetchFromServer는 서버 데이터를 수신한 후 다시 서버로 POST 요청을 보내지 않아야 한다 (무한 덮어쓰기 방지)', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: {
          workers: [],
          pushHistories: [],
        },
      }),
    });
    (global as any).fetch = fetchMock;

    await store.fetchFromServer();

    // GET 요청 1회만 발생하고, 추가 POST 요청은 없어야 함!
    const postCalls = fetchMock.mock.calls.filter((call) => call[1]?.method === 'POST');
    expect(postCalls.length).toBe(0);
  });
});
