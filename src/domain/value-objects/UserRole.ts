export enum UserRole {
  ADMIN = 'admin',
  WORKER = 'worker',
  SENIOR_WORKER = 'senior_worker',
  GUARDIAN = 'guardian',
}

export type PermissionAction =
  | 'APPROVE_PTW'
  | 'APPROVE_WORKER'
  | 'CREATE_TEMPLATE'
  | 'INSPECT_EQUIPMENT'
  | 'TRIGGER_SOS'
  | 'SUBMIT_WORK_REPORT';

export interface AuthTokenPayload {
  userId: string;
  role: UserRole;
  phoneNumber: string;
  workerId?: string;
  name?: string;
}

export function verifyRolePermission(role: UserRole, action: PermissionAction): boolean {
  switch (action) {
    case 'APPROVE_PTW':
    case 'APPROVE_WORKER':
    case 'CREATE_TEMPLATE':
      return role === UserRole.ADMIN;
    case 'INSPECT_EQUIPMENT':
      return role === UserRole.ADMIN || role === UserRole.SENIOR_WORKER || role === UserRole.WORKER;
    case 'TRIGGER_SOS':
    case 'SUBMIT_WORK_REPORT':
      return true;
    default:
      return false;
  }
}
