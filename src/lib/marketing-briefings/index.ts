import type { FormularioBriefingConfig } from './types'
import { diretorPedagogico } from './diretor-pedagogico'
import { diretorAdministrativo } from './diretor-administrativo'
import { consultoraPedagogica } from './consultora-pedagogica'
import { consultorOrganizacional } from './consultor-organizacional'
import { coordenacaoEducacaoInfantil } from './coordenacao-educacao-infantil'
import { coordenacaoFundamental1 } from './coordenacao-fundamental-1'
import { coordenacaoFundamental2 } from './coordenacao-fundamental-2'
import { consultorInglesCambridge } from './consultor-ingles-cambridge'
import { operacionalMarketing } from './operacional-marketing'

export * from './types'

// Ordem de aplicação sugerida (seção 22 do prompt mestre):
// respostas institucionais e estratégicas antes das percepções operacionais e segmentadas.
export const FORMULARIOS_BRIEFING: FormularioBriefingConfig[] = [
  diretorPedagogico,
  diretorAdministrativo,
  consultoraPedagogica,
  consultorOrganizacional,
  consultorInglesCambridge,
  coordenacaoEducacaoInfantil,
  coordenacaoFundamental1,
  coordenacaoFundamental2,
  operacionalMarketing,
]

export function getFormularioBriefing(id: string): FormularioBriefingConfig | undefined {
  return FORMULARIOS_BRIEFING.find(f => f.id === id)
}
