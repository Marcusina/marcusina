-- Backs GET /appointments/:id/queue-position. Queue position legitimately
-- needs to count OTHER patients' checked-in appointments for the same
-- professional - but appointments_participant RLS restricts a patient to
-- seeing only their own rows, so a plain COUNT(*) run as medgram_app
-- silently returns 0 for anyone else's queue-mates instead of erroring
-- (RLS filters rows before the aggregate ever sees them). Caught live: a
-- second patient's queue position came back as 1 instead of 2.
--
-- The fix is the standard Postgres pattern for "let an ordinary caller get
-- an aggregate over rows they can't SELECT directly": a SECURITY DEFINER
-- function, owned by medgram_admin (BYPASSRLS), that returns ONLY a count -
-- no other patient's identity or appointment details are ever exposed to
-- the caller, just a number. Runs after 900_rls.sql specifically because it
-- needs the medgram_admin role to already exist to reassign ownership to it.
CREATE FUNCTION count_checked_in_ahead(p_professional_id UUID, p_before TIMESTAMPTZ)
RETURNS INTEGER
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT count(*)::integer FROM appointments
  WHERE professional_id = p_professional_id
    AND status = 'checked_in'
    AND checked_in_at < p_before;
$$;

ALTER FUNCTION count_checked_in_ahead(UUID, TIMESTAMPTZ) OWNER TO medgram_admin;
GRANT EXECUTE ON FUNCTION count_checked_in_ahead(UUID, TIMESTAMPTZ) TO medgram_app;
