import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { upsertEscola } from '@/lib/actions'
import PageHeader from '@/components/layout/PageHeader'
import Link from 'next/link'
import { PERFIL_OPTIONS, ORIGEM_OPTIONS, CARGO_CONTATO_OPTIONS } from '@/types/database'
import { CheckboxPaideia } from '@/components/ui/CheckboxPaideia'
import { DeleteEscolaBtn } from '@/components/comercial/DeleteEscolaBtn'

export const dynamic = 'force-dynamic'

/* ── Estilos reutilizáveis (mesmo sistema da página "Nova Escola") ── */
const card: React.CSSProperties = {
  background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16,
  marginBottom: '1.5rem', overflow: 'hidden',
  boxShadow: '0 1px 4px rgba(15,23,42,.06)',
}
const cardHeader = (_color = '#d97706'): React.CSSProperties => ({
  padding: '1rem 1.75rem', borderBottom: '1px solid #f1f5f9',
  background: '#fafafa', display: 'flex', alignItems: 'center', gap: '.65rem',
})
const dot = (color = '#d97706'): React.CSSProperties => ({
  width: 28, height: 28, borderRadius: 7, flexShrink: 0,
  background: `linear-gradient(135deg, ${color}, ${color}cc)`,
  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '.9rem',
})
const sectionTitle: React.CSSProperties = {
  fontFamily: 'var(--font-montserrat,sans-serif)',
  fontSize: '.78rem', fontWeight: 800,
  textTransform: 'uppercase', letterSpacing: '.07em', color: '#0f172a',
}
const cardBody: React.CSSProperties = { padding: '1.5rem 1.75rem' }
const label: React.CSSProperties = {
  display: 'block', fontFamily: 'var(--font-montserrat,sans-serif)',
  fontSize: '.7rem', fontWeight: 700, textTransform: 'uppercase',
  letterSpacing: '.06em', color: '#64748b', marginBottom: '.4rem',
}
const input: React.CSSProperties = {
  width: '100%', padding: '.65rem .9rem', fontSize: '.875rem',
  fontFamily: 'var(--font-inter,sans-serif)',
  border: '1.5px solid #e2e8f0', borderRadius: 8,
  background: '#f8fafc', color: '#0f172a', outline: 'none',
  boxSizing: 'border-box',
}
const grid2: React.CSSProperties = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem 1.5rem' }
const grid3: React.CSSProperties = { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.25rem 1.5rem' }

function TurmaField({ name, label: lbl, value }: { name: string; label: string; value: number }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '.35rem' }}>
      <label style={{ ...label, textTransform: 'none', fontSize: '.75rem', letterSpacing: '.01em', color: '#475569', fontWeight: 600 }}>
        {lbl}
      </label>
      <input
        name={name} type="number" min="0" defaultValue={value}
        style={{ ...input, textAlign: 'center', fontFamily: 'var(--font-cormorant,serif)', fontSize: '1rem', fontWeight: 700 }}
      />
    </div>
  )
}

interface Props { params: Promise<{ id: string }> }

