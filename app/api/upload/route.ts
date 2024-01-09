import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
} from '@aws-sdk/client-s3'
import { NextResponse, type NextRequest } from 'next/server'
import { env } from '~/env.mjs'
import { getServerAuthSession } from '~/server/auth'
import { prisma } from '~/server/db'
import { r2 } from '~/server/r2'

export async function POST(request: NextRequest) {
  const session = await getServerAuthSession()
  if (!session)
    return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 })
  const requestingUser = await prisma.user.findUnique({
    where: { accessToken: session.user.accessToken },
  })
  if (!requestingUser)
    return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 })

  const data = await request.formData()
  const file: File | null = data.get('file') as unknown as File
  const title = data.get('title') as string

  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)

  const contentType = file.type
  console.log(contentType)

  const dbFile = await prisma.file.create({
    data: {
      name: file.name,
      title,
      uploadedById: requestingUser.id,
    },
  })

  await r2.send(
    new PutObjectCommand({
      Bucket: env.R2_BUCKET_NAME,
      Key: dbFile.id,
      Body: buffer,
      ContentType: contentType,
    })
  )

  return NextResponse.json({ file: dbFile })
}

export async function GET(request: NextRequest) {
  // const session = await getServerAuthSession()
  // if (!session)
  //   return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 })
  // const requestingUser = await prisma.user.findUnique({
  //   where: { accessToken: session.user.accessToken },
  // })
  // if (!requestingUser)
  //   return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 })

  const id = request.nextUrl.searchParams.get('id')
  if (!id)
    return NextResponse.json({ error: 'No id provided' }, { status: 400 })

  const fileDb = await prisma.file.findUnique({
    where: { id },
  })
  if (!fileDb)
    return NextResponse.json(
      { error: 'File not found in database' },
      { status: 404 }
    )

  const fileR2 = await r2.send(
    new GetObjectCommand({
      Bucket: env.R2_BUCKET_NAME,
      Key: id,
      ResponseContentDisposition: `attachment; filename=${fileDb.name}`,
    })
  )
  if (!fileR2.Body)
    return NextResponse.json(
      { error: 'File not found in bucket' },
      { status: 404 }
    )

  const response = new NextResponse(fileR2.Body.transformToWebStream())
  response.headers.set('Content-Type', fileR2.ContentType || '')
  response.headers.set(
    'Content-Length',
    fileR2.ContentLength?.toString() || '0'
  )
  return response
}

export async function DELETE(request: NextRequest) {
  const session = await getServerAuthSession()
  if (!session)
    return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 })
  const requestingUser = await prisma.user.findUnique({
    where: { accessToken: session.user.accessToken },
  })
  if (!requestingUser)
    return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 })

  const id = request.nextUrl.searchParams.get('id')
  if (!id)
    return NextResponse.json({ error: 'No id provided' }, { status: 400 })

  const fileDb = await prisma.file.findUnique({
    where: { id },
  })
  if (!fileDb)
    return NextResponse.json(
      { error: 'File not found in database' },
      { status: 404 }
    )

  if (fileDb.uploadedById !== requestingUser.id) {
    if (
      requestingUser.roles.length < 1 ||
      (requestingUser.roles.length === 1 &&
        requestingUser.roles.includes('STUDENT'))
    ) {
      return NextResponse.json(
        { error: 'You do not have permission to delete this file' },
        { status: 403 }
      )
    }
  }

  await prisma.file.delete({
    where: { id },
  })

  await r2.send(
    new DeleteObjectCommand({
      Bucket: env.R2_BUCKET_NAME,
      Key: id,
    })
  )

  return NextResponse.json({ message: 'File deleted' })
}
