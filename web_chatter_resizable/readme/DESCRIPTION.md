This module lets users resize the chatter shown on the side of a view by
dragging its edge, so that long messages and logged details are easier to
read. In form views, a button next to the pager hides the side chatter to
leave all the room to the form.

The handle is available on every side chatter: in form views and in any
other view that shows the standard chatter on the side, e.g. the bank
reconciliation of Odoo Enterprise. It is not shown when the chatter is below
the view.

The width is kept in the browser of each user, one width per kind of view
(form, kanban...), and is never smaller than the standard width of the
chatter. Beside a side chatter, the form uses all the width left by it, also
on very wide screens.
