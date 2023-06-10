import { writeFile } from 'fs/promises'
import { NextResponse, type NextRequest } from 'next/server'

export async function POST(request: NextRequest) {
  const data = await request.formData()
  const file: File | null = data.get('file') as unknown as File

  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)

  const path = `/tmp/${file.name}`
  await writeFile(path, buffer)

  return NextResponse.json({ success: true })
}
