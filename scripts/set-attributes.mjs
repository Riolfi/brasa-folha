/**
 * Preenche `attributes` (perfil para o quiz) de cada produto em
 * src/data/catalog.json. Rode uma vez: node scripts/set-attributes.mjs
 */
import { readFile, writeFile } from 'node:fs/promises';

const url = new URL('../src/data/catalog.json', import.meta.url);
const catalog = JSON.parse(await readFile(url, 'utf-8'));

const ALL = ['oleosa', 'seca', 'mista', 'normal', 'sensivel'];

const MAP = {
  'gel-de-limpeza-aguas-claras': {
    skin_types: ALL, concerns: ['oleosidade'], routine_step: 'limpeza',
    time_of_day: 'ambos', strength: 'suave', pregnancy_safe: true,
  },
  'oleo-bifasico-demaquilante-fonte': {
    skin_types: ['oleosa', 'mista', 'normal', 'seca'], concerns: [], routine_step: 'limpeza',
    time_of_day: 'pm', strength: 'suave', pregnancy_safe: true,
  },
  'sabonete-facial-argila-rosa': {
    skin_types: ['oleosa', 'mista', 'normal'], concerns: ['oleosidade', 'poros'], routine_step: 'limpeza',
    time_of_day: 'ambos', strength: 'suave', pregnancy_safe: true,
  },
  'hidratante-facial-veu-de-agua': {
    skin_types: ['oleosa', 'mista', 'normal'], concerns: ['oleosidade', 'poros', 'desidratacao', 'tom-irregular'],
    routine_step: 'hidratacao', time_of_day: 'ambos', strength: 'suave', pregnancy_safe: true,
  },
  'creme-hidratante-nutritivo-correnteza': {
    skin_types: ['seca', 'normal', 'sensivel'], concerns: ['desidratacao', 'vermelhidao'],
    routine_step: 'hidratacao', time_of_day: 'ambos', strength: 'suave', pregnancy_safe: true,
  },
  'bruma-hidratante-orvalho': {
    skin_types: ALL, concerns: ['desidratacao', 'vermelhidao'], routine_step: 'complemento',
    time_of_day: 'ambos', strength: 'suave', pregnancy_safe: true,
  },
  'protetor-solar-facial-fps-60-toque-seco': {
    skin_types: ['oleosa', 'mista', 'normal', 'seca'], concerns: [], routine_step: 'protecao',
    time_of_day: 'am', strength: 'suave', pregnancy_safe: true,
  },
  'protetor-solar-com-cor-fps-50': {
    skin_types: ['oleosa', 'mista', 'normal', 'seca', 'sensivel'], concerns: ['manchas', 'tom-irregular'],
    routine_step: 'protecao', time_of_day: 'am', strength: 'suave', pregnancy_safe: true,
  },
  'protetor-solar-fluido-corporal-fps-50': {
    skin_types: ALL, concerns: [], routine_step: 'complemento',
    time_of_day: 'am', strength: 'suave', pregnancy_safe: true,
  },
  'serum-vitamina-c-15-reflexo': {
    skin_types: ['oleosa', 'mista', 'normal'], concerns: ['manchas', 'tom-irregular', 'opacidade', 'linhas-finas'],
    routine_step: 'tratamento', time_of_day: 'am', strength: 'moderado', pregnancy_safe: true,
  },
  'serum-niacinamida-10-zinco': {
    skin_types: ['oleosa', 'mista', 'sensivel'], concerns: ['oleosidade', 'poros', 'acne', 'tom-irregular', 'vermelhidao'],
    routine_step: 'tratamento', time_of_day: 'ambos', strength: 'suave', pregnancy_safe: true,
  },
  'serum-acido-hialuronico-2-profundeza': {
    skin_types: ALL, concerns: ['desidratacao', 'linhas-finas', 'opacidade'],
    routine_step: 'tratamento', time_of_day: 'ambos', strength: 'suave', pregnancy_safe: true,
  },
  'tratamento-noturno-retinal-lua-nova': {
    skin_types: ['normal', 'mista', 'seca'], concerns: ['linhas-finas', 'firmeza', 'tom-irregular', 'manchas', 'acne'],
    routine_step: 'tratamento', time_of_day: 'pm', strength: 'potente', pregnancy_safe: false,
  },
  'serum-antioxidante-resveratrol-ferulico': {
    skin_types: ['sensivel', 'seca', 'normal', 'mista'], concerns: ['firmeza', 'linhas-finas', 'opacidade'],
    routine_step: 'tratamento', time_of_day: 'pm', strength: 'moderado', pregnancy_safe: true,
  },
  'mascara-facial-hidratante-remanso': {
    skin_types: ['seca', 'normal', 'sensivel'], concerns: ['desidratacao', 'opacidade'],
    routine_step: 'complemento', time_of_day: 'pm', strength: 'suave', pregnancy_safe: true,
  },
  'mascara-detox-argila-preta-carvao': {
    skin_types: ['oleosa', 'mista'], concerns: ['oleosidade', 'poros', 'acne'],
    routine_step: 'esfoliacao', time_of_day: 'pm', strength: 'moderado', pregnancy_safe: true,
  },
  'kit-ritual-essencial': {
    skin_types: [], concerns: [], routine_step: null, time_of_day: null, strength: 'suave', pregnancy_safe: true,
  },
  'kit-glow-vitamina-c': {
    skin_types: [], concerns: [], routine_step: null, time_of_day: null, strength: 'suave', pregnancy_safe: true,
  },
};

let done = 0;
for (const p of catalog.products) {
  if (MAP[p.slug]) {
    p.attributes = MAP[p.slug];
    done++;
  } else {
    console.warn('sem attributes:', p.slug);
  }
}

await writeFile(url, JSON.stringify(catalog, null, 2) + '\n', 'utf-8');
console.log(`✓ ${done}/${catalog.products.length} produtos com attributes`);
