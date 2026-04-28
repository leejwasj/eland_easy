'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Settings,
  ShieldCheck,
  LogOut,
  ChevronRight,
} from 'lucide-react'
import { logout } from '@/app/(auth)/login/actions'
import { Button } from '@/components/ui/button'

const navItems = [
  { href: '/dashboard', label: '전체 대시보드', icon: LayoutDashboard, exact: true },
  { href: '/settings', label: '설정', icon: Settings },
  { href: '/admin', label: '관리자', icon: ShieldCheck },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-60 bg-[#1E3A5F] text-white flex flex-col shrink-0">
      {/* 로고 */}
      <div className="px-6 py-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">E</span>
          </div>
          <div>
            <p className="text-sm font-semibold leading-tight">이랜드 리테일</p>
            <p className="text-xs text-white/50">카테고리 추천</p>
          </div>
        </div>
      </div>

      {/* 네비게이션 */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ href, label, icon: Icon, exact }) => {
          const isActive = exact ? pathname === href : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors group',
                isActive
                  ? 'bg-white/15 text-white'
                  : 'text-white/60 hover:bg-white/10 hover:text-white'
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="flex-1">{label}</span>
              {isActive && <ChevronRight className="w-3.5 h-3.5 opacity-50" />}
            </Link>
          )
        })}
      </nav>

      {/* 로그아웃 */}
      <div className="px-3 pb-4 border-t border-white/10 pt-4">
        <form action={logout}>
          <Button
            type="submit"
            variant="ghost"
            className="w-full justify-start gap-3 text-white/60 hover:text-white hover:bg-white/10 text-sm font-medium"
          >
            <LogOut className="w-4 h-4" />
            로그아웃
          </Button>
        </form>
      </div>
    </aside>
  )
}
