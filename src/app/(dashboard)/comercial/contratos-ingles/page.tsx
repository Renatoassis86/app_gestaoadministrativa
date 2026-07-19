import { createClient } from '@/lib/supabase/server'
import { buscarEscolasUnificadas } from '@/lib/escolas-unificadas'
import { upsertContratoBilinguismo } from '@/lib/bilinguismo-actions'
import { PACOTE_PRECOS, PACOTE_NOMES } from '@/lib/bilinguismo-constants'
import PageHeader from '@/components/layout/PageHeader'
import Link from 'next/link'
import { formatCurrency } from '@/lib/utils'
import { EscolaSelector } from '@/components/ui/EscolaSelector'
import { ContratoUpload } from '@/components/comercial/ContratoUpload'

interface Props { searchParams: Promise<{ escola?: string }> }

/* ── Estilos locais ─────────────────────────────────────────────── */
const card: React.CSSProperties = {
  background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16,
  marginBottom: '1.5rem', overflow: 'hidden', boxShadow: '0 1px 4px rgba(15,23,42,.06)',
}
const secHdr = (color = '#0284c7'): React.CSSProperties => ({
  padding: '1rem 1.75rem', borderBottom: '1px solid #f1f5f9',
  background: '#fafafa', display: 'flex', alignItems: 'center', gap: '.65rem',
})
const dot = (c = '#0284c7'): React.CSSProperties => ({
  width: 28, height: 28, borderRadius: 7, flexShrink: 0, background: c,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
})
const secTitle: React.CSSProperties = {
  fontFamily: 'var(--font-montserrat,sans-serif)',
  fontSize: '.78rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.07em', color: '#0f172a',
}
const body: React.CSSProperties = { padding: '1.5rem 1.75rem' }
const lbl: React.CSSProperties = {
  display: 'block', fontFamily: 'var(--font-montserrat,sans-serif)',
  fontSize: '.7rem', fontWeight: 700, textTransform: 'uppercase',
  letterSpacing: '.06em', color: '#64748b', marginBottom: '.45rem',
}
const inp: React.CSSProperties = {
  width: '100%', padding: '.7rem .9rem', fontSize: '.875rem',
  fontFamily: 'var(--font-inter,sans-serif)',
  border: '1.5px solid #e2e8f0', borderRadius: 8,
  background: '#f8fafc', color: '#0f172a', outline: 'none', boxSizing: 'border-box',
}

/* ── Checkbox de status ─────────────────────────────────────────── */
function StatusCheck({ name, label, checked }: { name: string; label: string; checked: boolean }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '.85rem 1.1rem',
      background: checked ? '#f0fdfa' : '#fafafa',
      border: `1.5px solid ${checked ? '#99f6e4' : '#e2e8f0'}`,
      borderRadius: 10, transition: 'all .15s',
    }}>
      <span style={{ fontSize: '.82rem', fontWeight: 600, color: checked ? '#0d9488' : '#475569', fontFamily: 'var(--font-montserrat,sans-serif)' }}>
        {label}
      </span>
      <select name={name} defaultValue={checked ? 'true' : 'false'} style={{
        padding: '5px 10px', fontSize: '.78rem', fontWeight: 700,
        border: `1.5px solid ${checked ? '#99f6e4' : '#e2e8f0'}`, borderRadius: 7,
        background: checked ? '#ccfbf1' : '#fff', color: checked ? '#0f766e' : '#475569',
        outline: 'none', cursor: 'pointer', fontFamily: 'var(--font-montserrat,sans-serif)',
      }}>
        <option value="false">Não</option>
        <option value="true">Sim</option>
      </select>
    </div>
  )
}

