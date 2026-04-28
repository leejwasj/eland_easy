export default async function BranchDetailPage({
  params,
}: {
  params: Promise<{ branchId: string }>
}) {
  const { branchId } = await params

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#1E3A5F] mb-6">지점 상세</h1>
      <p className="text-muted-foreground">지점 ID: {branchId}</p>
    </div>
  )
}
