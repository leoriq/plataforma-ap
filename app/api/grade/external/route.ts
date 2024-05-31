import { redirect } from 'next/navigation'
import { NextResponse, type NextRequest } from 'next/server'
import { ZodError } from 'zod'
import { ExternalGradeZod } from '~/schemas/ExternalGrade'
import { getServerAuthSession } from '~/server/auth'
import { prisma } from '~/server/db'

export async function POST(request: NextRequest) {
    try {
        const session = await getServerAuthSession()
        if (!session)
            return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 })

        const requestingUser = await prisma.user.findUnique({
            where: { accessToken: session.user.accessToken },
        })
        if (!requestingUser) redirect('/sign-out')

        const externalGrade = ExternalGradeZod.parse(await request.json())

        const isAuthorized =
            requestingUser.roles.includes('INSTRUCTOR') ||
            requestingUser.roles.includes('REP_INSTRUCTOR') ||
            requestingUser.roles.includes('COORDINATOR')

        if (!isAuthorized || !externalGrade) {
            return NextResponse.json({ error: 'Invalid data' }, { status: 400 })
        }

        const student = await prisma.user.findUnique({
            where: { id: externalGrade.studentUserId },
        });

        if (!student) {
            return NextResponse.json({ error: 'Student not found' }, { status: 404 });
        }


        await prisma.externalGrade.create({
            data: {
                studentUserId: externalGrade.studentUserId,
                grade: externalGrade.grade,
                weight: externalGrade.weight,
                description: externalGrade.description,
            }
        });

        return NextResponse.json({ success: true })

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
    try {
        const session = await getServerAuthSession()
        if (!session)
            return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 })

        const requestingUser = await prisma.user.findUnique({
            where: { accessToken: session.user.accessToken },
        })
        if (!requestingUser) redirect('/sign-out')

        const url = new URL(request.url)
        const studentUserId = url.searchParams.get('studentUserId') as string

        if (!studentUserId) {
            return NextResponse.json({ error: 'Invalid data' }, { status: 400 })
        }

        const isAuthorized =
            requestingUser.roles.includes('INSTRUCTOR') ||
            requestingUser.roles.includes('REP_INSTRUCTOR') ||
            requestingUser.roles.includes('COORDINATOR')

        if (isAuthorized) {
            const externalGrades = await prisma.externalGrade.findMany({
                where: { studentUserId: studentUserId },
            })

            return NextResponse.json({ externalGrades })
        }

        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    } catch (error) {
        if (error instanceof ZodError)
            return NextResponse.json(error.format(), { status: 400 })

        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        )
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const session = await getServerAuthSession()
        if (!session)
            return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 })

        const requestingUser = await prisma.user.findUnique({
            where: { accessToken: session.user.accessToken },
        })
        if (!requestingUser) redirect('/sign-out')

        const url = new URL(request.url)
        const externalGradeId = url.searchParams.get('externalGradeId') as string

        if (!externalGradeId) {
            return NextResponse.json({ error: 'Invalid data' }, { status: 400 })
        }

        const existingExternalGrade = await prisma.externalGrade.findUnique({
            where: { id: externalGradeId },
        });

        if (!existingExternalGrade) {
            return NextResponse.json({ error: 'External grade not found' }, { status: 404 });
        }

        const isAuthorized =
            requestingUser.roles.includes('INSTRUCTOR') ||
            requestingUser.roles.includes('REP_INSTRUCTOR') ||
            requestingUser.roles.includes('COORDINATOR')

        if (isAuthorized) {
            const deletedExternalGrade = await prisma.externalGrade.delete({
                where: { id: externalGradeId },
            })

            if (!deletedExternalGrade) {
                return NextResponse.json({ error: 'External grade not found' }, { status: 404 })
            }

            return NextResponse.json({ success: true })
        }

        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    } catch (error) {
        if (error instanceof ZodError)
            return NextResponse.json(error.format(), { status: 400 })

        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        )
    }
}