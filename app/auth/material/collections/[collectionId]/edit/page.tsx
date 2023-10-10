import { prisma } from '~/server/db'
import EditCollectionForm from './components/EditCollectionForm'

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

  return (
    <>
      <h1>Edit Collection</h1>
      <EditCollectionForm collection={collection} />
    </>
  )
}
