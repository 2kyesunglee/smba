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

  it('should support beforeDescription (문제점 설명) and afterDescription (개선이후 설명)', () => {
    const report = new WorkReport({
      id: 'rep-2',
      workerId: 'w-1',
      workerName: 'Nguyen Van An',
      taskName: '보일러실 배관 보온재 교체',
      location: 'B동 보일러실',
      beforeImg: 'https://example.com/before1.jpg',
      afterImg: 'https://example.com/after1.jpg',
      beforeDescription: '노후 보온재 탈락으로 인한 열 손실 및 화상 위험 발생',
      afterDescription: '난연성 글라스울 재시공 및 알루미늄 외장 마감 완료',
      description: '보온재 교체 완료',
    });

    expect(report.beforeDescription).toBe('노후 보온재 탈락으로 인한 열 손실 및 화상 위험 발생');
    expect(report.afterDescription).toBe('난연성 글라스울 재시공 및 알루미늄 외장 마감 완료');
  });
});
