import LessonForm from '~/components/organisms/LessonForm'

export default function CreateLessonPage({
  params,
}: {
  params: { collectionId: string }
}) {
  const { collectionId } = params
  if (!collectionId) {
    return <h1>Lesson collection id is required</h1>
  }

  return <LessonForm collectionId={collectionId} />
}
