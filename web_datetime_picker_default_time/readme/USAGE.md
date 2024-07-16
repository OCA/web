You can define the default time as follows for a static value:

```xml
    <field name="your_datetime_field" options="{'defaultTime': {'hour': 8, 'minute': 30, 'second': 15 }}"/>
```

Otherwise you can also use a JSON field to make it dynamic through a compute function,
and reference this field in the view:

```python
   start_time = field.Json(compute="_compute_start_time")

   def _compute_start_time(self):
       for rec in self:
           rec.start_time = {'hour': 8, 'minute': 30, 'second': 15 }
```

```xml
   <field name="start_time" invisible="1" />
   <field name="your_datetime_field" options="{'defaultTime': 'start_time'}"/>
```
