import { redirect } from 'next/navigation'

// Por ora o módulo é só os cartões das escolas com os contratos anexados.
// A visão geral (indicadores) fica em /contratos/visao-geral para a etapa de dashboards.
export default function ContratosIndex() {
  redirect('/contratos/escolas')
}
