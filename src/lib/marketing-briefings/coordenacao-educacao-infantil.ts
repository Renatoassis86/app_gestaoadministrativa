import type { FormularioBriefingConfig } from './types'
import { construirFormularioCoordenacao } from './coordenacao-base'

export const coordenacaoEducacaoInfantil: FormularioBriefingConfig = construirFormularioCoordenacao({
  id: 'coordenacao-educacao-infantil',
  destinatario: 'Coordenação Pedagógica — Educação Infantil',
  segmentoLabel: 'a Educação Infantil',
  dificuldadesProfessores: ['Rotina e organização do tempo', 'Ludicidade aplicada aos conteúdos', 'Desenvolvimento da linguagem', 'Formação de hábitos e virtudes', 'Uso do material didático'],
  duvidasFamilias: ['Como funciona a rotina do dia', 'O que a criança aprende nessa fase', 'Como a fé é trabalhada com crianças pequenas', 'Alfabetização começa quando', 'Uso de telas e tecnologia'],
  materiaisExistentes: ['Fotos de atividades e rotina', 'Vídeos de momentos em sala', 'Depoimentos de famílias', 'Materiais explicando a proposta da fase'],
  perguntaEspecifica: {
    id: 'aspectos_explicar_familias_infantil', bloco: 'Educação Infantil',
    texto: 'Quais aspectos da proposta da Educação Infantil precisam ser mais bem explicados às famílias?',
    tipo: 'caixas_selecao', obrigatoria: true, permiteOutro: true,
    opcoes: ['Desenvolvimento integral da criança', 'Alfabetização inicial', 'Rotina e ludicidade', 'Desenvolvimento da linguagem', 'Formação de hábitos e virtudes', 'Uso de imagens de crianças na comunicação'],
  },
})
