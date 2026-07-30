import type { FormularioBriefingConfig } from './types'
import { construirFormularioCoordenacao } from './coordenacao-base'

export const coordenacaoFundamental1: FormularioBriefingConfig = construirFormularioCoordenacao({
  id: 'coordenacao-fundamental-1',
  destinatario: 'Coordenação Pedagógica — Ensino Fundamental I',
  segmentoLabel: 'o Ensino Fundamental I',
  dificuldadesProfessores: ['Método de alfabetização fônica', 'Progressão de leitura e escrita', 'Interdisciplinaridade', 'Avaliação de progresso', 'Uso do material didático'],
  duvidasFamilias: ['Meu filho está alfabetizando no ritmo certo?', 'Como funciona o método fônico', 'Como apoiar a leitura em casa', 'Transição da Educação Infantil', 'Volume de tarefas e conteúdo'],
  materiaisExistentes: ['Fotos de atividades de alfabetização', 'Vídeos de aulas', 'Depoimentos de famílias', 'Materiais explicando o método fônico'],
  perguntaEspecifica: {
    id: 'aspectos_alfabetizacao_fund1', bloco: 'Ensino Fundamental I',
    texto: 'Em quais aspectos da alfabetização a comunicação com as famílias precisa ser mais clara?',
    tipo: 'caixas_selecao', obrigatoria: true, permiteOutro: true,
    opcoes: ['Consciência fonológica', 'Método fônico de alfabetização', 'Progressão da leitura', 'Desenvolvimento da escrita', 'Critérios de avaliação', 'Transição da Educação Infantil para o Fund. I'],
  },
})
