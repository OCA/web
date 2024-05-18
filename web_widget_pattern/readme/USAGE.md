You can either define a pattern in your Python source code on a field as in

```python
    my_field = fields.Char(pattern='[0-9]')
```

or on view level as in

```xml
    <field name="my_field" pattern="[0-9]" />
```

Demo data adds a pattern on the street2 field on partner forms to only allow numbers.
