import { describe, it, expect } from 'vitest';
import { PTWRequest } from '@/domain/entities/PTWRequest';
import { SOSAlert } from '@/domain/entities/SOSAlert';

describe('PTW & SOS Domain Logic', () => {
  it('should create PTW in REQUESTED status and allow admin approval', () => {
    const ptw = PTWRequest.create({
      id: 'ptw-1',
      ptwNumber: 'PTW-2026-001',
      workerId: 'w-1',
      workerName: 'Nguyen Van A',
      taskName: '스크러버 배관 고소 용접 작업',
      location: 'A동 화학탱크 상부',
      workDate: '2026-10-15',
      hazardFactors: '추락, 유해가스 누출, 화재',
      safetyMeasures: '안전대 착용, 가스농도 측정, 소화기 배치',
    });

    expect(ptw.status).toBe('REQUESTED');

    ptw.approve('admin-1');
    expect(ptw.status).toBe('APPROVED');
    expect(ptw.approvedBy).toBe('admin-1');
    expect(ptw.approvedAt).toBeDefined();
  });

  it('should trigger SOS alert and allow acknowledgment & resolution', () => {
    const sos = SOSAlert.create({
      id: 'sos-1',
      workerId: 'w-1',
      workerName: 'Nguyen Van A',
      phoneNumber: '010-1234-5678',
      location: 'A동 스크러버 배관 구역',
      message: '배관 가스 누출 의심 및 어지러움 호소',
    });

    expect(sos.status).toBe('TRIGGERED');
    expect(sos.isTriggered()).toBe(true);

    sos.acknowledge();
    expect(sos.status).toBe('ACKNOWLEDGED');

    sos.resolve();
    expect(sos.status).toBe('RESOLVED');
    expect(sos.isTriggered()).toBe(false);
  });
});
