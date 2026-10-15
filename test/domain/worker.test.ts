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
});
