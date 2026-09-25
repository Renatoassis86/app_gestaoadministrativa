'use client'

import { useState, type CSSProperties } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Pencil, Trash2, MessageCircle, Check, Loader2 } from 'lucide-react'
import { deletarPrevisaoPedido } from '@/lib/actions'

function waLink(telefone: string, nomeInstituicao: string, anoLetivo: number) {
  const digits = (telefone || '').replace(/\D/g, '')
  const comDDI = digits.startsWith('55') ? digits : `55${digits}`
  const texto = encodeURIComponent(
    `Olá! Aqui é da Cidade Viva Education. Vi a previsão de pedidos de ${anoLetivo} enviada pela ${nomeInstituicao} e queria conversar sobre os próximos passos.`
  )
  return `https://wa.me/${comDDI}?text=${texto}`
}

interface Props {
  id: string
  nomeInstituicao: string
  telefone: string
  anoLetivo: number
}

const btnBase: CSSProperties = {
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
  width: 30, height: 30, borderRadius: 7, cursor: 'pointer', flexShrink: 0,
  transition: 'all .15s', textDecoration: 'none', border: 'none',
}

export function PrevisaoRowActions({ id, nomeInstituicao, telefone, anoLetivo }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [confirmando, setConfirmando] = useState(false)

  async function handleDelete() {
    if (!confirmando) { setConfirmando(true); return }
    setLoading(true)
    const result = await deletarPrevisaoPedido(id)
    if (result.success) {
      router.refresh()
    } else {
      alert(result.error ?? 'Erro ao excluir')
      setLoading(false)
      setConfirmando(false)
    }
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '.4rem' }}>
      {telefone && (
        <a
          href={waLink(telefone, nomeInstituicao, anoLetivo)}
          target="_blank" rel="noopener noreferrer"
          title="Enviar WhatsApp para o responsável"
          style={{ ...btnBase, border: '1.5px solid #86efac', background: '#f0fdf4', color: '#16a34a' }}
        >
          <MessageCircle size={14} />
        </a>
      )}
      <Link
        href={`/hub/pedidos/${id}/editar`}
        title="Editar previsão"
        style={{ ...btnBase, border: '1.5px solid #bae6fd', background: '#f0f9ff', color: '#0369a1' }}
      >
        <Pencil size={13} />
      </Link>
      <button
        type="button"
        onClick={handleDelete}
        disabled={loading}
        title={confirmando ? 'Clique para confirmar exclusão' : 'Excluir previsão'}
        style={{
          ...btnBase,
          border: `1.5px solid ${confirmando ? '#dc2626' : '#fca5a5'}`,
          background: confirmando ? '#dc2626' : '#fef2f2',
          color: confirmando ? '#fff' : '#dc2626',
          opacity: loading ? .6 : 1,
          cursor: loading ? 'not-allowed' : 'pointer',
        }}
      >
        {loading
          ? <Loader2 size={13} style={{ animation: 'spin .8s linear infinite' }} />
          : confirmando ? <Check size={13} /> : <Trash2 size={13} />}
      </button>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
