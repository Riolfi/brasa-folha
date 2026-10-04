-- =============================================================================
-- Visionário — seed do catálogo (gerado de src/data/catalog.json)
-- Rode DEPOIS de 0001..0006. Idempotente. Migra bancos já populados:
-- renomeia categorias antigas, insere a nova árvore, remapeia produtos e
-- depois apaga as antigas.
-- =============================================================================

-- 1. libera os slugs das categorias antigas que não estão na nova árvore
update public.categories
  set slug = slug || '__legacy'
  where id not in ('c0e00000-0000-4000-8000-000000000010', 'c0e00000-0000-4000-8000-000000000011', 'c0e00000-0000-4000-8000-000000000012', 'c0e00000-0000-4000-8000-000000000013', 'c0e00000-0000-4000-8000-000000000020', 'c0e00000-0000-4000-8000-000000000021', 'c0e00000-0000-4000-8000-000000000030', 'c0e00000-0000-4000-8000-000000000031', 'c0e00000-0000-4000-8000-000000000040', 'c0e00000-0000-4000-8000-000000000041', 'c0e00000-0000-4000-8000-000000000042', 'c0e00000-0000-4000-8000-000000000050') and slug not like '%\_\_legacy';

-- 2. insere/atualiza a nova árvore (raízes antes das subcategorias, por FK)
insert into public.categories (id, slug, name, description, position, image_url, parent_id) values
  ('c0e00000-0000-4000-8000-000000000010', 'cabeca', 'Cabeça', 'Boné, bucket e gorro — o acabamento do visual.', 1, '', null),
  ('c0e00000-0000-4000-8000-000000000011', 'bags', 'Bags', 'Pochete, transversal, tote e mochila pra carregar o rolê.', 2, '', null),
  ('c0e00000-0000-4000-8000-000000000012', 'detalhes', 'Detalhes', 'Meia, óculos, corrente e chaveiro: o que faz o look ser seu.', 3, '', null),
  ('c0e00000-0000-4000-8000-000000000013', 'kits', 'Kits', 'Combos montados com desconto. Presente fácil.', 4, '', null),
  ('c0e00000-0000-4000-8000-000000000020', 'bones', 'Bonés', 'Dad hat e trucker.', 1, '', 'c0e00000-0000-4000-8000-000000000010'),
  ('c0e00000-0000-4000-8000-000000000021', 'buckets-e-gorros', 'Buckets & gorros', 'Pra sol, frio e cabelo que não colaborou.', 2, '', 'c0e00000-0000-4000-8000-000000000010'),
  ('c0e00000-0000-4000-8000-000000000030', 'pochetes-e-transversais', 'Pochetes & transversais', 'Mãos livres, celular seguro.', 1, '', 'c0e00000-0000-4000-8000-000000000011'),
  ('c0e00000-0000-4000-8000-000000000031', 'totes-e-mochilas', 'Totes & mochilas', 'Do dia a dia ao fim de semana.', 2, '', 'c0e00000-0000-4000-8000-000000000011'),
  ('c0e00000-0000-4000-8000-000000000040', 'meias', 'Meias', 'Cano alto, cor e estampa.', 1, '', 'c0e00000-0000-4000-8000-000000000012'),
  ('c0e00000-0000-4000-8000-000000000041', 'oculos', 'Óculos', 'Proteção UV400 com cara de brechó bom.', 2, '', 'c0e00000-0000-4000-8000-000000000012'),
  ('c0e00000-0000-4000-8000-000000000042', 'correntes-e-chaveiros', 'Correntes & chaveiros', 'Metal que pendura e faz barulho na medida.', 3, '', 'c0e00000-0000-4000-8000-000000000012'),
  ('c0e00000-0000-4000-8000-000000000050', 'kits-prontos', 'Kits prontos', 'Combos com desconto.', 1, '', 'c0e00000-0000-4000-8000-000000000013')
