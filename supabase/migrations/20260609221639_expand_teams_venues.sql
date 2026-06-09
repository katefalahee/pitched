-- ══════════════════════════════════════════
-- Expanded seed: full county coverage + venues
-- Additive — uses ON CONFLICT DO NOTHING to skip anything already present
-- ══════════════════════════════════════════

-- ── VENUES (county grounds + key stadiums) ────────────
insert into public.venues (name, slug, county, country) values
  ('Pearse Park',          'pearse-park-longford',   'Longford',  'IE'),
  ('Cusack Park (Ennis)',  'cusack-park-ennis',      'Clare',     'IE'),
  ('Cusack Park (Mullingar)','cusack-park-mullingar','Westmeath', 'IE'),
  ('Dr Hyde Park',         'dr-hyde-park',           'Roscommon', 'IE'),
  ('Markievicz Park',      'markievicz-park',        'Sligo',     'IE'),
  ('Brewster Park',        'brewster-park',          'Fermanagh', 'IE'),
  ('Healy Park',           'healy-park',             'Tyrone',    'IE'),
  ('Celtic Park',          'celtic-park-derry',      'Derry',     'IE'),
  ('Athletic Grounds',     'athletic-grounds',       'Armagh',    'IE'),
  ('St Tiernach''s Park',  'st-tiernachs-park',      'Monaghan',  'IE'),
  ('O''Moore Park',        'omoore-park',            'Laois',     'IE'),
  ('Netwatch Cullen Park', 'cullen-park',            'Carlow',    'IE'),
  ('Wexford Park',         'wexford-park',           'Wexford',   'IE'),
  ('Nowlan Park',          'nowlan-park-kk',         'Kilkenny',  'IE'),
  ('Walsh Park',           'walsh-park',             'Waterford', 'IE'),
  ('Cusack Park (Mullingar2)','cusack-mull-2',       'Westmeath', 'IE'),
  ('Parnell Park',         'parnell-park',           'Dublin',    'IE'),
  ('Tuam Stadium',         'tuam-stadium',           'Galway',    'IE'),
  ('Hastings Insurance MacHale','machale-2',         'Mayo',      'IE'),
  ('Breffni Park',         'breffni-park-2',         'Cavan',     'IE'),
  ('Páirc Tailteann',      'pairc-tailteann',        'Meath',     'IE'),
  ('Glennon Brothers Pearse Park','glennon-pearse',  'Longford',  'IE'),
  ('Aviva Stadium',        'aviva-stadium',          'Dublin',    'IE'),
  ('Thomond Park',         'thomond-park',           'Limerick',  'IE'),
  ('Tallaght Stadium',     'tallaght-2',             'Dublin',    'IE')
on conflict (slug) do nothing;

-- ── COMPETITIONS (more codes/levels) ──────────────────
insert into public.competitions (name, slug, sport, country, gender, level) values
  ('LGFA All-Ireland Intermediate Championship', 'lgfa-ifc',     'lgfa',         'IE', 'women', 'intermediate'),
  ('LGFA All-Ireland Junior Championship',       'lgfa-jfc',     'lgfa',         'IE', 'women', 'junior'),
  ('Camogie All-Ireland Intermediate Championship','camogie-ifc','camogie',      'IE', 'women', 'intermediate'),
  ('GAA All-Ireland U20 Football Championship',  'gaa-u20fc',    'gaa_football', 'IE', 'men',   'u20'),
  ('GAA Christy Ring Cup',                       'christy-ring', 'hurling',      'IE', 'men',   'intermediate'),
  ('SSE Airtricity Men''s Premier Division',     'loi-men',      'mens_soccer',  'IE', 'men',   'senior'),
  ('Men''s Six Nations',                         'mens-6n',      'mens_rugby',   'IE', 'men',   'senior'),
  ('United Rugby Championship',                  'urc',          'mens_rugby',   'IE', 'men',   'senior')
on conflict (slug) do nothing;

-- ══════════════════════════════════════════
-- TEAMS — full county coverage per GAA code
-- ══════════════════════════════════════════

-- ── LGFA: all 32 counties ─────────────────────────────
insert into public.teams (name, slug, sport, county, country) values
  ('Antrim','antrim-lgfa','lgfa','Antrim','IE'),
  ('Armagh','armagh-lgfa','lgfa','Armagh','IE'),
  ('Carlow','carlow-lgfa','lgfa','Carlow','IE'),
  ('Cavan','cavan-lgfa','lgfa','Cavan','IE'),
  ('Clare','clare-lgfa','lgfa','Clare','IE'),
  ('Derry','derry-lgfa','lgfa','Derry','IE'),
  ('Down','down-lgfa','lgfa','Down','IE'),
  ('Fermanagh','fermanagh-lgfa','lgfa','Fermanagh','IE'),
  ('Kildare','kildare-lgfa','lgfa','Kildare','IE'),
  ('Laois','laois-lgfa','lgfa','Laois','IE'),
  ('Leitrim','leitrim-lgfa','lgfa','Leitrim','IE'),
  ('Limerick','limerick-lgfa','lgfa','Limerick','IE'),
  ('Longford','longford-lgfa','lgfa','Longford','IE'),
  ('Louth','louth-lgfa','lgfa','Louth','IE'),
  ('Monaghan','monaghan-lgfa','lgfa','Monaghan','IE'),
  ('Offaly','offaly-lgfa','lgfa','Offaly','IE'),
  ('Roscommon','roscommon-lgfa','lgfa','Roscommon','IE'),
  ('Sligo','sligo-lgfa','lgfa','Sligo','IE'),
  ('Tipperary','tipperary-lgfa','lgfa','Tipperary','IE'),
  ('Tyrone','tyrone-lgfa','lgfa','Tyrone','IE'),
  ('Westmeath','westmeath-lgfa','lgfa','Westmeath','IE'),
  ('Wexford','wexford-lgfa','lgfa','Wexford','IE'),
  ('Wicklow','wicklow-lgfa','lgfa','Wicklow','IE'),
  ('Kilkenny','kilkenny-lgfa','lgfa','Kilkenny','IE')
