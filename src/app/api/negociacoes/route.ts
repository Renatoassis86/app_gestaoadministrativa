import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const body = await request.json()
  const { escola_id, stage, titulo, responsavel_id, valor_estimado, ativa = true } = body

  if (!escola_id) return NextResponse.json({ error: 'escola_id obrigatório' }, { status: 400 })

  const { data, error } = await supabase
    .from('negociacoes')
    .insert({
      escola_id,
      stage:           stage ?? 'prospeccao',
      titulo:          titulo || null,
      responsavel_id:  responsavel_id ?? user.id,
      valor_estimado:  valor_estimado ?? null,
      probabilidade:   0,
      ativa,
      created_by:      user.id,
    })
    .select('id, stage, titulo, escola_id')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  revalidatePath('/comercial/pipeline')
  return NextResponse.json(data)
}
