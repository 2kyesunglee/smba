/**
 * 클라이언트 사이드 이미지 리사이징 및 압축 유틸리티
 * 
 * Vercel Fast Origin Transfer 및 네트워크 페이로드 최소화 (Payload Optimization)
 * 사용자가 고화질 카메라로 촬영한 대용량(5MB~15MB) 사진을 브라우저 메모리 상에서
 * 최대 너비/높이 800px 및 JPEG 품질 70%로 압축하여 수십 KB 수준(95% 이상 감축)으로 경량화합니다.
 */
export async function compressImageFile(
  file: File | Blob,
  maxDimension = 800,
  quality = 0.7
): Promise<string> {
  return new Promise((resolve) => {
    if (typeof FileReader === 'undefined') {
      resolve('');
      return;
    }

    const reader = new FileReader();

    reader.onload = (e) => {
      const rawDataUrl = e.target?.result as string;
      if (!rawDataUrl) {
        resolve('');
        return;
      }

      // 브라우저 DOM 환경(Image & Canvas) 확인
      if (typeof Image === 'undefined' || typeof document === 'undefined') {
        resolve(rawDataUrl);
        return;
      }

      try {
        const img = new Image();
        img.onload = () => {
          let width = img.width || 800;
          let height = img.height || 600;

          if (width > maxDimension || height > maxDimension) {
            if (width > height) {
              height = Math.round((height * maxDimension) / width);
              width = maxDimension;
            } else {
              width = Math.round((width * maxDimension) / height);
              height = maxDimension;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext ? canvas.getContext('2d') : null;
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const compressed = canvas.toDataURL('image/jpeg', quality);
            resolve(compressed);
          } else {
            resolve(rawDataUrl);
          }
        };

        img.onerror = () => {
          resolve(rawDataUrl);
        };

        img.src = rawDataUrl;
      } catch {
        resolve(rawDataUrl);
      }
    };

    reader.onerror = () => {
      resolve('');
    };

    reader.readAsDataURL(file);
  });
}
