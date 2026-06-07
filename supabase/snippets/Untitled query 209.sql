select conname from pg_constraint
where conname in ('matches_unique_fixture', 'matches_sport_valid', 'teams_sport_valid');