export default async function EscolaEditar({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const [{ data: escola }, { data: profiles }] = await Promise.all([
    supabase.from('escolas').select('*').eq('id', id).single(),
    supabase.from('profiles').select('id, full_name').eq('is_active', true).order('full_name'),
  ])

  if (!escola) notFound()
  const e = escola as any

  return (
    <div>
      <PageHeader
        title={`Editar: ${e.nome}`}
        subtitle="Atualize os dados da escola parceira"
        breadcrumbs={[{ label: 'Escolas', href: '/comercial/escolas' }, { label: e.nome, href: `/comercial/escolas/${id}` }, { label: 'Editar' }]}
        actions={
          <Link href={`/comercial/escolas/${id}`} style={{
            padding: '.45rem 1rem', borderRadius: 8, border: '1.5px solid #e2e8f0',
            background: '#fff', color: '#475569', textDecoration: 'none',
            fontSize: '.82rem', fontWeight: 600, fontFamily: 'var(--font-montserrat,sans-serif)',
          }}>
            ← Voltar
          </Link>
        }
      />

      <div style={{ padding: '2rem 2.5rem', maxWidth: 860, margin: '0 auto' }}>
        <form action={upsertEscola}>
          <input type="hidden" name="id" value={id} />

          {/* ── 1. IDENTIFICAÇÃO ───────────────────────────────── */}
          <div style={card}>
            <div style={cardHeader()}>
              <div style={dot()}><svg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='#fff' strokeWidth='2.5' strokeLinecap='round' strokeLinejoin='round'><path d='M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z'/></svg></div>
              <div style={sectionTitle}>Identificação</div>
            </div>
            <div style={cardBody}>
              <div style={grid2}>
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={label}>Nome da Escola <span style={{ color: '#d97706' }}>*</span></label>
                  <input name="nome" style={input} required defaultValue={e.nome} placeholder="Nome completo da escola" />
                </div>
                <div>
                  <label style={label}>CNPJ</label>
                  <input name="cnpj" style={input} defaultValue={e.cnpj ?? ''} placeholder="00.000.000/0001-00" />
                </div>
                <div>
                  <label style={label}>Perfil Pedagógico</label>
                  <select name="perfil_pedagogico" style={input} defaultValue={e.perfil_pedagogico}>
                    {PERFIL_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ marginTop: '1.25rem' }}>
                <CheckboxPaideia defaultChecked={e.escola_paideia ?? false} />
              </div>
            </div>
          </div>

          {/* ── 2. ENDEREÇO ────────────────────────────────────── */}
          <div style={card}>
            <div style={cardHeader('#0ea5e9')}>
              <div style={dot('#0ea5e9')}><svg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='#fff' strokeWidth='2.5' strokeLinecap='round' strokeLinejoin='round'><path d='M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z'/><circle cx='12' cy='10' r='3'/></svg></div>
              <div style={sectionTitle}>Endereço</div>
            </div>
            <div style={cardBody}>
              <div style={{ ...grid3, marginBottom: '1.25rem' }}>
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={label}>Rua / Logradouro</label>
                  <input name="rua" style={input} defaultValue={e.rua ?? ''} placeholder="Rua, Avenida, Travessa..." />
                </div>
                <div>
                  <label style={label}>Número</label>
                  <input name="numero" style={input} defaultValue={e.numero ?? ''} placeholder="Ex: 142" />
                </div>
              </div>
              <div style={{ ...grid3, marginBottom: '1.25rem' }}>
                <div>
                  <label style={label}>Complemento</label>
                  <input name="complemento" style={input} defaultValue={e.complemento ?? ''} placeholder="Sala, Bloco..." />
                </div>
                <div>
                  <label style={label}>Bairro</label>
                  <input name="bairro" style={input} defaultValue={e.bairro ?? ''} />
                </div>
                <div>
                  <label style={label}>CEP</label>
                  <input name="cep" style={input} defaultValue={e.cep ?? ''} placeholder="00000-000" />
                </div>
              </div>
              <div style={grid2}>
                <div>
                  <label style={label}>Cidade</label>
                  <input name="cidade" style={input} defaultValue={e.cidade ?? ''} />
                </div>
                <div>
                  <label style={label}>Estado (UF)</label>
                  <input name="estado" style={{ ...input, textTransform: 'uppercase' }} maxLength={2} defaultValue={e.estado ?? ''} placeholder="Ex: PB" />
                </div>
              </div>
            </div>
          </div>

          {/* ── 3. CONTATO ─────────────────────────────────────── */}
          <div style={card}>
            <div style={cardHeader('#8b5cf6')}>
              <div style={dot('#8b5cf6')}><svg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='#fff' strokeWidth='2.5' strokeLinecap='round' strokeLinejoin='round'><path d='M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.56 1.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.73a16 16 0 0 0 6.29 6.29l1.62-1.34a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z'/></svg></div>
              <div style={sectionTitle}>Contato</div>
            </div>
            <div style={cardBody}>
              <div style={{ ...grid3, marginBottom: '1.25rem' }}>
                <div>
                  <label style={label}>Telefone</label>
                  <input name="telefone" style={input} defaultValue={e.telefone ?? ''} placeholder="(00) 00000-0000" />
                </div>
                <div>
                  <label style={label}>E-mail</label>
                  <input name="email" type="email" style={input} defaultValue={e.email ?? ''} placeholder="contato@escola.edu.br" />
                </div>
                <div>
                  <label style={label}>Site</label>
                  <input name="site" style={input} defaultValue={e.site ?? ''} placeholder="https://..." />
                </div>
              </div>
              <div style={grid3}>
                <div>
                  <label style={label}>Nome do Contato Principal</label>
                  <input name="contato_nome" style={input} defaultValue={e.contato_nome ?? ''} />
                </div>
                <div>
                  <label style={label}>Cargo do Contato</label>
                  <select name="contato_cargo" style={input} defaultValue={e.contato_cargo ?? ''}>
                    <option value="">Selecione...</option>
                    {CARGO_CONTATO_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label style={label}>Nome do Diretor</label>
                  <input name="diretor_nome" style={input} defaultValue={e.diretor_nome ?? ''} />
                </div>
              </div>
            </div>
          </div>

          {/* ── 4. ALUNOS POR SEGMENTO ─────────────────────────── */}
          <div style={card}>
            <div style={cardHeader('#16a34a')}>
              <div style={dot('#16a34a')}><svg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='#fff' strokeWidth='2.5' strokeLinecap='round' strokeLinejoin='round'><path d='M22 10v6M2 10l10-5 10 5-10 5z'/><path d='M6 12v5c3 3 9 3 12 0v-5'/></svg></div>
              <div>
                <div style={sectionTitle}>Quantidade de Alunos por Segmento</div>
                <div style={{ fontSize: '.68rem', color: '#94a3b8', marginTop: '.1rem', fontFamily: 'var(--font-inter,sans-serif)' }}>
                  Informe o total de alunos em cada segmento. Deixe 0 para segmentos inexistentes.
                </div>
              </div>
            </div>
            <div style={cardBody}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0,1fr))', gap: '1.5rem' }}>

                {/* Infantil */}
                <div style={{ background: '#fff7ed', border: '1.5px solid #fed7aa', borderRadius: 12, padding: '1.1rem 1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '.6rem', marginBottom: '.8rem' }}>
                    <div style={{ width: 4, height: 16, background: '#f97316', borderRadius: 2 }} />
                    <label style={{ ...label, color: '#ea580c', marginBottom: 0, fontSize: '.68rem' }}>Ed. Infantil</label>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.5rem' }}>
                    <TurmaField name="qtd_infantil2" label="Inf. 2" value={e.qtd_infantil2 ?? 0} />
                    <TurmaField name="qtd_infantil3" label="Inf. 3" value={e.qtd_infantil3 ?? 0} />
                    <TurmaField name="qtd_infantil4" label="Inf. 4" value={e.qtd_infantil4 ?? 0} />
                    <TurmaField name="qtd_infantil5" label="Inf. 5" value={e.qtd_infantil5 ?? 0} />
                  </div>
                  <div style={{ marginTop: '.8rem', borderTop: '1px dashed #fed7aa', paddingTop: '.6rem' }}>
                    <label style={{ ...label, fontSize: '.6rem', color: '#94a3b8', textAlign: 'center' }}>Total (Opcional)</label>
                    <input name="qtd_infantil" type="number" min="0" defaultValue={e.qtd_infantil ?? 0}
                      style={{ ...input, textAlign: 'center', padding: '.4rem', background: '#fff', fontSize: '.9rem', fontWeight: 700 }} />
                  </div>
                </div>

                {/* Fund I */}
                <div style={{ background: '#eff6ff', border: '1.5px solid #bfdbfe', borderRadius: 12, padding: '1.1rem 1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '.6rem', marginBottom: '.8rem' }}>
                    <div style={{ width: 4, height: 16, background: '#2563eb', borderRadius: 2 }} />
                    <label style={{ ...label, color: '#2563eb', marginBottom: 0, fontSize: '.68rem' }}>Fund. I</label>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '.4rem' }}>
                    <TurmaField name="qtd_fund1_ano1" label="1º Ano" value={e.qtd_fund1_ano1 ?? 0} />
                    <TurmaField name="qtd_fund1_ano2" label="2º Ano" value={e.qtd_fund1_ano2 ?? 0} />
                    <TurmaField name="qtd_fund1_ano3" label="3º Ano" value={e.qtd_fund1_ano3 ?? 0} />
                    <TurmaField name="qtd_fund1_ano4" label="4º Ano" value={e.qtd_fund1_ano4 ?? 0} />
                    <TurmaField name="qtd_fund1_ano5" label="5º Ano" value={e.qtd_fund1_ano5 ?? 0} />
                  </div>
                  <div style={{ marginTop: '.8rem', borderTop: '1px dashed #bfdbfe', paddingTop: '.6rem' }}>
                    <label style={{ ...label, fontSize: '.6rem', color: '#94a3b8', textAlign: 'center' }}>Total (Opcional)</label>
                    <input name="qtd_fund1" type="number" min="0" defaultValue={e.qtd_fund1 ?? 0}
                      style={{ ...input, textAlign: 'center', padding: '.4rem', background: '#fff', fontSize: '.9rem', fontWeight: 700 }} />
                  </div>
                </div>

                {/* Fund II */}
                <div style={{ background: '#f5f3ff', border: '1.5px solid #ddd6fe', borderRadius: 12, padding: '1.1rem 1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '.6rem', marginBottom: '.8rem' }}>
                    <div style={{ width: 4, height: 16, background: '#7c3aed', borderRadius: 2 }} />
                    <label style={{ ...label, color: '#7c3aed', marginBottom: 0, fontSize: '.68rem' }}>Fund. II</label>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.5rem' }}>
                    <TurmaField name="qtd_fund2_ano6" label="6º Ano" value={e.qtd_fund2_ano6 ?? 0} />
                    <TurmaField name="qtd_fund2_ano7" label="7º Ano" value={e.qtd_fund2_ano7 ?? 0} />
                    <TurmaField name="qtd_fund2_ano8" label="8º Ano" value={e.qtd_fund2_ano8 ?? 0} />
                    <TurmaField name="qtd_fund2_ano9" label="9º Ano" value={e.qtd_fund2_ano9 ?? 0} />
                  </div>
                  <div style={{ marginTop: '.8rem', borderTop: '1px dashed #ddd6fe', paddingTop: '.6rem' }}>
                    <label style={{ ...label, fontSize: '.6rem', color: '#94a3b8', textAlign: 'center' }}>Total (Opcional)</label>
                    <input name="qtd_fund2" type="number" min="0" defaultValue={e.qtd_fund2 ?? 0}
                      style={{ ...input, textAlign: 'center', padding: '.4rem', background: '#fff', fontSize: '.9rem', fontWeight: 700 }} />
                  </div>
                </div>

                {/* Médio */}
                <div style={{ background: '#fef2f2', border: '1.5px solid #fca5a5', borderRadius: 12, padding: '1.1rem 1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '.6rem', marginBottom: '.8rem' }}>
                    <div style={{ width: 4, height: 16, background: '#dc2626', borderRadius: 2 }} />
                    <label style={{ ...label, color: '#dc2626', marginBottom: 0, fontSize: '.68rem' }}>Ens. Médio</label>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '.5rem' }}>
                    <TurmaField name="qtd_medio_1s" label="1ª S" value={e.qtd_medio_1s ?? 0} />
                    <TurmaField name="qtd_medio_2s" label="2ª S" value={e.qtd_medio_2s ?? 0} />
                    <TurmaField name="qtd_medio_3s" label="3ª S" value={e.qtd_medio_3s ?? 0} />
                  </div>
                  <div style={{ marginTop: '.8rem', borderTop: '1px dashed #fca5a5', paddingTop: '.6rem' }}>
                    <label style={{ ...label, fontSize: '.6rem', color: '#94a3b8', textAlign: 'center' }}>Total (Opcional)</label>
                    <input name="qtd_medio" type="number" min="0" defaultValue={e.qtd_medio ?? 0}
                      style={{ ...input, textAlign: 'center', padding: '.4rem', background: '#fff', fontSize: '.9rem', fontWeight: 700 }} />
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* ── 5. GESTÃO COMERCIAL ────────────────────────────── */}
          <div style={card}>
            <div style={cardHeader('#d97706')}>
              <div style={dot()}><svg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='#fff' strokeWidth='2.5' strokeLinecap='round' strokeLinejoin='round'><line x1='18' y1='20' x2='18' y2='10'/><line x1='12' y1='20' x2='12' y2='4'/><line x1='6' y1='20' x2='6' y2='14'/></svg></div>
              <div style={sectionTitle}>Gestão Comercial</div>
            </div>
            <div style={cardBody}>
              <div style={{ ...grid2, marginBottom: '1.25rem' }}>
                <div>
                  <label style={label}>Origem do Lead</label>
                  <select name="origem_lead" style={input} defaultValue={e.origem_lead ?? ''}>
                    <option value="">Selecione...</option>
                    {ORIGEM_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
                <div>
                  <label style={label}>Responsável Comercial</label>
                  <select name="responsavel_id" style={input} defaultValue={e.responsavel_id ?? ''}>
                    <option value="">Selecione...</option>
                    {profiles?.map((p: any) => (
                      <option key={p.id} value={p.id}>{p.full_name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label style={label}>Observações internas</label>
                <textarea name="observacoes" rows={3} style={{ ...input, resize: 'vertical', minHeight: 80 }}
                  defaultValue={e.observacoes ?? ''} placeholder="Notas relevantes sobre esta escola..." />
              </div>
            </div>
          </div>

          {/* ── 6. FINANCEIRO / COMERCIAL ──────────────────────── */}
          <div style={card}>
            <div style={cardHeader('#16a34a')}>
              <div style={dot()}><svg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='#fff' strokeWidth='2.5' strokeLinecap='round' strokeLinejoin='round'><line x1='12' y1='1' x2='12' y2='23'/><path d='M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6'/></svg></div>
              <div style={sectionTitle}>Financeiro / Comercial</div>
            </div>
            <div style={cardBody}>
              <div style={grid2}>
                <div>
                  <label style={label}>Mensalidade média real (R$)</label>
                  <input type="number" name="mensalidade_media" step="0.01" min="0" style={input} defaultValue={e.mensalidade_media ?? ''} placeholder="Ex: 850.00" />
                </div>
                <div>
                  <label style={label}>Sistema de ensino atual</label>
                  <input type="text" name="sistema_ensino_atual" style={input} defaultValue={e.sistema_ensino_atual ?? ''} placeholder="Ex: material próprio, Objetivo, SAS..." />
                </div>
              </div>
              <div style={{ marginTop: '1.25rem' }}>
                <label style={label}>Satisfação com o sistema atual</label>
                <select name="satisfacao_sistema_atual" style={input} defaultValue={e.satisfacao_sistema_atual ?? ''}>
                  <option value="">Não informado</option>
                  <option value="Muito insatisfeito">Muito insatisfeito</option>
                  <option value="Insatisfeito">Insatisfeito</option>
                  <option value="Neutro">Neutro</option>
                  <option value="Satisfeito">Satisfeito</option>
                  <option value="Muito satisfeito">Muito satisfeito</option>
                </select>
              </div>
            </div>
          </div>

          {/* ── AÇÕES ──────────────────────────────────────────── */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '1rem',
            padding: '1.25rem 1.75rem',
            background: '#fff', border: '1px solid #e2e8f0',
            borderRadius: 16,
          }}>
            <button type="submit" style={{
              background: 'linear-gradient(135deg, #d97706, #b45309)',
              color: '#fff', padding: '.7rem 2rem',
              borderRadius: 9999, border: 'none', cursor: 'pointer',
              fontSize: '.875rem', fontWeight: 700,
              fontFamily: 'var(--font-montserrat,sans-serif)',
              boxShadow: '0 4px 14px rgba(217,119,6,.35)',
              letterSpacing: '.01em',
            }}>
              Salvar Alterações
            </button>
            <Link href={`/comercial/escolas/${id}`} style={{
              padding: '.7rem 1.5rem', borderRadius: 9999,
              border: '1.5px solid #e2e8f0', background: '#fff',
              color: '#64748b', textDecoration: 'none',
              fontSize: '.875rem', fontWeight: 600,
              fontFamily: 'var(--font-montserrat,sans-serif)',
            }}>
              Cancelar
            </Link>
            <div style={{ marginLeft: 'auto' }}>
              <DeleteEscolaBtn escolaId={id} escolaNome={e.nome} variant="hero" />
            </div>
          </div>

        </form>
      </div>
    </div>
  )
}
