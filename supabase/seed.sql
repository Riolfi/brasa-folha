-- =============================================================================
-- Brasa & Folha — seed do catálogo (gerado de src/data/catalog.json)
-- Rode DEPOIS de 0001..0006. Idempotente. Migra bancos já populados:
-- renomeia categorias antigas, insere a nova árvore, remapeia produtos e
-- depois apaga as antigas.
-- =============================================================================

-- 1. libera os slugs das categorias antigas que não estão na nova árvore
update public.categories
  set slug = slug || '__legacy'
  where id not in ('cb700000-0000-4000-8000-000000000010', 'cb700000-0000-4000-8000-000000000011', 'cb700000-0000-4000-8000-000000000012', 'cb700000-0000-4000-8000-000000000020', 'cb700000-0000-4000-8000-000000000021', 'cb700000-0000-4000-8000-000000000022', 'cb700000-0000-4000-8000-000000000023', 'cb700000-0000-4000-8000-000000000030', 'cb700000-0000-4000-8000-000000000031', 'cb700000-0000-4000-8000-000000000032', 'cb700000-0000-4000-8000-000000000033', 'cb700000-0000-4000-8000-000000000040') and slug not like '%\_\_legacy';

-- 2. insere/atualiza a nova árvore (raízes antes das subcategorias, por FK)
insert into public.categories (id, slug, name, description, position, image_url, parent_id) values
  ('cb700000-0000-4000-8000-000000000010', 'narguile', 'Narguilé', 'Do vaso ao rosh — tudo para uma sessão redonda.', 1, '/categorias/narguile.svg', null),
  ('cb700000-0000-4000-8000-000000000011', 'para-fumar', 'Para fumar', 'Sedas, dichavadores, isqueiros e cinzeiros.', 2, '/categorias/para-fumar.svg', null),
  ('cb700000-0000-4000-8000-000000000012', 'kits', 'Kits', 'Combos montados para começar sem erro.', 3, '/categorias/kits.svg', null),
  ('cb700000-0000-4000-8000-000000000020', 'narguiles-completos', 'Narguilés completos', 'Prontos para montar e usar.', 1, '/produtos/teste2.jpg', 'cb700000-0000-4000-8000-000000000010'),
  ('cb700000-0000-4000-8000-000000000021', 'rosh-e-acessorios', 'Rosh & acessórios', 'Rosh, pratos, abafadores e mangueiras.', 2, '', 'cb700000-0000-4000-8000-000000000010'),
  ('cb700000-0000-4000-8000-000000000022', 'essencias', 'Essências', 'Sabores em lata de 50 g e 250 g.', 3, '', 'cb700000-0000-4000-8000-000000000010'),
  ('cb700000-0000-4000-8000-000000000023', 'carvao', 'Carvão', 'Carvão de coco e acendedores.', 4, '', 'cb700000-0000-4000-8000-000000000010'),
  ('cb700000-0000-4000-8000-000000000030', 'sedas-e-piteiras', 'Sedas & piteiras', 'Sedas, blocos e piteiras de vidro.', 1, '', 'cb700000-0000-4000-8000-000000000011'),
  ('cb700000-0000-4000-8000-000000000031', 'dichavadores', 'Dichavadores', 'Alumínio, acrílico e com coletor.', 2, '', 'cb700000-0000-4000-8000-000000000011'),
  ('cb700000-0000-4000-8000-000000000032', 'isqueiros-e-macaricos', 'Isqueiros & maçaricos', 'Chama comum e maçarico antivento.', 3, '', 'cb700000-0000-4000-8000-000000000011'),
  ('cb700000-0000-4000-8000-000000000033', 'cinzeiros', 'Cinzeiros', 'Vidro, cerâmica e portáteis.', 4, '', 'cb700000-0000-4000-8000-000000000011'),
  ('cb700000-0000-4000-8000-000000000040', 'kits-prontos', 'Kits prontos', 'Combos com desconto.', 1, '', 'cb700000-0000-4000-8000-000000000012')
