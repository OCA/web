Add `website_visitor_defensive` to the Odoo addons path, update the apps
list, and install `Website Visitor Defensive`. Restart the server and
monitor logs for `website.visitor upsert serialization` messages; they
should no longer produce 500s or long waits.

Visitor tracking is best-effort. Some reloads or concurrent requests may
not create a `website.track` record. This is a defensive patch, not a
redesign of visitor tracking. If visitor analytics on appointment pages
are critical, consider a rate-limiter or advisory-lock based approach
instead of skipping tracking.

This module depends only on `website` and does not modify core files.
