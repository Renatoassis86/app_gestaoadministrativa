import { enviarFormularioPublico } from '@/lib/actions'

const ESTADOS_BR = [
  'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG',
  'PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'
]

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '2rem' }}>
      <div style={{ fontSize: '.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--brand-orange)', borderBottom: '2px solid var(--brand-orange)', paddingBottom: '.4rem', marginBottom: '1rem' }}>
        {title}
      </div>
      {children}
    </div>
  )
}

function Row({ children }: { children: React.ReactNode }) {
  return <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>{children}</div>
}

function Field({ label, name, type = 'text', required, options }: {
  label: string; name: string; type?: string; required?: boolean; options?: string[]
}) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: '.82rem', fontWeight: 600, color: '#4A5568', marginBottom: '.4rem' }}>
        {label}{required && ' *'}
      </label>
      {options ? (
        <select name={name} required={required} style={{ width: '100%', padding: '.55rem .85rem', fontSize: '.875rem', border: '1px solid #CBD5E1', borderRadius: 8, background: '#fff', outline: 'none' }}>
          <option value="">Selecione...</option>
          {options.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      ) : type === 'textarea' ? (
        <textarea name={name} rows={3} style={{ width: '100%', padding: '.55rem .85rem', fontSize: '.875rem', border: '1px solid #CBD5E1', borderRadius: 8, resize: 'vertical', outline: 'none' }} />
      ) : (
        <input name={name} type={type} required={required}
          style={{ width: '100%', padding: '.55rem .85rem', fontSize: '.875rem', border: '1px solid #CBD5E1', borderRadius: 8, outline: 'none' }} />
      )}
    </div>
  )
}

export default function FormularioPublico() {
  return (
    <div style={{ minHeight: '100vh', background: '#F0F2F5', padding: '2rem 1rem' }}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ width: 60, height: 60, background: '#F58220', borderRadius: 14, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
            <span style={{ fontSize: '1.5rem' }}>🏫</span>
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#003366', marginBottom: '.3rem' }}>
            Formulário de Pré-Cadastro Escolar
          </h1>
          <p style={{ color: '#718096', fontSize: '.9rem' }}>
            Cidade Viva Education — Preencha os dados da sua escola para iniciar a parceria
          </p>
        </div>

        <form action={enviarFormularioPublico}>
          <div style={{ background: '#fff', borderRadius: 16, padding: '2rem', boxShadow: '0 4px 6px rgba(0,0,0,.07)', marginBottom: '1.5rem' }}>

            <Section title="Responsável pelo Preenchimento">
              <Field label="Seu e-mail" name="email_responsavel" type="email" required />
            </Section>

            <Section title="Dados da Escola">
              <Row>
                <Field label="Nome da Escola" name="nome_escola" required />
                <Field label="CNPJ" name="cnpj" />
              </Row>
              <Row>
                <div style={{ gridColumn: 'span 2' }}><Field label="Rua" name="rua" /></div>
                <Field label="Número" name="numero" />
              </Row>
              <Row>
                <Field label="Complemento" name="complemento" />
                <Field label="Bairro" name="bairro" />
                <Field label="CEP" name="cep" />
              </Row>
              <Row>
                <div style={{ gridColumn: 'span 2' }}><Field label="Cidade" name="cidade" /></div>
                <Field label="Estado (UF)" name="estado" options={ESTADOS_BR} />
              </Row>
            </Section>

            <Section title="Informações Acadêmicas">
              <Row>
                {[
                  ['infantil2_qtd','Qtd Infantil 2'],
                  ['infantil3_qtd','Qtd Infantil 3'],
                  ['infantil4_qtd','Qtd Infantil 4'],
                  ['infantil5_qtd','Qtd Infantil 5'],
                  ['fund1_ano1_qtd','Qtd 1º Ano Fund I'],
                  ['fund1_ano2_qtd','Qtd 2º Ano Fund I'],
                  ['fund1_ano3_qtd','Qtd 3º Ano Fund I'],
                  ['fund1_ano4_qtd','Qtd 4º Ano Fund I'],
                  ['fund1_ano5_qtd','Qtd 5º Ano Fund I'],
                ].map(([n,l]) => (
                  <div key={n}>
                    <label style={{ display: 'block', fontSize: '.82rem', fontWeight: 600, color: '#4A5568', marginBottom: '.4rem' }}>{l}</label>
                    <input name={n} type="number" min="0" defaultValue="0"
                      style={{ width: '100%', padding: '.55rem .85rem', fontSize: '.875rem', border: '1px solid #CBD5E1', borderRadius: 8 }} />
                  </div>
                ))}
              </Row>
              <Row>
                <Field label="Previsão início do ano letivo 2026" name="data_inicio_letivo" type="date" />
                <Field label="Previsão fim do ano letivo 2026" name="data_fim_letivo" type="date" />
                <Field label="Formato do ano letivo" name="formato_ano_letivo" options={['Bimestre','Trimestre']} />
              </Row>
              <Field label="Observações adicionais" name="observacoes" type="textarea" />
            </Section>

            <Section title="Representante Legal">
              <Row>
                <Field label="Nome" name="legal_nome" />
                <Field label="CPF" name="legal_cpf" />
                <Field label="RG" name="legal_rg" />
                <Field label="Órgão Emissor" name="legal_orgao" />
              </Row>
              <Row>
                <div style={{ gridColumn: 'span 2' }}><Field label="Rua" name="legal_rua" /></div>
                <Field label="Número" name="legal_numero" />
              </Row>
              <Row>
                <Field label="Complemento" name="legal_complemento" />
                <Field label="Bairro" name="legal_bairro" />
                <Field label="Cidade" name="legal_cidade" />
                <Field label="Estado" name="legal_estado" options={ESTADOS_BR} />
                <Field label="CEP" name="legal_cep" />
              </Row>
              <Row>
                <Field label="E-mail" name="legal_email" type="email" />
                <Field label="Celular" name="legal_celular" />
              </Row>
            </Section>

            <Section title="Representante Financeiro">
              <Row>
                <Field label="Nome" name="fin_nome" />
                <Field label="CPF" name="fin_cpf" />
                <Field label="RG" name="fin_rg" />
                <Field label="Órgão Emissor" name="fin_orgao" />
              </Row>
              <Row>
                <Field label="E-mail" name="fin_email" type="email" />
                <Field label="Celular" name="fin_celular" />
              </Row>
            </Section>

            <Section title="Representante Pedagógico">
              <Row>
                <Field label="Nome" name="ped_nome" />
                <Field label="CPF" name="ped_cpf" />
                <Field label="RG" name="ped_rg" />
                <Field label="Órgão Emissor" name="ped_orgao" />
              </Row>
              <Row>
                <Field label="E-mail" name="ped_email" type="email" />
                <Field label="Celular" name="ped_celular" />
              </Row>
            </Section>

            <button type="submit"
              style={{ width: '100%', padding: '.85rem', background: '#F58220', color: '#fff', fontWeight: 700, fontSize: '1rem', border: 'none', borderRadius: 10, cursor: 'pointer' }}>
              Enviar Formulário
            </button>
          </div>
        </form>

        <p style={{ textAlign: 'center', fontSize: '.75rem', color: '#718096' }}>
          Cidade Viva Education © {new Date().getFullYear()} · Após envio, nossa equipe entrará em contato.
        </p>
      </div>
    </div>
  )
}
