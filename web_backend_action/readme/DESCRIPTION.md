**Trigger UI actions from backend code in real time.**

This technical module allows you to send standard Odoo actions
(`ir.actions.*`) from the server to the user’s web client and execute
them live via the bus. Instead of only showing a toast
notification, the client actually runs the action when the
conditions match.

**Typical use cases include**:

- Open a wizard automatically when a background job finishes
  (e.g. an import summary or a follow-up confirmation dialog).
- Redirect the user to a specific list/form view after a workflow event
  (approval, status change, external webhook, etc.).
- React in real time to server-side events by refreshing or changing
  the current screen without manual user navigation.

Backend helpers are provided on `res.users` to send actions, optionally
tagged with a target model (`res_model`), a specific record (`res_id`)
and allowed view types (`view_types`). A small service in the web client
listens to the bus channel and only executes the action when the current
UI context (model / record / view type) matches the hints sent from the
server.
