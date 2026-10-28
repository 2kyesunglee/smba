import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { LocalStateStore } from '@/infrastructure/storage/LocalStateStore';

describe('Vercel Fast Origin Transfer 최적화 및 캐싱 동기화 테스트 (Red Phase)', () => {
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

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('1. fetchFromServer 호출 시 클라이언트의 현재 버전/ETag를 If-None-Match 헤더에 담아 전송해야 한다', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      status: 200,
      ok: true,
      headers: {
        get: (h: string) => (h.toLowerCase() === 'etag' ? '"v-100"' : null),
      },
      json: async () => ({
        success: true,
        version: 'v-100',
        data: {
          workers: [],
        },
      }),
    });
    (global as any).fetch = fetchMock;

    await store.fetchFromServer();

    expect(fetchMock).toHaveBeenCalled();
    // 첫 호출 시도 또는 버전 업데이트 후 다음 호출 시 If-None-Match 전송 확인
    const secondFetchMock = vi.fn().mockResolvedValue({
      status: 304,
      ok: true,
      headers: {
        get: () => null,
      },
      json: async () => ({}),
    });
    (global as any).fetch = secondFetchMock;

    await store.fetchFromServer();

    expect(secondFetchMock).toHaveBeenCalled();
    const calledHeaders = secondFetchMock.mock.calls[0][1]?.headers;
    expect(calledHeaders?.['If-None-Match'] || calledHeaders?.['if-none-match']).toBe('"v-100"');
  });

  it('2. 서버로부터 304 Not Modified 또는 unchanged 응답을 받으면 상태를 불필요하게 갱신하지 않아야 한다', async () => {
    const listener = vi.fn();
    store.subscribe(listener);

    // 1차 동기화 (초기 수신)
    (global as any).fetch = vi.fn().mockResolvedValue({
      status: 200,
      ok: true,
      headers: {
        get: (h: string) => (h.toLowerCase() === 'etag' ? '"v-same"' : null),
      },
      json: async () => ({
        success: true,
        version: 'v-same',
        data: {
          workers: [],
        },
      }),
    });
    await store.fetchFromServer();
    const initialCallCount = listener.mock.calls.length;

    // 2차 동기화: 304 Not Modified 응답
    (global as any).fetch = vi.fn().mockResolvedValue({
      status: 304,
      ok: true,
      headers: {
        get: () => null,
      },
    });

    await store.fetchFromServer();

    // 304 Not Modified인 경우 상태 변경 리스너가 불필요하게 재호출되지 않아야 함
    expect(listener.mock.calls.length).toBe(initialCallCount);
  });

  it('3. saveToStorage 연속 호출 시 디바운스(Debounce) 처리를 통해 불필요한 연속 POST 호출을 억제해야 한다', async () => {
    vi.useFakeTimers();
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, version: 'v-new' }),
    });
    (global as any).fetch = fetchMock;

    // 짧은 시간 내 5회 연속 저장 호출
    store.saveToStorage();
    store.saveToStorage();
    store.saveToStorage();
    store.saveToStorage();
    store.saveToStorage();

    // 즉시 실행된 fetch 호출 수 확인 (디바운스 중이므로 0 또는 최소)
    expect(fetchMock.mock.calls.length).toBeLessThanOrEqual(1);

    // 타이머 경과 후 최종 1회만 호출되어야 함
    vi.runAllTimers();
    expect(fetchMock.mock.calls.length).toBe(1);

    vi.useRealTimers();
  });
});
