// Configuração compartilhada do módulo Gestão de Pedidos: séries e tipos de kit.
// Usada pelo formulário público, pela tela de edição, pelo painel e pelas server actions.

export const SERIES_PEDIDOS = [
  { id: 'infantil2',  label: 'Infantil II'     },
  { id: 'infantil3',  label: 'Infantil III'    },
  { id: 'infantil4',  label: 'Infantil IV'     },
  { id: 'infantil5',  label: 'Infantil V'      },
  { id: 'fund1_ano1', label: '1º ano - Fund I' },
  { id: 'fund1_ano2', label: '2º ano - Fund I' },
  { id: 'fund1_ano3', label: '3º ano - Fund I' },
  { id: 'fund1_ano4', label: '4º ano - Fund I' },
  { id: 'fund1_ano5', label: '5º ano - Fund I' },
] as const

// O kit completo mantém a coluna original `<serie>_qtd` — as previsões já enviadas
// (que não separavam inglês) continuam valendo como kit completo.
export const TIPOS_KIT = [
  { id: 'completo',   label: 'Kit completo',       curto: 'Completo',   desc: 'com Inglês',    sufixo: '_qtd'            },
  { id: 'sem_ingles', label: 'Kit sem Inglês',     curto: 'Sem Inglês', desc: 'sem o material de Inglês', sufixo: '_sem_ingles_qtd' },
  { id: 'so_ingles',  label: 'Só livro de Inglês', curto: 'Só Inglês',  desc: 'apenas o livro de Inglês', sufixo: '_so_ingles_qtd'  },
] as const

export type SerieId = typeof SERIES_PEDIDOS[number]['id']
export type TipoKitId = typeof TIPOS_KIT[number]['id']

export function colunaQtd(serie: SerieId, tipo: typeof TIPOS_KIT[number]) {
  return `${serie}${tipo.sufixo}`
}

// Lê do FormData todas as quantidades (série × tipo de kit) já no formato das colunas da tabela
export function lerQuantidades(formData: FormData) {
  const qtds: Record<string, number> = {}
  for (const s of SERIES_PEDIDOS) {
    for (const t of TIPOS_KIT) {
      const col = colunaQtd(s.id, t)
      qtds[col] = Math.max(0, parseInt(formData.get(col) as string) || 0)
    }
  }
  return qtds
}

// Total de kits de um registro de previsões_pedidos, por tipo e geral
export function totaisDaLinha(p: Record<string, any>) {
  const porTipo: Record<TipoKitId, number> = { completo: 0, sem_ingles: 0, so_ingles: 0 }
  for (const s of SERIES_PEDIDOS) {
    for (const t of TIPOS_KIT) porTipo[t.id] += Number(p[colunaQtd(s.id, t)]) || 0
  }
  return { ...porTipo, total: porTipo.completo + porTipo.sem_ingles + porTipo.so_ingles }
}
