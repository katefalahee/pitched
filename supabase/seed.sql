-- ══════════════════════════════════════════
-- PITCHED — Seed data: Irish teams, venues, competitions
-- ══════════════════════════════════════════

-- ── VENUES ────────────────────────────────────────────
insert into public.venues (name, slug, lat, lng, capacity, county, country) values
  ('Croke Park',          'croke-park',          53.3609, -6.2514, 82300, 'Dublin',    'IE'),
  ('Semple Stadium',      'semple-stadium',       52.6754, -7.9211, 45690, 'Tipperary', 'IE'),
  ('Páirc Uí Chaoimh',    'pairc-ui-chaoimh',     51.8897, -8.4398, 45000, 'Cork',      'IE'),
  ('Fitzgerald Stadium',  'fitzgerald-stadium',   52.0521, -9.5044, 43180, 'Kerry',     'IE'),
  ('MacHale Park',        'machale-park',         53.8512, -9.2987, 26500, 'Mayo',      'IE'),
  ('Kingspan Breffni',    'kingspan-breffni',     53.9897, -7.3526, 32000, 'Cavan',     'IE'),
  ('Nowlan Park',         'nowlan-park',          52.6477, -7.2398, 27000, 'Kilkenny',  'IE'),
  ('Pearse Stadium',      'pearse-stadium',       53.2569, -9.0817, 26197, 'Galway',    'IE'),
  ('Gaelic Grounds',      'gaelic-grounds',       52.6611, -8.6494, 44023, 'Limerick',  'IE'),
  ('O''Connor Park',      'oconnor-park',         53.2736, -7.4914, 17000, 'Offaly',    'IE'),
  ('Tallaght Stadium',    'tallaght-stadium',     53.2859, -6.3772, 8000,  'Dublin',    'IE'),
  ('Tolka Park',          'tolka-park',           53.3686, -6.2456, 9680,  'Dublin',    'IE'),
  ('RDS Arena',           'rds-arena',            53.3244, -6.2294, 18500, 'Dublin',    'IE'),
  ('Musgrave Park',       'musgrave-park',        51.8869, -8.4894, 8300,  'Cork',      'IE');

-- ── COMPETITIONS (structured: sport, gender, level) ───
insert into public.competitions (name, slug, sport, country, gender, level) values
  -- Ladies football
  ('LGFA All-Ireland Senior Championship', 'lgfa-sfc',        'lgfa',          'IE', 'women', 'senior'),
  ('LGFA National League Division 1',      'lgfa-nfl-d1',     'lgfa',          'IE', 'women', 'senior'),
  -- Camogie
  ('Camogie All-Ireland Senior Championship','camogie-sfc',   'camogie',       'IE', 'women', 'senior'),
  ('Camogie National League Division 1',   'camogie-nl-d1',   'camogie',       'IE', 'women', 'senior'),
  -- Men's GAA football
  ('GAA All-Ireland Senior Football Championship','gaa-sfc',  'gaa_football',  'IE', 'men',   'senior'),
  ('GAA National Football League Division 1','gaa-nfl-d1',    'gaa_football',  'IE', 'men',   'senior'),
  -- Hurling
  ('GAA All-Ireland Senior Hurling Championship','hurling-shc','hurling',      'IE', 'men',   'senior'),
  ('GAA National Hurling League Division 1','hurling-nhl-d1', 'hurling',       'IE', 'men',   'senior'),
  -- Women's soccer
  ('SSE Airtricity Women''s Premier Division','loi-women',    'womens_soccer', 'IE', 'women', 'senior'),
  ('Women''s FAI Cup',                     'fai-cup-women',   'womens_soccer', 'IE', 'women', 'senior'),
  -- Women's rugby
  ('Women''s Six Nations',                 'womens-6n',       'womens_rugby',  'IE', 'women', 'senior');

-- ── TEAMS (separate record per sport) ─────────────────
-- LGFA (ladies football) counties
insert into public.teams (name, slug, sport, county, country) values
  ('Dublin',    'dublin-lgfa',    'lgfa', 'Dublin',    'IE'),
  ('Cork',      'cork-lgfa',      'lgfa', 'Cork',      'IE'),
  ('Kerry',     'kerry-lgfa',     'lgfa', 'Kerry',     'IE'),
  ('Galway',    'galway-lgfa',    'lgfa', 'Galway',    'IE'),
  ('Mayo',      'mayo-lgfa',      'lgfa', 'Mayo',      'IE'),
  ('Meath',     'meath-lgfa',     'lgfa', 'Meath',     'IE'),
  ('Donegal',   'donegal-lgfa',   'lgfa', 'Donegal',   'IE'),
  ('Waterford', 'waterford-lgfa', 'lgfa', 'Waterford', 'IE');

