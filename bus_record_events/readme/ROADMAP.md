- Only changes made through the ORM `create`, `write` and `unlink` methods
  broadcast. Stored computed fields, raw SQL and database cascades do not.
- An SQL view model (`_auto = False`), such as most reporting models, never
  broadcasts. Pivot and graph views on these models do not refresh.
- A form does not refresh when only its one2many lines change.
- The model channel is checked against access rights, not record rules. An
  internal user who can read a model receives the ids of every changed record
  of it, including records that record rules hide. Field values are never sent.
- Events missed while the browser is disconnected for longer than the
  retention period are lost. The views do not reload on reconnection.
- The change mark compares the values the view shows. One2many lines inside a
  form are not compared. The statusbar widget paints over the mark, so a stage
  change shows only through the statusbar itself.
