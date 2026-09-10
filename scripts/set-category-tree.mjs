/**
 * Reestrutura as categorias de src/data/catalog.json numa árvore de 2 níveis
 * (categoria raiz → subcategoria) e aponta cada produto para a subcategoria.
 * Usa ids totalmente novos (não reaproveita ids antigos) para o seed poder
 * migrar bancos já populados sem violar FK.
 *   node scripts/set-category-tree.mjs
 */
import { readFile, writeFile } from 'node:fs/promises';

const url = new URL('../src/data/catalog.json', import.meta.url);
const catalog = JSON.parse(await readFile(url, 'utf-8'));

const ID = {
  rosto: 'ca700000-0000-4000-8000-000000000010',
  corpo: 'ca700000-0000-4000-8000-000000000011',
  kits: 'ca700000-0000-4000-8000-000000000012',
  limpeza: 'ca700000-0000-4000-8000-000000000020',
  hidratacao: 'ca700000-0000-4000-8000-000000000021',
  protFacial: 'ca700000-0000-4000-8000-000000000022',
  seruns: 'ca700000-0000-4000-8000-000000000023',
  mascaras: 'ca700000-0000-4000-8000-000000000024',
  protCorpo: 'ca700000-0000-4000-8000-000000000025',
  rotinas: 'ca700000-0000-4000-8000-000000000026',
};

const categories = [
  { id: ID.rosto, slug: 'rosto', name: 'Rosto', description: 'Tudo para o cuidado facial, do primeiro passo ao último.', position: 1, image_url: '', parent_id: null },
  { id: ID.corpo, slug: 'corpo', name: 'Corpo', description: 'Proteção e hidratação para o corpo todo.', position: 2, image_url: '', parent_id: null },
  { id: ID.kits, slug: 'kits', name: 'Kits', description: 'Rotinas completas montadas para começar sem erro.', position: 3, image_url: '', parent_id: null },

  { id: ID.limpeza, slug: 'limpeza-facial', name: 'Limpeza facial', description: 'Retirar o dia sem tirar a água da pele.', position: 1, image_url: '', parent_id: ID.rosto },
  { id: ID.hidratacao, slug: 'hidratacao', name: 'Hidratação', description: 'Camadas leves que devolvem à pele o que a rotina evapora.', position: 2, image_url: '', parent_id: ID.rosto },
  { id: ID.protFacial, slug: 'protetor-solar', name: 'Proteção solar facial', description: 'Proteção diária de toque seco — o passo que não se pula.', position: 3, image_url: '', parent_id: ID.rosto },
  { id: ID.seruns, slug: 'seruns-tratamento', name: 'Séruns & tratamento', description: 'Ativos concentrados para objetivos específicos.', position: 4, image_url: '', parent_id: ID.rosto },
  { id: ID.mascaras, slug: 'mascaras', name: 'Máscaras', description: 'Pausas semanais de imersão para a pele respirar.', position: 5, image_url: '', parent_id: ID.rosto },

  { id: ID.protCorpo, slug: 'protecao-solar-corpo', name: 'Proteção solar corporal', description: 'FPS para a pele exposta do corpo.', position: 1, image_url: '', parent_id: ID.corpo },

  { id: ID.rotinas, slug: 'rotinas-prontas', name: 'Rotinas prontas', description: 'Kits com desconto para começar.', position: 1, image_url: '', parent_id: ID.kits },
];

catalog.categories = categories;

const REMAP = {
  'protetor-solar-fluido-corporal-fps-50': 'protecao-solar-corpo',
  'kit-ritual-essencial': 'rotinas-prontas',
  'kit-glow-vitamina-c': 'rotinas-prontas',
};
const subSlugs = new Set(categories.filter((c) => c.parent_id).map((c) => c.slug));

for (const p of catalog.products) {
  if (REMAP[p.slug]) p.category_slug = REMAP[p.slug];
  if (!subSlugs.has(p.category_slug)) console.warn('⚠ produto sem subcategoria válida:', p.slug, '→', p.category_slug);
}

await writeFile(url, JSON.stringify(catalog, null, 2) + '\n', 'utf-8');
console.log(`✓ ${categories.length} categorias (${categories.filter((c) => !c.parent_id).length} raízes), produtos remapeados`);
