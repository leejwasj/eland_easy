export default async function UploadPage({
  params,
}: {
  params: Promise<{ branchId: string }>
}) {
  const { branchId } = await params

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#1E3A5F] mb-6">데이터 업로드</h1>
      <p className="text-muted-foreground">지점 ID: {branchId} — 업로드 화면 구현 예정</p>
    </div>
  )
}
