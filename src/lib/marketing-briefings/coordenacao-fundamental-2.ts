import type { FormularioBriefingConfig } from './types'
import { construirFormularioCoordenacao } from './coordenacao-base'

export const coordenacaoFundamental2: FormularioBriefingConfig = construirFormularioCoordenacao({
  id: 'coordenacao-fundamental-2',
  destinatario: 'Coordenação Pedagógica — Ensino Fundamental II',
  segmentoLabel: 'o Ensino Fundamental II',
  dificuldadesProfessores: ['Integração curricular entre disciplinas', 'Aplicação da cosmovisão cristã na disciplina específica', 'Profundidade acadêmica adequada à faixa etária', 'Lacunas de formação nos professores especialistas', 'Uso do material didático'],
  duvidasFamilias: ['O conteúdo prepara para o vestibular?', 'Como a cosmovisão cristã aparece em cada disciplina', 'Volume de conteúdo e cobrança acadêmica', 'Como lidar com a fase da adolescência', 'Continuidade da proposta em relação ao Fund. I'],
  materiaisExistentes: ['Fotos e vídeos de aulas por disciplina', 'Depoimentos de professores especialistas', 'Depoimentos de famílias', 'Materiais explicando a integração curricular'],
  perguntaEspecifica: {
    id: 'consolidacao_disciplinas_fund2', bloco: 'Ensino Fundamental II',
    texto: 'Avalie o nível de consolidação da proposta pedagógica em cada disciplina.',
    tipo: 'grade', obrigatoria: true,
    linhas: ['Língua Portuguesa', 'Matemática', 'Ciências', 'História', 'Geografia', 'Artes', 'Inglês', 'Educação Física'],
    colunas: ['Não iniciado', 'Em desenvolvimento', 'Parcialmente consolidado', 'Consolidado', 'Não sei responder'],
  },
})