on conflict (id) do update set
  slug = excluded.slug, name = excluded.name, description = excluded.description,
  position = excluded.position, image_url = excluded.image_url, parent_id = excluded.parent_id;

-- 3. produtos (category_id já aponta para a subcategoria nova)
insert into public.products
  (id, slug, name, category_id, short_description, description, ingredients, how_to_use,
   price_cents, compare_at_price_cents, stock, is_active, is_bestseller, rating, reviews_count,
   images)
values
  ('e1000000-0000-4000-8000-000000000001', 'bucket-hat-dupla-face-verde-musgo', 'Bucket Hat Dupla Face Verde Musgo', 'c0e00000-0000-4000-8000-000000000021',
   'Dois chapéus em um: verde musgo de um lado, estampado do outro.', 'Bucket de sarja pesada com aba média que não desaba na primeira chuva. Vira do avesso e vira outro chapéu — um lado liso verde musgo, o outro estampado. Costura reforçada na aba e tamanho único com folga.', '100% algodão (sarja 10 oz). Forro estampado em algodão.', 'Lave à mão com água fria. Seque à sombra, na forma da cabeça.',
   11900, null, 24, true, true,
   4.8, 61, '["https://images.unsplash.com/photo-1627683566270-bf7e75dfec0a","https://images.unsplash.com/photo-1627681828965-048a32cdf16f"]'::jsonb),
  ('e1000000-0000-4000-8000-000000000002', 'gorro-beanie-canelado-laranja', 'Gorro Beanie Canelado Laranja', 'c0e00000-0000-4000-8000-000000000021',
   'Canelado grosso, barra dobrada e laranja de sinalização.', 'Beanie de malha canelada com barra dupla dobrável — usa curto em cima da orelha ou desdobrado no frio de verdade. Laranja vivo que aparece de longe na foto.', 'Acrílico macio antipilling.', 'Lave à mão ou no ciclo delicado. Não use secadora.',
   6900, null, 40, true, true,
   4.7, 88, '["https://images.unsplash.com/photo-1511500118080-275313ec90a1"]'::jsonb),
  ('e1000000-0000-4000-8000-000000000003', 'gorro-pompom-amarelo', 'Gorro Pompom Amarelo', 'c0e00000-0000-4000-8000-000000000021',
   'Tricô trançado e pompom fofo. Amarelo gema.', 'Gorro de tricô com tranças em relevo e pompom grande. Quentinho sem esquentar demais, com elastano na barra pra não sair da cabeça.', 'Acrílico e lã (70/30). Pompom em fio acrílico.', 'Lave à mão em água fria e seque deitado.',
   7900, 8900, 18, true, false,
   4.6, 27, '["https://images.unsplash.com/photo-1576529598261-96e376f6aabb"]'::jsonb),
  ('e1000000-0000-4000-8000-000000000004', 'bone-dad-hat-lavado-grafite', 'Boné Dad Hat Lavado Grafite', 'c0e00000-0000-4000-8000-000000000020',
   'Aba curva, copa baixa e lavagem que deixa com cara de usado-favorito.', 'O boné de seis gomos que vai com tudo. Copa desestruturada, aba curva pré-moldada e lavagem estonada que dá aquele desbotado bonito. Fecho de metal ajustável atrás.', '100% algodão lavado. Fivela em metal.', 'Lave à mão com sabão neutro. Seque com papel dentro pra manter a forma.',
   8900, null, 35, true, true,
   4.8, 104, '["https://images.unsplash.com/photo-1521369909029-2afed882baee"]'::jsonb),
  ('e1000000-0000-4000-8000-000000000005', 'bone-dad-hat-amarelo-gema', 'Boné Dad Hat Amarelo Gema', 'c0e00000-0000-4000-8000-000000000020',
   'O mesmo dad hat, em amarelo que liga o look.', 'Copa baixa desestruturada, aba curva e fecho ajustável. Amarelo forte que combina com preto, jeans e cinza — ou seja, com o armário inteiro.', '100% algodão. Fivela em metal.', 'Lave à mão com sabão neutro. Não torça.',
   8900, null, 22, true, false,
   4.6, 39, '["https://images.unsplash.com/photo-1645266729222-17cd32e06fd0"]'::jsonb),
  ('e1000000-0000-4000-8000-000000000006', 'bone-trucker-preto-e-branco', 'Boné Trucker Preto e Branco', 'c0e00000-0000-4000-8000-000000000020',
   'Frente de espuma, tela atrás e snapback.', 'Trucker clássico: painel frontal alto em espuma branca, tela preta respirável e fecho snapback. Aba reta que você pode curvar do seu jeito.', 'Frente em espuma de poliéster, tela em poliéster, aba com reforço plástico.', 'Limpe com pano úmido. Não coloque na máquina.',
   9900, null, 30, true, false,
   4.5, 33, '["https://images.unsplash.com/photo-1678721938524-1a3ee398de2a"]'::jsonb),
  ('e1000000-0000-4000-8000-000000000007', 'bone-trucker-azul-royal', 'Boné Trucker Azul Royal', 'c0e00000-0000-4000-8000-000000000020',
   'Trucker todo azul royal com etiqueta de couro na aba.', 'Azul royal do painel à tela, aba reta com etiqueta aplicada e snapback. Pra quem quer um boné que seja o ponto de cor do look.', 'Poliéster e espuma. Etiqueta em couro sintético.', 'Limpe com pano úmido e sabão neutro.',
   9900, 11900, 14, true, false,
   4.7, 21, '["https://images.unsplash.com/photo-1620231109648-302d034cb29b"]'::jsonb),
  ('e1000000-0000-4000-8000-000000000008', 'pochete-transparente-roxa', 'Pochete Transparente Roxa', 'c0e00000-0000-4000-8000-000000000030',
   'Vinil transparente com vivo roxo. Tudo à vista, nada perdido.', 'Pochete de vinil cristal com acabamento roxo e zíper grosso. Cabe celular, carteira, chave e fone. Liberada em muito show e estádio que exige bolsa transparente.', 'PVC cristal, zíper e alça em poliéster.', 'Limpe com pano úmido. Evite sol forte por muito tempo.',
   12900, null, 20, true, true,
   4.7, 46, '["https://images.unsplash.com/photo-1789110855224-5598c2c7de1a"]'::jsonb),
  ('e1000000-0000-4000-8000-000000000009', 'bolsa-transversal-preta-nylon', 'Bolsa Transversal Preta Nylon', 'c0e00000-0000-4000-8000-000000000030',
   'Shoulder bag de nylon, alça regulável e dois bolsos.', 'Transversal compacta de nylon resistente à água, com bolso principal e bolso frontal. Usa no ombro, cruzada no peito ou como pochete.', 'Nylon 420D com revestimento repelente à água. Ferragens em metal.', 'Limpe com esponja e sabão neutro. Seque aberta.',
   14900, null, 26, true, true,
   4.8, 72, '["https://images.unsplash.com/photo-1620786514684-ff35b5aae55e","https://images.unsplash.com/photo-1789110854460-18562d439e1c"]'::jsonb),
  ('e1000000-0000-4000-8000-000000000010', 'tote-bag-algodao-cru', 'Tote Bag Algodão Cru', 'c0e00000-0000-4000-8000-000000000031',
   'A ecobag que aguenta notebook, feira e rolê.', 'Tote de lona grossa em algodão cru com alças longas — vai no ombro mesmo de casaco. Costura dupla nas alças e fundo reforçado.', 'Lona 100% algodão (8 oz).', 'Pode lavar na máquina, água fria. Passe do avesso.',
   5900, null, 60, true, false,
   4.6, 58, '["https://images.unsplash.com/photo-1574365569389-a10d488ca3fb","https://images.unsplash.com/photo-1630381260512-e3fe55c11973"]'::jsonb),
  ('e1000000-0000-4000-8000-000000000011', 'mochila-minimal-preta', 'Mochila Minimal Preta', 'c0e00000-0000-4000-8000-000000000031',
   'Linhas limpas, aba com fecho magnético e bolso pra notebook 14".', 'Mochila de couro sintético com aba frontal, fecho magnético e compartimento acolchoado para notebook até 14". Alças acolchoadas e bolso interno com zíper.', 'Couro sintético (PU), forro em poliéster.', 'Limpe com pano levemente úmido. Não molhe.',
   24900, 27900, 10, true, false,
   4.7, 19, '["https://images.unsplash.com/photo-1680039211156-66c721b87625"]'::jsonb),
  ('e1000000-0000-4000-8000-000000000012', 'kit-3-meias-cano-alto-listradas', 'Kit 3 Meias Cano Alto Listradas', 'c0e00000-0000-4000-8000-000000000040',
   'Três pares listrados, cano alto e punho que não afrouxa.', 'Meias de algodão penteado com cano alto, listras coloridas e punho canelado com elastano. Vem um par de cada combinação de cor. Tamanho 38–43.', 'Algodão penteado, poliamida e elastano.', 'Lave do avesso, água fria. Não use alvejante.',
   7900, 8700, 50, true, true,
   4.9, 131, '["https://images.unsplash.com/photo-1580973757787-e22cdecb9cd5","https://images.unsplash.com/photo-1585499583264-491df5142e83"]'::jsonb),
  ('e1000000-0000-4000-8000-000000000013', 'meia-cano-alto-laranja', 'Meia Cano Alto Laranja', 'c0e00000-0000-4000-8000-000000000040',
   'Uma cor, sem estampa, muita presença.', 'Meia lisa de cano alto em laranja vibrante, com punho canelado firme e sola atoalhada. Tamanho 38–43.', 'Algodão penteado, poliamida e elastano.', 'Lave do avesso, água fria.',
   3500, null, 45, true, false,
   4.6, 24, '["https://images.unsplash.com/photo-1640025867572-f6b3a8410c81"]'::jsonb),
  ('e1000000-0000-4000-8000-000000000014', 'oculos-redondo-retro-dourado', 'Óculos Redondo Retrô Dourado', 'c0e00000-0000-4000-8000-000000000041',
   'Armação fina dourada e lente verde. Proteção UV400.', 'Óculos de sol redondo com armação de metal fina e lente verde G-15. Leve, com plaquetas ajustáveis. Acompanha estojo e flanela.', 'Armação em liga metálica, lente em policarbonato UV400.', 'Limpe com a flanela. Guarde no estojo, lente pra cima.',
   11900, null, 25, true, false,
   4.5, 37, '["https://images.unsplash.com/photo-1511499767150-a48a237f0083","https://images.unsplash.com/photo-1577803645773-f96470509666"]'::jsonb),
  ('e1000000-0000-4000-8000-000000000015', 'oculos-gatinho-armacao-branca', 'Óculos Gatinho Armação Branca', 'c0e00000-0000-4000-8000-000000000041',
   'Armação branca de acetato, lente degradê marrom.', 'Modelo gatinho com armação branca encorpada e lente degradê. Proteção UV400. Acompanha estojo.', 'Armação em acetato, lente em policarbonato UV400.', 'Limpe com flanela seca. Evite deixar no painel do carro.',
   12900, null, 16, true, false,
   4.6, 15, '["https://images.unsplash.com/photo-1508296695146-257a814070b4"]'::jsonb),
  ('e1000000-0000-4000-8000-000000000016', 'corrente-de-bolso-aco', 'Corrente de Bolso Aço', 'c0e00000-0000-4000-8000-000000000042',
   'Elo grosso, 50 cm, com mosquetão nas duas pontas.', 'Wallet chain de aço inox com elos grossos. Prende no passante da calça e na carteira ou chave. Não enferruja e não mancha a roupa.', 'Aço inox 316L.', 'Limpe com pano seco. Pode lavar com água e sabão.',
   5900, null, 30, true, true,
   4.7, 49, '["https://images.unsplash.com/photo-1669303276837-b85ac024b617","https://images.unsplash.com/photo-1774301757878-d4f3be3999bc"]'::jsonb),
  ('e1000000-0000-4000-8000-000000000017', 'chaveiro-mosquetao-vermelho', 'Chaveiro Mosquetão Vermelho', 'c0e00000-0000-4000-8000-000000000042',
   'Mosquetão de alumínio pra pendurar chave na calça ou na bag.', 'Mosquetão de alumínio anodizado vermelho com trava de mola. Leve e firme — só não é pra escalada. Vende avulso.', 'Alumínio anodizado.', 'Limpe com pano seco.',
   2900, null, 80, true, false,
   4.5, 22, '["https://images.unsplash.com/photo-1701836924886-6dbb14f712e6","https://images.unsplash.com/photo-1541690090176-17d35a190b6c"]'::jsonb),
  ('e1000000-0000-4000-8000-000000000018', 'kit-role-completo', 'Kit Rolê Completo', 'c0e00000-0000-4000-8000-000000000050',
   'Dad hat + transversal + kit 3 meias. Visual fechado com desconto.', 'O combo pra sair de casa pronto: Boné Dad Hat Lavado Grafite, Bolsa Transversal Preta Nylon e Kit 3 Meias Cano Alto Listradas. Sai mais barato que comprar separado.', 'Ver itens individuais.', 'Ver cuidados de cada item.',
   27900, 31700, 12, true, true,
   4.9, 38, '["https://images.unsplash.com/photo-1771736813285-4ea70605d8cc"]'::jsonb),
  ('e1000000-0000-4000-8000-000000000019', 'kit-dupla-de-bones', 'Kit Dupla de Bonés', 'c0e00000-0000-4000-8000-000000000050',
   'Dois dad hats (grafite + amarelo gema) com desconto.', 'Um boné neutro e um que liga o look: Dad Hat Lavado Grafite e Dad Hat Amarelo Gema. Bom pra dividir com alguém — ou não.', 'Ver itens individuais.', 'Ver cuidados de cada item.',
   15900, 17800, 15, true, false,
   4.8, 17, '["https://images.unsplash.com/photo-1653704841996-c2ed854aedd8"]'::jsonb)
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
  images = excluded.images;

