import { describe, it, expect } from 'vitest';
import { Inspection, InspectionThreshold } from '@/domain/entities/Inspection';

describe('Inspection Domain Entity & Rule', () => {
  const threshold: InspectionThreshold = {
    metric: 'temperature',
    max: 130, // 130도 초과 시 이상
    min: 50,
  };

  it('should flag abnormal when temperature exceeds threshold', () => {
    const inspection = Inspection.create({
      id: 'insp-1',
      equipmentId: 'eq-cooker-1',
      workerId: 'w-1',
      workerName: 'Nguyen Van A',
      data: { temperature: 135, pressure: 2.1 },
      thresholds: [threshold],
    });

    expect(inspection.isAbnormal).toBe(true);
    expect(inspection.abnormalNotes).toContain('temperature');
  });

  it('should be normal when temperature is within range', () => {
    const inspection = Inspection.create({
      id: 'insp-2',
      equipmentId: 'eq-cooker-1',
      workerId: 'w-1',
      workerName: 'Nguyen Van A',
      data: { temperature: 110, pressure: 2.0 },
      thresholds: [threshold],
    });

    expect(inspection.isAbnormal).toBe(false);
  });
});
