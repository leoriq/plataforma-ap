import Link from 'next/link'
import { prisma } from '~/server/db'

export default async function MaterialCollectionsPage() {
  const collections = await prisma.lessonCollection.findMany({
    include: {
      Lessons: true,
    },
  })

  return (
    <>
      <h1>Material Collections</h1>
      <ul>
        {collections.map((collection) => (
          <li key={collection.id}>
            <h2>{collection.name}</h2>
            <p>{collection.description}</p>
            {collection.Lessons.map((lesson) => (
              <p key={lesson.id}>{lesson.title}</p>
            ))}
            <Link
              href={`/material/create-lesson?collectionId=${collection.id}`}
            >
              Criar uma aula
            </Link>
          </li>
        ))}
      </ul>
    </>
  )
}
