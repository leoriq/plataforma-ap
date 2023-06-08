import { prisma } from '~/server/db'
import DeleteUserButton from '../components/DeleteUserButton'

export default async function MaterialManagement() {
  const materials = await prisma.user.findMany({
    where: {
      role: 'MATERIAL',
    },
    select: {
      id: true,
      email: true,
      role: true,
    },
  })

  return (
    <>
      <h1>Material</h1>
      <ul>
        {materials.map((material) => (
          <li key={material.email}>
            {material.email} - {material.role}
            <DeleteUserButton id={material.id} />
          </li>
        ))}
      </ul>
      <a href="material/add">Add Material</a>
    </>
  )
}
