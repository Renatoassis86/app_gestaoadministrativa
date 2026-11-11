'use client'

import { useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { BUCKET_CONTRATOS, CATEGORIAS_ARQUIVO, MODALIDADES, fmtCnpj, fmtData, type Modalidade } from '@/lib/contratos'

interface Arquivo { id: string; nome: string; path: string; tamanho: number | null; categoria: string; created_at: string }
export interface EscolaRepo { id: string; nome: string; cnpj: string | null; modalidade: Modalidade; arquivos: Arquivo[] }

const kb = (n?: number | null) => (n == null ? '' : n > 1048576 ? `${(n / 1048576).toFixed(1)} MB` : `${Math.round(n / 1024)} KB`)

function Linha({ e }: { e: EscolaRepo }) {
  const [arquivos, setArquivos] = useState(e.arquivos)
  const [categoria, setCategoria] = useState('contrato')
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState('')
  const ref = useRef<HTMLInputElement>(null)
  const m = MODALIDADES[e.modalidade]

  async function enviar(ev: React.ChangeEvent<HTMLInputElement>) {
    const file = ev.target.files?.[0]
    if (!file) return
    if (file.size > 20 * 1024 * 1024) { setErro('Arquivo acima de 20 MB.'); return }
    setEnviando(true); setErro('')
    const sb = createClient()
    const seguro = file.name.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-zA-Z0-9._-]+/g, '_')
    const path = `${e.id}/${Date.now()}_${seguro}`
    const up = await sb.storage.from(BUCKET_CONTRATOS).upload(path, file, { contentType: file.type, upsert: false })
    if (up.error) { setErro(up.error.message); setEnviando(false); return }
    const { data, error } = await sb.from('contratos_arquivos')
      .insert({ escola_id: e.id, nome: file.name, path, tamanho: file.size, tipo: file.type, categoria })
      .select('id, nome, path, tamanho, categoria, created_at').single()
    if (error || !data) {
      await sb.storage.from(BUCKET_CONTRATOS).remove([path])
      setErro(error?.message ?? 'Erro ao registrar o arquivo.'); setEnviando(false); return
    }
    setArquivos(a => [data as Arquivo, ...a]); setEnviando(false)
    if (ref.current) ref.current.value = ''
  }

  async function abrir(a: Arquivo) {
    const { data, error } = await createClient().storage.from(BUCKET_CONTRATOS).createSignedUrl(a.path, 120)
    if (error || !data) { setErro(error?.message ?? 'Não foi possível abrir o arquivo.'); return }
    window.open(data.signedUrl, '_blank', 'noopener')
  }

  async function remover(a: Arquivo) {
    if (!confirm(`Remover "${a.nome}"?`)) return
    const sb = createClient()
    const { error } = await sb.from('contratos_arquivos').delete().eq('id', a.id)
    if (error) { setErro(error.message); return }
    await sb.storage.from(BUCKET_CONTRATOS).remove([a.path])
    setArquivos(l => l.filter(x => x.id !== a.id))
  }

  return (
    <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: '.9rem 1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '.6rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div>
          <strong style={{ fontSize: '.92rem' }}>{e.nome}</strong>
          <span style={{ marginLeft: '.5rem', background: m.bg, color: m.cor, borderRadius: 9999, padding: '.1rem .5rem', fontSize: '.66rem', fontWeight: 800 }}>{m.label}</span>
          <div style={{ fontSize: '.72rem', color: '#64748b' }}>{fmtCnpj(e.cnpj)}</div>
        </div>
        <div style={{ display: 'flex', gap: '.4rem', alignItems: 'center' }}>
          <select value={categoria} onChange={ev => setCategoria(ev.target.value)} style={{ padding: '.4rem .5rem', border: '1px solid #cbd5e1', borderRadius: 8, fontSize: '.78rem' }}>
            {CATEGORIAS_ARQUIVO.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
          </select>
          <input ref={ref} type="file" accept=".pdf,.docx,.png,.jpg,.jpeg" onChange={enviar} hidden id={`up-${e.id}`} />
          <label htmlFor={`up-${e.id}`} style={{ padding: '.45rem .9rem', borderRadius: 9999, background: enviando ? '#94a3b8' : '#0ea5e9', color: '#fff', fontWeight: 700, fontSize: '.78rem', cursor: 'pointer' }}>
            {enviando ? 'Enviando…' : 'Anexar arquivo'}
          </label>
        </div>
      </div>
      {erro && <p style={{ color: '#991b1b', fontSize: '.78rem', marginTop: '.4rem' }}>{erro}</p>}
      {arquivos.length === 0 ? (
        <p style={{ fontSize: '.76rem', color: '#94a3b8', marginTop: '.5rem' }}>Nenhum arquivo anexado.</p>
      ) : (
        <div style={{ marginTop: '.6rem', display: 'grid', gap: '.3rem' }}>
          {arquivos.map(a => (
            <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', gap: '.6rem', fontSize: '.78rem', borderTop: '1px dashed #eef2f6', paddingTop: '.3rem' }}>
              <span>
                <button onClick={() => abrir(a)} style={{ border: 'none', background: 'none', color: '#0369a1', fontWeight: 700, cursor: 'pointer', padding: 0 }}>{a.nome}</button>
                <span style={{ color: '#64748b' }}> · {CATEGORIAS_ARQUIVO.find(c => c.id === a.categoria)?.label ?? a.categoria} · {kb(a.tamanho)} · {fmtData(a.created_at.slice(0, 10))}</span>
              </span>
              <button onClick={() => remover(a)} style={{ border: 'none', background: 'none', color: '#b91c1c', cursor: 'pointer', fontWeight: 700 }}>Remover</button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export function RepositorioClient({ escolas }: { escolas: EscolaRepo[] }) {
  return <div style={{ display: 'grid', gap: '.8rem', maxWidth: 900 }}>{escolas.map(e => <Linha key={e.id} e={e} />)}</div>
}
