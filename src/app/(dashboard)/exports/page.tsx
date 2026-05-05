import { createClient } from '@/lib/supabase/server'
import PageHeader from '@/components/layout/PageHeader'
import { formatDate } from '@/lib/utils'
import { Download, FileText } from 'lucide-react'

export default async function ExportsPage() {
  const supabase = await createClient()
  const { data: formularios } = await supabase
    .from('formularios')
    .select('id, data_envio, nome_escola, email_responsavel, cidade, estado')
    .order('data_envio', { ascending: false })

  return (
    <div>
      <PageHeader title="Relatórios e Downloads" subtitle="Documentos e formulários preenchidos" />
      <div className="p-6">

        {/* Documentos oficiais */}
        <div className="card mb-6">
          <div className="card-header"><span className="card-title">Documentos Oficiais</span></div>
          <div className="card-body">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              {[
                { label: 'Ficha Cadastral', sub: 'Cidade Viva Education.docx', href: '/docs/ficha-cadastral.docx', cor: '#EBF4FF', icon: '📄' },
                { label: 'Minuta do Contrato', sub: 'Minuta - Cidade Viva Education.pdf', href: '/docs/minuta-contrato.pdf', cor: '#FFF5F5', icon: '📋' },
              ].map(doc => (
                <div key={doc.label} style={{ padding: '1.25rem', border: '1px solid var(--border)', borderRadius: 10, display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: 44, height: 44, background: doc.cor, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '1.25rem' }}>
                    {doc.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: '.9rem', color: 'var(--brand-blue)' }}>{doc.label}</div>
                    <div style={{ fontSize: '.75rem', color: 'var(--text-s)' }}>{doc.sub}</div>
                  </div>
                  <a href={doc.href} download className="btn btn-outline btn-sm">
                    <Download size={14} /> Baixar
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Link do formulário público */}
        <div className="card mb-6" style={{ borderLeft: '4px solid var(--brand-orange)' }}>
          <div className="card-body" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ fontWeight: 700, color: 'var(--brand-blue)' }}>Formulário de Pré-Cadastro Escolar</div>
              <div style={{ fontSize: '.85rem', color: 'var(--text-s)' }}>
                Link público para escolas preencherem seus dados · <strong>/formulario</strong>
              </div>
            </div>
            <a href="/formulario" target="_blank" className="btn btn-outline btn-sm">
              Abrir Formulário
            </a>
          </div>
        </div>

        {/* Formulários preenchidos */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Formulários Preenchidos ({formularios?.length ?? 0})</span>
          </div>
          <div style={{ overflowX: 'auto' }}>
            {formularios && formularios.length > 0 ? (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Data</th><th>Escola</th><th>Responsável</th><th>Localidade</th>
                  </tr>
                </thead>
                <tbody>
                  {formularios.map((f: any) => (
                    <tr key={f.id}>
                      <td style={{ fontSize: '.78rem', color: 'var(--text-s)' }}>{formatDate(f.data_envio)}</td>
                      <td style={{ fontWeight: 600 }}>{f.nome_escola}</td>
                      <td style={{ fontSize: '.85rem' }}>{f.email_responsavel}</td>
                      <td style={{ fontSize: '.85rem' }}>{f.cidade}{f.estado ? `, ${f.estado}` : ''}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="empty-state">
                <h3>Nenhum formulário preenchido ainda</h3>
                <p>Compartilhe o link <strong>/formulario</strong> com as escolas parceiras.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
