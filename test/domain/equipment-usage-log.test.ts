import { describe, it, expect } from 'vitest';
import { EquipmentUsageLog } from '@/domain/entities/EquipmentUsageLog';

describe('EquipmentUsageLog Domain Entity', () => {
  it('should create an equipment usage request with REQUESTED status', () => {
    const log = EquipmentUsageLog.create({
      id: 'eq-log-1',
      equipmentType: '지게차',
      workerId: 'w-1',
      workerName: 'Nguyen Van An',
      purpose: 'A동 원자재 하역 및 파렛트 이송',
      startTime: '2026-10-20 09:00',
      endTime: '2026-10-20 12:00',
      hasLicense: true,
      preCheckCompleted: true,
    });

    expect(log.status).toBe('REQUESTED');
    expect(log.equipmentType).toBe('지게차');
    expect(log.workerName).toBe('Nguyen Van An');
  });

  it('should allow admin to approve and reject equipment usage', () => {
    const log = EquipmentUsageLog.create({
      id: 'eq-log-2',
      equipmentType: '고소작업대',
      workerId: 'w-2',
      workerName: 'Batbayar Bold',
      purpose: '천장 조명 교체',
      startTime: '2026-10-20 14:00',
      endTime: '2026-10-20 16:00',
    });

    log.approve('김공장장 (안전관리자)');
    expect(log.status).toBe('APPROVED');
    expect(log.approvedBy).toBe('김공장장 (안전관리자)');
    expect(log.approvedAt).toBeDefined();

    log.reject('안전모 미착용 및 면허 미확인', '김공장장 (안전관리자)');
    expect(log.status).toBe('REJECTED');
    expect(log.rejectReason).toBe('안전모 미착용 및 면허 미확인');
  });
});
