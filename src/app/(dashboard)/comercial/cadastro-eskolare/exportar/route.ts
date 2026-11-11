import * as XLSX from 'xlsx'
import { createAdminClient } from '@/lib/supabase/admin'
import { exigirComercial } from '@/lib/eskolare-servidor'
import { BLOCOS, CAMPOS, STATUS_FICHA, totalAlunos } from '@/lib/eskolare-campos'
import { mascararCpf } from '@/lib/eskolare-validacao'

export const dynamic = 'force-dynamic'

// Exporta no mesmo layout e ordem de colunas da planilha oficial (linhas 3 e 4 = grupos e títulos).
// ?id=<ficha> exporta uma só; sem id, todas.
export async function GET(req: Request) {
  const u = await exigirComercial()
  if (!u) return new Response('Não autorizado', { status: 401 })
  const id = new URL(req.url).searchParams.get('id')
  const admin = createAdminClient()

  let q = admin.from('eskolare_fichas').select('id, escola_id, status, responsavel_comercial, obs_comercial, dados, pct_preenchido').order('created_at')
  if (id) q = q.eq('id', id)
  const { data: fichas, error } = await q
  if (error) return new Response(error.message, { status: 500 })

  const campos = CAMPOS.filter(c => !c.interno)
  const titulos = ['Nº', 'Status', '% preenchido', 'Responsável comercial',
    ...campos.map(c => c.colunaTitulo ?? `${c.rotulo}${c.obrigatorio ? ' *' : ''}`), 'Observações do comercial']

  const grupos: string[] = ['CONTROLE', '', '', '']
  for (const b of BLOCOS) {
    camposDoBlocoOrdem(b.id).forEach((_, i) => grupos.push(i === 0 ? `${b.id}. ${b.titulo.toUpperCase()}` : ''))
  }
  grupos.push('OBSERVAÇÕES')

  const linhas = (fichas ?? []).map((f, i) => {
    const d = f.dados ?? {}
    return [
      i + 1, STATUS_FICHA.find(s => s.id === f.status)?.label ?? f.status, f.pct_preenchido / 100, f.responsavel_comercial ?? '',
      ...campos.map(c => {
        if (c.tipo === 'calculado') return totalAlunos(d)
        if (c.tipo === 'logo') return d.logo ? 'Sim' : 'Não'
        const v = d[c.chave] ?? ''
        if (c.tipo === 'cpf' && u.role !== 'gerente') return mascararCpf(v)
        return c.tipo === 'inteiro' && v !== '' ? Number(v) : c.tipo === 'dinheiro' && v !== '' ? Number(v) : v
      }),
      f.obs_comercial ?? '',
    ]
  })

  const ws = XLSX.utils.aoa_to_sheet([
    ['CIDADE VIVA EDUCATION  ·  Cadastro das escolas na Eskolare  ·  Lojas 2027'],
    ['Uma linha por escola. * = obrigatório. No bloco 8, informe o preço final OU a comissão.'],
    grupos, titulos, ...linhas,
  ])
  ws['!cols'] = titulos.map(t => ({ wch: Math.max(14, Math.min(34, t.length + 2)) }))
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Cadastro')
  const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' }) as Buffer

  return new Response(new Uint8Array(buf), {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="Cadastro_Eskolare_2027_${new Date().toISOString().slice(0, 10)}.xlsx"`,
    },
  })
}

function camposDoBlocoOrdem(blocoId: number) {
  return CAMPOS.filter(c => !c.interno && c.bloco === blocoId)
}
