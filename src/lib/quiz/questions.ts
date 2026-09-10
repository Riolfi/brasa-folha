export interface QuizOption {
  value: string;
  label: string;
  hint?: string;
}

export interface QuizQuestion {
  id: string;
  title: string;
  help?: string;
  type: 'single' | 'multi';
  max?: number;
  options: QuizOption[];
}

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 'skin_type',
    title: 'Como você descreveria a sua pele no fim da tarde?',
    type: 'single',
    options: [
      { value: 'oleosa', label: 'Oleosa', hint: 'brilho no rosto todo' },
      { value: 'mista', label: 'Mista', hint: 'zona T oleosa, bochechas normais' },
      { value: 'seca', label: 'Seca', hint: 'repuxa, às vezes descama' },
      { value: 'normal', label: 'Normal', hint: 'nem muito oleosa nem seca' },
      { value: 'nao-sei', label: 'Não sei dizer' },
    ],
  },
  {
    id: 'sensitivity',
    title: 'A sua pele costuma reagir a produtos novos?',
    help: 'vermelhidão, ardência, coceira',
    type: 'single',
    options: [
      { value: 'nao', label: 'Quase nunca' },
      { value: 'as-vezes', label: 'Às vezes' },
      { value: 'muito', label: 'Sim, é bem reativa / sensível' },
    ],
  },
  {
    id: 'concerns',
    title: 'O que você mais quer trabalhar?',
    help: 'escolha até 3',
    type: 'multi',
    max: 3,
    options: [
      { value: 'acne', label: 'Acne e cravos' },
      { value: 'oleosidade', label: 'Oleosidade e poros' },
      { value: 'desidratacao', label: 'Desidratação' },
      { value: 'linhas-finas', label: 'Linhas finas e firmeza' },
      { value: 'manchas', label: 'Manchas e tom irregular' },
      { value: 'vermelhidao', label: 'Vermelhidão' },
      { value: 'opacidade', label: 'Falta de viço' },
    ],
  },
  {
    id: 'experience',
    title: 'Qual a sua experiência com ativos?',
    type: 'single',
    options: [
      { value: 'nenhuma', label: 'Nunca usei', hint: 'só limpeza e hidratante' },
      { value: 'basico', label: 'Básico', hint: 'vitamina C, niacinamida' },
      { value: 'avancado', label: 'Avançado', hint: 'já uso ácidos ou retinol' },
    ],
  },
  {
    id: 'pregnancy',
    title: 'Você está grávida ou amamentando?',
    help: 'usamos essa resposta para evitar ativos não recomendados nesse período',
    type: 'single',
    options: [
      { value: 'nao', label: 'Não' },
      { value: 'sim', label: 'Sim' },
    ],
  },
  {
    id: 'fragrance',
    title: 'Preferência de fragrância?',
    type: 'single',
    options: [
      { value: 'tanto-faz', label: 'Tanto faz' },
      { value: 'sem-perfume', label: 'Prefiro sem perfume' },
    ],
  },
  {
    id: 'budget',
    title: 'Quanto você pretende investir por mês?',
    help: 'usamos para dimensionar a rotina',
    type: 'single',
    options: [
      { value: 'ate-150', label: 'Até R$ 150' },
      { value: '150-300', label: 'R$ 150 a R$ 300' },
      { value: '300-mais', label: 'Acima de R$ 300' },
    ],
  },
];

export const QUIZ_QUESTION_IDS = QUIZ_QUESTIONS.map((q) => q.id);
