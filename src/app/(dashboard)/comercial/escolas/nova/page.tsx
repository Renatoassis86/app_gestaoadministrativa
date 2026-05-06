import { createClient } from '@/lib/supabase/server'
import { upsertEscola } from '@/lib/actions'
import PageHeader from '@/components/layout/PageHeader'
import Link from 'next/link'
import { PERFIL_OPTIONS, ORIGEM_OPTIONS, CARGO_CONTATO_OPTIONS } from '@/types/database'
import { CheckboxPaideia } from '@/components/ui/CheckboxPaideia'

/* ── Estilos reutilizáveis ──────────────────────────────────────── */
const card: React.CSSProperties = {
  background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16,
  marginBottom: '1.5rem', overflow: 'hidden',
  boxShadow: '0 1px 4px rgba(15,23,42,.06)',
}
const cardHeader = (color = '#d97706'): React.CSSProperties => ({
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

/* ── Componente de campo de turma ───────────────────────────────── */
function TurmaField({ name, label: lbl }: { name: string; label: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '.35rem' }}>
      <label style={{ ...label, textTransform: 'none', fontSize: '.75rem', letterSpacing: '.01em', color: '#475569', fontWeight: 600 }}>
        {lbl}
      </label>
      <input
        name={name} type="number" min="0" defaultValue="0"
        style={{ ...input, textAlign: 'center', fontFamily: 'var(--font-cormorant,serif)', fontSize: '1rem', fontWeight: 700 }}
      />
    </div>
  )
}

