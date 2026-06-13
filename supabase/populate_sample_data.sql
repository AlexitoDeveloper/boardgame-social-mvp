-- Seeding data for Boardgame Social MVP Phase 2
-- Run this in your Supabase SQL Editor.

-- 1. Insert Auth Users (if they don't exist)
-- Note: These passwords are set to a dummy hash.
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_user_meta_data, created_at, updated_at, role, aud)
VALUES 
  ('cf957a43-1dd5-4b26-b102-9508d8010464', 'alex@test.com', '$2a$10$vI0N3i4t8QhGf8t.k8iZNeW1LpEaVdM2r2zW5oJ7vQd49ZtZtZtZt', now(), '{"username": "alex"}', now(), now(), 'authenticated', 'authenticated'),
  ('e0658e26-6e0c-4e8b-ab68-69fa4c4cd062', 'tester2@test.com', '$2a$10$vI0N3i4t8QhGf8t.k8iZNeW1LpEaVdM2r2zW5oJ7vQd49ZtZtZtZt', now(), '{"username": "tester2"}', now(), now(), 'authenticated', 'authenticated'),
  ('7d8b1c1e-bf91-4cf1-8c4d-6b5839218204', 'sara@test.com', '$2a$10$vI0N3i4t8QhGf8t.k8iZNeW1LpEaVdM2r2zW5oJ7vQd49ZtZtZtZt', now(), '{"username": "meeple_sara"}', now(), now(), 'authenticated', 'authenticated')
ON CONFLICT (id) DO NOTHING;

-- Trigger should automatically copy them to public.users. Let's make sure they exist in public.users:
INSERT INTO public.users (id, username, created_at, updated_at)
VALUES 
  ('cf957a43-1dd5-4b26-b102-9508d8010464', 'alex', now(), now()),
  ('e0658e26-6e0c-4e8b-ab68-69fa4c4cd062', 'tester2', now(), now()),
  ('7d8b1c1e-bf91-4cf1-8c4d-6b5839218204', 'meeple_sara', now(), now())
ON CONFLICT (id) DO NOTHING;

-- 2. Insert Games (Seeding both games and games_cache tables depending on which exist in the schema)
DO $$
BEGIN
  -- Insert into public.games if it exists
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'games') THEN
    INSERT INTO public.games (bgg_id, title, year_published, image_url, created_at)
    VALUES 
      (224517, 'Brass: Birmingham', 2018, 'https://cf.geekdo-images.com/moCQ39CcMSmHjnvxhkLgLg__original/img/qhLe0wKtf7I1_IKM55bOMPGk57o=/0x0/filters:format(png)/pic2729316.png', now()),
      (13, 'Catan', 1995, 'https://cf.geekdo-images.com/0XODRpReiZBFUffEcqT5-Q__original/img/oRc0AomWA9ZtFqQDZiZbIyKE1j0=/0x0/filters:format(png)/pic9156909.png', now()),
      (12333, 'Twilight Struggle', 2005, 'https://cf.geekdo-images.com/er9v24WuRowkr9gscop2kw__original/img/Z_bL6O2y5V19WvYm2z9l3m1z7tY=/0x0/filters:format(jpeg)/pic2602161.jpg', now()),
      (37111, 'Dixit', 2008, 'https://cf.geekdo-images.com/1qvA21HdRaPYwrn4tGDNaQ__original/img/Vn6PK_Ue5TX14oQ5uau4XICHEJU=/0x0/filters:format(jpeg)/pic8689185.jpg', now())
    ON CONFLICT (bgg_id) DO NOTHING;
  END IF;

  -- Insert into public.games_cache if it exists
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'games_cache') THEN
    INSERT INTO public.games_cache (bgg_id, title, year, image_url, created_at, updated_at)
    VALUES 
      (224517, 'Brass: Birmingham', 2018, 'https://cf.geekdo-images.com/moCQ39CcMSmHjnvxhkLgLg__original/img/qhLe0wKtf7I1_IKM55bOMPGk57o=/0x0/filters:format(png)/pic2729316.png', now(), now()),
      (13, 'Catan', 1995, 'https://cf.geekdo-images.com/0XODRpReiZBFUffEcqT5-Q__original/img/oRc0AomWA9ZtFqQDZiZbIyKE1j0=/0x0/filters:format(png)/pic9156909.png', now(), now()),
      (12333, 'Twilight Struggle', 2005, 'https://cf.geekdo-images.com/er9v24WuRowkr9gscop2kw__original/img/Z_bL6O2y5V19WvYm2z9l3m1z7tY=/0x0/filters:format(jpeg)/pic2602161.jpg', now(), now()),
      (37111, 'Dixit', 2008, 'https://cf.geekdo-images.com/1qvA21HdRaPYwrn4tGDNaQ__original/img/Vn6PK_Ue5TX14oQ5uau4XICHEJU=/0x0/filters:format(jpeg)/pic8689185.jpg', now(), now())
    ON CONFLICT (bgg_id) DO NOTHING;
  END IF;
END $$;


