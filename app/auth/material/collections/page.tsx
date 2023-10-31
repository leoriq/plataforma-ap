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
      <h1>Collections</h1>
      <ul>
        {collections.map((collection) => (
          <li key={collection.id}>
            <h2>{collection.name}</h2>
            <p>{collection.description}</p>
            {collection.Lessons.map((lesson) => (
              <Link
                href={`/material/collections/${collection.id}/lessons/${lesson.id}`}
                key={lesson.id}
              >
                {lesson.title}
              </Link>
            ))}
            <Link href={`/material/collections/${collection.id}/lessons/add`}>
              Criar uma aula
            </Link>
          </li>
        ))}
      </ul>
      <Link href="/material/collections/add">Criar uma coleção</Link>
    </>
  )
}
