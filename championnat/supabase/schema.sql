-- MULTIPLEX : la copie en ligne des carrières (projet Supabase « multiplex », région Paris).
-- Ce fichier est la vérité de la base : il se rejoue tel quel sur un projet neuf (SQL Editor → Run).
-- Le code du jeu ne porte que la clé PUBLIQUE. Tout ce qui protège les carrières est ICI :
--   1. chacun ne LIT et n'EFFACE que ses propres lignes (règles de sécurité au niveau des lignes) ;
--   2. personne n'ÉCRIT directement dans la table : tout envoi passe par pousse_carriere(), qui tient la
--      limite de dix carrières, le poids maximal et la détection des conflits entre deux appareils ;
--   3. supprime_mon_compte() efface le compte, et ses carrières partent avec lui (on delete cascade).
-- La logique côté jeu (index.html, « La copie en ligne des carrières ») et son faux serveur
-- (harness-compte.cjs) doivent rester d'accord avec ce fichier.

create table if not exists public.carrieres (
  user_id     uuid        not null default auth.uid() references auth.users(id) on delete cascade,
  id          text        not null,                    -- G.pid : « p » + horodatage + hasard
  maj         bigint      not null default 0,          -- G._maj de la copie envoyée (sert à détecter un conflit)
  fiche       jsonb       not null default '{}'::jsonb, -- club, saison, journée, division, nom, avancement : la liste sans les données
  donnees     text        not null,                    -- la sauvegarde : "gz:" + base64 du gzip (ou "js:" + texte brut)
  version     text,                                    -- version du jeu qui l'a envoyée
  maj_serveur timestamptz not null default now(),
  primary key (user_id, id),
  constraint carrieres_id_court   check (char_length(id) between 1 and 64),
  constraint carrieres_poids      check (octet_length(donnees) <= 2000000),
  constraint carrieres_fiche_nette check (octet_length(fiche::text) <= 4000)
);

alter table public.carrieres enable row level security;

drop policy if exists "chacun lit ses carrieres" on public.carrieres;
create policy "chacun lit ses carrieres" on public.carrieres
  for select to authenticated using ((select auth.uid()) = user_id);

drop policy if exists "chacun efface ses carrieres" on public.carrieres;
create policy "chacun efface ses carrieres" on public.carrieres
  for delete to authenticated using ((select auth.uid()) = user_id);

-- ni insert ni update en direct : seulement par pousse_carriere()
revoke all on public.carrieres from anon, authenticated;
grant select, delete on public.carrieres to authenticated;

-- ENVOYER UNE CARRIÈRE. Réponses : {ok}, {conflit, maj, fiche}, {refus: plein|lourd|fiche|id}.
-- p_attendu = la date de la copie en ligne que l'appareil croit écraser (0 s'il ne l'a jamais vue).
-- Si la ligne a bougé depuis, c'est qu'un autre appareil a joué : on ne touche à rien et on répond
-- {conflit}. L'appareil tranche (la plus avancée garde sa place) et, s'il gagne, renvoie avec
-- p_attendu = la date lue et p_copie = {id, nom} : la version écrasée est d'abord recopiée à part.
create or replace function public.pousse_carriere(
  p_id text, p_attendu bigint, p_maj bigint, p_fiche jsonb, p_donnees text,
  p_version text default null, p_copie jsonb default null)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid   uuid := auth.uid();
  v_nb    int;
  v_trouve boolean;
  v_ligne public.carrieres%rowtype;
begin
  if v_uid is null then
    raise exception 'connexion requise' using errcode = '28000';
  end if;
  if p_id is null or char_length(p_id) not between 1 and 64 then return jsonb_build_object('refus', 'id'); end if;
  if p_donnees is null or octet_length(p_donnees) > 2000000 then return jsonb_build_object('refus', 'lourd'); end if;
  if p_fiche is null or octet_length(p_fiche::text) > 4000 then return jsonb_build_object('refus', 'fiche'); end if;

  -- un verrou par compte : deux envois simultanés ne franchissent pas la limite ensemble
  perform pg_advisory_xact_lock(hashtextextended(v_uid::text, 0));

  select * into v_ligne from public.carrieres where user_id = v_uid and id = p_id for update;
  v_trouve := found;
  select count(*) into v_nb from public.carrieres where user_id = v_uid;

  if not v_trouve then
    if v_nb >= 10 then return jsonb_build_object('refus', 'plein'); end if;
    insert into public.carrieres (user_id, id, maj, fiche, donnees, version)
    values (v_uid, p_id, coalesce(p_maj, 0), p_fiche, p_donnees, p_version);
    return jsonb_build_object('ok', true);
  end if;

  -- la même copie renvoyée (réponse perdue en route) ou un simple renommage : on met la fiche à jour
  if v_ligne.maj = p_maj then
    update public.carrieres set fiche = p_fiche, maj_serveur = now() where user_id = v_uid and id = p_id;
    return jsonb_build_object('ok', true);
  end if;

  if v_ligne.maj is distinct from p_attendu then
    return jsonb_build_object('conflit', true, 'maj', v_ligne.maj, 'fiche', v_ligne.fiche);
  end if;

  if p_copie is not null then
    -- la version qu'on écrase continue à part (tolérance de deux lignes au-delà des dix)
    if v_nb >= 12 then return jsonb_build_object('refus', 'plein'); end if;
    if char_length(coalesce(p_copie->>'id', '')) not between 1 and 64 then return jsonb_build_object('refus', 'id'); end if;
    insert into public.carrieres (user_id, id, maj, fiche, donnees, version)
    values (v_uid, p_copie->>'id', v_ligne.maj,
            jsonb_set(v_ligne.fiche, '{nom}', to_jsonb(left(coalesce(p_copie->>'nom', ''), 60))),
            v_ligne.donnees, v_ligne.version);
  end if;

  update public.carrieres
     set maj = p_maj, fiche = p_fiche, donnees = p_donnees, version = p_version, maj_serveur = now()
   where user_id = v_uid and id = p_id;
  return jsonb_build_object('ok', true);
