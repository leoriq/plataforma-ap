import CreateLessonForm from './components/CreateLessonForm'

export default function CreateLessonPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined }
}) {
  if (!searchParams.collectionId) {
    return <h1>Lesson collection id is required</h1>
  }

  return (
    <>
      <h1>Create Lesson</h1>
      <CreateLessonForm collectionId={searchParams.collectionId} />
    </>
  )
}
