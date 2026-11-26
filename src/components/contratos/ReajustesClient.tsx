'use client'

import { useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { adicionarColunaReajuste, adicionarReajuste, editarColunaReajuste, removerColunaReajuste, removerReajuste, salvarCampoReajuste, salvarExtraReajuste } from '@/lib/contratos-reajustes'

export interface ColunaExtra { id: string; rotulo: string; tipo: 'texto' | 'numero' | 'data' | 'lista'; opcoes: string[]; ordem: number }

export interface LinhaReajuste {
  id: string; ordem: number
  extras?: Record<string, string> | null
  categoria: string | null; modelo: string | null
  inf2: number | null; inf3: number | null; inf4: number | null; inf5: number | null
  escola: string
  valor_kit: string | null; reaj_infantil: string | null; reaj_1ano: string | null; reaj_incompleto: string | null
  valor_contrato: string | null; valor_parcela: string | null; vencimento: string | null
  adesao_1ano: string | null; adesao_2ano: string | null; adesao_3ano: string | null; adesao_4ano: string | null; adesao_5ano: string | null
  parcelamentos: string | null; data_primeira_parcela: string | null
  email_aditivo: string | null; aditivo_enviado: string | null; observacoes: string | null
}
type Campo = Exclude<keyof LinhaReajuste, 'id' | 'ordem' | 'extras'>

const CATEGORIAS = [['nova', 'Nova'], ['veterana', 'Veterana']]
const MODELOS = ['Boleto', 'Eskolare']
const PARCELAS = ['Eskolare', '4x', '5x', '6x', '8x', '10x', '12x']
const ADITIVO = ['sim', 'não']
const VALORES_ADESAO = ['-', 'R$ 1.150,00', 'R$ 1.450,00']

// campo = nome da coluna fixa OU id da coluna criada pelo usuário (extra = true)
interface Col { campo: string; rotulo: string; w: number; tipo?: 'num' | 'sel' | 'lista' | 'texto' | 'data'; opcoes?: string[][]; lista?: string[]; extra?: ColunaExtra }
const valorDe = (l: LinhaReajuste, c: Col): string => {
  const v = c.extra ? l.extras?.[c.campo] : (l as unknown as Record<string, unknown>)[c.campo]
  return v == null ? '' : String(v)
}
function colDeExtra(x: ColunaExtra): Col {
  const base = { campo: x.id, rotulo: x.rotulo, w: 150, extra: x }
  if (x.tipo === 'lista') return { ...base, tipo: 'sel', opcoes: x.opcoes.map(o => [o, o]) }
  if (x.tipo === 'numero') return { ...base, tipo: 'num', w: 110 }
  if (x.tipo === 'data') return { ...base, tipo: 'data', w: 140 }
  return { ...base, w: 180 }
}
interface Grupo { titulo: string; cor: string; cols: Col[] }

const GRUPOS: Grupo[] = [
  { titulo: 'Escola', cor: '#0369a1', cols: [
    { campo: 'escola', rotulo: 'Escola', w: 250 },
    { campo: 'categoria', rotulo: 'Categoria', w: 112, tipo: 'sel', opcoes: CATEGORIAS },
    { campo: 'modelo', rotulo: 'Modelo contratual', w: 124, tipo: 'sel', opcoes: MODELOS.map(m => [m, m]) },
  ] },
  { titulo: 'Alunos (kits) 2027', cor: '#0f766e', cols: [
    { campo: 'inf2', rotulo: 'Inf. 2', w: 70, tipo: 'num' }, { campo: 'inf3', rotulo: 'Inf. 3', w: 70, tipo: 'num' },
    { campo: 'inf4', rotulo: 'Inf. 4', w: 70, tipo: 'num' }, { campo: 'inf5', rotulo: 'Inf. 5', w: 70, tipo: 'num' },
  ] },
  { titulo: 'Valores do kit', cor: '#7c3aed', cols: [
    { campo: 'valor_kit', rotulo: 'Valor do kit completo', w: 130, tipo: 'lista', lista: ['R$ 700,00', 'R$ 799,00', 'R$ 800,00', 'R$ 900,00', 'R$ 1.000,00'] },
    { campo: 'reaj_infantil', rotulo: 'Reajuste Infantil', w: 130, tipo: 'lista', lista: ['R$ 1.044,40'] },
    { campo: 'reaj_1ano', rotulo: 'Reajuste 1º ano', w: 130, tipo: 'lista', lista: ['R$ 1.044,40'] },
    { campo: 'reaj_incompleto', rotulo: 'Reajuste kit incompleto', w: 130 },
  ] },
  { titulo: 'Adesão ao Fundamental (valor do kit)', cor: '#b45309', cols: [
    { campo: 'adesao_1ano', rotulo: '1º ano', w: 112, tipo: 'lista', lista: VALORES_ADESAO },
    { campo: 'adesao_2ano', rotulo: '2º ano', w: 112, tipo: 'lista', lista: VALORES_ADESAO },
    { campo: 'adesao_3ano', rotulo: '3º ano', w: 112, tipo: 'lista', lista: VALORES_ADESAO },
    { campo: 'adesao_4ano', rotulo: '4º ano', w: 112, tipo: 'lista', lista: VALORES_ADESAO },
    { campo: 'adesao_5ano', rotulo: '5º ano', w: 112, tipo: 'lista', lista: VALORES_ADESAO },
  ] },
  { titulo: 'Pagamento', cor: '#be185d', cols: [
    { campo: 'valor_contrato', rotulo: 'Valor do contrato', w: 130 },
    { campo: 'valor_parcela', rotulo: 'Valor da parcela', w: 120 },
    { campo: 'parcelamentos', rotulo: 'Parcelamento', w: 112, tipo: 'lista', lista: PARCELAS },
    { campo: 'vencimento', rotulo: 'Vencimento', w: 112 },
    { campo: 'data_primeira_parcela', rotulo: '1ª parcela', w: 112 },
  ] },
  { titulo: 'Aditivo', cor: '#334155', cols: [
    { campo: 'email_aditivo', rotulo: 'E-mail para envio do aditivo', w: 290 },
    { campo: 'aditivo_enviado', rotulo: 'Aditivo enviado?', w: 112, tipo: 'sel', opcoes: ADITIVO.map(a => [a, a]) },
    { campo: 'observacoes', rotulo: 'Observações', w: 260, tipo: 'texto' },
  ] },
]
const COLUNAS = GRUPOS.flatMap(g => g.cols)

const base: React.CSSProperties = { width: '100%', padding: '.4rem .5rem', fontSize: '.8rem', border: '1px solid transparent', borderRadius: 6, background: 'transparent', color: '#0f172a', fontFamily: 'inherit', minWidth: 0 }

function Celula({ linha, col, onSalvar }: { linha: LinhaReajuste; col: Col; onSalvar: (c: Col, v: string) => void }) {
  const atual = valorDe(linha, col)
  const [v, setV] = useState(atual)
  const sair = () => { if (v !== atual) onSalvar(col, v) }
  const foco = (e: React.FocusEvent<HTMLElement>) => { e.currentTarget.style.border = '1px solid #38bdf8'; e.currentTarget.style.background = '#fff' }
  const desfoco = (e: React.FocusEvent<HTMLElement>) => { e.currentTarget.style.border = '1px solid transparent'; e.currentTarget.style.background = 'transparent' }

  if (col.tipo === 'sel') {
    const ops = col.opcoes ?? []
    const extra = v && !ops.some(o => o[0] === v) ? [[v, v]] : []
    return (
      <select value={v} style={base} onChange={e => { setV(e.target.value); onSalvar(col, e.target.value) }}>
        <option value="">—</option>
        {[...ops, ...extra].map(o => <option key={o[0]} value={o[0]}>{o[1]}</option>)}
      </select>
    )
  }
  if (col.tipo === 'texto') {
    return <textarea value={v} rows={Math.max(1, Math.ceil(v.length / 34))} style={{ ...base, resize: 'vertical', lineHeight: 1.3 }}
      onChange={e => setV(e.target.value)} onFocus={foco} onBlur={e => { desfoco(e); sair() }} />
  }
  const listId = col.tipo === 'lista' ? `dl-${col.campo}` : undefined
  return (
    <>
      <input value={v} list={listId} type={col.tipo === 'data' ? 'date' : 'text'} inputMode={col.tipo === 'num' ? 'numeric' : undefined}
        style={{ ...base, textAlign: col.tipo === 'num' ? 'center' : 'left' }}
        onChange={e => setV(e.target.value)} onFocus={foco} onBlur={e => { desfoco(e); sair() }} onKeyDown={e => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur() }} />
      {col.lista && <datalist id={listId}>{col.lista.map(o => <option key={o} value={o} />)}</datalist>}
    </>
  )
}