on conflict (slug) do nothing;

-- ── Camogie: established counties ─────────────────────
insert into public.teams (name, slug, sport, county, country) values
  ('Antrim','antrim-camogie','camogie','Antrim','IE'),
  ('Clare','clare-camogie','camogie','Clare','IE'),
  ('Cork','cork-camogie-2','camogie','Cork','IE'),
  ('Derry','derry-camogie','camogie','Derry','IE'),
  ('Down','down-camogie','camogie','Down','IE'),
  ('Kerry','kerry-camogie','camogie','Kerry','IE'),
  ('Kildare','kildare-camogie','camogie','Kildare','IE'),
  ('Laois','laois-camogie','camogie','Laois','IE'),
  ('Limerick','limerick-camogie','camogie','Limerick','IE'),
  ('Meath','meath-camogie','camogie','Meath','IE'),
  ('Offaly','offaly-camogie','camogie','Offaly','IE'),
  ('Wexford','wexford-camogie','camogie','Wexford','IE'),
  ('Westmeath','westmeath-camogie','camogie','Westmeath','IE'),
  ('Antrim','antrim-cam-2','camogie','Antrim','IE')
on conflict (slug) do nothing;

-- ── GAA Football: all 32 counties ─────────────────────
insert into public.teams (name, slug, sport, county, country) values
  ('Antrim','antrim-gaa','gaa_football','Antrim','IE'),
  ('Carlow','carlow-gaa','gaa_football','Carlow','IE'),
  ('Cavan','cavan-gaa','gaa_football','Cavan','IE'),
  ('Clare','clare-gaa','gaa_football','Clare','IE'),
  ('Cork','cork-gaa','gaa_football','Cork','IE'),
  ('Derry','derry-gaa','gaa_football','Derry','IE'),
  ('Down','down-gaa','gaa_football','Down','IE'),
  ('Dublin','dublin-gaa-2','gaa_football','Dublin','IE'),
  ('Fermanagh','fermanagh-gaa','gaa_football','Fermanagh','IE'),
  ('Kildare','kildare-gaa','gaa_football','Kildare','IE'),
  ('Laois','laois-gaa','gaa_football','Laois','IE'),
  ('Leitrim','leitrim-gaa','gaa_football','Leitrim','IE'),
  ('Limerick','limerick-gaa','gaa_football','Limerick','IE'),
  ('Longford','longford-gaa','gaa_football','Longford','IE'),
  ('Louth','louth-gaa','gaa_football','Louth','IE'),
  ('Meath','meath-gaa','gaa_football','Meath','IE'),
  ('Monaghan','monaghan-gaa','gaa_football','Monaghan','IE'),
  ('Offaly','offaly-gaa','gaa_football','Offaly','IE'),
  ('Roscommon','roscommon-gaa','gaa_football','Roscommon','IE'),
  ('Sligo','sligo-gaa','gaa_football','Sligo','IE'),
  ('Tipperary','tipperary-gaa','gaa_football','Tipperary','IE'),
  ('Tyrone','tyrone-gaa','gaa_football','Tyrone','IE'),
  ('Waterford','waterford-gaa','gaa_football','Waterford','IE'),
  ('Westmeath','westmeath-gaa','gaa_football','Westmeath','IE'),
  ('Wexford','wexford-gaa','gaa_football','Wexford','IE'),
  ('Wicklow','wicklow-gaa','gaa_football','Wicklow','IE'),
  ('Kilkenny','kilkenny-gaa','gaa_football','Kilkenny','IE')
on conflict (slug) do nothing;

-- ── Hurling: established counties ─────────────────────
insert into public.teams (name, slug, sport, county, country) values
  ('Antrim','antrim-hurling','hurling','Antrim','IE'),
  ('Carlow','carlow-hurling','hurling','Carlow','IE'),
  ('Dublin','dublin-hurling','hurling','Dublin','IE'),
  ('Kerry','kerry-hurling','hurling','Kerry','IE'),
  ('Laois','laois-hurling','hurling','Laois','IE'),
  ('Limerick','limerick-hurling-2','hurling','Limerick','IE'),
  ('Offaly','offaly-hurling','hurling','Offaly','IE'),
  ('Waterford','waterford-hurling','hurling','Waterford','IE'),
  ('Westmeath','westmeath-hurling','hurling','Westmeath','IE'),
  ('Wexford','wexford-hurling','hurling','Wexford','IE'),
  ('Dublin','dublin-hurl-2','hurling','Dublin','IE')
on conflict (slug) do nothing;

-- ── Women's soccer (more LOI Women clubs) ─────────────
insert into public.teams (name, slug, sport, county, country) values
  ('Shamrock Rovers','shamrock-rovers-women','womens_soccer','Dublin','IE'),
  ('Bohemians','bohemians-women','womens_soccer','Dublin','IE'),
  ('Cork City','cork-city-women','womens_soccer','Cork','IE'),
  ('Treaty United','treaty-women','womens_soccer','Limerick','IE'),
  ('Sligo Rovers','sligo-women','womens_soccer','Sligo','IE'),
  ('DLR Waves','dlr-waves-women','womens_soccer','Dublin','IE')
on conflict (slug) do nothing;

-- ── Women's rugby (more nations) ──────────────────────
insert into public.teams (name, slug, sport, county, country) values
  ('Italy','italy-womens-rugby','womens_rugby',null,'IT')
on conflict (slug) do nothing;