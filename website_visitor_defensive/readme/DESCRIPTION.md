When a tracked public page is hit many times in quick succession from
the same anonymous browser session, the Odoo `website.visitor` upsert
can hit PostgreSQL `SerializationFailure` errors.

`website.visitor` records each page view with an
`INSERT ... ON CONFLICT (access_token) DO UPDATE` statement that creates
or updates the visitor and inserts a tracking record in the same
transaction. Several concurrent requests sharing the same `access_token`
(same session, IP and user-agent) contend on the same `website.visitor`
row, causing PostgreSQL to raise
`could not serialize access due to concurrent update`.

Odoo's generic retry mechanism then reruns the whole request several
times with an increasing backoff. The visible result is slow page loads
and, eventually, HTTP 500 responses, while the visitor tracking keeps
failing in a loop.

This module adds two defensive layers:

1.  `website.visitor._get_visitor_from_request` is wrapped in a
    savepoint. If the visitor upsert raises a serialization failure, the
    savepoint is rolled back and the method returns `None` instead of
    failing the entire request. The page finishes normally; only that
    single tracking event is lost.
2.  `ir.http._register_website_track` is told to skip tracking for
    public paths that are typically hit in bursts and do not need
    visitor analytics (appointment pages, asset endpoints, translation
    files, and similar). This removes the contended write path for the
    most common sources of concurrent load.
