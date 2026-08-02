import { NextRequest, NextResponse } from 'next/server'
import * as XLSX from 'xlsx'
import { createClient } from '@/lib/supabase/server'
import { getFilaPriorizacao, PRESCRICAO_LABEL } from '@/lib/priorizacao'
import { labelPerfil } from '@/types/database'

export async function GET(_request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const fila = await getFilaPriorizacao()

  const rowsFila = fila.filaAbordagem.map(e => ({
    'Escola': e.nome,
    'Cidade': e.cidade ?? '',
    'UF': e.estado ?? '',
    'Perfil Pedagógico': labelPerfil(e.perfil_pedagogico),
    'Potencial Financeiro (R$)': e.potencial_financeiro,
    'Estágio': e.estagioLabel,
    'Último Contato': e.ultimo_contato ?? '',
    'Score (0-100)': e.score,
    'Prescrição': PRESCRICAO_LABEL[e.prescricao],
    'Responsável': e.responsavel_nome ?? '',
  }))

  const rowsCadastro = fila.filaCompletarCadastro.map(e => ({
    'Escola': e.nome,
    'Cidade': e.cidade ?? '',
    'UF': e.estado ?? '',
    'Perfil Pedagógico': labelPerfil(e.perfil_pedagogico),
    'Último Contato': e.ultimo_contato ?? '',
    'Responsável': e.responsavel_nome ?? '',
  }))

  const rowsClientes = fila.clientesAtivos.map(e => ({
    'Escola': e.nome,
    'Cidade': e.cidade ?? '',
    'UF': e.estado ?? '',
    'Perfil Pedagógico': labelPerfil(e.perfil_pedagogico),
    'Responsável': e.responsavel_nome ?? '',
  }))

  const wb = XLSX.utils.book_new()

  const wsFila = XLSX.utils.json_to_sheet(rowsFila)
  if (rowsFila.length > 0) {
    wsFila['!cols'] = Object.keys(rowsFila[0]).map(key => ({
      wch: Math.max(key.length, ...rowsFila.slice(0, 50).map(r => String((r as any)[key] ?? '').length), 10),
    }))
  }
  XLSX.utils.book_append_sheet(wb, wsFila, 'Fila de Abordagem')

  if (rowsCadastro.length > 0) {
    const wsCadastro = XLSX.utils.json_to_sheet(rowsCadastro)
    wsCadastro['!cols'] = Object.keys(rowsCadastro[0]).map(key => ({
      wch: Math.max(key.length, ...rowsCadastro.slice(0, 50).map(r => String((r as any)[key] ?? '').length), 10),
    }))
    XLSX.utils.book_append_sheet(wb, wsCadastro, 'Completar Cadastro')
  }

  if (rowsClientes.length > 0) {
    const wsClientes = XLSX.utils.json_to_sheet(rowsClientes)
    wsClientes['!cols'] = Object.keys(rowsClientes[0]).map(key => ({
      wch: Math.max(key.length, ...rowsClientes.slice(0, 50).map(r => String((r as any)[key] ?? '').length), 10),
    }))
    XLSX.utils.book_append_sheet(wb, wsClientes, 'Parceiras Ativas')
  }

  const dataExport = new Date().toLocaleDateString('pt-BR')
  const resumo = [
    ['CVE Gestão Comercial — Priorização Comercial'],
    ['Data de exportação:', dataExport],
    ['Escolas na fila de abordagem:', fila.resumo.totalFila.toString()],
    ['Com ação urgente (fechamento pendente):', fila.resumo.acaoUrgente.toString()],
    ['Aguardando completar cadastro:', fila.resumo.aguardandoCadastro.toString()],
    ['Parceiras ativas:', fila.resumo.clientesAtivos.toString()],
    [],
    ['Metodologia do score (0-100):'],
    ['Potencial financeiro', '35%'],
    ['Afinidade de perfil pedagógico', '20%'],
    ['PIB per capita da UF (IBGE, 2023)', '15%'],
    ['Estágio no funil / prontidão', '20%'],
    ['Recência do último contato', '10%'],
  ]
  const wsResumo = XLSX.utils.aoa_to_sheet(resumo)
  XLSX.utils.book_append_sheet(wb, wsResumo, 'Resumo')

  const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })

  const now = new Date()
  const stamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`
  const filename = `CVE_Priorizacao_Comercial_${stamp}.xlsx`

  return new NextResponse(buf, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}
