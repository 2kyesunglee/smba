import { describe, it, expect, vi } from 'vitest';
import { compressImageFile } from '@/infrastructure/utils/imageCompressor';

describe('Image Compressor Utility (Payload 최소화 - Red Phase)', () => {
  it('1. 파일이 주어지면 DataURL 문자열을 반환해야 한다', async () => {
    const mockFile = new Blob(['mock image content'], { type: 'image/png' }) as File;

    // Node 환경에서는 Canvas API가 없을 수 있으므로 FileReader fallback 또는 mock을 통해 정상 동작 확인
    const result = await compressImageFile(mockFile, 800, 0.7);
    expect(result).toBeDefined();
    expect(typeof result).toBe('string');
  });

  it('2. Canvas가 사용 가능한 환경에서는 압축된 JPEG dataURL을 반환해야 한다', async () => {
    const mockDrawImage = vi.fn();
    const mockToDataURL = vi.fn().mockReturnValue('data:image/jpeg;base64,compressed123');

    // Mock HTMLCanvasElement
    const originalCreateElement = (global as any).document?.createElement;
    (global as any).document = {
      createElement: vi.fn().mockImplementation((tag: string) => {
        if (tag === 'canvas') {
          return {
            width: 0,
            height: 0,
            getContext: () => ({
              drawImage: mockDrawImage,
            }),
            toDataURL: mockToDataURL,
          };
        }
        return {};
      }),
    };

    // Mock FileReader
    (global as any).FileReader = class {
      onload: ((e: any) => void) | null = null;
      readAsDataURL() {
        setTimeout(() => {
          if (this.onload) {
            this.onload({ target: { result: 'data:image/jpeg;base64,rawdata' } });
          }
        }, 5);
      }
    };

    // Mock Image
    (global as any).Image = class {
      width = 1600;
      height = 1200;
      onload: (() => void) | null = null;
      set src(_val: string) {
        setTimeout(() => {
          if (this.onload) this.onload();
        }, 10);
      }
    };

    const mockFile = new Blob(['fake image data'], { type: 'image/jpeg' }) as File;
    const result = await compressImageFile(mockFile, 800, 0.7);

    expect(result).toBe('data:image/jpeg;base64,compressed123');
  });
});
