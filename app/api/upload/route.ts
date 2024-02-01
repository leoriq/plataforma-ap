import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { NextResponse, type NextRequest } from 'next/server'
import { ZodError } from 'zod'
import { env } from '~/env.mjs'
import { UploadRequestZod } from '~/schemas/UploadRequest'
import { getServerAuthSession } from '~/server/auth'
import { prisma } from '~/server/db'
import { r2 } from '~/server/r2'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerAuthSession()
    if (!session)
      return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 })
    const requestingUser = await prisma.user.findUnique({
      where: { accessToken: session.user.accessToken },
    })
    if (!requestingUser)
      return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 })

    const data = UploadRequestZod.parse(await request.json())

    const dbFile = await prisma.file.create({
      data: {
        name: data.name,
        title: data.title,
        uploadedById: requestingUser.id,
      },
    })

    const url = await getSignedUrl(
      r2,
      new PutObjectCommand({
        Bucket: env.R2_BUCKET_NAME,
        Key: dbFile.id,
        ContentType: data.type,
      }),
      { expiresIn: 3600 }
    )

    return NextResponse.json({ url, id: dbFile.id })
  } catch (error) {
    if (error instanceof ZodError)
      return NextResponse.json(error.format(), { status: 400 })

    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
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
