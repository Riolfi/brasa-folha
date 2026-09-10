import type { Concern, RoutineStep, SkinType } from '../types';

/**
 * Gera a frase "por que esse produto" de cada passo, a partir do passo da
 * rotina, das preocupações do cliente e do tipo de pele. Texto 100% por regras.
 */

const BY_STEP: Record<RoutineStep, string> = {
  limpeza: 'Tira o dia sem repuxar — a base de qualquer rotina que funciona.',
  esfoliacao: 'Uma vez por semana para desobstruir os poros e renovar a superfície.',
  tratamento: 'O passo que trabalha o seu objetivo específico, camada por camada.',
  hidratacao: 'Sela a água na pele e mantém a barreira confortável o dia todo.',
  protecao: 'O passo que trava o resultado de todos os outros. Reaplique ao longo do dia.',
  complemento: 'Um reforço opcional para turbinar a hidratação.',
};

const BY_CONCERN: Partial<Record<Concern, Partial<Record<RoutineStep, string>>>> = {
  acne: {
    tratamento: 'Controla a oleosidade e ajuda a acalmar as marquinhas de acne sem ressecar.',
    limpeza: 'Limpa a fundo sem agredir — importante para pele com tendência a acne.',
  },
  oleosidade: {
    tratamento: 'Regula o sebo e reduz a aparência dos poros ao longo das semanas.',
    hidratacao: 'Textura leve, oil-free: hidrata sem deixar a pele mais oleosa.',
  },
  poros: {
    tratamento: 'Refina a textura e minimiza a aparência dos poros dilatados.',
  },
  'linhas-finas': {
    tratamento: 'Estimula a renovação e suaviza linhas finas com o uso contínuo.',
  },
  firmeza: {
    tratamento: 'Antioxidante que apoia a firmeza e defende do estresse do dia a dia.',
  },
  manchas: {
    tratamento: 'Clareia manchas e uniformiza o tom em 8 a 12 semanas de uso.',
  },
  'tom-irregular': {
    tratamento: 'Uniformiza o tom e devolve luminosidade à pele.',
  },
  desidratacao: {
    tratamento: 'Hidratação profunda em várias camadas da pele, para um aspecto preenchido.',
    hidratacao: 'Repõe o que a rotina evapora e mantém a pele macia por horas.',
    complemento: 'Um empurrão extra de água nos dias mais secos.',
  },
  vermelhidao: {
    tratamento: 'Acalma a pele reativa e reforça a barreira aos poucos.',
    limpeza: 'Fórmula suave, de pH equilibrado, para não estressar a pele sensível.',
  },
  opacidade: {
    tratamento: 'Devolve viço e aquele aspecto de pele descansada.',
  },
};

export function reasonFor(step: RoutineStep, concerns: Concern[], _skinType: SkinType | null): string {
  for (const c of concerns) {
    const specific = BY_CONCERN[c]?.[step];
    if (specific) return specific;
  }
  return BY_STEP[step];
}
