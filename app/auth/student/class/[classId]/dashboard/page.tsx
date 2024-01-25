import { redirect } from 'next/navigation'

export default async function StudentDashboard({
  params,
}: {
  params: { classId: string }
}) {
  const { classId } = params
  if (!classId || classId === 'redirect')
    redirect('/auth/student?redirect=dashboard')

  return (
    <div>
      <h1>Student Dashboard</h1>
    </div>
  )
}
