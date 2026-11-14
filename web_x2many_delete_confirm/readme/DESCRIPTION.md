Odoo asks for confirmation before deleting a record from a form view or from
the action menu of a list view, but not when a line is removed from an x2many
list: the trash icon at the end of the row deletes it right away, and an
accidental click is only noticed once the document is saved.

This module lets you declare, per model, that removing such a line must be
confirmed first, with a message of your own.

The rules are pure user experience: they do not prevent anybody from deleting
the line, and they do not apply to deletions made through imports, server
actions or the ORM. Forbidding a deletion outright is a different problem,
solved with an access rule or a constraint on the model.
