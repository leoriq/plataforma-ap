import { prisma } from '~/server/db'

import styles from './CollectionsPage.module.scss'

import CollectionItem from '~/components/molecules/CollectionItem'

export default async function CollectionsPage() {
  const collections = await prisma.lessonCollection.findMany({
    include: {
      Lessons: {
        orderBy: {
          publicationDate: 'asc',
        },
      },
    },
  })

  return (
    <div className={styles.container}>
      <h1>Collections</h1>
      <ul>
        {collections.map((collection) => (
          <CollectionItem collection={collection} key={collection.id} />
        ))}
      </ul>
    </div>
  )
}
