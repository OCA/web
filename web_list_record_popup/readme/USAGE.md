### A) To use it, adding a dependency to the web_list_record_popup module:

1. Make your model inherit from ``web_list_record_popup.mixin``
2. Define ``_popup_button_xpaths`` class attribute with xpath expressions where buttons should be injected

Example:

```python
    class MyModel(models.Model):
        _inherit = "web_list_record_popup.mixin"

        _popup_button_xpaths = [
            ("//field[@name='line_ids']/list/field[@name='product_id']", "before"),
        ]
```

### B) If you prefer use it WITHOUT adding a hard dependency to the web_list_record_popup module instead:

Then don't add the module dependency and don't inherit from ``web_list_record_popup.mixin`` but override ``_get_view`` instead.

Example:

```python
    class MyModel(models.Model):
        _popup_button_xpaths = [
            ("//field[@name='line_ids']/list/field[@name='product_id']", "before"),
        ]

    @api.model
    def _get_view(self, view_id=None, view_type="form", **options):
        arch, view = super()._get_view(view_id, view_type, **options)
        if view_type == "form" and "web_list_record_popup.mixin" in self.env:
            arch = self.env["web_list_record_popup.mixin"]._inject_popup_buttons(
                arch,
                self._popup_button_xpaths,
            )
        return arch, view

```

Thus, the popup button will only be injected if the ``web_list_record_popup`` module is installed.
