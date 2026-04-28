import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/providers'

const geist = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: '이랜드 리테일 | 카테고리 추천 대시보드',
  description: '상권 데이터 기반 공백 카테고리 분석 및 브랜드 추천 시스템',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ko" className={`${geist.variable} h-full antialiased`}>
      <body className="min-h-full bg-slate-50">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
