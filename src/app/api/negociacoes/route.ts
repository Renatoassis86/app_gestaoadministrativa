import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Não autenticado', detail: authError?.message }, { status: 401 })
    }

    const body = await request.json()
    const { escola_id, stage, titulo, responsavel_id, valor_estimado, ativa = true } = body

    if (!escola_id) {
      return NextResponse.json({ error: 'escola_id obrigatório' }, { status: 400 })
    }

    // Valida se a escola existe
    const { data: escola, error: escolaError } = await supabase
      .from('escolas')
      .select('id, nome')
      .eq('id', escola_id)
      .single()

    if (escolaError || !escola) {
      return NextResponse.json({ error: `Escola não encontrada: ${escolaError?.message ?? 'id inválido'}` }, { status: 400 })
    }

    // Verifica se já existe negociação ativa para essa escola nesse stage
    const { data: existente } = await supabase
      .from('negociacoes')
      .select('id, stage, titulo')
      .eq('escola_id', escola_id)
      .eq('ativa', true)
      .maybeSingle()

    if (existente) {
      return NextResponse.json({
        error: `Esta escola já está no pipeline (${existente.titulo ?? existente.stage}). Mova o card existente ou desative-o antes de adicionar novamente.`
      }, { status: 409 })
    }

    const stageValido = ['prospeccao','qualificacao','apresentacao','proposta','negociacao','fechamento'].includes(stage)
    const stageFinal = stageValido ? stage : 'prospeccao'

    const { data, error } = await supabase
      .from('negociacoes')
      .insert({
        escola_id,
        stage:           stageFinal,
        titulo:          titulo || null,
        responsavel_id:  responsavel_id ?? user.id,
        valor_estimado:  valor_estimado ?? null,
        probabilidade:   0,
        ativa,
        created_by:      user.id,
      })
      .select('id, stage, titulo, escola_id')
      .single()

    if (error) {
      console.error('[negociacoes POST] Supabase error:', error)
      return NextResponse.json({
        error: error.message,
        code: error.code,
        detail: error.details,
        hint: error.hint,
      }, { status: 400 })
    }

    revalidatePath('/comercial/pipeline')
    return NextResponse.json(data)

  } catch (err: any) {
    console.error('[negociacoes POST] Unexpected error:', err)
    return NextResponse.json({ error: 'Erro interno do servidor', detail: String(err) }, { status: 500 })
  }
}
