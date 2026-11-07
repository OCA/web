## 1 -> 1 relation between a parent and several child tables

Two abstract models implement the pattern shown by the widget:

- `sub.form.parent`: the parent, e.g. `res.partner`
- `sub.form.child`: each child table, e.g. `partner.teacher`, `partner.student`

The parent has **one active child**, in the table chosen by its fields. When
the table changes, the previous child is **kept as an orphan**: switching back
shows it again, with its data.

See `web_widget_sub_view_form_demo` for a full example.

### Child tables

```python
class PartnerDetail(models.AbstractModel):
    # optional intermediate model shared by the child tables
    _name = "partner.detail"
    _inherit = "sub.form.child"
    _description = "Partner Detail"
    _link_field = "partner_id"

    partner_id = fields.Many2one(
        "res.partner", required=True, index=True, ondelete="cascade"
    )


class PartnerTeacher(models.Model):
    _name = "partner.teacher"
    _inherit = "partner.detail"
    _description = "Teacher Partner"

    subject = fields.Char()
```

`sub.form.child` gives each concrete table:

- a unique index on `_link_field`, created in `init()`: at most one child per
  table and per parent, so at most one orphan per table
- a check (`_check_detail_model`) that refuses a child in a table that isn't the
  parent's active one: orphans only appear when the active table changes
- the parent's name as `display_name`

`ondelete="cascade"` on `_link_field` deletes all the children of a deleted
parent, the orphans included.

### Parent

```python
class ResPartner(models.Model):
    _name = "res.partner"
    _inherit = ["res.partner", "sub.form.parent"]

    # fields deciding the active table
    _detail_fields = ("kind",)

    kind = fields.Selection([("teacher", "Teacher"), ("student", "Student")])

    @api.model
    def _detail_selection(self):
        # the child tables
        return [("partner.teacher", "Teacher"), ("partner.student", "Student")]

    def _detail_model(self):
        # the active table, or False
        self.ensure_one()
        return self.kind and f"partner.{self.kind}"
```

`sub.form.parent` gives:

- `detail_ref`: computed Reference field to the active child, for the widget
- `_sync_detail()`: called from `create()` and from `write()` when one of the
  `_detail_fields` changes. It creates the active child if it's missing and
  never deletes anything.

`_detail_fields` only supports direct fields of the parent: a dotted path
(`category_id.kind`) wouldn't trigger `_sync_detail()`.

### View

```xml
<field name="kind"/>
<field name="detail_ref" invisible="1"/>
<widget name="sub_view_form" ref-field="detail_ref"/>
```

### Finding the orphans

```python
for model in env["res.partner"]._detail_models():
    link = env[model]._link_field
    orphans = env[model].search([]).filtered(
        lambda c: c[link]._detail_model() != c._name
    )
```
