import { describe, it, expect } from 'vitest';
import { WorkReport } from '@/domain/entities/WorkReport';

describe('WorkReport Domain Entity', () => {
  it('should support 2 before images and 2 after images', () => {
    const report = new WorkReport({
      id: 'rep-1',
      workerId: 'w-1',
      workerName: 'Nguyen Van An',
      taskName: '배관 용접 및 도색',
      location: 'A동 2층',
      beforeImg: 'https://example.com/before1.jpg',
      afterImg: 'https://example.com/after1.jpg',
      beforeImgs: ['https://example.com/before1.jpg', 'https://example.com/before2.jpg'],
      afterImgs: ['https://example.com/after1.jpg', 'https://example.com/after2.jpg'],
      description: '작업 완료',
    });

    expect(report.beforeImgs).toHaveLength(2);
    expect(report.afterImgs).toHaveLength(2);
    expect(report.beforeImgs[1]).toBe('https://example.com/before2.jpg');
    expect(report.afterImgs[1]).toBe('https://example.com/after2.jpg');
  });
});
