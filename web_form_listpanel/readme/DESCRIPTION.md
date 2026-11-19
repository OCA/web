This module adds a `<listpanel>` element for form views. It shows a compact,
read-only list on the left of the form, and clicking a row opens that record
in the form. It is meant for form-oriented work, where the record you are
editing has correlated records and you want to keep them in view.

The panel has two modes, switched from its header:

- **Related**: the records matching a domain evaluated on the current record,
  for example the other orders of the same customer. The domain can also be
  computed on the server.
- **Search**: the records of the list or kanban view the form was opened from,
  with the same filters, sort order and page.

Its columns are drawn by Odoo's list renderer, so widgets, decorations,
optional columns and totals work as in a list view. The panel pages like a list view, can be collapsed, and is hidden in dialogs
and on small screens.

With the **Auto panel** setting, forms that declare no `<listpanel>` can show
the panel too, with the records and columns of the list they were opened from.
