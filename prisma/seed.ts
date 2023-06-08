import { PrismaClient } from '@prisma/client'
import { hash } from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  const password = await hash('password123', 12)
  await prisma.user.upsert({
    where: { email: 'coord@admin.com' },
    update: {},
    create: {
      email: 'coord@admin.com',
      password,
      role: 'COORDINATOR',
    },
  })
  await prisma.user.upsert({
    where: { email: 'repInst@admin.com' },
    update: {},
    create: {
      email: 'repInst@admin.com',
      password,
      role: 'REP_INSTRUCTOR',
    },
  })
  await prisma.user.upsert({
    where: { email: 'inst@admin.com' },
    update: {},
    create: {
      email: 'inst@admin.com',
      password,
      role: 'INSTRUCTOR',
    },
  })
  await prisma.user.upsert({
    where: { email: 'mat@admin.com' },
    update: {},
    create: {
      email: 'mat@admin.com',
      password,
      role: 'MATERIAL',
    },
  })
  await prisma.user.upsert({
    where: { email: 'student@admin.com' },
    update: {},
    create: {
      email: 'student@admin.com',
      password,
      role: 'STUDENT',
    },
  })
}
main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
