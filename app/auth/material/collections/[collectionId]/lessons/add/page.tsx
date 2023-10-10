import CreateLessonForm from './components/CreateLessonForm'

export default function CreateLessonPage({
  params,
}: {
  params: { collectionId: string }
}) {
  const { collectionId } = params
  if (!collectionId) {
    return <h1>Lesson collection id is required</h1>
  }

  return (
    <>
      <h1>Create Lesson</h1>
      <CreateLessonForm collectionId={collectionId} />
    </>
  )
}