on conflict (id) do update set
  slug = excluded.slug, name = excluded.name, description = excluded.description,
  position = excluded.position, image_url = excluded.image_url, parent_id = excluded.parent_id;

-- 3. produtos (category_id já aponta para a subcategoria nova)
insert into public.products
  (id, slug, name, category_id, short_description, description, ingredients, how_to_use,
   price_cents, compare_at_price_cents, stock, is_active, is_bestseller, rating, reviews_count,
   images, attributes)
values
  ('d1000000-0000-4000-8000-000000000001', 'narguile-medio-aluminio-preto', 'Narguilé Médio Alumínio Preto', 'cb700000-0000-4000-8000-000000000020',
   '80 cm de alumínio anodizado, vaso de vidro e mangueira lavável.', 'Estrutura de alumínio anodizado que não enferruja, com 80 cm de altura — o tamanho que equilibra tiragem e portabilidade. Acompanha vaso de vidro jateado, prato removível, mangueira de silicone lavável e piteira. Rosca vedada em todas as conexões para não perder fumaça.', 'Corpo em alumínio anodizado, vaso em vidro, mangueira em silicone.', 'Lave o vaso e a mangueira com água morna após o uso. Seque o corpo para preservar o anodizado.',
   18900, null, 12, true, true,
   4.7, 53, '["/produtos/narguile-preto.webp"]'::jsonb, '{}'::jsonb),
  ('d1000000-0000-4000-8000-000000000002', 'narguile-pequeno-portatil-35cm', 'Narguilé Pequeno Portátil 35 cm', 'cb700000-0000-4000-8000-000000000020',
   'Compacto, desmonta em segundos e cabe na mochila.', 'Para levar para a casa de amigos ou para a viagem. 35 cm, desmontável, com estojo. A tiragem é mais curta que a de um médio, mas a vedação é a mesma — sessão honesta em qualquer lugar.', 'Alumínio e vidro.', 'Enxágue e seque antes de guardar no estojo.',
   14900, null, 18, true, false,
   4.4, 21, '["/produtos/narguile-pequeno.webp"]'::jsonb, '{}'::jsonb),
  ('d1000000-0000-4000-8000-000000000003', 'rosh-de-barro-artesanal', 'Rosh de Barro Artesanal', 'cb700000-0000-4000-8000-000000000021',
   'Queima mais lenta e uniforme — o barro segura o calor.', 'Rosh tradicional de barro cru, feito à mão. O barro distribui o calor de forma mais suave que o alumínio, o que rende sessões mais longas e sem gosto de queimado. Furos calibrados para não deixar a essência escorrer.', 'Barro cru.', 'Cure antes do primeiro uso queimando um carvão sem essência. Não lave com sabão.',
   3500, null, 40, true, false,
   4.6, 38, '["/produtos/rosh-barro.png"]'::jsonb, '{}'::jsonb),
  ('d1000000-0000-4000-8000-000000000004', 'rosh-phunnel-aluminio', 'Rosh Phunnel Alumínio', 'cb700000-0000-4000-8000-000000000021',
   'Furo central único — a calda não vaza para o prato.', 'O formato phunnel mantém a essência e o melaço dentro do rosh, sem escorrer. Alumínio fundido, fácil de limpar, com borda alta para acomodar bastante fumo. Combina com abafador.', 'Alumínio fundido.', 'Lave com água quente. Pode ir à máquina de lavar louça.',
   4500, null, 30, true, false,
   4.5, 27, '["/produtos/rosh-aluminio.webp"]'::jsonb, '{}'::jsonb),
  ('d1000000-0000-4000-8000-000000000005', 'prato-universal-inox', 'Prato Universal Inox', 'cb700000-0000-4000-8000-000000000021',
   'Encaixa na maioria dos corpos e segura carvão e pinça.', 'Prato de inox escovado de 14 cm, com furo central de tamanho universal. Borda funda para segurar as brasas e a pinça sem bagunça.', 'Aço inox.', 'Lave normalmente. Não risca.',
   3900, null, 25, true, false,
   4.3, 12, '["/produtos/prato.webp"]'::jsonb, '{}'::jsonb),
  ('d1000000-0000-4000-8000-000000000006', 'essencia-zomo-tradicional-50g', 'Essência Zomo Tradicional 50 g', 'cb700000-0000-4000-8000-000000000022',
   'Linha nacional, fumaça densa e sabor redondo.', 'Essência brasileira à base de folha de tabaco com melaço e glicerina. 50 g rendem cerca de 3 sessões. Sabores da linha tradicional em estoque rotativo — informe a preferência no checkout.', 'Folha de tabaco, melaço, glicerina vegetal, aromatizantes.', 'Mantenha a lata fechada e ao abrigo de luz. Contém nicotina.',
   2200, null, 60, true, true,
   4.6, 71, '["/produtos/essencia-zomo-1.png","/produtos/essencia-zomo-2.png","/produtos/essencia-zomo-3.png"]'::jsonb, '{}'::jsonb),
  ('d1000000-0000-4000-8000-000000000007', 'essencia-adalya-love-66-50g', 'Essência Adalya Love 66 · 50 g', 'cb700000-0000-4000-8000-000000000022',
   'O clássico frutado da Adalya: melancia, melão e menta.', 'Importada da Turquia, corte fino e bem melado. Love 66 mistura melancia, melão e um toque de menta — o sabor de entrada mais pedido. 50 g.', 'Folha de tabaco, melaço, glicerina, aromatizantes.', 'Guarde fechada. Contém nicotina.',
   3490, null, 35, true, false,
   4.8, 44, '["/produtos/adalya.png"]'::jsonb, '{}'::jsonb),
  ('d1000000-0000-4000-8000-000000000008', 'essencia-element-agua-50g', 'Essência Element Água · 50 g', 'cb700000-0000-4000-8000-000000000022',
   'Linha sem nicotina à base de cana — para sessões mais leves.', 'A linha Água da Element não usa folha de tabaco: a base é bagaço de cana. Fumaça igualmente densa, sem nicotina. Bom para quem quer sessão longa sem o efeito do tabaco.', 'Bagaço de cana, melaço, glicerina, aromatizantes. Sem nicotina.', 'Guarde fechada e seca.',
   3290, null, 28, true, false,
   4.4, 19, '["/produtos/element.png"]'::jsonb, '{}'::jsonb),
  ('d1000000-0000-4000-8000-000000000009', 'carvao-de-coco-250g-hexagonal', 'Carvão de Coco 250 g · Hexagonal', 'cb700000-0000-4000-8000-000000000023',
   'Acende rápido, dura ~45 min e quase não solta cheiro.', 'Carvão prensado de casca de coco, formato hexagonal (queima mais uniforme que o cúbico). Caixa com 250 g, cerca de 18 unidades. Pouca cinza, sem faísca.', 'Casca de coco prensada.', 'Acenda no fogão elétrico ou no acendedor até ficar todo alaranjado antes de colocar no prato.',
   2900, null, 80, true, true,
   4.7, 96, '["/produtos/carvao-coco.webp"]'::jsonb, '{}'::jsonb),
  ('d1000000-0000-4000-8000-000000000010', 'acendedor-de-carvao-eletrico', 'Acendedor de Carvão Elétrico', 'cb700000-0000-4000-8000-000000000023',
   'Resistência em espiral: carvão pronto em 4 minutos.', 'Acendedor com resistência de 1000 W e base de apoio. Acende de 2 a 4 carvões por vez sem precisar de fogão. Cabo de 1,4 m.', 'Resistência metálica, base cerâmica.', 'Deixe esfriar completamente antes de guardar. Não deixe ligado sem carvão.',
   8900, null, 15, true, false,
   4.5, 23, '["/produtos/acendedor.png"]'::jsonb, '{}'::jsonb),
  ('d1000000-0000-4000-8000-000000000011', 'seda-king-size-slim-bloco-32', 'Seda King Size Slim · Bloco 32 un', 'cb700000-0000-4000-8000-000000000030',
   'Papel fino de arroz, goma vegetal, queima reta.', 'Bloco com 32 livretos de seda King Size Slim (110 mm). Papel de arroz ultrafino com goma natural — queima devagar e sem sabor de papel.', 'Papel de arroz, goma arábica.', '',
   2800, null, 100, true, true,
   4.6, 64, '["/produtos/seda-slim.webp"]'::jsonb, '{}'::jsonb),
  ('d1000000-0000-4000-8000-000000000012', 'piteira-de-vidro-reutilizavel', 'Piteira de Vidro Reutilizável', 'cb700000-0000-4000-8000-000000000030',
   'Não amassa, não molha e melhora o tiro. Com 3 unidades.', 'Piteiras de vidro borossilicato de 8 mm, resistentes ao calor. Reutilizáveis: lava e usa de novo. Pack com 3 e estojo de silicone.', 'Vidro borossilicato.', 'Lave com água quente ou álcool isopropílico.',
   1900, null, 70, true, false,
   4.4, 31, '["/produtos/piteira-vidro.webp"]'::jsonb, '{}'::jsonb),
  ('d1000000-0000-4000-8000-000000000013', 'dichavador-aluminio-4-partes-63mm', 'Dichavador de Alumínio 4 Partes 63 mm', 'cb700000-0000-4000-8000-000000000031',
   'Dentes em diamante, tela e compartimento coletor.', 'Alumínio aeronáutico anodizado, 63 mm, 4 partes com rosca. Dentes cortados a laser em formato diamante, tela de inox e compartimento inferior para o pólen. Ímã no topo.', 'Alumínio anodizado, tela em inox.', 'Bata as partes para soltar o resíduo. Limpe a tela com álcool isopropílico.',
   5900, null, 22, true, true,
   4.8, 57, '["/produtos/dichavador-aluminio-4partes1.webp","/produtos/dichavador-aluminio-4partes2.webp"]'::jsonb, '{}'::jsonb),
  ('d1000000-0000-4000-8000-000000000014', 'dichavador-acrilico-transparente', 'Dichavador Acrílico Transparente', 'cb700000-0000-4000-8000-000000000031',
   'Leve, barato e você enxerga o ponto certo.', 'Dichavador de acrílico de 3 partes, 55 mm. Transparente para acompanhar a moagem. Dentes reforçados. Opção de entrada.', 'Acrílico.', 'Lave só com água — álcool pode esbranquiçar o acrílico.',
   2500, null, 45, true, false,
   4.1, 18, '["/produtos/dichavador-acrilico.webp"]'::jsonb, '{}'::jsonb),
  ('d1000000-0000-4000-8000-000000000015', 'isqueiro-macarico-antivento', 'Isqueiro Maçarico Antivento', 'cb700000-0000-4000-8000-000000000032',
   'Chama azul de 1300 °C que não apaga no vento.', 'Maçarico recarregável a gás butano, chama única azul, trava de segurança e janela de nível. Acende carvão e resiste ao vento — bom para sessão ao ar livre.', 'Corpo em metal e ABS.', 'Recarregue com gás butano refinado. Regule a chama no parafuso da base.',
   3900, null, 30, true, false,
   4.5, 40, '["/produtos/isqueiro-macarico.webp"]'::jsonb, '{}'::jsonb),
  ('d1000000-0000-4000-8000-000000000016', 'cinzeiro-de-vidro-grande', 'Cinzeiro de Vidro Grande', 'cb700000-0000-4000-8000-000000000033',
   'Vidro pesado de 13 cm, quatro descansos e fundo fundo.', 'Cinzeiro de vidro prensado espesso, 13 cm, com quatro entalhes de descanso e cavidade funda que segura bastante cinza. Base larga que não tomba.', 'Vidro prensado.', 'Lava na pia ou na máquina.',
   4500, null, 25, true, false,
   4.6, 15, '["/produtos/cinzeiro-vidro.webp"]'::jsonb, '{}'::jsonb),
  ('d1000000-0000-4000-8000-000000000017', 'kit-narguile-completo-iniciante', 'Kit Narguilé Completo Iniciante', 'cb700000-0000-4000-8000-000000000040',
   'Narguilé médio + rosh + prato + carvão + acendedor + essência.', 'Tudo para a primeira sessão em uma caixa: narguilé médio de alumínio, rosh phunnel, prato inox, uma lata de carvão de coco, acendedor elétrico e uma essência de 50 g à escolha. Com desconto sobre os itens separados.', 'Ver itens individuais.', 'Ver instruções de cada item.',
   27900, 33800, 10, true, true,
   4.7, 29, '["/produtos/kit-iniciante.webp"]'::jsonb, '{}'::jsonb),
  ('d1000000-0000-4000-8000-000000000018', 'kit-rolar-seda-piteira-dichavador-cinzeiro', 'Kit Rolar · Seda + Piteira + Dichavador + Cinzeiro', 'cb700000-0000-4000-8000-000000000040',
   'O básico do rolo em um combo com desconto.', 'Um bloco de seda King Size Slim, um pack de 3 piteiras de vidro, o dichavador de alumínio 4 partes e o cinzeiro de vidro grande. Combo com preço fechado.', 'Ver itens individuais.', 'Ver instruções de cada item.',
   9900, 13100, 14, true, false,
   4.5, 17, '["/produtos/kit-pala.webp"]'::jsonb, '{}'::jsonb)
