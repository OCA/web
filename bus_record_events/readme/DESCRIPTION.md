Refreshes open views when their records change on the server.

When a record is created, written or deleted, the server sends one bus
notification per model per transaction. The notification contains record ids
only, never field values. Open form, list, kanban, calendar, pivot and graph
views of that model reload by themselves.

The module patches the standard view controllers, so views with a custom
`js_class` refresh too.
