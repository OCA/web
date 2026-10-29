To make the records of a model colorable, inherit the mixin and expose the
fields `many2one_color` and `many2one_color_message` in its form view:

```python
class MyModel(models.Model):
    _name = "my.model"
    _inherit = ["my.model", "many2one.color.mixin"]
```

The color fields are read as sub-fields of the many2one value with the access
rights of the current user, so the mixin is meant for models that backend users
can read. Records the user cannot read are shown without color.

The `no_color` option is honored for the fetching of the color data on every
many2one widget. Specialized widgets that build their own properties (for
example `many2one_avatar`) still color the dropdown entries while a record is
being searched.
