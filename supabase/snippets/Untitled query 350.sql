select name, slug from public.venues
where name ilike '%tallaght%' or name ilike '%nowlan%' or name ilike '%cusack park (mullingar%'
order by name;