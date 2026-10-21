import { describe, it, expect, beforeEach } from 'vitest';
import { LocalStateStore } from '@/infrastructure/storage/LocalStateStore';
import { Worker } from '@/domain/entities/Worker';

describe('LocalStateStore Persistence (근로자 삭제 및 영속성 보장)', () => {
  let store: LocalStateStore;

  // Mock localStorage in node/vitest environment
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
    // Fresh store reset
    store = LocalStateStore.getInstance();
    store.resetToInitial();
  });

  it('근로자를 삭제하면 store 상태에서 즉시 제거되어야 한다', () => {
    const initialCount = store.getState().workers.length;
    const workerToDelete = store.getState().workers[0];

    store.deleteWorker(workerToDelete.id);

    const remainingWorkers = store.getState().workers;
    expect(remainingWorkers.length).toBe(initialCount - 1);
    expect(remainingWorkers.find((w) => w.id === workerToDelete.id)).toBeUndefined();
  });

  it('근로자를 삭제한 뒤 reload/re-initialize 해도 삭제된 상태가 영구 유지되어야 한다', () => {
    const workerToDelete = store.getState().workers[0];
    const targetId = workerToDelete.id;

    store.deleteWorker(targetId);

    // Simulate reloading from storage
    store.loadFromStorage();

    const loadedWorkers = store.getState().workers;
    expect(loadedWorkers.find((w) => w.id === targetId)).toBeUndefined();
  });

  it('신규 근로자를 추가하면 reload 후에도 보존되어야 한다', () => {
    const newWorker = Worker.create({
      id: 'w-test-persist-999',
      name: 'John Doe',
      phoneNumber: '010-9999-0000',
      nationality: 'PH',
      visaType: 'E-9',
      contractStartDate: '2026-01-01',
      contractEndDate: '2028-12-31',
    });

    store.addWorker(newWorker);
    store.loadFromStorage();

    const found = store.getState().workers.find((w) => w.id === 'w-test-persist-999');
    expect(found).toBeDefined();
    expect(found?.name).toBe('John Doe');
  });
});