-- Camogie counties
insert into public.teams (name, slug, sport, county, country) values
  ('Cork',      'cork-camogie',      'camogie', 'Cork',      'IE'),
  ('Kilkenny',  'kilkenny-camogie',  'camogie', 'Kilkenny',  'IE'),
  ('Galway',    'galway-camogie',    'camogie', 'Galway',    'IE'),
  ('Tipperary', 'tipperary-camogie', 'camogie', 'Tipperary', 'IE'),
  ('Waterford', 'waterford-camogie', 'camogie', 'Waterford', 'IE'),
  ('Dublin',    'dublin-camogie',    'camogie', 'Dublin',    'IE');

-- Men's GAA football counties
insert into public.teams (name, slug, sport, county, country) values
  ('Dublin',  'dublin-gaa',   'gaa_football', 'Dublin',  'IE'),
  ('Kerry',   'kerry-gaa',    'gaa_football', 'Kerry',   'IE'),
  ('Mayo',    'mayo-gaa',     'gaa_football', 'Mayo',    'IE'),
  ('Galway',  'galway-gaa',   'gaa_football', 'Galway',  'IE'),
  ('Armagh',  'armagh-gaa',   'gaa_football', 'Armagh',  'IE'),
  ('Donegal', 'donegal-gaa',  'gaa_football', 'Donegal', 'IE');

-- Hurling counties
insert into public.teams (name, slug, sport, county, country) values
  ('Limerick', 'limerick-hurling', 'hurling', 'Limerick', 'IE'),
  ('Kilkenny', 'kilkenny-hurling', 'hurling', 'Kilkenny', 'IE'),
  ('Cork',     'cork-hurling',     'hurling', 'Cork',     'IE'),
  ('Clare',    'clare-hurling',    'hurling', 'Clare',    'IE'),
  ('Tipperary','tipperary-hurling','hurling', 'Tipperary','IE'),
  ('Galway',   'galway-hurling',   'hurling', 'Galway',   'IE');

-- Women's soccer clubs (League of Ireland Women)
insert into public.teams (name, slug, sport, county, country) values
  ('Shelbourne',     'shelbourne-women',   'womens_soccer', 'Dublin', 'IE'),
  ('Athlone Town',   'athlone-women',      'womens_soccer', 'Westmeath', 'IE'),
  ('Peamount United','peamount-women',     'womens_soccer', 'Dublin', 'IE'),
  ('Galway United',  'galway-utd-women',   'womens_soccer', 'Galway', 'IE'),
  ('Wexford',        'wexford-women',      'womens_soccer', 'Wexford', 'IE');

-- Women's rugby (Six Nations sides)
insert into public.teams (name, slug, sport, county, country) values
  ('Ireland',  'ireland-womens-rugby',  'womens_rugby', null, 'IE'),
  ('England',  'england-womens-rugby',  'womens_rugby', null, 'GB'),
  ('Scotland', 'scotland-womens-rugby', 'womens_rugby', null, 'GB'),
  ('France',   'france-womens-rugby',   'womens_rugby', null, 'FR'),
  ('Wales',    'wales-womens-rugby',    'womens_rugby', null, 'GB');

-- ── A couple of sample matches to start (optional) ────
insert into public.matches (home_team_id, away_team_id, competition_id, venue_id, kickoff_at, home_score, away_score, sport, status)
values
  (
    (select id from teams where slug = 'dublin-lgfa'),
    (select id from teams where slug = 'kerry-lgfa'),
    (select id from competitions where slug = 'lgfa-sfc'),
    (select id from venues where slug = 'croke-park'),
    '2025-08-03 15:00:00+00', '2-14', '1-12', 'lgfa', 'completed'
  ),
  (
    (select id from teams where slug = 'cork-camogie'),
    (select id from teams where slug = 'kilkenny-camogie'),
    (select id from competitions where slug = 'camogie-sfc'),
    (select id from venues where slug = 'nowlan-park'),
    '2025-09-07 16:00:00+00', null, null, 'camogie', 'upcoming'
  );