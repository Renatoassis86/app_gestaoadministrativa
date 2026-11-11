'use client'

import { MODALIDADES, fmtCnpj, type Modalidade } from '@/lib/contratos'
import { ArquivosEscola, type ArquivoContrato } from '@/components/contratos/ArquivosEscola'

export interface EscolaRepo { id: string; nome: string; cnpj: string | null; modalidade: Modalidade; arquivos: ArquivoContrato[] }

export function RepositorioClient({ escolas }: { escolas: EscolaRepo[] }) {
  return (
    <div style={{ display: 'grid', gap: '.8rem', maxWidth: 900 }}>
      {escolas.map(e => {
        const m = MODALIDADES[e.modalidade]
        return (
          <div key={e.id} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: '.9rem 1rem' }}>
            <div style={{ marginBottom: '.6rem' }}>
              <strong style={{ fontSize: '.92rem' }}>{e.nome}</strong>
              <span style={{ marginLeft: '.5rem', background: m.bg, color: m.cor, borderRadius: 9999, padding: '.1rem .5rem', fontSize: '.66rem', fontWeight: 800 }}>{m.label}</span>
              <div style={{ fontSize: '.72rem', color: '#64748b' }}>{fmtCnpj(e.cnpj)}</div>
            </div>
            <ArquivosEscola escolaId={e.id} inicial={e.arquivos} />
          </div>
        )
      })}
    </div>
  )
}
