import type { Metadata } from 'next';
import { Toaster } from 'sonner';
import './globals.css';
import Providers from './providers';

export const metadata: Metadata = {
  title: '뚠뚠 - 외식 프랜차이즈 운영 지원 대시보드',
  description: 'F&B 브랜드의 매출, 매장, 직원, 재고, 고객 데이터를 통합 관리하는 운영 대시보드',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html suppressHydrationWarning lang="ko">
      <body suppressHydrationWarning className="antialiased">
        <Providers>
          {children}
          <Toaster position="top-right" richColors />
        </Providers>
      </body>
    </html>
  );
}
