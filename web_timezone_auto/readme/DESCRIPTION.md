Keeps each user's time zone in line with the device they use.

Odoo only reads the browser time zone at login, from a cookie set by its own login page, and only when the user has
no time zone yet. When users log in through an external identity provider, that page is skipped and their time zone
stays empty (the Preferences show a warning sign); when they travel, it never changes. The server then computes in
the wrong time zone for e-mails, reports, activity deadlines and scheduled actions, while the web client shows the
device time.

With this module, each time the interface opens, the device time zone is compared with the user's one and, when
they differ, written on the user (only then: writing a time zone clears the server caches). The first page already
uses the new time zone; the interface never waits more than two seconds for the server.

Users who prefer a fixed time zone uncheck *Automatic Time Zone* in their Preferences.
