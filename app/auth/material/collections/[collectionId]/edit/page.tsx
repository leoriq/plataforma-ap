import { prisma } from '~/server/db'
import CollectionForm from '~/components/molecules/CollectionForm'

export default async function EditCollectionPage({
  params,
}: {
  params: { collectionId: string }
}) {
  const { collectionId } = params
  const collection = await prisma.lessonCollection.findUnique({
    where: {
      id: collectionId,
    },
  })
  if (!collection) {
    return <div>Collection not found</div>
  }

  const formattedCollection = {
    ...collection,
    description: collection.description ?? undefined,
  }

  return <CollectionForm collection={formattedCollection} />
}
