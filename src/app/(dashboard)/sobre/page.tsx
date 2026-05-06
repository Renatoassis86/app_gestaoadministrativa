import PageHeader from '@/components/layout/PageHeader'

function Bloco({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1.5rem', marginBottom: '1rem', boxShadow: 'var(--shadow)' }}>
      <h3 style={{ fontSize: '.95rem', fontWeight: 700, color: 'var(--brand-blue)', marginBottom: '.75rem' }}>{titulo}</h3>
      {children}
    </div>
  )
}

export default function SobrePage() {
  return (
    <div>
      <PageHeader title="Sobre o Aplicativo" subtitle="CVE Gestão Comercial — Cidade Viva Education" />
      <div className="p-6" style={{ maxWidth: 900 }}>

        <Bloco titulo="Sobre o Aplicativo">
          <p style={{ fontSize: '.9rem', color: 'var(--text-m)', lineHeight: 1.7 }}>
            O Aplicativo de Gerenciamento Comercial Cidade Viva Education foi desenvolvido para atender às necessidades estratégicas da equipe comercial, oferecendo uma plataforma prática, segura e eficiente para organizar, controlar e analisar o relacionamento com as escolas e instituições parceiras.
          </p>
        </Bloco>

        <Bloco titulo="Propósito do Aplicativo">
          <p style={{ fontSize: '.9rem', color: 'var(--text-m)', lineHeight: 1.7 }}>
            Seu principal objetivo é centralizar o processo de gestão de propostas comerciais, registros de negociações e acompanhamento do desempenho, proporcionando uma visão clara das oportunidades e decisões estratégicas.
          </p>
        </Bloco>

        <Bloco titulo="Justificativa da Plataforma">
          <p style={{ fontSize: '.9rem', color: 'var(--text-m)', lineHeight: 1.7 }}>
            A criação deste sistema responde à necessidade de maior controle e padronização das informações comerciais, aumentando a agilidade na comunicação interna, otimizando o atendimento e possibilitando a análise crítica de dados para orientar tomadas de decisão fundamentadas.
          </p>
        </Bloco>

        <Bloco titulo="Principais Funcionalidades">
          <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '.5rem' }}>
            {[
              'Cadastro e gerenciamento de escolas e clientes',
              'Registro detalhado de propostas e negociações',
              'Acompanhamento de status das tratativas comerciais',
              'Painéis de visualização de desempenho comercial (Dashboards)',
              'Geração de relatórios de apoio à gestão',
              'Histórico centralizado de interações',
            ].map(f => (
              <li key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: '.5rem', fontSize: '.9rem', color: 'var(--text-m)' }}>
                <span style={{ color: 'var(--brand-orange)', fontWeight: 700, flexShrink: 0 }}>✓</span>
                {f}
              </li>
            ))}
          </ul>
        </Bloco>

        <Bloco titulo="Impacto Esperado">
          <p style={{ fontSize: '.9rem', color: 'var(--text-m)', lineHeight: 1.7 }}>
            Com o uso do aplicativo, a equipe comercial poderá estabelecer processos mais organizados, mensurar resultados de maneira eficiente, aprimorar o relacionamento com os parceiros e embasar decisões estratégicas na análise de dados reais e consolidados.
          </p>
        </Bloco>

        {/* Missão, Visão e Valores */}
        <Bloco titulo="Missão">
          <p style={{ fontSize: '.9rem', color: 'var(--text-m)', fontStyle: 'italic' }}>
            "Conduzir pessoas ao deslumbramento a partir de uma educação cristã de excelência."
          </p>
        </Bloco>

        <Bloco titulo="Visão">
          <p style={{ fontSize: '.9rem', color: 'var(--text-m)', fontStyle: 'italic' }}>
            "Ser uma ponte que resgata presentes do passado, educando mentes e corações para a contemplação, a virtude, o serviço e a glória de Deus."
          </p>
        </Bloco>

        <Bloco titulo="Valores Organizacionais">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            {[
              {
                eixo: 'Eixo Cristão',
                itens: [
                  ['Piedade', 'Relacionamento íntimo e reverente com Deus'],
                  ['Sabedoria', 'Discernimento e prudência aplicados na vida'],
                  ['Amor', 'Expressar o amor de Cristo em todas as relações'],
                  ['Cosmovisão Cristã', 'Visão de mundo moldada pela Palavra de Deus'],
                ]
              },
              {
                eixo: 'Eixo Pedagógico',
                itens: [
                  ['Liberdade', 'Formação de indivíduos capazes de agir com responsabilidade'],
                  ['Excelência', 'Buscar sempre padrões elevados em todas as atividades'],
                  ['Integralidade', 'Educação completa para corpo, mente e espírito'],
                  ['Beleza', 'Reconhecimento da beleza como reflexo da criação divina'],
                  ['Tradição', 'Preservar e valorizar legados essenciais para a educação'],
                  ['Verdade', 'Compromisso com princípios imutáveis e eternos'],
                ]
              },
              {
                eixo: 'Eixo de Inovação',
                itens: [
                  ['Estética', 'Desenvolvimento da sensibilidade para o belo'],
                  ['Criatividade', 'Estímulo à criação de novas soluções educativas'],
                  ['Regionalidade', 'Valorização das raízes e cultura local'],
                  ['Tecnologia', 'Uso ético e inteligente de recursos tecnológicos'],
                  ['Experiência', 'Aprendizado vivencial e prático'],
                ]
              },
              {
                eixo: 'Eixo Organizacional',
                itens: [
                  ['Transparência', 'Clareza e abertura nas ações institucionais'],
                  ['Prudência', 'Tomada de decisões cuidadosas e responsáveis'],
                  ['Mordomia', 'Gestão responsável dos recursos confiados por Deus'],
                  ['Comprometimento', 'Dedicação total à missão e aos valores da organização'],
                ]
              },
            ].map(({ eixo, itens }) => (
              <div key={eixo}>
                <div style={{ fontWeight: 700, fontSize: '.82rem', color: 'var(--brand-orange)', textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: '.5rem' }}>{eixo}</div>
                {itens.map(([nome, desc]) => (
                  <div key={nome} style={{ marginBottom: '.4rem' }}>
                    <span style={{ fontWeight: 600, fontSize: '.85rem' }}>{nome}:</span>{' '}
                    <span style={{ fontSize: '.82rem', color: 'var(--text-s)' }}>{desc}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </Bloco>

        <div style={{ textAlign: 'center', padding: '1rem', fontSize: '.75rem', color: 'var(--text-s)' }}>
          Cidade Viva Education © {new Date().getFullYear()} · Central de Inteligência Analítica
        </div>
      </div>
    </div>
  )
}