-- 3. Insert Meetups
-- Meetup 1: Completed Brass Birmingham (Winner: alex, Attended: alex, tester2)
INSERT INTO public.meetups (id, creator_id, game_id, title, description, city, location, date, max_players, joined_players, completed, winner_user_id, attended_players, created_at, updated_at)
VALUES 
  ('d1a11111-1111-1111-1111-111111111111', 'cf957a43-1dd5-4b26-b102-9508d8010464', 224517, 'Partida Épica de Brass Birmingham', 'Quedamos para ver quién domina la era industrial. Traed ganas de pensar.', 'Madrid', 'Cafe Central', now() - interval '5 days', 4, '{cf957a43-1dd5-4b26-b102-9508d8010464, e0658e26-6e0c-4e8b-ab68-69fa4c4cd062}', true, 'cf957a43-1dd5-4b26-b102-9508d8010464', '{cf957a43-1dd5-4b26-b102-9508d8010464, e0658e26-6e0c-4e8b-ab68-69fa4c4cd062}', now() - interval '6 days', now() - interval '5 days')
ON CONFLICT (id) DO NOTHING;

-- Meetup 2: Completed Catan (Winner: Draw/Coop, Attended: tester2, Absent: alex -> testing karma!)
INSERT INTO public.meetups (id, creator_id, game_id, title, description, city, location, date, max_players, joined_players, completed, winner_user_id, attended_players, created_at, updated_at)
VALUES 
  ('d2a22222-2222-2222-2222-222222222222', 'e0658e26-6e0c-4e8b-ab68-69fa4c4cd062', 13, 'Catan de los domingos', 'Partida tranquila de fin de semana.', 'Madrid', 'Casa de Tester', now() - interval '2 days', 3, '{e0658e26-6e0c-4e8b-ab68-69fa4c4cd062, cf957a43-1dd5-4b26-b102-9508d8010464}', true, null, '{e0658e26-6e0c-4e8b-ab68-69fa4c4cd062}', now() - interval '3 days', now() - interval '2 days')
ON CONFLICT (id) DO NOTHING;

-- Meetup 3: Active future Twilight Struggle (joined: alex, tester2)
INSERT INTO public.meetups (id, creator_id, game_id, title, description, city, location, date, max_players, joined_players, completed, winner_user_id, attended_players, created_at, updated_at)
VALUES 
  ('d3a33333-3333-3333-3333-333333333333', 'cf957a43-1dd5-4b26-b102-9508d8010464', 12333, 'Guerra Fría en el Tablero', 'Partida de Twilight Struggle. Máxima tensión geopolítica.', 'Barcelona', 'Ateneo de Sants', now() + interval '2 days', 2, '{cf957a43-1dd5-4b26-b102-9508d8010464, e0658e26-6e0c-4e8b-ab68-69fa4c4cd062}', false, null, '{}', now() - interval '1 day', now())
ON CONFLICT (id) DO NOTHING;

-- Meetup 4: Active future Dixit (joined: meeple_sara, alex)
INSERT INTO public.meetups (id, creator_id, game_id, title, description, city, location, date, max_players, joined_players, completed, winner_user_id, attended_players, created_at, updated_at)
VALUES 
  ('d4a44444-4444-4444-4444-444444444444', '7d8b1c1e-bf91-4cf1-8c4d-6b5839218204', 37111, 'Noche de Dixit', 'Para reírnos y adivinar cartas abstractas. Muy familiar.', 'Valencia', 'Café Lúdico', now() + interval '5 days', 6, '{7d8b1c1e-bf91-4cf1-8c4d-6b5839218204, cf957a43-1dd5-4b26-b102-9508d8010464}', false, null, '{}', now() - interval '1 day', now())
ON CONFLICT (id) DO NOTHING;

-- 4. Insert Chat Messages
-- Messages for Meetup 3 (Guerra Fría)
INSERT INTO public.meetup_messages (id, meetup_id, user_id, sender_name, content, created_at)
VALUES 
  ('c3111111-1111-1111-1111-111111111111', 'd3a33333-3333-3333-3333-333333333333', 'cf957a43-1dd5-4b26-b102-9508d8010464', 'alex', 'Hola! ¿Tenéis ya claras las reglas de Twilight Struggle?', now() - interval '1 hour'),
  ('c3222222-2222-2222-2222-222222222222', 'd3a33333-3333-3333-3333-333333333333', 'e0658e26-6e0c-4e8b-ab68-69fa4c4cd062', 'tester2', 'Sí, he estado viendo un par de tutoriales. ¡Tengo muchas ganas!', now() - interval '45 minutes'),
  ('c3333333-3333-3333-3333-333333333333', 'd3a33333-3333-3333-3333-333333333333', 'cf957a43-1dd5-4b26-b102-9508d8010464', 'alex', 'Perfecto, yo llevaré el juego montado para empezar rápido.', now() - interval '30 minutes');

-- Messages for Meetup 4 (Dixit)
INSERT INTO public.meetup_messages (id, meetup_id, user_id, sender_name, content, created_at)
VALUES 
  ('c4111111-1111-1111-1111-111111111111', 'd4a44444-4444-4444-4444-444444444444', '7d8b1c1e-bf91-4cf1-8c4d-6b5839218204', 'meeple_sara', 'Hola a todos! Bienvenidos a la mesa.', now() - interval '2 hours'),
  ('c4222222-2222-2222-2222-222222222222', 'd4a44444-4444-4444-4444-444444444444', 'cf957a43-1dd5-4b26-b102-9508d8010464', 'alex', 'Hola Sara! Gracias por organizar. ¿Llevamos algo?', now() - interval '1 hour');
