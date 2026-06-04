-- Sample venues
insert into public.venues (name, slug, lat, lng, capacity, county, country) values
  ('Croke Park',         'croke-park',         53.3609, -6.2514, 82300, 'Dublin',    'IE'),
  ('Semple Stadium',     'semple-stadium',     52.6754, -7.9211, 45690, 'Tipperary', 'IE'),
  ('Páirc Uí Chaoimh',  'pairc-ui-chaoimh',   51.8897, -8.4398, 45000, 'Cork',      'IE'),
  ('Fitzgerald Stadium', 'fitzgerald-stadium', 52.0521, -9.5044, 43000, 'Kerry',     'IE'),
  ('MacHale Park',       'machale-park',       53.8512, -9.2987, 26500, 'Mayo',      'IE'),
  ('Kingspan Breffni',   'kingspan-breffni',   53.9897, -7.3526, 36000, 'Cavan',     'IE');

-- Sample competitions
insert into public.competitions (name, slug, sport, country, gender, level) values
  ('LGFA All-Ireland Senior Championship',    'lgfa-sfc',     'lgfa',    'IE', 'women', 'senior'),
  ('Camogie All-Ireland Senior Championship', 'camogie-sfc',  'camogie', 'IE', 'women', 'senior'),
  ('GAA Football Championship',               'gaa-football', 'gaa',     'IE', 'men',   'senior'),
  ('GAA Hurling Championship',                'gaa-hurling',  'hurling', 'IE', 'men',   'senior');

-- Sample teams
insert into public.teams (name, slug, sport, county, country) values
  ('Dublin',  'dublin-lgfa',  'lgfa',    'Dublin',    'IE'),
  ('Kerry',   'kerry-lgfa',   'lgfa',    'Kerry',     'IE'),
  ('Cork',    'cork-camogie', 'camogie', 'Cork',      'IE'),
  ('Galway',  'galway-lgfa',  'lgfa',    'Galway',    'IE');

-- Sample matches (looks up related rows by slug)
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
    (select id from teams where slug = 'galway-lgfa'),
    (select id from teams where slug = 'kerry-lgfa'),
    (select id from competitions where slug = 'lgfa-sfc'),
    (select id from venues where slug = 'pairc-ui-chaoimh'),
    '2025-07-20 14:00:00+00', null, null, 'lgfa', 'upcoming'
  );