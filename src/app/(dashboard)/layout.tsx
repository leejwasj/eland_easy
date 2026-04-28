export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="h-16 bg-[#1E3A5F] text-white flex items-center px-6 shrink-0">
        <span className="font-bold text-lg">이랜드 리테일 · 카테고리 추천</span>
      </header>
      <main className="flex-1 p-6">{children}</main>
    </div>
  )
}
