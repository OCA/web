-- Table: public.calendar_event_res_users_rel

-- DROP TABLE public.calendar_event_res_users_rel;

CREATE TABLE public.calendar_event_res_users_rel
(
  calendar_event_id integer NOT NULL,
  res_users_id integer NOT NULL,
  CONSTRAINT calendar_event_res_users_rel_calendar_event_id_fkey FOREIGN KEY (calendar_event_id)
      REFERENCES public.calendar_event (id) MATCH SIMPLE
      ON UPDATE NO ACTION ON DELETE CASCADE,
  CONSTRAINT calendar_event_res_users_rel_res_users_id_fkey FOREIGN KEY (res_users_id)
      REFERENCES public.res_users (id) MATCH SIMPLE
      ON UPDATE NO ACTION ON DELETE CASCADE,
  CONSTRAINT calendar_event_res_users_re_calendar_event_id_res_users_key UNIQUE (calendar_event_id, res_users_id)
)
WITH (
  OIDS=FALSE
);
ALTER TABLE public.calendar_event_res_users_rel
  OWNER TO api;
COMMENT ON TABLE public.calendar_event_res_users_rel
  IS 'RELATION BETWEEN calendar_event AND res_users';

-- Index: public.calendar_event_res_users_rel_calendar_event_id_idx

-- DROP INDEX public.calendar_event_res_users_rel_calendar_event_id_idx;

CREATE INDEX calendar_event_res_users_rel_calendar_event_id_idx
  ON public.calendar_event_res_users_rel
  USING btree
  (calendar_event_id);

-- Index: public.calendar_event_res_users_rel_res_users_id_idx

-- DROP INDEX public.calendar_event_res_users_rel_res_users_id_idx;

CREATE INDEX calendar_event_res_users_rel_res_users_id_idx
  ON public.calendar_event_res_users_rel
  USING btree
  (res_users_id);

INSERT INTO calendar_event_res_users_rel SELECT ce.id, ru.id FROM calendar_event ce 
INNER JOIN calendar_attendee ca ON ca.event_id = ce.id
INNER JOIN res_users ru ON ru.partner_id = ca.partner_id;

