import AddStudentForm from './components/AddStudentForm'

export default function AddStudentsPage({
  params,
}: {
  params: { classId: string }
}) {
  const { classId } = params

  return (
    <>
      <h1>Add Student</h1>
      <AddStudentForm classId={classId} />
    </>
  )
}