export default async function ContratosInglesPage({ searchParams }: Props) {
  const params    = await searchParams
  const escolaId  = params.escola ?? ''
  const supabase  = await createClient()

  const [todasEscolas, resContratosGeral] = await Promise.all([
    buscarEscolasUnificadas(supabase),
    supabase.from('contratos_bilinguismo').select('*, escola:escolas(nome, estado, cidade)')
      .order('updated_at', { ascending: false }),
  ])

  const contratos_geral = resContratosGeral.data ?? []

  let escola: any = null, contrato: any = null, propostaBilinguismo: any = null
  let arquivosEscola: any[] = []

  if (escolaId) {
    const [{ data: e }, { data: c }, { data: p }, { data: arqs }] = await Promise.all([
      supabase.from('escolas').select('*').eq('id', escolaId).single(),
      supabase.from('contratos_bilinguismo').select('*').eq('escola_id', escolaId).maybeSingle(),
      supabase.from('formularios_bilinguismo').select('*').eq('escola_id', escolaId).order('data_envio', { ascending: false }).limit(1).maybeSingle(),
      supabase.from('contratos_arquivos').select('id, nome, path, created_at, tamanho')
        .eq('escola_id', escolaId).order('created_at', { ascending: false }),
    ])
    escola = e; contrato = c; propostaBilinguismo = p
    arquivosEscola = arqs ?? []
  }

  const c = contrato as any
  const assinados = contratos_geral.filter((x: any) => x.contrato_assinado).length
  const enviados  = contratos_geral.filter((x: any) => x.contrato_enviado && !x.contrato_assinado).length
  const totalReceita = contratos_geral.reduce((acc: number, x: any) => acc + (x.valor_anual ?? 0), 0)

  return (
    <div>
      <PageHeader
        title="Jornada Contratual — Parceria de Bilinguismo"
        subtitle="Gestão de contratos e fechamentos do Programa de Inglês"
      />
      <div style={{ padding: '2rem 2.5rem' }}>

        {/* ── KPIs de resumo ──────────────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
          {[
            { label: 'Contratos Assinados', value: assinados, sub: 'bilinguismo concluídos', color: '#0d9488', bg: '#f0fdfa', border: '#99f6e4' },
            { label: 'Aguardando Assinatura', value: enviados, sub: 'minutas enviadas', color: '#0284c7', bg: '#f0f9ff', border: '#bae6fd' },
            { label: 'Total de Escolas', value: contratos_geral.length, sub: 'com processo ativo', color: '#4f46e5', bg: '#f5f3ff', border: '#c4b5fd' },
            { label: 'Receita Anual Total', value: formatCurrency(totalReceita), sub: 'valor contratado', color: '#7c3aed', bg: '#faf5ff', border: '#d8b4fe' },
          ].map(k => (
            <div key={k.label} style={{ background: k.bg, border: `1.5px solid ${k.border}`, borderRadius: 14, padding: '1.1rem 1.25rem', borderTop: `3px solid ${k.color}` }}>
              <div style={{ fontSize: '.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.07em', color: k.color, fontFamily: 'var(--font-montserrat,sans-serif)', marginBottom: '.35rem' }}>{k.label}</div>
              <div style={{ fontFamily: 'var(--font-cormorant,serif)', fontSize: '2rem', fontWeight: 800, lineHeight: 1, color: '#0f172a' }}>{k.value}</div>
              <div style={{ fontSize: '.72rem', color: '#64748b', marginTop: '.2rem', fontFamily: 'var(--font-inter,sans-serif)' }}>{k.sub}</div>
            </div>
          ))}
        </div>

        {/* ── Seletor de Escola ─────────────────────────────── */}
        <div style={{ ...card, overflow: 'visible', position: 'relative', zIndex: 50 }}>
          <div style={secHdr()}>
            <div style={{ ...dot(), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
            </div>
            <div style={secTitle}>Selecionar Escola para Editar Contrato de Bilinguismo</div>
          </div>
          <div style={{ padding: '1.25rem 1.75rem', overflow: 'visible' }}>
            <EscolaSelector
              escolas={todasEscolas ?? []}
              escolaId={escolaId}
              basePath="/comercial/contratos-ingles"
              placeholder="— Escolha uma escola para gerenciar seu contrato de bilinguismo —"
              extraButton={escola ? (
                <Link href={`/comercial/escolas/${escolaId}`} style={{ padding: '8px 14px', borderRadius: 8, border: '1.5px solid #e2e8f0', background: '#fff', color: '#475569', textDecoration: 'none', fontSize: '.8rem', fontWeight: 600, fontFamily: 'var(--font-montserrat,sans-serif)', whiteSpace: 'nowrap' }}>
                  Ver Ficha
                </Link>
              ) : undefined}
            />
          </div>
        </div>

        {/* ── Formulário do Contrato de Bilinguismo ────────────────────────── */}
        {escola && (
          <form action={upsertContratoBilinguismo}>
            <input type="hidden" name="escola_id" value={escolaId} />
            {propostaBilinguismo?.id && (
              <input type="hidden" name="formulario_bilinguismo_id" value={propostaBilinguismo.id} />
            )}

            {/* Escola selecionada — header informativo */}
            <div style={{ background: 'linear-gradient(135deg, #0284c7, #0f172a)', borderRadius: 14, padding: '1.25rem 1.75rem', marginBottom: '1.5rem', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '.65rem', color: '#38bdf8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', fontFamily: 'var(--font-montserrat,sans-serif)', marginBottom: '.3rem' }}>
                  ✦ Editando Contrato de Bilinguismo
                </div>
                <div style={{ fontFamily: 'var(--font-cormorant,serif)', fontSize: '1.4rem', fontWeight: 700 }}>{escola.nome}</div>
                <div style={{ fontSize: '.78rem', color: 'rgba(255,255,255,.65)' }}>{escola.cidade}{escola.estado ? `, ${escola.estado}` : ''}</div>
              </div>
              {c?.contrato_assinado && (
                <div style={{ background: '#0d9488', color: '#fff', padding: '.4rem 1rem', borderRadius: 9999, fontSize: '.75rem', fontWeight: 700, fontFamily: 'var(--font-montserrat,sans-serif)' }}>
                  Contrato Assinado ✓
                </div>
              )}
            </div>

            {/* Configuração do Pacote Contratado */}
            <div style={card}>
              <div style={secHdr('#0284c7')}>
                <div style={{ ...dot('#0284c7'), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                </div>
                <div>
                  <div style={secTitle}>Pacote e Condições Comerciais</div>
                  <div style={{ fontSize: '.68rem', color: '#475569', fontFamily: 'var(--font-inter,sans-serif)', marginTop: '.1rem' }}>Defina o pacote contratado e o valor anual acordado</div>
                </div>
              </div>
              <div style={body}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.25rem' }}>
                  <div>
                    <label style={lbl}>Pacote Contratado *</label>
                    <select
                      name="pacote_contratado"
                      defaultValue={c?.pacote_contratado ?? propostaBilinguismo?.pacote_interesse ?? 'silver'}
                      style={{ ...inp, fontWeight: 700 }}
                    >
                      <option value="bronze">Bronze (R$ 29.900/ano)</option>
                      <option value="silver">Silver (R$ 57.900/ano)</option>
                      <option value="gold">Gold (R$ 84.900/ano)</option>
                    </select>
                  </div>

                  <div>
                    <label style={lbl}>Valor Anual Acordado (R$)</label>
                    <input
                      name="valor_anual"
                      type="number"
                      step="0.01"
                      defaultValue={c?.valor_anual ?? PACOTE_PRECOS[propostaBilinguismo?.pacote_interesse ?? 'silver'] ?? 57900}
                      style={{ ...inp, fontWeight: 700, fontFamily: 'var(--font-cormorant,serif)', fontSize: '1.1rem' }}
                    />
                  </div>

                  <div>
                    <label style={lbl}>Vigência do Contrato (Meses)</label>
                    <input
                      name="tempo_contrato"
                      type="number"
                      min="1"
                      defaultValue={c?.tempo_contrato ?? 12}
                      style={{ ...inp, textAlign: 'center', fontWeight: 700 }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Checklist de Status */}
            <div style={card}>
              <div style={secHdr('#0f172a')}>
                <div style={{ ...dot('#0f172a'), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
                </div>
                <div>
                  <div style={secTitle}>Checklist de Progresso Contratual (Bilinguismo)</div>
                  <div style={{ fontSize: '.68rem', color: '#475569', fontFamily: 'var(--font-inter,sans-serif)', marginTop: '.1rem' }}>Marque cada etapa conforme avança no processo</div>
                </div>
              </div>
              <div style={body}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.75rem', marginBottom: '1.25rem' }}>
                  {[
                    ['formulario_enviado',  'Formulário de Bilinguismo enviado'],
                    ['formulario_recebido', 'Formulário recebido e conferido'],
                    ['minuta_enviada',      'Minuta da Parceria de Inglês enviada'],
                    ['retorno_minuta',      'Retorno da escola sobre a minuta'],
                    ['minuta_atualizada',   'Minuta atualizada conforme retorno'],
                    ['contrato_enviado',    'Contrato enviado para assinatura'],
                    ['contrato_assinado',   'Contrato assinado por ambas as partes'],
                    ['contrato_arquivado',  'Contrato arquivado no sistema'],
                  ].map(([name, label]) => (
                    <StatusCheck key={name} name={name} label={label} checked={!!c?.[name]} />
                  ))}
                </div>

                <div style={{ marginBottom: '1.25rem' }}>
                  <label style={lbl}>Observações sobre a minuta / pontos jurídicos</label>
                  <textarea name="observacao_minuta" rows={3} style={{ ...inp, resize: 'vertical', minHeight: 80 }}
                    defaultValue={c?.observacao_minuta ?? ''}
                    placeholder="Descreva observações, ajustes solicitados na minuta de bilinguismo..." />
                </div>

                <div>
                  <label style={lbl}>Encaminhamento Final</label>
                  <input name="encaminhamento_final" style={inp}
                    defaultValue={c?.encaminhamento_final ?? ''}
                    placeholder="Próximo passo previsto ou encaminhamento da implantação..." />
                </div>
              </div>
            </div>

            {/* Ações */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem 1.75rem', background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, marginBottom: '2rem' }}>
              <button type="submit" style={{ background: 'linear-gradient(135deg, #0284c7, #0369a1)', color: '#fff', padding: '.7rem 2rem', borderRadius: 9999, border: 'none', cursor: 'pointer', fontSize: '.875rem', fontWeight: 700, fontFamily: 'var(--font-montserrat,sans-serif)', boxShadow: '0 4px 14px rgba(2,132,199,.35)' }}>
                Salvar Contrato de Bilinguismo
              </button>
              <Link href={`/comercial/escolas/${escolaId}`} style={{ padding: '.7rem 1.5rem', borderRadius: 9999, border: '1.5px solid #e2e8f0', background: '#fff', color: '#64748b', textDecoration: 'none', fontSize: '.875rem', fontWeight: 600, fontFamily: 'var(--font-montserrat,sans-serif)' }}>
                Cancelar
              </Link>
            </div>
          </form>
        )}

        {/* ── Upload de Arquivos do Contrato ─────────────────── */}
        {escola && (
          <div style={card}>
            <div style={secHdr('#0f172a')}>
              <div style={{ ...dot('#0f172a'), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
                </svg>
              </div>
              <div>
                <div style={secTitle}>Documentos do Contrato de Bilinguismo — {escola.nome}</div>
                <div style={{ fontSize: '.68rem', color: '#475569', fontFamily: 'var(--font-inter,sans-serif)', marginTop: '.1rem' }}>
                  Upload e armazenamentos de minutas e contratos de bilinguismo
                </div>
              </div>
            </div>
            <div style={body}>
              <ContratoUpload
                escolaId={escolaId}
                escolaNome={escola.nome}
                arquivosExistentes={arquivosEscola.map((a: any) => ({
                  id:        a.id,
                  nome:      a.nome,
                  url:       `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/documentos-oficiais/${a.path}`,
                  criado_em: a.created_at,
                  tamanho:   a.tamanho,
                }))}
              />
            </div>
          </div>
        )}

        {/* ── Tabela de Acompanhamento Geral ──────────────────────────── */}
        <div style={card}>
          <div style={secHdr('#0284c7')}>
            <div style={{ ...dot('#0284c7'), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
            </div>
            <div style={secTitle}>Acompanhamento Geral de Contratos de Bilinguismo</div>
          </div>
          <div style={{ overflowX: 'auto' }}>
            {contratos_geral && contratos_geral.length > 0 ? (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#0f172a' }}>
                    {['Escola','Estado','Pacote','Encaminhamento','Form.','Minuta','Assinado','Arquivado','Valor Anual'].map(col => (
                      <th key={col} style={{ padding: '.7rem 1rem', textAlign: 'left', fontSize: '.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.07em', color: 'rgba(255,255,255,.65)', whiteSpace: 'nowrap', fontFamily: 'var(--font-montserrat,sans-serif)' }}>{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {contratos_geral.map((ct: any, idx: number) => (
                    <tr key={ct.id} style={{ borderBottom: '1px solid #f1f5f9', background: idx % 2 === 0 ? '#fff' : '#fafafa' }}>
                      <td style={{ padding: '.85rem 1rem', verticalAlign: 'middle' }}>
                        <Link href={`/comercial/contratos-ingles?escola=${ct.escola_id}`} style={{ fontWeight: 700, fontSize: '.82rem', color: '#0f172a', textDecoration: 'none', fontFamily: 'var(--font-montserrat,sans-serif)', display: 'block', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {ct.escola?.nome ?? '—'}
                        </Link>
                      </td>
                      <td style={{ padding: '.85rem 1rem', fontSize: '.78rem', color: '#64748b' }}>{ct.escola?.estado ?? '—'}</td>
                      <td style={{ padding: '.85rem 1rem', fontSize: '.78rem', fontWeight: 700, color: '#0284c7', textTransform: 'capitalize' }}>{PACOTE_NOMES[ct.pacote_contratado] ?? ct.pacote_contratado ?? '—'}</td>
                      <td style={{ padding: '.85rem 1rem', fontSize: '.78rem', color: '#334155', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ct.encaminhamento_final ?? '—'}</td>
                      {[
                        [ct.formulario_recebido, 'Recebido'],
                        [ct.minuta_enviada,       'Enviada'],
                        [ct.contrato_assinado,    'Assinado'],
                        [ct.contrato_arquivado,   'Arquivado'],
                      ].map(([ok, lbl], i) => (
                        <td key={i} style={{ padding: '.85rem 1rem', verticalAlign: 'middle' }}>
                          <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: '.25rem',
                            background: ok ? '#f0fdfa' : '#fafafa',
                            color: ok ? '#0d9488' : '#94a3b8',
                            border: `1px solid ${ok ? '#99f6e4' : '#e2e8f0'}`,
                            padding: '.2rem .6rem', borderRadius: 99,
                            fontSize: '.65rem', fontWeight: 700, fontFamily: 'var(--font-montserrat,sans-serif)',
                          }}>
                            {ok ? '✓' : '—'}
                          </span>
                        </td>
                      ))}
                      <td style={{ padding: '.85rem 1rem', fontFamily: 'var(--font-cormorant,serif)', fontSize: '.95rem', fontWeight: 700, color: '#0d9488', whiteSpace: 'nowrap' }}>
                        {ct.valor_anual > 0 ? formatCurrency(ct.valor_anual) : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div style={{ textAlign: 'center', padding: '3rem', color: '#475569' }}>
                <div style={{ fontSize: '.875rem', fontFamily: 'var(--font-inter,sans-serif)' }}>Nenhum contrato de bilinguismo registrado ainda.</div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