on conflict (slug) do update set
  name = excluded.name,
  category_id = excluded.category_id,
  short_description = excluded.short_description,
  description = excluded.description,
  ingredients = excluded.ingredients,
  how_to_use = excluded.how_to_use,
  price_cents = excluded.price_cents,
  compare_at_price_cents = excluded.compare_at_price_cents,
  stock = excluded.stock,
  is_active = excluded.is_active,
  is_bestseller = excluded.is_bestseller,
  rating = excluded.rating,
  reviews_count = excluded.reviews_count,
  images = excluded.images,
  attributes = excluded.attributes;

-- 4. remove as categorias antigas (nada mais aponta para elas)
delete from public.categories where slug like '%\_\_legacy';


insert into public.offers
  (id, position, is_active, image_url, eyebrow, title, subtitle, cta_label, cta_href)
values
  ('0ffe1000-0000-4000-8000-000000000003', 1, true, '/ofertas/kit-iniciante-desktop.webp', '', '', '', 'Ver o Kit Narguilé Completo Iniciante', '/produto/kit-narguile-completo-iniciante'),
  ('0ffe1000-0000-4000-8000-000000000001', 2, true, '/ofertas/curadoria-acessorios.svg', 'Tabacaria com curadoria', 'Acessório que aguenta o uso', 'A gente testa tudo antes de vender. Narguilé que não vaza, seda que queima reta, dichavador que não trava.', 'Ver a loja', '/loja'),
  ('0ffe1000-0000-4000-8000-000000000002', 3, true, '/ofertas/kit-iniciante.svg', 'Primeira vez no narguilé?', 'Kit iniciante montado e com desconto', 'Narguilé, rosh, prato, carvão, acendedor e uma essência à escolha — tudo em uma caixa.', 'Ver os kits', '/loja?categoria=kits')