export default async function EscolaNova() {
  const supabase = await createClient()
  const { data: profiles } = await supabase
    .from('profiles').select('id, full_name').eq('is_active', true).order('full_name')

  return (
    <div>
      <PageHeader
        title="Cadastrar Nova Escola"
        subtitle="Preencha os dados da escola parceira"
        actions={
          <Link href="/comercial/escolas" style={{
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

          {/* ── 1. IDENTIFICAÇÃO ───────────────────────────────── */}
          <div style={card}>
            <div style={cardHeader()}>
              <div style={dot()}>🏫</div>
              <div style={sectionTitle}>Identificação</div>
            </div>
            <div style={cardBody}>
              <div style={grid2}>
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={label}>Nome da Escola <span style={{ color: '#d97706' }}>*</span></label>
                  <input name="nome" style={input} required placeholder="Nome completo da escola" />
                </div>
                <div>
                  <label style={label}>CNPJ</label>
                  <input name="cnpj" style={input} placeholder="00.000.000/0001-00" />
                </div>
                <div>
                  <label style={label}>Perfil Pedagógico</label>
                  <select name="perfil_pedagogico" style={input}>
                    {PERFIL_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ marginTop: '1.25rem' }}>
                <CheckboxPaideia defaultChecked={false} />
              </div>
            </div>
          </div>

          {/* ── 2. ENDEREÇO ────────────────────────────────────── */}
          <div style={card}>
            <div style={cardHeader('#0ea5e9')}>
              <div style={dot('#0ea5e9')}>📍</div>
              <div style={sectionTitle}>Endereço</div>
            </div>
            <div style={cardBody}>
              <div style={{ ...grid3, marginBottom: '1.25rem' }}>
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={label}>Rua / Logradouro</label>
                  <input name="rua" style={input} placeholder="Rua, Avenida, Travessa..." />
                </div>
                <div>
                  <label style={label}>Número</label>
                  <input name="numero" style={input} placeholder="Ex: 142" />
                </div>
              </div>
              <div style={{ ...grid3, marginBottom: '1.25rem' }}>
                <div>
                  <label style={label}>Complemento</label>
                  <input name="complemento" style={input} placeholder="Sala, Bloco..." />
                </div>
                <div>
                  <label style={label}>Bairro</label>
                  <input name="bairro" style={input} />
                </div>
                <div>
                  <label style={label}>CEP</label>
                  <input name="cep" style={input} placeholder="00000-000" />
                </div>
              </div>
              <div style={grid2}>
                <div>
                  <label style={label}>Cidade</label>
                  <input name="cidade" style={input} />
                </div>
                <div>
                  <label style={label}>Estado (UF)</label>
                  <input name="estado" style={input} maxLength={2} placeholder="Ex: PB" />
                </div>
              </div>
            </div>
          </div>

          {/* ── 3. CONTATO ─────────────────────────────────────── */}
          <div style={card}>
            <div style={cardHeader('#8b5cf6')}>
              <div style={dot('#8b5cf6')}>📞</div>
              <div style={sectionTitle}>Contato</div>
            </div>
            <div style={cardBody}>
              <div style={{ ...grid3, marginBottom: '1.25rem' }}>
                <div>
                  <label style={label}>Telefone</label>
                  <input name="telefone" style={input} placeholder="(00) 00000-0000" />
                </div>
                <div>
                  <label style={label}>E-mail</label>
                  <input name="email" type="email" style={input} placeholder="contato@escola.edu.br" />
                </div>
                <div>
                  <label style={label}>Site</label>
                  <input name="site" style={input} placeholder="https://..." />
                </div>
              </div>
              <div style={grid3}>
                <div>
                  <label style={label}>Nome do Contato Principal</label>
                  <input name="contato_nome" style={input} />
                </div>
                <div>
                  <label style={label}>Cargo do Contato</label>
                  <select name="contato_cargo" style={input}>
                    <option value="">Selecione...</option>
                    {CARGO_CONTATO_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label style={label}>Nome do Diretor</label>
                  <input name="diretor_nome" style={input} />
                </div>
              </div>
            </div>
          </div>

          {/* ── 4. ALUNOS POR TURMA ────────────────────────────── */}
          <div style={card}>
            <div style={cardHeader('#16a34a')}>
              <div style={dot('#16a34a')}>🎓</div>
              <div>
                <div style={sectionTitle}>Quantidade de Alunos por Turma</div>
                <div style={{ fontSize: '.68rem', color: '#94a3b8', marginTop: '.1rem', fontFamily: 'var(--font-inter,sans-serif)' }}>
                  Preencha apenas as turmas que a escola possui. Deixe 0 para turmas inexistentes.
                </div>
              </div>
            </div>
            <div style={cardBody}>

              {/* Educação Infantil */}
              <div style={{ marginBottom: '1.75rem' }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '.5rem',
                  marginBottom: '1rem',
                }}>
                  <div style={{ width: 4, height: 18, background: '#f97316', borderRadius: 2 }} />
                  <span style={{ fontFamily: 'var(--font-montserrat,sans-serif)', fontSize: '.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', color: '#f97316' }}>
                    Educação Infantil
                  </span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '1rem' }}>
                  <TurmaField name="qtd_infantil" label="Infantil (geral)" />
                </div>
                <div style={{ fontSize: '.68rem', color: '#94a3b8', marginTop: '.5rem', fontFamily: 'var(--font-inter,sans-serif)' }}>
                  * Total consolidado da Ed. Infantil (Inf. 2 ao Inf. 5 serão detalhados no formulário contratual)
                </div>
              </div>

              {/* Fundamental I */}
              <div style={{ marginBottom: '1.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', marginBottom: '1rem' }}>
                  <div style={{ width: 4, height: 18, background: '#0ea5e9', borderRadius: 2 }} />
                  <span style={{ fontFamily: 'var(--font-montserrat,sans-serif)', fontSize: '.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', color: '#0ea5e9' }}>
                    Ensino Fundamental I — 1º ao 5º Ano
                  </span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: '1rem' }}>
                  <TurmaField name="qtd_fund1_ano1" label="1º Ano" />
                  <TurmaField name="qtd_fund1_ano2" label="2º Ano" />
                  <TurmaField name="qtd_fund1_ano3" label="3º Ano" />
                  <TurmaField name="qtd_fund1_ano4" label="4º Ano" />
                  <TurmaField name="qtd_fund1_ano5" label="5º Ano" />
                </div>
              </div>

              {/* Fundamental II */}
              <div style={{ marginBottom: '1.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', marginBottom: '1rem' }}>
                  <div style={{ width: 4, height: 18, background: '#8b5cf6', borderRadius: 2 }} />
                  <span style={{ fontFamily: 'var(--font-montserrat,sans-serif)', fontSize: '.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', color: '#8b5cf6' }}>
                    Ensino Fundamental II — 6º ao 9º Ano
                  </span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '1rem' }}>
                  <TurmaField name="qtd_fund2_ano6" label="6º Ano" />
                  <TurmaField name="qtd_fund2_ano7" label="7º Ano" />
                  <TurmaField name="qtd_fund2_ano8" label="8º Ano" />
                  <TurmaField name="qtd_fund2_ano9" label="9º Ano" />
                </div>
              </div>

              {/* Ensino Médio */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', marginBottom: '1rem' }}>
                  <div style={{ width: 4, height: 18, background: '#dc2626', borderRadius: 2 }} />
                  <span style={{ fontFamily: 'var(--font-montserrat,sans-serif)', fontSize: '.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', color: '#dc2626' }}>
                    Ensino Médio — 1ª à 3ª Série
                  </span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1rem' }}>
                  <TurmaField name="qtd_medio_1s" label="1ª Série" />
                  <TurmaField name="qtd_medio_2s" label="2ª Série" />
                  <TurmaField name="qtd_medio_3s" label="3ª Série" />
                </div>
              </div>

              {/* Totais legado (hidden — calculados no backend) */}
              <input type="hidden" name="qtd_fund1" value="0" />
              <input type="hidden" name="qtd_fund2" value="0" />
              <input type="hidden" name="qtd_medio" value="0" />
            </div>
          </div>

          {/* ── 5. GESTÃO COMERCIAL ────────────────────────────── */}
          <div style={card}>
            <div style={cardHeader('#d97706')}>
              <div style={dot()}>📊</div>
              <div style={sectionTitle}>Gestão Comercial</div>
            </div>
            <div style={cardBody}>
              <div style={{ ...grid2, marginBottom: '1.25rem' }}>
                <div>
                  <label style={label}>Origem do Lead</label>
                  <select name="origem_lead" style={input}>
                    <option value="">Selecione...</option>
                    {ORIGEM_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
                <div>
                  <label style={label}>Responsável Comercial</label>
                  <select name="responsavel_id" style={input}>
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
                  placeholder="Notas relevantes sobre esta escola..." />
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
              Cadastrar Escola
            </button>
            <Link href="/comercial/escolas" style={{
              padding: '.7rem 1.5rem', borderRadius: 9999,
              border: '1.5px solid #e2e8f0', background: '#fff',
              color: '#64748b', textDecoration: 'none',
              fontSize: '.875rem', fontWeight: 600,
              fontFamily: 'var(--font-montserrat,sans-serif)',
            }}>
              Cancelar
            </Link>
            <span style={{ fontSize: '.72rem', color: '#94a3b8', fontFamily: 'var(--font-inter,sans-serif)', marginLeft: 'auto' }}>
              Campos com <span style={{ color: '#d97706', fontWeight: 700 }}>*</span> são obrigatórios
            </span>
          </div>

        </form>
      </div>
    </div>
  )
}
