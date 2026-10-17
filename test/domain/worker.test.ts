import { describe, it, expect } from 'vitest';
import { Worker } from '@/domain/entities/Worker';

describe('Worker Domain Entity', () => {
  it('should create a new worker with PENDING_APPROVAL status', () => {
    const worker = Worker.create({
      id: 'w-1',
      name: 'Nguyen Van A',
      koreanName: '응우옌',
      alienRegNumber: '950101-5123456',
      phoneNumber: '010-1234-5678',
      nationality: 'VN',
      visaType: 'E-9',
      contractStartDate: '2024-01-01',
      contractEndDate: '2026-12-31',
      departureDate: '2027-01-15',
      specialHealthCheckDate: '2026-11-20',
    });

    expect(worker.status).toBe('PENDING_APPROVAL');
    expect(worker.phoneNumber).toBe('010-1234-5678');
  });

  it('should approve worker when requested by admin', () => {
    const worker = Worker.create({
      id: 'w-1',
      name: 'Nguyen Van A',
      phoneNumber: '010-1234-5678',
      nationality: 'VN',
      visaType: 'E-9',
      contractStartDate: '2024-01-01',
      contractEndDate: '2026-12-31',
    });

    worker.approve();
    expect(worker.status).toBe('ACTIVE');
  });

  it('should calculate remaining days until visa expiry correctly', () => {
    const worker = Worker.create({
      id: 'w-1',
      name: 'Nguyen Van A',
      phoneNumber: '010-1234-5678',
      nationality: 'VN',
      visaType: 'E-9',
      contractStartDate: '2024-01-01',
      contractEndDate: '2026-12-15',
    });

    // Reference date: 2026-10-15 (61 days left)
    const referenceDate = new Date('2026-10-15T00:00:00Z');
    const remainingDays = worker.getDaysUntilContractEnd(referenceDate);
    expect(remainingDays).toBe(61);
    expect(worker.isVisaExpiringSoon(remainingDays)).toBe(true); // Within 2 months (60-61 days)
  });

  it('should support bloodType, reEntryAllowed and South Korea nationality', () => {
    const worker = Worker.create({
      id: 'w-kr-1',
      name: '홍길동',
      koreanName: '홍길동',
      alienRegNumber: '900101-1234567',
      phoneNumber: '010-1111-2222',
      nationality: 'KR',
      visaType: '내국인',
      contractStartDate: '2024-01-01',
      contractEndDate: '2030-12-31',
      bloodType: 'O',
      reEntryAllowed: true,
    });

    expect(worker.nationality).toBe('KR');
    expect(worker.bloodType).toBe('O');
    expect(worker.reEntryAllowed).toBe(true);
  });

  it('should update worker information correctly', () => {
    const worker = Worker.create({
      id: 'w-2',
      name: 'Batbayar',
      phoneNumber: '010-1111-1111',
      nationality: 'MN',
      visaType: 'E-9',
      contractStartDate: '2024-01-01',
      contractEndDate: '2026-12-31',
      bloodType: 'A',
      reEntryAllowed: false,
    });

    worker.update({
      name: 'Batbayar Bold',
      koreanName: '바트볼드',
      bloodType: 'B',
      reEntryAllowed: true,
      alienRegNumber: '920820-5982134',
    });

    expect(worker.name).toBe('Batbayar Bold');
    expect(worker.koreanName).toBe('바트볼드');
    expect(worker.bloodType).toBe('B');
    expect(worker.reEntryAllowed).toBe(true);
    expect(worker.alienRegNumber).toBe('920820-5982134');
  });
});