end;
$$;

-- SUPPRIMER SON COMPTE depuis le jeu (exigé par l'App Store et le RGPD). Les carrières en ligne
-- partent avec lui (on delete cascade) ; celles du navigateur ne sont pas touchées.
create or replace function public.supprime_mon_compte()
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception 'connexion requise' using errcode = '28000';
  end if;
  delete from auth.users where id = auth.uid();
end;
$$;

revoke all on function public.pousse_carriere(text, bigint, bigint, jsonb, text, text, jsonb) from public, anon;
grant execute on function public.pousse_carriere(text, bigint, bigint, jsonb, text, text, jsonb) to authenticated;
revoke all on function public.supprime_mon_compte() from public, anon;
grant execute on function public.supprime_mon_compte() to authenticated;

-- LA PROGRESSION DU JOUEUR (v2.22) : les saisons gagnées, les saisons ouvertes avec une clé, et les
-- résultats de chaque fin de saison (pour un futur classement entre joueurs). Une ligne par compte.
-- Mêmes protections que les carrières : chacun ne lit que sa ligne, personne n'écrit en direct, tout
-- passe par pousse_progression(). La FUSION entre deux appareils se fait dans le jeu (la réunion des
-- deux, rien ne se perd) ; la base ne fait que refuser d'écraser une ligne qui a bougé depuis sa lecture.
create table if not exists public.progression (
  user_id     uuid        not null default auth.uid() references auth.users(id) on delete cascade,
  maj         bigint      not null default 0,            -- date de la version envoyée (détection des conflits)
  donnees     jsonb       not null default '{}'::jsonb,  -- {gagnees:[{k,pid,t}], ouvertes:[k], resultats:[…]}
  version     text,                                      -- version du jeu qui l'a envoyée
  maj_serveur timestamptz not null default now(),
  primary key (user_id),
  constraint progression_poids check (octet_length(donnees::text) <= 200000)
);

alter table public.progression enable row level security;

drop policy if exists "chacun lit sa progression" on public.progression;
create policy "chacun lit sa progression" on public.progression
  for select to authenticated using ((select auth.uid()) = user_id);

-- ni insert, ni update, ni delete en direct : seulement par pousse_progression() (et la cascade du compte)
revoke all on public.progression from anon, authenticated;
grant select on public.progression to authenticated;

-- ENVOYER SA PROGRESSION. Réponses : {ok}, {conflit, maj}, {refus: lourd|forme}.
-- p_attendu = la date de la ligne que l'appareil vient de lire (0 s'il n'y en avait pas). Si elle a bougé
-- depuis, un autre appareil a écrit : on ne touche à rien, l'appareil relit, refusionne et renvoie.
create or replace function public.pousse_progression(
  p_attendu bigint, p_maj bigint, p_donnees jsonb, p_version text default null)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid    uuid := auth.uid();
  v_ligne  public.progression%rowtype;
begin
  if v_uid is null then
    raise exception 'connexion requise' using errcode = '28000';
  end if;
  if p_donnees is null or jsonb_typeof(p_donnees) <> 'object' then return jsonb_build_object('refus', 'forme'); end if;
  if octet_length(p_donnees::text) > 200000 then return jsonb_build_object('refus', 'lourd'); end if;

  perform pg_advisory_xact_lock(hashtextextended('progression:' || v_uid::text, 0));

  select * into v_ligne from public.progression where user_id = v_uid for update;
  if not found then
    if coalesce(p_attendu, 0) <> 0 then
      return jsonb_build_object('conflit', true, 'maj', 0);
    end if;
    insert into public.progression (user_id, maj, donnees, version)
    values (v_uid, coalesce(p_maj, 0), p_donnees, p_version);
    return jsonb_build_object('ok', true);
  end if;

  if v_ligne.maj is distinct from p_attendu then
    return jsonb_build_object('conflit', true, 'maj', v_ligne.maj);
  end if;

  update public.progression
     set maj = coalesce(p_maj, 0), donnees = p_donnees, version = p_version, maj_serveur = now()
   where user_id = v_uid;
  return jsonb_build_object('ok', true);
end;
$$;

revoke all on function public.pousse_progression(bigint, bigint, jsonb, text) from public, anon;
grant execute on function public.pousse_progression(bigint, bigint, jsonb, text) to authenticated;
