import { prisma } from '~/server/db'

export default async function MaterialLessonPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined }
}) {
  if (!searchParams.id) {
    return <h1>Id is required</h1>
  }

  const lesson = await prisma.lesson.findUnique({
    where: {
      id: searchParams.id,
    },
  })

  if (!lesson) {
    return <h1>Lesson not found</h1>
  }

  return (
    <>
      <h1>{lesson.title}</h1>
      <p>{lesson.body}</p>
      {lesson.videoUrl.map((url, index) => (
        <iframe
          key={index}
          width="560"
          height="315"
          src={`https://www.youtube.com/embed/${url}`}
          title="YouTube video player"
          allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      ))}
    </>
  )
}
