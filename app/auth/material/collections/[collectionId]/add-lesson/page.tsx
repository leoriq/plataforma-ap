import CreateLessonForm from '~/components/molecules/CreateLessonForm'

export default function CreateLessonPage({
  params,
}: {
  params: { collectionId: string }
}) {
  const { collectionId } = params
  if (!collectionId) {
    return <h1>Lesson collection id is required</h1>
  }

  return <CreateLessonForm collectionId={collectionId} />
}
