import { UserRole, AuthTokenPayload } from '@/domain/value-objects/UserRole';

export class JwtAuthService {
  private readonly secretKey: string;

  constructor(secretKey: string = 'safeguard-ai-super-secure-jwt-secret-key-2026') {
    this.secretKey = secretKey;
  }

  public signToken(payload: AuthTokenPayload, expiresInSeconds: number = 86400): string {
    const header = {
      alg: 'HS256',
      typ: 'JWT',
    };

    const exp = Math.floor(Date.now() / 1000) + expiresInSeconds;
    const fullPayload = {
      ...payload,
      exp,
      iat: Math.floor(Date.now() / 1000),
    };

    const encodedHeader = this.base64UrlEncode(JSON.stringify(header));
    const encodedPayload = this.base64UrlEncode(JSON.stringify(fullPayload));
    const signature = this.simpleHmac(encodedHeader + '.' + encodedPayload, this.secretKey);

    return `${encodedHeader}.${encodedPayload}.${signature}`;
  }

  public verifyToken(token: string): AuthTokenPayload | null {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;

      const [encodedHeader, encodedPayload, signature] = parts;
      const expectedSig = this.simpleHmac(encodedHeader + '.' + encodedPayload, this.secretKey);

      if (signature !== expectedSig) {
        return null;
      }

      const payloadStr = this.base64UrlDecode(encodedPayload);
      const payload = JSON.parse(payloadStr);

      if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
        return null; // Expired
      }

      return {
        userId: payload.userId,
        role: payload.role as UserRole,
        phoneNumber: payload.phoneNumber,
        workerId: payload.workerId,
        name: payload.name,
      };
    } catch {
      return null;
    }
  }

  private base64UrlEncode(str: string): string {
    if (typeof window !== 'undefined') {
      return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (_, p1) => String.fromCharCode(parseInt(p1, 16))))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
    }
    return Buffer.from(str)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  }

  private base64UrlDecode(str: string): string {
    let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) {
      base64 += '=';
    }
    if (typeof window !== 'undefined') {
      return decodeURIComponent(
        Array.prototype.map.call(atob(base64), (c: string) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')
      );
    }
    return Buffer.from(base64, 'base64').toString('utf8');
  }

  private simpleHmac(data: string, key: string): string {
    let hash = 0;
    const combined = data + ':' + key;
    for (let i = 0; i < combined.length; i++) {
      const char = combined.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0;
    }
    return Math.abs(hash).toString(36);
  }
}
