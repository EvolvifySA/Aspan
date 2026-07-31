import { readFile, stat } from 'node:fs/promises'
import path from 'node:path'
import { NextResponse } from 'next/server'

const CONTENT_TYPES: Record<string, string> = {
  '.gif': 'image/gif',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.pdf': 'application/pdf',
  '.png': 'image/png',
  '.webp': 'image/webp',
}

async function getUploadResponse(filename: string, includeBody: boolean) {
  const safeName = path.basename(filename)
  if (safeName !== filename) {
    return new NextResponse('Arquivo invalido.', { status: 400 })
  }

  const uploadDir = path.resolve(process.cwd(), 'public', 'uploads')
  const filePath = path.resolve(uploadDir, safeName)
  if (!filePath.startsWith(`${uploadDir}${path.sep}`)) {
    return new NextResponse('Arquivo invalido.', { status: 400 })
  }

  try {
    const fileInfo = await stat(filePath)
    const extension = path.extname(safeName).toLowerCase()
    const headers = new Headers({
      'Cache-Control': 'public, max-age=31536000, immutable',
      'Content-Length': String(fileInfo.size),
      'Content-Type': CONTENT_TYPES[extension] ?? 'application/octet-stream',
    })

    if (!includeBody) {
      return new NextResponse(null, { headers })
    }

    const file = await readFile(filePath)
    return new NextResponse(file, { headers })
  } catch {
    return new NextResponse('Arquivo nao encontrado.', { status: 404 })
  }
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ filename: string }> },
) {
  const { filename } = await params
  return getUploadResponse(filename, true)
}

export async function HEAD(
  _request: Request,
  { params }: { params: Promise<{ filename: string }> },
) {
  const { filename } = await params
  return getUploadResponse(filename, false)
}
