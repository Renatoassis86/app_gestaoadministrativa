'use client'

import { useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { BUCKET_CONTRATOS, CATEGORIAS_ARQUIVO, fmtData } from '@/lib/contratos'

export interface ArquivoContrato { id: string; nome: string; path: string; tamanho: number | null; categoria: string; created_at: string }

const kb = (n?: number | null) => (n == null ? '' : n > 1048576 ? `${(n / 1048576).toFixed(1)} MB` : `${Math.round(n / 1024)} KB`)

// Upload + lista de documentos de UMA escola. Usado no cartão da escola e no Repositório.
export function ArquivosEscola({ escolaId, inicial, compacto = false }: { escolaId: string; inicial: ArquivoContrato[]; compacto?: boolean }) {
  const [arquivos, setArquivos] = useState(inicial)
  const [categoria, setCategoria] = useState('contrato')
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState('')
  const ref = useRef<HTMLInputElement>(null)
  const idInput = `up-${escolaId}-${compacto ? 'c' : 'r'}`

  async function enviar(ev: React.ChangeEvent<HTMLInputElement>) {
    const file = ev.target.files?.[0]
    if (!file) return
    if (file.size > 20 * 1024 * 1024) { setErro('Arquivo acima de 20 MB.'); return }
    setEnviando(true); setErro('')
    const sb = createClient()
    const seguro = file.name.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-zA-Z0-9._-]+/g, '_')
    const path = `${escolaId}/${Date.now()}_${seguro}`
    const up = await sb.storage.from(BUCKET_CONTRATOS).upload(path, file, { contentType: file.type, upsert: false })
    if (up.error) { setErro(up.error.message); setEnviando(false); return }
    const { data, error } = await sb.from('contratos_arquivos')
      .insert({ escola_id: escolaId, nome: file.name, path, tamanho: file.size, tipo: file.type, categoria })
      .select('id, nome, path, tamanho, categoria, created_at').single()
    if (error || !data) {
      await sb.storage.from(BUCKET_CONTRATOS).remove([path])
      setErro(error?.message ?? 'Erro ao registrar o arquivo.'); setEnviando(false); return
    }
    setArquivos(a => [data as ArquivoContrato, ...a]); setEnviando(false)
    if (ref.current) ref.current.value = ''
  }

  async function abrir(a: ArquivoContrato) {
    const { data, error } = await createClient().storage.from(BUCKET_CONTRATOS).createSignedUrl(a.path, 120)
    if (error || !data) { setErro(error?.message ?? 'Não foi possível abrir o arquivo.'); return }
    window.open(data.signedUrl, '_blank', 'noopener')
  }

  async function remover(a: ArquivoContrato) {
    if (!confirm(`Remover "${a.nome}"?`)) return
    const sb = createClient()
    const { error } = await sb.from('contratos_arquivos').delete().eq('id', a.id)
    if (error) { setErro(error.message); return }
    await sb.storage.from(BUCKET_CONTRATOS).remove([a.path])
    setArquivos(l => l.filter(x => x.id !== a.id))
  }

  return (
    <div style={{ borderTop: '1px solid #eef2f6', paddingTop: '.6rem' }}>
      <div style={{ display: 'flex', gap: '.4rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <select value={categoria} onChange={ev => setCategoria(ev.target.value)} aria-label="Tipo do documento"
          style={{ flex: compacto ? '1 1 120px' : undefined, padding: '.38rem .45rem', border: '1px solid #cbd5e1', borderRadius: 8, fontSize: '.74rem', minWidth: 0 }}>
          {CATEGORIAS_ARQUIVO.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
        </select>
        <input ref={ref} type="file" accept=".pdf,.docx,.png,.jpg,.jpeg" onChange={enviar} hidden id={idInput} />
        <label htmlFor={idInput}
          style={{ padding: '.4rem .85rem', borderRadius: 9999, background: enviando ? '#94a3b8' : '#0ea5e9', color: '#fff', fontWeight: 700, fontSize: '.74rem', cursor: enviando ? 'wait' : 'pointer', whiteSpace: 'nowrap' }}>
          {enviando ? 'Enviando…' : '⬆ Enviar contrato'}
        </label>
      </div>
      {erro && <p style={{ color: '#991b1b', fontSize: '.74rem', marginTop: '.35rem' }}>{erro}</p>}
      {arquivos.length === 0 ? (
        <p style={{ fontSize: '.72rem', color: '#94a3b8', marginTop: '.4rem' }}>Nenhum arquivo anexado.</p>
      ) : (
        <div style={{ marginTop: '.45rem', display: 'grid', gap: '.25rem' }}>
          {arquivos.map(a => (
            <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', gap: '.5rem', fontSize: '.74rem' }}>
              <span style={{ minWidth: 0 }}>
                <button onClick={() => abrir(a)} title={a.nome}
                  style={{ border: 'none', background: 'none', color: '#0369a1', fontWeight: 700, cursor: 'pointer', padding: 0, textAlign: 'left', maxWidth: compacto ? 190 : 420, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'inline-block', verticalAlign: 'bottom' }}>
                  {a.nome}
                </button>
                <span style={{ color: '#64748b', display: 'block' }}>
                  {CATEGORIAS_ARQUIVO.find(c => c.id === a.categoria)?.label ?? a.categoria} · {kb(a.tamanho)} · {fmtData(a.created_at.slice(0, 10))}
                </span>
              </span>
              <button onClick={() => remover(a)} aria-label={`Remover ${a.nome}`}
                style={{ border: 'none', background: 'none', color: '#b91c1c', cursor: 'pointer', fontWeight: 700, alignSelf: 'flex-start' }}>×</button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