const TIPOS_COLUNA: [ColunaExtra['tipo'], string][] = [['texto', 'Texto'], ['numero', 'Número'], ['data', 'Data'], ['lista', 'Lista suspensa']]
const btn: React.CSSProperties = { padding: '.45rem 1rem', borderRadius: 9999, border: 'none', background: '#0ea5e9', color: '#fff', fontWeight: 700, fontSize: '.8rem', cursor: 'pointer' }
const btnSec: React.CSSProperties = { ...btn, background: '#fff', color: '#0369a1', border: '1px solid #bae6fd' }

export function ReajustesClient({ linhas, colunasExtras = [] }: { linhas: LinhaReajuste[]; colunasExtras?: ColunaExtra[] }) {
  const router = useRouter()
  const [pendente, start] = useTransition()
  const [estado, setEstado] = useState<{ tipo: 'ok' | 'erro'; msg: string } | null>(null)
  const [filtro, setFiltro] = useState('')
  const [cat, setCat] = useState('')
  const [novaCol, setNovaCol] = useState<{ rotulo: string; tipo: ColunaExtra['tipo']; opcoes: string } | null>(null)

  const grupos = useMemo<Grupo[]>(() => colunasExtras.length
    ? [...GRUPOS, { titulo: 'Campos adicionais', cor: '#475569', cols: colunasExtras.map(colDeExtra) }]
    : GRUPOS, [colunasExtras])
  const colunas = useMemo(() => grupos.flatMap(g => g.cols), [grupos])

  const visiveis = useMemo(() => linhas.filter(l =>
    (!cat || l.categoria === cat) && (!filtro || l.escola.toLowerCase().includes(filtro.toLowerCase()))), [linhas, filtro, cat])
  const soma = (k: 'inf2' | 'inf3' | 'inf4' | 'inf5') => visiveis.reduce((s, l) => s + (l[k] ?? 0), 0)
  const total = soma('inf2') + soma('inf3') + soma('inf4') + soma('inf5')

  function exec(fn: () => Promise<{ ok: boolean; error?: string }>, aoOk?: () => void) {
    start(async () => {
      const r = await fn()
      if (!r.ok) setEstado({ tipo: 'erro', msg: r.error ?? 'Erro' })
      else { setEstado({ tipo: 'ok', msg: 'Salvo' }); aoOk?.() }
      router.refresh()
    })
  }
  const salvar = (id: string, col: Col, valor: string) =>
    exec(() => col.extra ? salvarExtraReajuste(id, col.campo, valor) : salvarCampoReajuste(id, col.campo, valor))
  function nova() {
    const nome = prompt('Nome da escola / linha nova:')
    if (nome === null) return
    exec(() => adicionarReajuste(nome))
  }
  function remover(l: LinhaReajuste) {
    if (!confirm(`Remover "${l.escola}" da tabela de reajustes?`)) return
    exec(() => removerReajuste(l.id))
  }
  function criarColuna() {
    if (!novaCol) return
    exec(() => adicionarColunaReajuste(novaCol.rotulo, novaCol.tipo, novaCol.opcoes.split(',')), () => setNovaCol(null))
  }
  function editarColuna(x: ColunaExtra) {
    const nome = prompt('Nome da coluna:', x.rotulo)
    if (nome === null) return
    let ops: string[] | null = null
    if (x.tipo === 'lista') {
      const o = prompt('Itens da lista suspensa (separe por vírgula):', x.opcoes.join(', '))
      if (o === null) return
      ops = o.split(',')
    }
    exec(() => editarColunaReajuste(x.id, nome, ops))
  }
  function removerColuna(x: ColunaExtra) {
    if (!confirm(`Remover a coluna "${x.rotulo}"? Os valores digitados nela deixam de aparecer.`)) return
    exec(() => removerColunaReajuste(x.id))
  }

  const th: React.CSSProperties = { padding: '.5rem', fontSize: '.72rem', fontWeight: 700, color: '#334155', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left', verticalAlign: 'bottom' }
  const rod: React.CSSProperties = { background: '#f1f5f9', borderTop: '2px solid #cbd5e1' }
  const mini: React.CSSProperties = { border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '.72rem', padding: '0 .2rem', fontWeight: 800 }
  const inp: React.CSSProperties = { ...base, border: '1px solid #cbd5e1', background: '#fff' }

  return (
    <section>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.75rem', alignItems: 'center', marginBottom: '.9rem' }}>
        <div>
          <h2 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>Reajustes 2027 e novas adesões</h2>
          <p style={{ fontSize: '.78rem', color: '#64748b', margin: '.15rem 0 0' }}>Clique em qualquer célula para editar; salva ao sair do campo. Adicione linhas (escolas) e colunas novas quando precisar.</p>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <input value={filtro} onChange={e => setFiltro(e.target.value)} placeholder="Buscar escola…" style={{ ...inp, width: 190 }} />
          <select value={cat} onChange={e => setCat(e.target.value)} style={{ ...inp, width: 160 }}>
            <option value="">Todas as categorias</option>
            {CATEGORIAS.map(c => <option key={c[0]} value={c[0]}>{c[1]}</option>)}
          </select>
          <button onClick={() => setNovaCol(novaCol ? null : { rotulo: '', tipo: 'texto', opcoes: '' })} style={btnSec}>+ Coluna</button>
          <button onClick={nova} disabled={pendente} style={btn}>+ Linha (escola)</button>
          <span style={{ fontSize: '.76rem', fontWeight: 700, minWidth: 64, color: estado?.tipo === 'erro' ? '#b91c1c' : '#047857' }}>{pendente ? 'Salvando…' : estado?.tipo === 'ok' ? estado.msg : ''}</span>
        </div>
      </div>
      {estado?.tipo === 'erro' && <p style={{ color: '#991b1b', fontSize: '.82rem' }}>{estado.msg}</p>}

      {novaCol && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.5rem', alignItems: 'center', background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: 12, padding: '.7rem .9rem', marginBottom: '.9rem' }}>
          <strong style={{ fontSize: '.8rem', color: '#0369a1' }}>Nova coluna</strong>
          <input autoFocus value={novaCol.rotulo} onChange={e => setNovaCol({ ...novaCol, rotulo: e.target.value })} placeholder="Nome da coluna" style={{ ...inp, width: 220 }} />
          <select value={novaCol.tipo} onChange={e => setNovaCol({ ...novaCol, tipo: e.target.value as ColunaExtra['tipo'] })} style={{ ...inp, width: 150 }}>
            {TIPOS_COLUNA.map(t => <option key={t[0]} value={t[0]}>{t[1]}</option>)}
          </select>
          {novaCol.tipo === 'lista' && <input value={novaCol.opcoes} onChange={e => setNovaCol({ ...novaCol, opcoes: e.target.value })} placeholder="Itens separados por vírgula" style={{ ...inp, width: 260 }} />}
          <button onClick={criarColuna} disabled={pendente || !novaCol.rotulo.trim()} style={btn}>Criar coluna</button>
          <button onClick={() => setNovaCol(null)} style={btnSec}>Cancelar</button>
        </div>
      )}

      <div style={{ overflow: 'auto', maxHeight: '72vh', border: '1px solid #e2e8f0', borderRadius: 12, background: '#fff' }}>
        <table style={{ borderCollapse: 'separate', borderSpacing: 0, tableLayout: 'fixed', width: 'max-content' }}>
          <colgroup>{colunas.map(c => <col key={c.campo} style={{ width: c.w }} />)}<col style={{ width: 76 }} /></colgroup>
          <thead style={{ position: 'sticky', top: 0, zIndex: 3 }}>
            <tr>
              {grupos.map(g => (
                <th key={g.titulo} colSpan={g.cols.length} style={{ padding: '.4rem .6rem', fontSize: '.7rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.05em', color: '#fff', background: g.cor, textAlign: 'left', borderLeft: '2px solid #fff' }}>{g.titulo}</th>
              ))}
              <th style={{ background: '#64748b' }} />
            </tr>
            <tr>
              {colunas.map((c, i) => (
                <th key={c.campo} style={{ ...th, ...(i === 0 ? { position: 'sticky', left: 0, zIndex: 4 } : {}), textAlign: c.tipo === 'num' ? 'center' : 'left' }}>
                  {c.rotulo}
                  {c.extra && (
                    <span style={{ whiteSpace: 'nowrap' }}>
                      <button title="Renomear / editar lista" onClick={() => editarColuna(c.extra!)} style={{ ...mini, color: '#0369a1' }}>✎</button>
                      <button title="Remover coluna" onClick={() => removerColuna(c.extra!)} style={{ ...mini, color: '#b91c1c' }}>×</button>
                    </span>
                  )}
                </th>
              ))}
              <th style={th} />
            </tr>
          </thead>
          <tbody>
            {visiveis.map((l, ri) => {
              const fundo = ri % 2 ? '#fcfdff' : '#fff'
              return (
                <tr key={l.id} style={{ background: fundo }}>
                  {colunas.map((c, i) => (
                    <td key={c.campo} style={{ padding: '.15rem .2rem', borderBottom: '1px solid #eef2f7', verticalAlign: 'top',
                      ...(i === 0 ? { position: 'sticky', left: 0, zIndex: 1, background: fundo, fontWeight: 700, borderRight: '1px solid #e2e8f0' } : {}) }}>
                      <Celula key={`${l.id}-${c.campo}-${valorDe(l, c)}`} linha={l} col={c} onSalvar={(col, v) => salvar(l.id, col, v)} />
                    </td>
                  ))}
                  <td style={{ borderBottom: '1px solid #eef2f7', textAlign: 'center', verticalAlign: 'top', padding: '.4rem .2rem' }}>
                    <button onClick={() => remover(l)} disabled={pendente} style={{ border: 'none', background: 'transparent', color: '#b91c1c', cursor: 'pointer', fontSize: '.74rem', fontWeight: 700 }}>Remover</button>
                  </td>
                </tr>
              )
            })}
            {visiveis.length === 0 && <tr><td colSpan={colunas.length + 1} style={{ padding: '1rem', fontSize: '.84rem', color: '#64748b' }}>Nenhuma escola encontrada.</td></tr>}
          </tbody>
          <tfoot style={{ position: 'sticky', bottom: 0, zIndex: 3 }}>
            <tr>
              <td style={{ ...rod, padding: '.5rem .6rem', fontSize: '.78rem', fontWeight: 800, position: 'sticky', left: 0 }}>{visiveis.length} escolas</td>
              <td style={rod} /><td style={rod} />
              {(['inf2', 'inf3', 'inf4', 'inf5'] as const).map(k => <td key={k} style={{ ...rod, textAlign: 'center', fontSize: '.8rem', fontWeight: 800 }}>{soma(k)}</td>)}
              <td colSpan={colunas.length - 6} style={{ ...rod, padding: '.5rem .6rem', fontSize: '.78rem', fontWeight: 700, color: '#475569' }}>Total de kits Infantil: {total}</td>
              <td style={rod} />
            </tr>
          </tfoot>
        </table>
      </div>
      <p style={{ fontSize: '.74rem', color: '#64748b', marginTop: '.6rem' }}>Legenda: “-” = não adere àquele ano · “Eskolare” = pagamento pela loja virtual · ** = parcelamento ou vencimento renegociado em 2026 para 2027.</p>
    </section>
  )
}
