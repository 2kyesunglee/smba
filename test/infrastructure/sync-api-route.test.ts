import { describe, it, expect } from 'vitest';
import { GET, POST } from '@/app/api/sync/route';

describe('Server API Route /api/sync ETag & Fast Origin Transfer 최적화 테스트 (Red Phase)', () => {
  it('1. GET 요청 시 ETag와 Cache-Control 헤더를 반환해야 한다', async () => {
    const req = new Request('http://localhost:3000/api/sync', {
      method: 'GET',
    });

    const res = await GET(req);
    expect(res.headers.get('etag')).toBeDefined();
    expect(res.headers.get('cache-control')).toContain('no-cache');
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.version).toBeDefined();
  });

  it('2. 클라이언트가 최신 If-None-Match ETag를 전송하면 304 Not Modified를 반환해야 한다 (Body 없음 -> Fast Origin Transfer 100% 절감)', async () => {
    // 1차 GET으로 현재 ETag 조회
    const req1 = new Request('http://localhost:3000/api/sync', { method: 'GET' });
    const res1 = await GET(req1);
    const etag = res1.headers.get('etag');
    expect(etag).toBeTruthy();

    // 2차 GET: If-None-Match 헤더 포함
    const req2 = new Request('http://localhost:3000/api/sync', {
      method: 'GET',
      headers: {
        'if-none-match': etag as string,
      },
    });

    const res2 = await GET(req2);
    expect(res2.status).toBe(304);
  });

  it('3. POST 요청 시 응답은 전체 데이터(Echo) 대신 경량 메타데이터(Data projection)만 반환해야 한다', async () => {
    const postBody = {
      workers: [{ id: 'w-test-projection', name: 'Optimized Worker' }],
    };

    const req = new Request('http://localhost:3000/api/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(postBody),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    expect(res.headers.get('etag')).toBeDefined();
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.version).toBeDefined();
    // 데이터 페이로드(전체 DB 객체)가 제거되어 응답 크기가 최소화되어야 함
    expect(json.data).toBeUndefined();
  });
});
