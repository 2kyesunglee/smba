import { describe, it, expect } from 'vitest';
import { JwtAuthService } from '@/infrastructure/services/JwtAuthService';
import { UserRole } from '@/domain/value-objects/UserRole';

describe('JwtAuthService', () => {
  const jwt = new JwtAuthService();

  it('should issue and verify valid JWT for admin and guardian/worker roles', () => {
    const adminToken = jwt.signToken({
      userId: 'admin-1',
      role: UserRole.ADMIN,
      phoneNumber: '010-0000-0000',
      name: '김공장장',
    });

    const verifiedAdmin = jwt.verifyToken(adminToken);
    expect(verifiedAdmin).not.toBeNull();
    expect(verifiedAdmin?.role).toBe(UserRole.ADMIN);
    expect(verifiedAdmin?.name).toBe('김공장장');

    const workerToken = jwt.signToken({
      userId: 'user-worker-1',
      workerId: 'w-1',
      role: UserRole.WORKER,
      phoneNumber: '010-1234-5678',
      name: 'Nguyen Van A',
    });

    const verifiedWorker = jwt.verifyToken(workerToken);
    expect(verifiedWorker).not.toBeNull();
    expect(verifiedWorker?.role).toBe(UserRole.WORKER);
    expect(verifiedWorker?.workerId).toBe('w-1');
  });

  it('should reject tampered or invalid JWT', () => {
    const token = jwt.signToken({
      userId: 'test',
      role: UserRole.WORKER,
      phoneNumber: '010-1111-2222',
    });

    const tampered = token.slice(0, -3) + 'xyz';
    expect(jwt.verifyToken(tampered)).toBeNull();
  });
});