-- 4. remove as categorias antigas (nada mais aponta para elas)
delete from public.categories where slug like '%\_\_legacy';


insert into public.offers
  (id, position, is_active, image_url, eyebrow, title, subtitle, cta_label, cta_href)
values
  ('0ffe2000-0000-4000-8000-000000000001', 1, true, 'https://images.unsplash.com/photo-1721713168896-11db10d9740b', 'Drop de outubro', 'Acessório que fecha o look', 'Boné, bag, meia e metal — escolhidos a dedo pra rua.', 'Ver a loja', '/loja'),
  ('0ffe2000-0000-4000-8000-000000000002', 2, true, 'https://images.unsplash.com/photo-1740381918234-d364ff4c5cb4', 'Cabeça feita', 'Dad hat, trucker e bucket', 'A partir de R$ 69. Tamanho único com ajuste.', 'Ver bonés', '/loja?categoria=cabeca'),
  ('0ffe2000-0000-4000-8000-000000000003', 3, true, 'https://images.unsplash.com/photo-1566563634870-d566ab58a4df', 'Kits com desconto', 'Monta o visual de uma vez', 'Combos prontos que saem mais baratos que separado.', 'Ver os kits', '/loja?categoria=kits')
on conflict (id) do nothing;


insert into public.site_content (section, is_active, data) values
  ('brand', true, '{"logo_url":"/logo.svg"}'::jsonb),
  ('home_bestsellers', true, '{"eyebrow":"Mais pedidos","title":"O que tá saindo","cta_label":"Ver a loja inteira","cta_href":"/loja"}'::jsonb),
  ('home_story', true, '{"eyebrow":"Visionário","title":"Acessório bom\nnão precisa ser caro","body":"A Visionário nasceu de um grupo de amigos cansados de boné que desbota em um mês e bag que rasga a alça. A gente garimpa fornecedor, testa no dia a dia e só coloca na loja o que usaria de verdade.","cta_label":"Conhecer a Visionário","cta_href":"/sobre","features":[{"title":"Testado na rua","body":"Cada peça passa um tempo no nosso rolê antes de entrar no catálogo."},{"title":"Drop todo mês","body":"Coleção pequena e renovada. Acabou, acabou."},{"title":"Troca sem drama","body":"Não serviu ou não curtiu? 7 dias pra trocar, sem burocracia."}]}'::jsonb),
  ('home_social', true, '{"eyebrow":"Quem compra volta","title":"Mais de 8 mil looks fechados","subtitle":"Nota média 4,8 / 5 nas avaliações da loja","testimonials":[{"quote":"O dad hat lavado é exatamente o desbotado que eu procurava. Já pedi o amarelo também.","name":"Lucas P.","detail":"Belo Horizonte"},{"quote":"A transversal de nylon pegou chuva no festival e o celular saiu sequinho. Comprei outra pra minha irmã.","name":"Marina A.","detail":"Recife"},{"quote":"Kit de meias listradas virou uniforme. Lavei mil vezes e o punho continua firme.","name":"Thiago R.","detail":"São Paulo"}]}'::jsonb),
  ('footer', true, '{"tagline":"Acessórios streetwear — bonés, bags, meias, óculos e metal pra fechar o look.","returns_line":"Trocas em até 7 dias corridos. Frete grátis acima de R$ 199.","legal_line":"Visionário Acessórios LTDA. CNPJ 00.000.000/0001-00. Todos os direitos reservados.","payment_line":"Pagamentos pelo Mercado Pago · Pix e cartão em até 6x"}'::jsonb),
  ('contact', true, '{"email":"contato@lojavisionario.com.br","whatsapp_number":"","hours":"Segunda a sábado, das 10h às 20h"}'::jsonb),
  ('page_sobre', true, '{"hero_eyebrow":"Visionário","hero_title":"Acessório pra rua,\nsem firula","paragraphs":["A Visionário começou num grupo de amigos que vivia trocando dica de onde comprar boné, bag e meia que prestasse. Virou planilha, virou fornecedor, virou loja.","O catálogo é curto de propósito. Em vez de cem bonés iguais, os poucos que a gente usaria. Cada drop é pequeno — quando acaba, vem coisa nova.","Atendimento por gente de verdade no WhatsApp, envio rápido e troca sem drama. É isso."],"values":[{"title":"Testado na rua","body":"Se desbotou, rasgou ou afrouxou com a gente, não vai pra você."},{"title":"Catálogo enxuto","body":"Só o que a gente recompraria. Menos rolagem, mais certeza."},{"title":"Preço justo","body":"Sem markup de grife. Qualidade boa a preço de rolê."}],"cta_title":"Não sabe por onde começar?","cta_body":"O Kit Rolê Completo junta boné, bag e meias com desconto.","cta_label":"Ver os kits","cta_href":"/loja?categoria=kits"}'::jsonb),
  ('page_contato', true, '{"eyebrow":"Atendimento","title":"Fala com a gente","intro":"Dúvida de tamanho, troca, rastreio ou parceria? A gente responde no mesmo dia útil.","show_form":true}'::jsonb)
on conflict (section) do nothing;
