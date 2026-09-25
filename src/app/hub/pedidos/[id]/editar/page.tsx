import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { atualizarPrevisaoPedido } from '@/lib/actions'
import { ArrowLeft } from 'lucide-react'

export const dynamic = 'force-dynamic'

const SERIES = [
  ['Infantil II', 'infantil2'],
  ['Infantil III', 'infantil3'],
  ['Infantil IV', 'infantil4'],
  ['Infantil V', 'infantil5'],
  ['1º ano - Fund I', 'fund1_ano1'],
  ['2º ano - Fund I', 'fund1_ano2'],
  ['3º ano - Fund I', 'fund1_ano3'],
  ['4º ano - Fund I', 'fund1_ano4'],
  ['5º ano - Fund I', 'fund1_ano5'],
] as const

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '2rem' }}>
      <div style={{ fontSize: '.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', color: '#0ea5e9', borderBottom: '2px solid #0ea5e9', paddingBottom: '.4rem', marginBottom: '1rem' }}>
        {title}
      </div>
      {children}
    </div>
  )
}

function Row({ children }: { children: React.ReactNode }) {
  return <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>{children}</div>
}

function Field({ label, name, type = 'text', required, options, defaultValue }: {
  label: string; name: string; type?: string; required?: boolean; options?: string[]; defaultValue?: string
}) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: '.82rem', fontWeight: 600, color: '#4A5568', marginBottom: '.4rem' }}>
        {label}{required && ' *'}
      </label>
      {options ? (
        <select name={name} required={required} defaultValue={defaultValue}
          style={{ width: '100%', padding: '.55rem .85rem', fontSize: '.875rem', border: '1px solid #CBD5E1', borderRadius: 8, background: '#fff', outline: 'none' }}>
          {options.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      ) : type === 'textarea' ? (
        <textarea name={name} rows={4} defaultValue={defaultValue}
          style={{ width: '100%', padding: '.55rem .85rem', fontSize: '.875rem', border: '1px solid #CBD5E1', borderRadius: 8, resize: 'vertical', outline: 'none' }} />
      ) : (
        <input name={name} type={type} required={required} defaultValue={defaultValue}
          style={{ width: '100%', padding: '.55rem .85rem', fontSize: '.875rem', border: '1px solid #CBD5E1', borderRadius: 8, outline: 'none' }} />
      )}
    </div>
  )
}

export default async function EditarPrevisaoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/hub/pedidos/login')

  const { data: p } = await supabase.from('previsoes_pedidos').select('*').eq('id', id).single()

  if (!p) {
    return (
      <div style={{ minHeight: '100vh', background: '#F7FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: '#64748b', marginBottom: '1rem' }}>Previsão não encontrada.</p>
          <Link href="/hub/pedidos" style={{ color: '#0ea5e9', fontWeight: 700 }}>← Voltar para Gestão de Pedidos</Link>
        </div>
      </div>
    )
  }

  const seriesAdotadas: string[] = p.series_adotadas ?? []

  return (
    <div style={{ minHeight: '100vh', background: '#F7FAFC', padding: '2rem 1rem' }}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>

        <Link href="/hub/pedidos" style={{ display: 'inline-flex', alignItems: 'center', gap: '.4rem', color: '#475569', fontSize: '.85rem', fontWeight: 600, textDecoration: 'none', marginBottom: '1.5rem' }}>
          <ArrowLeft size={15} /> Voltar para Gestão de Pedidos
        </Link>

        <h1 style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.75rem', fontWeight: 700, color: '#0f172a', marginBottom: '1.5rem' }}>
          Editar previsão — {p.nome_instituicao}
        </h1>

        <form action={atualizarPrevisaoPedido}>
          <input type="hidden" name="id" value={p.id} />

          <div style={{ background: '#fff', borderRadius: 16, padding: '2rem', boxShadow: '0 4px 6px rgba(0,0,0,.07)' }}>

            <Section title="Triagem interna">
              <Field label="Status" name="status" required defaultValue={p.status} options={['recebido', 'em_analise', 'confirmado']} />
            </Section>

            <Section title="Dados da Instituição">
              <Row>
                <Field label="Nome da Instituição" name="nome_instituicao" required defaultValue={p.nome_instituicao} />
                <Field label="CNPJ" name="cnpj" defaultValue={p.cnpj ?? ''} />
              </Row>
              <Field label="Endereço completo" name="endereco" defaultValue={p.endereco ?? ''} />
              <Row>
                <Field label="Representante Legal" name="representante_legal" defaultValue={p.representante_legal ?? ''} />
              </Row>
            </Section>

            <Section title="Responsável pelo Preenchimento">
              <Row>
                <Field label="Nome do responsável" name="responsavel_nome" required defaultValue={p.responsavel_nome} />
                <Field label="Telefone do responsável" name="responsavel_telefone" required defaultValue={p.responsavel_telefone} />
              </Row>
            </Section>

            <Section title="Informações Acadêmicas">
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '.82rem', fontWeight: 600, color: '#4A5568', marginBottom: '.5rem' }}>
                  Séries adotadas
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.75rem' }}>
                  {SERIES.map(([label]) => (
                    <label key={label} style={{ display: 'flex', alignItems: 'center', gap: '.4rem', fontSize: '.85rem', color: '#2d3748', cursor: 'pointer', background: '#F7FAFC', border: '1px solid #E2E8F0', borderRadius: 8, padding: '.4rem .7rem' }}>
                      <input type="checkbox" name="series_adotadas" value={label} defaultChecked={seriesAdotadas.includes(label)} />
                      {label}
                    </label>
                  ))}
                </div>
              </div>

              <Row>
                <Field label="Ano letivo" name="ano_letivo" type="number" required defaultValue={String(p.ano_letivo)} />
                <Field label="Início do ano letivo" name="data_inicio_letivo" type="date" defaultValue={p.data_inicio_letivo ?? ''} />
                <Field label="Fim do ano letivo" name="data_fim_letivo" type="date" defaultValue={p.data_fim_letivo ?? ''} />
              </Row>

              <Field label="Formato do calendário letivo" name="formato_calendario" defaultValue={p.formato_calendario ?? 'Bimestral'} options={['Bimestral', 'Trimestral', 'Semestral']} />
            </Section>

            <Section title="Previsão de Alunos por Série">
              <Row>
                {SERIES.map(([label, key]) => (
                  <Field key={key} label={label} name={`${key}_qtd`} type="number" required defaultValue={String(p[`${key}_qtd`] ?? 0)} />
                ))}
              </Row>
            </Section>

            <Section title="Como a escola quer receber o material">
              <Field label="Observações sobre a entrega do material" name="observacoes_material" type="textarea" defaultValue={p.observacoes_material ?? ''} />
            </Section>

            <button type="submit"
              style={{ width: '100%', padding: '.85rem', background: '#0ea5e9', color: '#fff', fontWeight: 700, fontSize: '1rem', border: 'none', borderRadius: 9999, cursor: 'pointer', fontFamily: 'var(--font-montserrat, sans-serif)', letterSpacing: '.02em' }}>
              Salvar alterações
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
