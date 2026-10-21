export interface AdminUser {
  id: string;
  username: string;
  name: string;
  role: 'admin';
  lastPasswordChangedAt?: string;
}

export interface AdminAuthResult {
  success: boolean;
  message?: string;
  user?: AdminUser;
  token?: string;
}

const STORAGE_KEY_ADMIN_CREDS = 'smba_admin_credentials_v1';
const STORAGE_KEY_ADMIN_SESSION = 'smba_admin_session_v1';

export class AdminAuthService {
  private static defaultAdminUser: AdminUser = {
    id: 'admin-master',
    username: 'admin',
    name: '김공장장 (총괄 관리자)',
    role: 'admin',
    lastPasswordChangedAt: new Date().toISOString(),
  };

  private static currentPassword = '1004';
  private static currentUser: AdminUser = { ...AdminAuthService.defaultAdminUser };

  constructor() {
    this.loadFromStorage();
  }

  private isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
  }

  public resetDefault(): void {
    AdminAuthService.currentPassword = '1004';
    AdminAuthService.currentUser = { ...AdminAuthService.defaultAdminUser };
    if (this.isBrowser()) {
      window.localStorage.removeItem(STORAGE_KEY_ADMIN_CREDS);
      window.localStorage.removeItem(STORAGE_KEY_ADMIN_SESSION);
    }
  }

  private loadFromStorage(): void {
    if (!this.isBrowser()) return;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY_ADMIN_CREDS);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.password) {
          AdminAuthService.currentPassword = parsed.password;
        }
        if (parsed.user) {
          AdminAuthService.currentUser = parsed.user;
        }
      }
    } catch {
      // fallback to memory
    }
  }

  private saveToStorage(): void {
    if (!this.isBrowser()) return;
    try {
      window.localStorage.setItem(
        STORAGE_KEY_ADMIN_CREDS,
        JSON.stringify({
          password: AdminAuthService.currentPassword,
          user: AdminAuthService.currentUser,
        })
      );
    } catch {
      // storage unavailable
    }
  }

  public login(username: string, password: string): AdminAuthResult {
    this.loadFromStorage();
    if (username.trim() === 'admin' && password === AdminAuthService.currentPassword) {
      const token = `adm_token_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      if (this.isBrowser()) {
        window.localStorage.setItem(
          STORAGE_KEY_ADMIN_SESSION,
          JSON.stringify({
            token,
            user: AdminAuthService.currentUser,
            loggedInAt: new Date().toISOString(),
          })
        );
      }
      return {
        success: true,
        user: AdminAuthService.currentUser,
        token,
      };
    }

    return {
      success: false,
      message: '관리자 ID 또는 비밀번호가 일치하지 않습니다. (최초 ID: admin / PW: 1004)',
    };
  }

  public getSession(): { user: AdminUser; token: string } | null {
    if (!this.isBrowser()) return null;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY_ADMIN_SESSION);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.token && parsed.user) {
          return { user: parsed.user, token: parsed.token };
        }
      }
    } catch {
      return null;
    }
    return null;
  }

  public logout(): void {
    if (this.isBrowser()) {
      window.localStorage.removeItem(STORAGE_KEY_ADMIN_SESSION);
    }
  }

  public changePassword(username: string, currentPw: string, newPw: string): { success: boolean; message: string } {
    this.loadFromStorage();
    if (username.trim() !== 'admin') {
      return { success: false, message: '해당 관리자 계정을 찾을 수 없습니다.' };
    }

    if (currentPw !== AdminAuthService.currentPassword) {
      return { success: false, message: '현재 비밀번호가 일치하지 않습니다.' };
    }

    if (!newPw || newPw.length < 4) {
      return { success: false, message: '새 비밀번호는 4자리 이상이어야 합니다.' };
    }

    AdminAuthService.currentPassword = newPw;
    AdminAuthService.currentUser.lastPasswordChangedAt = new Date().toISOString();
    this.saveToStorage();

    return {
      success: true,
      message: '관리자 비밀번호가 성공적으로 변경되었습니다. 다음 로그인부터 적용됩니다.',
    };
  }
}
