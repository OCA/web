- Rules are read from the session, so a change only reaches a user after a page
  reload.
- The message is static. Interpolating fields of the line being deleted, e.g.
  the product name, is not supported yet.
- `ir.http.session_info()` needs a real request, so the override that ships the
  rules to the browser is covered by the JS tests only.
