/**
 * PIB per capita nominal por UF (R$), ano-base 2023, publicado pelo IBGE
 * (Sistema de Contas Regionais do Brasil) em 2025.
 * Fonte: https://www.ibge.gov.br/estatisticas/economicas/contas-nacionais/9054-contas-regionais-do-brasil.html
 *
 * Usado como proxy macroeconômico regional na priorização comercial —
 * não é um dado por escola, é um sinal de poder aquisitivo médio da UF.
 */
export const PIB_PER_CAPITA_UF: Record<string, number> = {
  DF: 129790.44,
  SP: 77566.27,
  MT: 74620.05,
  RJ: 73052.55,
  SC: 67459.74,
  MS: 66884.75,
  RS: 59736.20,
  PR: 58624.33,
  ES: 54732.78,
  RO: 48353.38,
  GO: 47721.56,
  MG: 47321.23,
  TO: 42553.36,
  AM: 41047.91,
  RR: 39460.54,
  AP: 38187.09,
  AC: 31675.60,
  PA: 31347.59,
  RN: 30804.91,
  BA: 30476.54,
  PE: 29857.27,
  AL: 28675.84,
  SE: 27518.80,
  CE: 26405.96,
  PI: 24736.15,
  PB: 24395.17,
  MA: 22020.63,
}

export const PIB_PER_CAPITA_BRASIL = 53886.67
