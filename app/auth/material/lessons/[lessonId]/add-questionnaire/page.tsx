import QuestionnaireForm from '~/components/organisms/QuestionnaireForm'

export default function CreateQuestionnairePage({
  params,
}: {
  params: { lessonId: string }
}) {
  const { lessonId } = params
  if (!lessonId) {
    return <h1>Lesson id is required</h1>
  }

  return (
    <>
      <QuestionnaireForm lessonId={lessonId} />
    </>
  )
}
