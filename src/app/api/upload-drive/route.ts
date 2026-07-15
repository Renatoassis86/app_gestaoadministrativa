import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { createClient } from '@/lib/supabase/server'

// Upload de arquivos para uma pasta do Google Drive via conta de serviço.
// Implementado com fetch + crypto nativos do Node (sem depender do pacote
// "googleapis", que não pôde ser instalado neste ambiente).
export const runtime = 'nodejs'

const DRIVE_SCOPE = 'https://www.googleapis.com/auth/drive.file'
const TOKEN_URL    = 'https://oauth2.googleapis.com/token'
// supportsAllDrives=true é obrigatório para criar arquivos em pastas de Drives
// Compartilhados (Shared Drives) — sem isso a API retorna "File not found"
// mesmo com a permissão correta.
const UPLOAD_URL   = 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&supportsAllDrives=true&fields=id,webViewLink,webContentLink'

function base64url(input: Buffer | string) {
  return Buffer.from(input).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

async function getAccessToken(): Promise<string> {
  const email      = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL
  const privateKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g, '\n')

  if (!email || !privateKey) {
    throw new Error('Credenciais do Google Drive não configuradas (GOOGLE_SERVICE_ACCOUNT_EMAIL / GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY)')
  }

  const now = Math.floor(Date.now() / 1000)
  const header = { alg: 'RS256', typ: 'JWT' }
  const claim = {
    iss: email,
    scope: DRIVE_SCOPE,
    aud: TOKEN_URL,
    exp: now + 3600,
    iat: now,
  }

  const unsigned  = `${base64url(JSON.stringify(header))}.${base64url(JSON.stringify(claim))}`
  const signature = crypto.sign('RSA-SHA256', Buffer.from(unsigned), privateKey)
  const jwt       = `${unsigned}.${base64url(signature)}`

  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  })

  const data = await res.json()
  if (!res.ok) throw new Error(data.error_description || data.error || 'Falha ao autenticar com o Google')
  return data.access_token as string
}

async function uploadParaDrive(file: File, folderId: string, accessToken: string) {
  const metadata = { name: file.name, parents: [folderId] }
  const boundary = `cve_${crypto.randomBytes(16).toString('hex')}`
  const fileBuffer = Buffer.from(await file.arrayBuffer())

  const body = Buffer.concat([
    Buffer.from(
      `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(metadata)}\r\n` +
      `--${boundary}\r\nContent-Type: ${file.type || 'application/octet-stream'}\r\n\r\n`
    ),
    fileBuffer,
    Buffer.from(`\r\n--${boundary}--`),
  ])

  const res = await fetch(UPLOAD_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': `multipart/related; boundary=${boundary}`,
    },
    body,
  })

  const data = await res.json()
  if (!res.ok) throw new Error(data.error?.message || 'Falha no upload ao Google Drive')
  return data as { id: string; webViewLink?: string; webContentLink?: string }
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const formData = await request.formData()
  const file = formData.get('file') as File | null
  const tipo = formData.get('tipo') as string | null   // 'transcricao' — reservado para 'gravacao' futuramente

  if (!file) return NextResponse.json({ error: 'Arquivo é obrigatório' }, { status: 400 })
  if (tipo !== 'transcricao') {
    return NextResponse.json({ error: 'Tipo de upload não suportado ainda' }, { status: 400 })
  }

  const folderId = process.env.GOOGLE_DRIVE_FOLDER_TRANSCRICAO
  if (!folderId) {
    return NextResponse.json({ error: 'Pasta do Google Drive não configurada' }, { status: 500 })
  }

  try {
    const accessToken = await getAccessToken()
    const arquivo = await uploadParaDrive(file, folderId, accessToken)
    return NextResponse.json({
      driveId: arquivo.id,
      driveUrl: arquivo.webViewLink ?? `https://drive.google.com/file/d/${arquivo.id}/view`,
    })
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? 'Erro inesperado no upload ao Google Drive' }, { status: 502 })
  }
}
