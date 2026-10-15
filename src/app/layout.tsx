import type { Metadata } from 'next';
import './globals.css';
import { AppProvider } from '@/presentation/context/AppContext';

export const metadata: Metadata = {
  title: 'SafeGuard AI - 외국인 근로자 스마트 안전보건 및 설비 통합 관리 솔루션',
  description:
    '16개국 다국어 지원, 스마트폰 기반 계정 연동, 중대재해처벌법 대비 100% 디지털(Paperless) 안전·공정 관리 환경',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" className="dark">
      <body className="min-h-screen bg-[#0B0F19] text-gray-100 flex flex-col font-sans">
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
