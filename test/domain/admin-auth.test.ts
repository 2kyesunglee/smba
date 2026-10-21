import { describe, it, expect, beforeEach } from 'vitest';
import { AdminAuthService } from '@/infrastructure/services/AdminAuthService';

describe('AdminAuthService (관리자 인증 및 비밀번호 관리)', () => {
  let authService: AdminAuthService;

  beforeEach(() => {
    // Reset or clean instance
    authService = new AdminAuthService();
    authService.resetDefault();
  });

  it('기본 관리자 계정(admin / 1004)으로 올바르게 로그인 성공해야 한다', () => {
    const result = authService.login('admin', '1004');
    expect(result.success).toBe(true);
    expect(result.user?.username).toBe('admin');
    expect(result.token).toBeDefined();
  });

  it('잘못된 비밀번호나 ID로 로그인 시 실패해야 한다', () => {
    const wrongPw = authService.login('admin', 'wrong_password');
    expect(wrongPw.success).toBe(false);
    expect(wrongPw.message).toBeDefined();

    const wrongUser = authService.login('unknown_user', '1004');
    expect(wrongUser.success).toBe(false);
  });

  it('로그인 후 비밀번호 변경 시 새 비밀번호로 변경되어야 하며 구 비밀번호로는 로그인 실패해야 한다', () => {
    const changeResult = authService.changePassword('admin', '1004', 'newPassword2026!');
    expect(changeResult.success).toBe(true);

    // Old password should fail
    const oldLogin = authService.login('admin', '1004');
    expect(oldLogin.success).toBe(false);

    // New password should succeed
    const newLogin = authService.login('admin', 'newPassword2026!');
    expect(newLogin.success).toBe(true);
  });

  it('현재 비밀번호가 틀리면 비밀번호 변경이 거부되어야 한다', () => {
    const changeResult = authService.changePassword('admin', 'wrong_current_pw', 'newPassword2026!');
    expect(changeResult.success).toBe(false);
  });
});
