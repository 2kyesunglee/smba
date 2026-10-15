import { describe, it, expect } from 'vitest';
import { UserRole, AuthTokenPayload, verifyRolePermission } from '@/domain/value-objects/UserRole';

describe('UserRole Value Object & Auth Permissions', () => {
  it('should distinguish admin and senior/worker roles', () => {
    const adminUser: AuthTokenPayload = {
      userId: 'u-admin',
      role: UserRole.ADMIN,
      phoneNumber: '010-0000-0000',
    };

    const workerUser: AuthTokenPayload = {
      userId: 'u-worker',
      role: UserRole.WORKER,
      workerId: 'w-1',
      phoneNumber: '010-1234-5678',
    };

    const seniorUser: AuthTokenPayload = {
      userId: 'u-senior',
      role: UserRole.SENIOR_WORKER,
      workerId: 'w-2',
      phoneNumber: '010-9999-8888',
    };

    expect(verifyRolePermission(adminUser.role, 'APPROVE_PTW')).toBe(true);
    expect(verifyRolePermission(workerUser.role, 'APPROVE_PTW')).toBe(false);
    expect(verifyRolePermission(seniorUser.role, 'INSPECT_EQUIPMENT')).toBe(true);
  });
});
