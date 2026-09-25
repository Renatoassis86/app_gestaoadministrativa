import { enviarPrevisaoPedido } from '@/lib/actions'

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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '.5rem', paddingTop: '.2rem' }}>
          {options.map(o => (
            <label key={o} style={{ display: 'flex', alignItems: 'center', gap: '.5rem', fontSize: '.875rem', color: '#2d3748', cursor: 'pointer' }}>
              <input type="radio" name={name} value={o} required={required} />
              {o}
            </label>
          ))}
        </div>
      ) : type === 'textarea' ? (
        <textarea name={name} rows={4} defaultValue={defaultValue} placeholder="Ex.: kit individual por aluno, separado por série, com etiqueta do nome..."
          style={{ width: '100%', padding: '.55rem .85rem', fontSize: '.875rem', border: '1px solid #CBD5E1', borderRadius: 8, resize: 'vertical', outline: 'none' }} />
      ) : (
        <input name={name} type={type} required={required} defaultValue={defaultValue}
          style={{ width: '100%', padding: '.55rem .85rem', fontSize: '.875rem', border: '1px solid #CBD5E1', borderRadius: 8, outline: 'none' }} />
      )}
    </div>
  )
}

export default function FormularioPedidosPublico() {
  const anoLetivo = new Date().getFullYear() + 1

  return (
    <div style={{ minHeight: '100vh', background: '#F0F2F5', padding: '2rem 1rem' }}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>

        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <img
            src="/images/logo_azul.png"
            alt="Cidade Viva Education"
            style={{ height: 56, objectFit: 'contain', marginBottom: '1.5rem' }}
          />
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '.4rem',
            background: '#f0f9ff', border: '1px solid #bae6fd',
            borderRadius: 9999, padding: '.3rem .9rem', marginBottom: '1rem',
            fontSize: '.7rem', fontWeight: 700, color: '#0369a1',
            textTransform: 'uppercase', letterSpacing: '.08em',
            fontFamily: 'var(--font-montserrat, sans-serif)',
          }}>
            ✦ Escolas parceiras Cidade Viva Education
          </div>
          <h1 style={{
            fontFamily: 'var(--font-cormorant, "Georgia", serif)',
            fontSize: 'clamp(1.8rem, 4vw, 2.6rem)',
            fontWeight: 700, color: '#0f172a', lineHeight: 1.15,
            marginBottom: '.75rem',
          }}>
            Previsão de Pedidos<br />
            <span style={{ color: '#0ea5e9' }}>Ano Letivo {anoLetivo}</span>
          </h1>
          <p style={{
            color: '#475569', fontSize: '.95rem', lineHeight: 1.6,
            maxWidth: 560, margin: '0 auto',
            fontFamily: 'var(--font-inter, sans-serif)',
          }}>
            Preencha com a previsão de alunos por série para {anoLetivo} e como sua escola deseja receber o material. Isso garante que a separação e o envio dos pedidos aconteçam sem atraso.
          </p>
        </div>

        <form action={enviarPrevisaoPedido}>
          <input type="hidden" name="ano_letivo" value={anoLetivo} />

          <div style={{ background: '#fff', borderRadius: 16, padding: '2rem', boxShadow: '0 4px 6px rgba(0,0,0,.07)', marginBottom: '1.5rem' }}>

            <Section title="Dados da Instituição">
              <Row>
                <Field label="Nome da Instituição" name="nome_instituicao" required />
                <Field label="CNPJ" name="cnpj" required />
              </Row>
              <Field label="Endereço completo da Instituição (com CEP)" name="endereco" required />
              <Row>
                <Field label="Representante Legal" name="representante_legal" required />
              </Row>
            </Section>

            <Section title="Responsável pelo Preenchimento">
              <Row>
                <Field label="Nome completo do responsável pelo preenchimento" name="responsavel_nome" required />
                <Field label="Telefone do responsável pelo preenchimento" name="responsavel_telefone" required />
              </Row>
            </Section>

            <Section title="Informações Acadêmicas">
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '.82rem', fontWeight: 600, color: '#4A5568', marginBottom: '.5rem' }}>
                  Quais séries a instituição irá adotar em {anoLetivo}? *
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.75rem' }}>
                  {SERIES.map(([label, key]) => (
                    <label key={key} style={{ display: 'flex', alignItems: 'center', gap: '.4rem', fontSize: '.85rem', color: '#2d3748', cursor: 'pointer', background: '#F7FAFC', border: '1px solid #E2E8F0', borderRadius: 8, padding: '.4rem .7rem' }}>
                      <input type="checkbox" name="series_adotadas" value={label} />
                      {label}
                    </label>
                  ))}
                </div>
              </div>

              <Row>
                <Field label="Início do ano letivo" name="data_inicio_letivo" type="date" required />
                <Field label="Fim do ano letivo" name="data_fim_letivo" type="date" required />
              </Row>

              <Field label="Formato do calendário letivo" name="formato_calendario" required options={['Bimestral', 'Trimestral', 'Semestral']} />
            </Section>

            <Section title="Previsão de Alunos por Série">
              <p style={{ fontSize: '.82rem', color: '#718096', marginBottom: '1rem' }}>
                Informe "0" nas séries que não serão adotadas pela instituição.
              </p>
              <Row>
                {SERIES.map(([label, key]) => (
                  <Field key={key} label={label} name={`${key}_qtd`} type="number" required defaultValue="0" />
                ))}
              </Row>
            </Section>

            <Section title="Como sua escola quer receber o material?">
              <Field label="Observações sobre a entrega do material" name="observacoes_material" type="textarea" />
            </Section>

            <button type="submit"
              style={{ width: '100%', padding: '.85rem', background: '#0ea5e9', color: '#fff', fontWeight: 700, fontSize: '1rem', border: 'none', borderRadius: 9999, cursor: 'pointer', fontFamily: 'var(--font-montserrat, sans-serif)', letterSpacing: '.02em', boxShadow: '0 4px 14px rgba(14,165,233,.35)' }}>
              Enviar Previsão de Pedidos
            </button>
          </div>
        </form>

        <p style={{ textAlign: 'center', fontSize: '.75rem', color: '#718096' }}>
          Cidade Viva Education © {new Date().getFullYear()} · Dúvidas: pedidos.education@cidadeviva.org
        </p>
      </div>
    </div>
  )
}
