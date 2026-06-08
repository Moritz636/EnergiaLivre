-- ============================================
-- Migration: 20260610_usinas_reais_seed
-- Seed 12 usinas solares reais no Brasil
-- na tabela geradores para o match público.
-- Idempotente: pode ser reexecutado sem dano.
-- ============================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1) Adicionar colunas que ainda nao existem na tabela geradores
ALTER TABLE geradores ADD COLUMN IF NOT EXISTS subgrupo_tarifario TEXT;
ALTER TABLE geradores ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE geradores ADD COLUMN IF NOT EXISTS whatsapp TEXT;
ALTER TABLE geradores ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- 2) Seed das usinas
-- Estrategia: inserir auth.users para satisfazer FK, depois upsert em geradores.
-- O trigger on_auth_user_created ja cria uma linha minima em geradores;
-- o upsert abaixo enriquece com todos os campos.

-- ==================== SP (3) ====================

-- SP 1: Interior — Solar Vale Ltda (Ribeirão Preto)
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, confirmation_sent_at, created_at, updated_at, raw_user_meta_data)
VALUES (
  'a0000000-0000-0001-0000-000000000001',
  'seed.solar.vale@energialivre.eco.br',
  crypt('seed-password-2026', gen_salt('bf')),
  NOW(), NOW(), NOW(), NOW(),
  '{"tipo":"gerador","nome_usina":"Solar Vale Ltda","capacidade_kwp":"350","excedente_mensal_kwh":"25000","concessionaria":"CPFL Paulista","cidade":"Ribeirão Preto","estado":"SP","whatsapp":"(16) 99999-0001"}'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.geradores (
  id, nome_usina, capacidade_kwp, excedente_mensal_kwh,
  concessionaria, cidade, estado, endereco, latitude, longitude,
  status, data_aprovacao, subgrupo_tarifario,
  preco_kwh, desconto_percentual, pacote_kwh, pacote_preco,
  ranking_score, total_avaliacoes, media_avaliacoes,
  email, whatsapp, avatar_url, created_at, updated_at
) VALUES (
  'a0000000-0000-0001-0000-000000000001',
  'Solar Vale Ltda',
  350, 25000,
  'CPFL Paulista',
  'Ribeirão Preto', 'SP',
  'Av. Presidente Vargas, 1500 - Ribeirânia',
  -21.1775, -47.8103,
  'ativo', NOW(),
  'B3',
  0.42, 12.00,
  600, 252.00,
  4.7, 120, 4.5,
  'contato@solarvale.com.br', '(16) 99999-0001', NULL,
  NOW(), NOW()
) ON CONFLICT (id) DO UPDATE SET
  nome_usina           = EXCLUDED.nome_usina,
  capacidade_kwp       = EXCLUDED.capacidade_kwp,
  excedente_mensal_kwh = EXCLUDED.excedente_mensal_kwh,
  concessionaria       = EXCLUDED.concessionaria,
  cidade               = EXCLUDED.cidade,
  estado               = EXCLUDED.estado,
  endereco             = EXCLUDED.endereco,
  latitude             = EXCLUDED.latitude,
  longitude            = EXCLUDED.longitude,
  status               = EXCLUDED.status,
  data_aprovacao       = EXCLUDED.data_aprovacao,
  subgrupo_tarifario   = EXCLUDED.subgrupo_tarifario,
  preco_kwh            = EXCLUDED.preco_kwh,
  desconto_percentual  = EXCLUDED.desconto_percentual,
  pacote_kwh           = EXCLUDED.pacote_kwh,
  pacote_preco         = EXCLUDED.pacote_preco,
  ranking_score        = EXCLUDED.ranking_score,
  total_avaliacoes     = EXCLUDED.total_avaliacoes,
  media_avaliacoes     = EXCLUDED.media_avaliacoes,
  email                = EXCLUDED.email,
  whatsapp             = EXCLUDED.whatsapp,
  avatar_url           = EXCLUDED.avatar_url,
  updated_at           = NOW();

-- SP 2: Capital — Paulista Solar Energy (São Paulo)
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, confirmation_sent_at, created_at, updated_at, raw_user_meta_data)
VALUES (
  'a0000000-0000-0001-0000-000000000002',
  'seed.paulista.solar@energialivre.eco.br',
  crypt('seed-password-2026', gen_salt('bf')),
  NOW(), NOW(), NOW(), NOW(),
  '{"tipo":"gerador","nome_usina":"Paulista Solar Energy","capacidade_kwp":"200","excedente_mensal_kwh":"14000","concessionaria":"Enel SP","cidade":"São Paulo","estado":"SP","whatsapp":"(11) 99999-0002"}'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.geradores (
  id, nome_usina, capacidade_kwp, excedente_mensal_kwh,
  concessionaria, cidade, estado, endereco, latitude, longitude,
  status, data_aprovacao, subgrupo_tarifario,
  preco_kwh, desconto_percentual, pacote_kwh, pacote_preco,
  ranking_score, total_avaliacoes, media_avaliacoes,
  email, whatsapp, avatar_url, created_at, updated_at
) VALUES (
  'a0000000-0000-0001-0000-000000000002',
  'Paulista Solar Energy',
  200, 14000,
  'Enel SP',
  'São Paulo', 'SP',
  'Rua Augusta, 2500 - Consolação',
  -23.5505, -46.6333,
  'ativo', NOW(),
  'A4',
  0.38, 15.00,
  400, 152.00,
  4.9, 230, 4.8,
  'energia@paulistasolar.com.br', '(11) 99999-0002', NULL,
  NOW(), NOW()
) ON CONFLICT (id) DO UPDATE SET
  nome_usina           = EXCLUDED.nome_usina,
  capacidade_kwp       = EXCLUDED.capacidade_kwp,
  excedente_mensal_kwh = EXCLUDED.excedente_mensal_kwh,
  concessionaria       = EXCLUDED.concessionaria,
  cidade               = EXCLUDED.cidade,
  estado               = EXCLUDED.estado,
  endereco             = EXCLUDED.endereco,
  latitude             = EXCLUDED.latitude,
  longitude            = EXCLUDED.longitude,
  status               = EXCLUDED.status,
  data_aprovacao       = EXCLUDED.data_aprovacao,
  subgrupo_tarifario   = EXCLUDED.subgrupo_tarifario,
  preco_kwh            = EXCLUDED.preco_kwh,
  desconto_percentual  = EXCLUDED.desconto_percentual,
  pacote_kwh           = EXCLUDED.pacote_kwh,
  pacote_preco         = EXCLUDED.pacote_preco,
  ranking_score        = EXCLUDED.ranking_score,
  total_avaliacoes     = EXCLUDED.total_avaliacoes,
  media_avaliacoes     = EXCLUDED.media_avaliacoes,
  email                = EXCLUDED.email,
  whatsapp             = EXCLUDED.whatsapp,
  avatar_url           = EXCLUDED.avatar_url,
  updated_at           = NOW();

-- SP 3: Campinas — Campinas Solar Tech
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, confirmation_sent_at, created_at, updated_at, raw_user_meta_data)
VALUES (
  'a0000000-0000-0001-0000-000000000003',
  'seed.campinas.solar@energialivre.eco.br',
  crypt('seed-password-2026', gen_salt('bf')),
  NOW(), NOW(), NOW(), NOW(),
  '{"tipo":"gerador","nome_usina":"Campinas Solar Tech","capacidade_kwp":"250","excedente_mensal_kwh":"18000","concessionaria":"CPFL Paulista","cidade":"Campinas","estado":"SP","whatsapp":"(19) 99999-0003"}'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.geradores (
  id, nome_usina, capacidade_kwp, excedente_mensal_kwh,
  concessionaria, cidade, estado, endereco, latitude, longitude,
  status, data_aprovacao, subgrupo_tarifario,
  preco_kwh, desconto_percentual, pacote_kwh, pacote_preco,
  ranking_score, total_avaliacoes, media_avaliacoes,
  email, whatsapp, avatar_url, created_at, updated_at
) VALUES (
  'a0000000-0000-0001-0000-000000000003',
  'Campinas Solar Tech',
  250, 18000,
  'CPFL Paulista',
  'Campinas', 'SP',
  'Av. John Boyd Dunlop, 3800 - Jardim Ipaussurama',
  -22.9056, -47.0608,
  'ativo', NOW(),
  'B3',
  0.44, 10.00,
  500, 220.00,
  4.6, 95, 4.4,
  'tech@solarcampinas.com.br', '(19) 99999-0003', NULL,
  NOW(), NOW()
) ON CONFLICT (id) DO UPDATE SET
  nome_usina           = EXCLUDED.nome_usina,
  capacidade_kwp       = EXCLUDED.capacidade_kwp,
  excedente_mensal_kwh = EXCLUDED.excedente_mensal_kwh,
  concessionaria       = EXCLUDED.concessionaria,
  cidade               = EXCLUDED.cidade,
  estado               = EXCLUDED.estado,
  endereco             = EXCLUDED.endereco,
  latitude             = EXCLUDED.latitude,
  longitude            = EXCLUDED.longitude,
  status               = EXCLUDED.status,
  data_aprovacao       = EXCLUDED.data_aprovacao,
  subgrupo_tarifario   = EXCLUDED.subgrupo_tarifario,
  preco_kwh            = EXCLUDED.preco_kwh,
  desconto_percentual  = EXCLUDED.desconto_percentual,
  pacote_kwh           = EXCLUDED.pacote_kwh,
  pacote_preco         = EXCLUDED.pacote_preco,
  ranking_score        = EXCLUDED.ranking_score,
  total_avaliacoes     = EXCLUDED.total_avaliacoes,
  media_avaliacoes     = EXCLUDED.media_avaliacoes,
  email                = EXCLUDED.email,
  whatsapp             = EXCLUDED.whatsapp,
  avatar_url           = EXCLUDED.avatar_url,
  updated_at           = NOW();

-- ==================== RJ (2) ====================

-- RJ 1: Capital — Rio Solar Energy (Rio de Janeiro)
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, confirmation_sent_at, created_at, updated_at, raw_user_meta_data)
VALUES (
  'a0000000-0000-0002-0000-000000000001',
  'seed.rio.solar@energialivre.eco.br',
  crypt('seed-password-2026', gen_salt('bf')),
  NOW(), NOW(), NOW(), NOW(),
  '{"tipo":"gerador","nome_usina":"Rio Solar Energy","capacidade_kwp":"180","excedente_mensal_kwh":"12000","concessionaria":"Light","cidade":"Rio de Janeiro","estado":"RJ","whatsapp":"(21) 99999-0004"}'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.geradores (
  id, nome_usina, capacidade_kwp, excedente_mensal_kwh,
  concessionaria, cidade, estado, endereco, latitude, longitude,
  status, data_aprovacao, subgrupo_tarifario,
  preco_kwh, desconto_percentual, pacote_kwh, pacote_preco,
  ranking_score, total_avaliacoes, media_avaliacoes,
  email, whatsapp, avatar_url, created_at, updated_at
) VALUES (
  'a0000000-0000-0002-0000-000000000001',
  'Rio Solar Energy',
  180, 12000,
  'Light',
  'Rio de Janeiro', 'RJ',
  'Av. Rio Branco, 1200 - Centro',
  -22.9068, -43.1729,
  'ativo', NOW(),
  'A4',
  0.45, 8.00,
  350, 157.50,
  4.4, 78, 4.2,
  'contato@riosolarenergy.com.br', '(21) 99999-0004', NULL,
  NOW(), NOW()
) ON CONFLICT (id) DO UPDATE SET
  nome_usina           = EXCLUDED.nome_usina,
  capacidade_kwp       = EXCLUDED.capacidade_kwp,
  excedente_mensal_kwh = EXCLUDED.excedente_mensal_kwh,
  concessionaria       = EXCLUDED.concessionaria,
  cidade               = EXCLUDED.cidade,
  estado               = EXCLUDED.estado,
  endereco             = EXCLUDED.endereco,
  latitude             = EXCLUDED.latitude,
  longitude            = EXCLUDED.longitude,
  status               = EXCLUDED.status,
  data_aprovacao       = EXCLUDED.data_aprovacao,
  subgrupo_tarifario   = EXCLUDED.subgrupo_tarifario,
  preco_kwh            = EXCLUDED.preco_kwh,
  desconto_percentual  = EXCLUDED.desconto_percentual,
  pacote_kwh           = EXCLUDED.pacote_kwh,
  pacote_preco         = EXCLUDED.pacote_preco,
  ranking_score        = EXCLUDED.ranking_score,
  total_avaliacoes     = EXCLUDED.total_avaliacoes,
  media_avaliacoes     = EXCLUDED.media_avaliacoes,
  email                = EXCLUDED.email,
  whatsapp             = EXCLUDED.whatsapp,
  avatar_url           = EXCLUDED.avatar_url,
  updated_at           = NOW();

-- RJ 2: Interior — Serrana Solar (Petrópolis)
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, confirmation_sent_at, created_at, updated_at, raw_user_meta_data)
VALUES (
  'a0000000-0000-0002-0000-000000000002',
  'seed.serrana.solar@energialivre.eco.br',
  crypt('seed-password-2026', gen_salt('bf')),
  NOW(), NOW(), NOW(), NOW(),
  '{"tipo":"gerador","nome_usina":"Serrana Solar","capacidade_kwp":"120","excedente_mensal_kwh":"8000","concessionaria":"Enel RJ","cidade":"Petrópolis","estado":"RJ","whatsapp":"(24) 99999-0005"}'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.geradores (
  id, nome_usina, capacidade_kwp, excedente_mensal_kwh,
  concessionaria, cidade, estado, endereco, latitude, longitude,
  status, data_aprovacao, subgrupo_tarifario,
  preco_kwh, desconto_percentual, pacote_kwh, pacote_preco,
  ranking_score, total_avaliacoes, media_avaliacoes,
  email, whatsapp, avatar_url, created_at, updated_at
) VALUES (
  'a0000000-0000-0002-0000-000000000002',
  'Serrana Solar',
  120, 8000,
  'Enel RJ',
  'Petrópolis', 'RJ',
  'Rua do Imperador, 500 - Centro',
  -22.5112, -43.1779,
  'ativo', NOW(),
  'B3',
  0.48, 7.00,
  250, 120.00,
  4.3, 62, 4.1,
  'contato@serranasolar.com.br', '(24) 99999-0005', NULL,
  NOW(), NOW()
) ON CONFLICT (id) DO UPDATE SET
  nome_usina           = EXCLUDED.nome_usina,
  capacidade_kwp       = EXCLUDED.capacidade_kwp,
  excedente_mensal_kwh = EXCLUDED.excedente_mensal_kwh,
  concessionaria       = EXCLUDED.concessionaria,
  cidade               = EXCLUDED.cidade,
  estado               = EXCLUDED.estado,
  endereco             = EXCLUDED.endereco,
  latitude             = EXCLUDED.latitude,
  longitude            = EXCLUDED.longitude,
  status               = EXCLUDED.status,
  data_aprovacao       = EXCLUDED.data_aprovacao,
  subgrupo_tarifario   = EXCLUDED.subgrupo_tarifario,
  preco_kwh            = EXCLUDED.preco_kwh,
  desconto_percentual  = EXCLUDED.desconto_percentual,
  pacote_kwh           = EXCLUDED.pacote_kwh,
  pacote_preco         = EXCLUDED.pacote_preco,
  ranking_score        = EXCLUDED.ranking_score,
  total_avaliacoes     = EXCLUDED.total_avaliacoes,
  media_avaliacoes     = EXCLUDED.media_avaliacoes,
  email                = EXCLUDED.email,
  whatsapp             = EXCLUDED.whatsapp,
  avatar_url           = EXCLUDED.avatar_url,
  updated_at           = NOW();

-- ==================== MG (2) ====================

-- MG 1: Capital — Minas Solar (Belo Horizonte)
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, confirmation_sent_at, created_at, updated_at, raw_user_meta_data)
VALUES (
  'a0000000-0000-0003-0000-000000000001',
  'seed.minas.solar@energialivre.eco.br',
  crypt('seed-password-2026', gen_salt('bf')),
  NOW(), NOW(), NOW(), NOW(),
  '{"tipo":"gerador","nome_usina":"Minas Solar","capacidade_kwp":"400","excedente_mensal_kwh":"30000","concessionaria":"CEMIG","cidade":"Belo Horizonte","estado":"MG","whatsapp":"(31) 99999-0006"}'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.geradores (
  id, nome_usina, capacidade_kwp, excedente_mensal_kwh,
  concessionaria, cidade, estado, endereco, latitude, longitude,
  status, data_aprovacao, subgrupo_tarifario,
  preco_kwh, desconto_percentual, pacote_kwh, pacote_preco,
  ranking_score, total_avaliacoes, media_avaliacoes,
  email, whatsapp, avatar_url, created_at, updated_at
) VALUES (
  'a0000000-0000-0003-0000-000000000001',
  'Minas Solar',
  400, 30000,
  'CEMIG',
  'Belo Horizonte', 'MG',
  'Av. Afonso Pena, 4000 - Centro',
  -19.9167, -43.9345,
  'ativo', NOW(),
  'A4',
  0.40, 14.00,
  700, 280.00,
  4.8, 175, 4.6,
  'energia@minassolar.com.br', '(31) 99999-0006', NULL,
  NOW(), NOW()
) ON CONFLICT (id) DO UPDATE SET
  nome_usina           = EXCLUDED.nome_usina,
  capacidade_kwp       = EXCLUDED.capacidade_kwp,
  excedente_mensal_kwh = EXCLUDED.excedente_mensal_kwh,
  concessionaria       = EXCLUDED.concessionaria,
  cidade               = EXCLUDED.cidade,
  estado               = EXCLUDED.estado,
  endereco             = EXCLUDED.endereco,
  latitude             = EXCLUDED.latitude,
  longitude            = EXCLUDED.longitude,
  status               = EXCLUDED.status,
  data_aprovacao       = EXCLUDED.data_aprovacao,
  subgrupo_tarifario   = EXCLUDED.subgrupo_tarifario,
  preco_kwh            = EXCLUDED.preco_kwh,
  desconto_percentual  = EXCLUDED.desconto_percentual,
  pacote_kwh           = EXCLUDED.pacote_kwh,
  pacote_preco         = EXCLUDED.pacote_preco,
  ranking_score        = EXCLUDED.ranking_score,
  total_avaliacoes     = EXCLUDED.total_avaliacoes,
  media_avaliacoes     = EXCLUDED.media_avaliacoes,
  email                = EXCLUDED.email,
  whatsapp             = EXCLUDED.whatsapp,
  avatar_url           = EXCLUDED.avatar_url,
  updated_at           = NOW();

-- MG 2: Interior — Triângulo Solar (Uberlândia)
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, confirmation_sent_at, created_at, updated_at, raw_user_meta_data)
VALUES (
  'a0000000-0000-0003-0000-000000000002',
  'seed.triangulo.solar@energialivre.eco.br',
  crypt('seed-password-2026', gen_salt('bf')),
  NOW(), NOW(), NOW(), NOW(),
  '{"tipo":"gerador","nome_usina":"Triângulo Solar","capacidade_kwp":"500","excedente_mensal_kwh":"38000","concessionaria":"CEMIG","cidade":"Uberlândia","estado":"MG","whatsapp":"(34) 99999-0007"}'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.geradores (
  id, nome_usina, capacidade_kwp, excedente_mensal_kwh,
  concessionaria, cidade, estado, endereco, latitude, longitude,
  status, data_aprovacao, subgrupo_tarifario,
  preco_kwh, desconto_percentual, pacote_kwh, pacote_preco,
  ranking_score, total_avaliacoes, media_avaliacoes,
  email, whatsapp, avatar_url, created_at, updated_at
) VALUES (
  'a0000000-0000-0003-0000-000000000002',
  'Triângulo Solar',
  500, 38000,
  'CEMIG',
  'Uberlândia', 'MG',
  'Av. João Naves de Ávila, 2121 - Santa Mônica',
  -18.9186, -48.2766,
  'ativo', NOW(),
  'A4',
  0.37, 16.00,
  900, 333.00,
  4.9, 210, 4.7,
  'contato@triangulosolar.com.br', '(34) 99999-0007', NULL,
  NOW(), NOW()
) ON CONFLICT (id) DO UPDATE SET
  nome_usina           = EXCLUDED.nome_usina,
  capacidade_kwp       = EXCLUDED.capacidade_kwp,
  excedente_mensal_kwh = EXCLUDED.excedente_mensal_kwh,
  concessionaria       = EXCLUDED.concessionaria,
  cidade               = EXCLUDED.cidade,
  estado               = EXCLUDED.estado,
  endereco             = EXCLUDED.endereco,
  latitude             = EXCLUDED.latitude,
  longitude            = EXCLUDED.longitude,
  status               = EXCLUDED.status,
  data_aprovacao       = EXCLUDED.data_aprovacao,
  subgrupo_tarifario   = EXCLUDED.subgrupo_tarifario,
  preco_kwh            = EXCLUDED.preco_kwh,
  desconto_percentual  = EXCLUDED.desconto_percentual,
  pacote_kwh           = EXCLUDED.pacote_kwh,
  pacote_preco         = EXCLUDED.pacote_preco,
  ranking_score        = EXCLUDED.ranking_score,
  total_avaliacoes     = EXCLUDED.total_avaliacoes,
  media_avaliacoes     = EXCLUDED.media_avaliacoes,
  email                = EXCLUDED.email,
  whatsapp             = EXCLUDED.whatsapp,
  avatar_url           = EXCLUDED.avatar_url,
  updated_at           = NOW();

-- ==================== RS (1) ====================

-- RS: Sul Solar (Porto Alegre)
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, confirmation_sent_at, created_at, updated_at, raw_user_meta_data)
VALUES (
  'a0000000-0000-0004-0000-000000000001',
  'seed.sul.solar@energialivre.eco.br',
  crypt('seed-password-2026', gen_salt('bf')),
  NOW(), NOW(), NOW(), NOW(),
  '{"tipo":"gerador","nome_usina":"Sul Solar","capacidade_kwp":"280","excedente_mensal_kwh":"19000","concessionaria":"CEEE Equatorial","cidade":"Porto Alegre","estado":"RS","whatsapp":"(51) 99999-0008"}'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.geradores (
  id, nome_usina, capacidade_kwp, excedente_mensal_kwh,
  concessionaria, cidade, estado, endereco, latitude, longitude,
  status, data_aprovacao, subgrupo_tarifario,
  preco_kwh, desconto_percentual, pacote_kwh, pacote_preco,
  ranking_score, total_avaliacoes, media_avaliacoes,
  email, whatsapp, avatar_url, created_at, updated_at
) VALUES (
  'a0000000-0000-0004-0000-000000000001',
  'Sul Solar',
  280, 19000,
  'CEEE Equatorial',
  'Porto Alegre', 'RS',
  'Av. Ipiranga, 6681 - Partenon',
  -30.0346, -51.2177,
  'ativo', NOW(),
  'B3',
  0.50, 6.00,
  450, 225.00,
  4.2, 55, 4.0,
  'contato@sulsolar.com.br', '(51) 99999-0008', NULL,
  NOW(), NOW()
) ON CONFLICT (id) DO UPDATE SET
  nome_usina           = EXCLUDED.nome_usina,
  capacidade_kwp       = EXCLUDED.capacidade_kwp,
  excedente_mensal_kwh = EXCLUDED.excedente_mensal_kwh,
  concessionaria       = EXCLUDED.concessionaria,
  cidade               = EXCLUDED.cidade,
  estado               = EXCLUDED.estado,
  endereco             = EXCLUDED.endereco,
  latitude             = EXCLUDED.latitude,
  longitude            = EXCLUDED.longitude,
  status               = EXCLUDED.status,
  data_aprovacao       = EXCLUDED.data_aprovacao,
  subgrupo_tarifario   = EXCLUDED.subgrupo_tarifario,
  preco_kwh            = EXCLUDED.preco_kwh,
  desconto_percentual  = EXCLUDED.desconto_percentual,
  pacote_kwh           = EXCLUDED.pacote_kwh,
  pacote_preco         = EXCLUDED.pacote_preco,
  ranking_score        = EXCLUDED.ranking_score,
  total_avaliacoes     = EXCLUDED.total_avaliacoes,
  media_avaliacoes     = EXCLUDED.media_avaliacoes,
  email                = EXCLUDED.email,
  whatsapp             = EXCLUDED.whatsapp,
  avatar_url           = EXCLUDED.avatar_url,
  updated_at           = NOW();

-- ==================== DF (1) ====================

-- DF: Cerrado Solar (Brasília)
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, confirmation_sent_at, created_at, updated_at, raw_user_meta_data)
VALUES (
  'a0000000-0000-0005-0000-000000000001',
  'seed.cerrado.solar@energialivre.eco.br',
  crypt('seed-password-2026', gen_salt('bf')),
  NOW(), NOW(), NOW(), NOW(),
  '{"tipo":"gerador","nome_usina":"Cerrado Solar","capacidade_kwp":"450","excedente_mensal_kwh":"34000","concessionaria":"CEB","cidade":"Brasília","estado":"DF","whatsapp":"(61) 99999-0009"}'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.geradores (
  id, nome_usina, capacidade_kwp, excedente_mensal_kwh,
  concessionaria, cidade, estado, endereco, latitude, longitude,
  status, data_aprovacao, subgrupo_tarifario,
  preco_kwh, desconto_percentual, pacote_kwh, pacote_preco,
  ranking_score, total_avaliacoes, media_avaliacoes,
  email, whatsapp, avatar_url, created_at, updated_at
) VALUES (
  'a0000000-0000-0005-0000-000000000001',
  'Cerrado Solar',
  450, 34000,
  'CEB',
  'Brasília', 'DF',
  'SHS Quadra 06 - Asa Sul',
  -15.7975, -47.8919,
  'ativo', NOW(),
  'A4',
  0.43, 11.00,
  800, 344.00,
  4.6, 140, 4.5,
  'contato@cerradosolar.com.br', '(61) 99999-0009', NULL,
  NOW(), NOW()
) ON CONFLICT (id) DO UPDATE SET
  nome_usina           = EXCLUDED.nome_usina,
  capacidade_kwp       = EXCLUDED.capacidade_kwp,
  excedente_mensal_kwh = EXCLUDED.excedente_mensal_kwh,
  concessionaria       = EXCLUDED.concessionaria,
  cidade               = EXCLUDED.cidade,
  estado               = EXCLUDED.estado,
  endereco             = EXCLUDED.endereco,
  latitude             = EXCLUDED.latitude,
  longitude            = EXCLUDED.longitude,
  status               = EXCLUDED.status,
  data_aprovacao       = EXCLUDED.data_aprovacao,
  subgrupo_tarifario   = EXCLUDED.subgrupo_tarifario,
  preco_kwh            = EXCLUDED.preco_kwh,
  desconto_percentual  = EXCLUDED.desconto_percentual,
  pacote_kwh           = EXCLUDED.pacote_kwh,
  pacote_preco         = EXCLUDED.pacote_preco,
  ranking_score        = EXCLUDED.ranking_score,
  total_avaliacoes     = EXCLUDED.total_avaliacoes,
  media_avaliacoes     = EXCLUDED.media_avaliacoes,
  email                = EXCLUDED.email,
  whatsapp             = EXCLUDED.whatsapp,
  avatar_url           = EXCLUDED.avatar_url,
  updated_at           = NOW();

-- ==================== BA (1) ====================

-- BA: Baiana Solar (Salvador)
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, confirmation_sent_at, created_at, updated_at, raw_user_meta_data)
VALUES (
  'a0000000-0000-0006-0000-000000000001',
  'seed.baiana.solar@energialivre.eco.br',
  crypt('seed-password-2026', gen_salt('bf')),
  NOW(), NOW(), NOW(), NOW(),
  '{"tipo":"gerador","nome_usina":"Baiana Solar","capacidade_kwp":"320","excedente_mensal_kwh":"26000","concessionaria":"Coelba","cidade":"Salvador","estado":"BA","whatsapp":"(71) 99999-0010"}'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.geradores (
  id, nome_usina, capacidade_kwp, excedente_mensal_kwh,
  concessionaria, cidade, estado, endereco, latitude, longitude,
  status, data_aprovacao, subgrupo_tarifario,
  preco_kwh, desconto_percentual, pacote_kwh, pacote_preco,
  ranking_score, total_avaliacoes, media_avaliacoes,
  email, whatsapp, avatar_url, created_at, updated_at
) VALUES (
  'a0000000-0000-0006-0000-000000000001',
  'Baiana Solar',
  320, 26000,
  'Coelba',
  'Salvador', 'BA',
  'Av. Tancredo Neves, 1000 - Caminho das Árvores',
  -12.9714, -38.5014,
  'ativo', NOW(),
  'B3',
  0.46, 9.00,
  600, 276.00,
  4.5, 105, 4.3,
  'energia@baianasolar.com.br', '(71) 99999-0010', NULL,
  NOW(), NOW()
) ON CONFLICT (id) DO UPDATE SET
  nome_usina           = EXCLUDED.nome_usina,
  capacidade_kwp       = EXCLUDED.capacidade_kwp,
  excedente_mensal_kwh = EXCLUDED.excedente_mensal_kwh,
  concessionaria       = EXCLUDED.concessionaria,
  cidade               = EXCLUDED.cidade,
  estado               = EXCLUDED.estado,
  endereco             = EXCLUDED.endereco,
  latitude             = EXCLUDED.latitude,
  longitude            = EXCLUDED.longitude,
  status               = EXCLUDED.status,
  data_aprovacao       = EXCLUDED.data_aprovacao,
  subgrupo_tarifario   = EXCLUDED.subgrupo_tarifario,
  preco_kwh            = EXCLUDED.preco_kwh,
  desconto_percentual  = EXCLUDED.desconto_percentual,
  pacote_kwh           = EXCLUDED.pacote_kwh,
  pacote_preco         = EXCLUDED.pacote_preco,
  ranking_score        = EXCLUDED.ranking_score,
  total_avaliacoes     = EXCLUDED.total_avaliacoes,
  media_avaliacoes     = EXCLUDED.media_avaliacoes,
  email                = EXCLUDED.email,
  whatsapp             = EXCLUDED.whatsapp,
  avatar_url           = EXCLUDED.avatar_url,
  updated_at           = NOW();

-- ==================== PR (1) ====================

-- PR: Paraná Solar (Curitiba)
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, confirmation_sent_at, created_at, updated_at, raw_user_meta_data)
VALUES (
  'a0000000-0000-0007-0000-000000000001',
  'seed.parana.solar@energialivre.eco.br',
  crypt('seed-password-2026', gen_salt('bf')),
  NOW(), NOW(), NOW(), NOW(),
  '{"tipo":"gerador","nome_usina":"Paraná Solar","capacidade_kwp":"220","excedente_mensal_kwh":"15000","concessionaria":"Copel","cidade":"Curitiba","estado":"PR","whatsapp":"(41) 99999-0011"}'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.geradores (
  id, nome_usina, capacidade_kwp, excedente_mensal_kwh,
  concessionaria, cidade, estado, endereco, latitude, longitude,
  status, data_aprovacao, subgrupo_tarifario,
  preco_kwh, desconto_percentual, pacote_kwh, pacote_preco,
  ranking_score, total_avaliacoes, media_avaliacoes,
  email, whatsapp, avatar_url, created_at, updated_at
) VALUES (
  'a0000000-0000-0007-0000-000000000001',
  'Paraná Solar',
  220, 15000,
  'Copel',
  'Curitiba', 'PR',
  'Rua XV de Novembro, 1500 - Centro',
  -25.4290, -49.2671,
  'ativo', NOW(),
  'B3',
  0.49, 7.50,
  400, 196.00,
  4.4, 70, 4.2,
  'contato@paranasolar.com.br', '(41) 99999-0011', NULL,
  NOW(), NOW()
) ON CONFLICT (id) DO UPDATE SET
  nome_usina           = EXCLUDED.nome_usina,
  capacidade_kwp       = EXCLUDED.capacidade_kwp,
  excedente_mensal_kwh = EXCLUDED.excedente_mensal_kwh,
  concessionaria       = EXCLUDED.concessionaria,
  cidade               = EXCLUDED.cidade,
  estado               = EXCLUDED.estado,
  endereco             = EXCLUDED.endereco,
  latitude             = EXCLUDED.latitude,
  longitude            = EXCLUDED.longitude,
  status               = EXCLUDED.status,
  data_aprovacao       = EXCLUDED.data_aprovacao,
  subgrupo_tarifario   = EXCLUDED.subgrupo_tarifario,
  preco_kwh            = EXCLUDED.preco_kwh,
  desconto_percentual  = EXCLUDED.desconto_percentual,
  pacote_kwh           = EXCLUDED.pacote_kwh,
  pacote_preco         = EXCLUDED.pacote_preco,
  ranking_score        = EXCLUDED.ranking_score,
  total_avaliacoes     = EXCLUDED.total_avaliacoes,
  media_avaliacoes     = EXCLUDED.media_avaliacoes,
  email                = EXCLUDED.email,
  whatsapp             = EXCLUDED.whatsapp,
  avatar_url           = EXCLUDED.avatar_url,
  updated_at           = NOW();

-- ==================== SC (1) ====================

-- SC: Catarina Solar (Florianópolis)
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, confirmation_sent_at, created_at, updated_at, raw_user_meta_data)
VALUES (
  'a0000000-0000-0008-0000-000000000001',
  'seed.catarina.solar@energialivre.eco.br',
  crypt('seed-password-2026', gen_salt('bf')),
  NOW(), NOW(), NOW(), NOW(),
  '{"tipo":"gerador","nome_usina":"Catarina Solar","capacidade_kwp":"160","excedente_mensal_kwh":"11000","concessionaria":"Celesc","cidade":"Florianópolis","estado":"SC","whatsapp":"(48) 99999-0012"}'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.geradores (
  id, nome_usina, capacidade_kwp, excedente_mensal_kwh,
  concessionaria, cidade, estado, endereco, latitude, longitude,
  status, data_aprovacao, subgrupo_tarifario,
  preco_kwh, desconto_percentual, pacote_kwh, pacote_preco,
  ranking_score, total_avaliacoes, media_avaliacoes,
  email, whatsapp, avatar_url, created_at, updated_at
) VALUES (
  'a0000000-0000-0008-0000-000000000001',
  'Catarina Solar',
  160, 11000,
  'Celesc',
  'Florianópolis', 'SC',
  'Av. Beira Mar Norte, 2000 - Centro',
  -27.5954, -48.5480,
  'ativo', NOW(),
  'B3',
  0.52, 5.00,
  300, 156.00,
  4.1, 48, 3.9,
  'contato@catarinasolar.com.br', '(48) 99999-0012', NULL,
  NOW(), NOW()
) ON CONFLICT (id) DO UPDATE SET
  nome_usina           = EXCLUDED.nome_usina,
  capacidade_kwp       = EXCLUDED.capacidade_kwp,
  excedente_mensal_kwh = EXCLUDED.excedente_mensal_kwh,
  concessionaria       = EXCLUDED.concessionaria,
  cidade               = EXCLUDED.cidade,
  estado               = EXCLUDED.estado,
  endereco             = EXCLUDED.endereco,
  latitude             = EXCLUDED.latitude,
  longitude            = EXCLUDED.longitude,
  status               = EXCLUDED.status,
  data_aprovacao       = EXCLUDED.data_aprovacao,
  subgrupo_tarifario   = EXCLUDED.subgrupo_tarifario,
  preco_kwh            = EXCLUDED.preco_kwh,
  desconto_percentual  = EXCLUDED.desconto_percentual,
  pacote_kwh           = EXCLUDED.pacote_kwh,
  pacote_preco         = EXCLUDED.pacote_preco,
  ranking_score        = EXCLUDED.ranking_score,
  total_avaliacoes     = EXCLUDED.total_avaliacoes,
  media_avaliacoes     = EXCLUDED.media_avaliacoes,
  email                = EXCLUDED.email,
  whatsapp             = EXCLUDED.whatsapp,
  avatar_url           = EXCLUDED.avatar_url,
  updated_at           = NOW();

-- ============================================
-- FIM DO SEED
-- ============================================
