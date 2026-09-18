Use `widget="autocomplete"` on a `fields.Char` and name a public
`@api.model` method in `options`.

The method receives the trimmed input string and must return a list of
dicts. Each dict’s keys are field names. The widget field’s key is the
label shown in the dropdown and the value written to the Char. Any number
of extra keys may be present; on **select** they are written to sibling
fields that exist on the **model and in the same view** (visible or
`invisible`). Keys missing from the model or view, unsupported field types,
and invalid values are skipped. The `id` key is always ignored.

Supported extra values (Python values are converted to JSON by the RPC):

| Field type | Value returned by the method |
|------------|------------------------------|
| Char, Text, HTML | String; use an empty string to clear |
| Integer, Float, Monetary | A value convertible to a finite number, as with the existing Integer behavior |
| Boolean | `True` or `False` |
| Selection | An exact selection key, or `False` to clear |
| Date | `"YYYY-MM-DD"`, or `False` to clear |
| Datetime | `"YYYY-MM-DD HH:MM:SS"` in UTC, or `False` to clear |
| Many2one | A positive integer ID, `[id, display_name]`, or `False` to clear |
| One2many, Many2many | A list of the ORM commands described below |

Invalid dates are skipped. Datetimes are converted from UTC to the client
timezone by Odoo. A bare Many2one ID is resolved through Odoo to obtain its
display name; the related record must exist and be readable by the user.

Supported x2many commands are `(0, 0, values)` to create a related record,
`(4, id)` or `(4, id, 0)` to link an existing record, and `(6, 0, ids)` to
replace the relation. For example, `[(4, 12)]` links record 12 and
`[(0, 0, {"name": "Visit"})]` creates a related record. Create values must
use the related model's server-side field formats.

**Replace removes relations omitted from the supplied IDs.** In particular,
`[(6, 0, [])]` clears the relation; for One2many fields, Odoo's inverse
field deletion policy can also delete removed records. An empty command
list `[]` makes no relation changes. Other opcodes and malformed command
shapes are rejected for that field as a whole. These checks validate the
payload format; the model method must enforce its own authorization and
Odoo access rights still apply when related records are read or saved.

Free typing (without selecting a row) updates only the Char. Extra fields
keep their previous values until the next select.

A **readonly** extra is still filled in the UI on select. It is persisted
on save only if that field’s view node has `force_save="1"`. Without it,
the fill is dropped on save with no error.

The method must be publicly RPC-callable: not prefixed with `_`, not
`@api.private`, and decorated with `@api.model` so the first argument is
the search string rather than record ids.

```xml
<field
    name="address_string"
    widget="autocomplete"
    options="{'function': 'address_auto_complete', 'min_symbols': 3, 'debounce': 5}"
/>
<field name="address_ref" readonly="1" force_save="1"/>
<field name="city" invisible="1"/>
```

```python
@api.model
def address_auto_complete(self, value):
    """Return autocomplete rows for ``value``.

    :param str value: current Char input (trimmed by the widget)
    :return: list of dicts whose keys are field names on this model
    :rtype: list[dict]
    """
    return [
        {
            "address_string": "string1",
            "address_ref": 1,
            "city": "Perugia",
        },
    ]
```

| Option | Type | Default if omitted |
|--------|------|-------------------|
| `function` | str (method name) | none — no RPC, Char still editable |
| `min_symbols` | int | `3` |
| `debounce` | int (ms) | `250` |

This is typeahead, not a closed `<select>`. For a dropdown whose options
are fetched once (or when a `depending_on` context key changes), use
`web_widget_dropdown_dynamic` instead.
