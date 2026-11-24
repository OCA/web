Go to *Settings > Technical > User Interface > Delete Confirmation Rules* and
create a rule:

- **Line Model**: the model of the records listed in the x2many field, not the
  model of the document. For the lines of a purchase order, that is
  `purchase.order.line`.
- **Parent Model**: optional. Set it when the same line model is shown on
  several documents and you only want the confirmation on one of them. Leave
  it empty to ask everywhere.
- **Title** and **Message**: optional. Leave them empty to use the default
  ones, which are translated in the language of each user. Fill them in to ask
  something more specific, e.g. *This line is already invoiced. Delete it
  anyway?*
- **Groups**: optional. Only the users in those groups are asked. Leave empty
  to ask everybody.
- **Company**: optional, for multi-company databases.

When several rules match the same line model, the one bound to the parent
model at hand wins; otherwise the first one by sequence is used.

The rules are sent to the browser with the session, so **users have to reload
their page** to see a newly created or modified rule.
