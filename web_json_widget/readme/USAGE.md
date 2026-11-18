To insert a json editor in a form view, you can use the widget:
```xml
    <field name="json_field" widget="json_editor"/>
```
Assuming you defined the model such that:
```python
    json_field = fields.Json(
        string="JSON Data",
        # default={"test": "value", "int": 123},
    )
```