on conflict (id) do nothing;


insert into public.site_content (section, is_active, data) values
  ('brand', true, '{"logo_url":""}'::jsonb),
  ('home_quiz', false, '{"eyebrow":"","title":"","body":"","cta_label":"","cta_href":"/loja"}'::jsonb),
  ('home_bestsellers', true, '{"eyebrow":"Sai mais","title":"Os queridinhos da casa","cta_label":"Ver a loja inteira","cta_href":"/loja"}'::jsonb),
  ('home_story', true, '{"eyebrow":"A casa","title":"A gente testa antes\nde botar na prateleira","body":"A Brasa & Folha nasceu do cansaço de comprar acessório que quebra na segunda sessão. Se a rosca do narguilé vaza, se a seda queima torta, se o dichavador trava — não entra no catálogo.","cta_label":"Conhecer a Brasa & Folha","cta_href":"/sobre","features":[{"title":"Testado de verdade","body":"Cada item passa por uso real antes de entrar."},{"title":"Catálogo enxuto","body":"Só o que a gente recompraria. Menos abas, menos dúvida."},{"title":"+18 e discreto","body":"Confirmação de idade na entrada e embalagem sem identificação externa."}]}'::jsonb),
  ('home_social', true, '{"eyebrow":"Quem compra volta","title":"Mais de 6 mil sessões equipadas","subtitle":"Nota média 4,7 / 5 nas avaliações da loja","testimonials":[{"quote":"Comprei o kit iniciante sem saber nada de narguilé. Veio tudo explicadinho e a primeira sessão já foi de boa.","name":"Rafael T.","detail":"Curitiba"},{"quote":"O dichavador de alumínio é outro nível. Já tinha comprado dois baratos que travaram, esse não.","name":"Bruna M.","detail":"São Paulo"},{"quote":"Envio discreto de verdade e chegou rápido. A essência Element sem nicotina virou padrão aqui em casa.","name":"Diego S.","detail":"Porto Alegre"}]}'::jsonb),
  ('footer', true, '{"tagline":"Tabacaria com curadoria — narguilé, sedas, dichavadores e acessórios que aguentam o uso.","returns_line":"Trocas em até 7 dias corridos. Venda proibida para menores de 18 anos.","legal_line":"Brasa & Folha Comércio de Tabacaria LTDA. CNPJ 00.000.000/0001-00. Todos os direitos reservados.","payment_line":"Pagamentos pelo Mercado Pago · Pix e cartão em até 6x · Envio discreto"}'::jsonb),
  ('contact', true, '{"email":"contato@brasaefolha.com.br","whatsapp_number":"","hours":"Segunda a sábado, das 10h às 20h"}'::jsonb),
  ('page_sobre', true, '{"hero_eyebrow":"A casa","hero_title":"Curadoria de tabacaria,\nsem enrolação","paragraphs":["A Brasa & Folha nasceu do cansaço de comprar acessório que quebra na segunda sessão. A gente testa tudo antes de colocar na prateleira: se a rosca do narguilé vaza, se a seda queima torta, se o dichavador trava — não entra.","O catálogo é curto de propósito. Em vez de trezentas essências, as que valem a pena. Em vez de dez dichavadores iguais, o de alumínio que dura e o de acrílico que serve pra começar.","Atendimento por pessoa de verdade no WhatsApp, envio discreto e troca sem drama. É isso."],"values":[{"title":"Testado antes de vender","body":"Cada item passa por uso real. Se falhou pra gente, não vai pra você."},{"title":"Catálogo enxuto","body":"Só o que a gente recompraria. Menos abas, menos dúvida."},{"title":"+18 e discreto","body":"Confirmação de idade na entrada e embalagem sem identificação externa."}],"cta_title":"Primeira vez no narguilé?","cta_body":"O kit iniciante traz tudo montado e com desconto.","cta_label":"Ver os kits","cta_href":"/loja?categoria=kits"}'::jsonb),
  ('page_contato', true, '{"eyebrow":"Atendimento","title":"Fala com a gente","intro":"Dúvida de montagem, sabor de essência, rastreio ou troca? A gente responde no mesmo dia útil.","show_form":true}'::jsonb)
on conflict (section) do nothing;
