**Static Default Time**
You can define the default time as follows for a static value
For `widget="datetime"`:
```xml
    <field name="your_datetime_field" widget="datetime" options="{'defaultTime': {'hour': 8, 'minute': 30, 'second': 15 }}"/>
```

For `widget="daterange"`:
```xml
    <field name="your_start_datetime_field" widget="datetime" options="{'end_date_field': 'your_end_datetime_field', 'defaultStartTime': {'hour': 2, 'minute': 22, 'second': 22,}, 'defaultEndTime': {'hour': 3, 'minute': 33, 'second': 33,}}"/>
```

**Dynamic Default Time**
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
