import CreateQuestionnaireForm from './components/CreateQuestionnaireForm'

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
      <h1>Create Questionnaire</h1>
      <CreateQuestionnaireForm lessonId={lessonId} />
    </>
  )
}
