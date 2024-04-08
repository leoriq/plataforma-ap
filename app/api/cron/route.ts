import { DeleteObjectsCommand } from '@aws-sdk/client-s3'
import { type NextRequest, NextResponse } from 'next/server'
import { prisma } from '~/server/db'
import { r2 } from '~/server/r2'
import { env } from '~/env.mjs'

export async function GET(request: NextRequest) {
  if (request.headers.get('Authorization') !== `Bearer ${env.CRON_SECRET}`) {
    return NextResponse.json('Unauthorized', { status: 401 })
  }

  try {
    const unusedFiles = await prisma.file.findMany({
      where: {
        ProfilePictureOf: {
          is: null,
        },
        QuestionAudioOf: {
          is: null,
        },
        QuestionImageOf: {
          is: null,
        },
        UserAnswerOf: {
          is: null,
        },
        LessonDocumentOf: {
          is: null,
        },
      },
      select: {
        id: true,
      },
    })

    if (unusedFiles.length === 0) {
      return NextResponse.json('OK', { status: 200 })
    }

    await r2.send(
      new DeleteObjectsCommand({
        Bucket: env.R2_BUCKET_NAME,
        Delete: {
          Objects: unusedFiles.map((file) => ({ Key: file.id })),
        },
      })
    )

    await prisma.file.deleteMany({
      where: {
        id: {
          in: unusedFiles.map((file) => file.id),
        },
      },
    })

    return NextResponse.json('OK', { status: 200 })
  } catch (error) {
    console.error(error)
    return NextResponse.json('Internal Server Error', { status: 500 })
  }
}
