This module colors the selected value of many2one (selection) fields depending
on a color state stored on the target record.

A record can be flagged as *Warning* (yellow) or *Critical* (red), together
with an optional message. Every many2one field pointing to that record then
shows its name in that color, in edit mode as well as in read-only list and
kanban cells. The message is displayed as tooltip, and matching entries in the
autocomplete dropdown are colored too.

This module only provides the mechanism: the abstract model
`many2one.color.mixin` with the two fields, the session information telling the
web client which models provide it, and the widget patches. Install an
implementation module such as `partner_many2one_color` (contacts) to use it,
or inherit the mixin on your own model.
