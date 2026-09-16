Use `widget="autocomplete"` on a `fields.Char` and name a public
`@api.model` method in `options`.

The method receives the trimmed input string and must return a list of
dicts. Each dict’s keys are field names. The widget field’s key is the
label shown in the dropdown and the value written to the Char. Any number
of extra keys may be present; on **select** they are written to sibling
Char or Integer fields that exist on the **model and in the same view**
(visible or `invisible`). Keys missing from the model, missing from the
view, or whose type is not Char/Integer are skipped.

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
