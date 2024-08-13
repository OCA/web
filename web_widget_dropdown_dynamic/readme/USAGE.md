``` python
@api.model
def method_name(self):
    values = [
        ('value_a', 'Title A'),
    ]
    if self.env.context.get('depending_on') == True:
        values += [
            ('value_b', 'Title B'),
        ]
    return values
```

``` xml
<field
    name="other_field"
/>
<field
    name="char_field"
    widget="dynamic_dropdown"
    options="{'values':'method_name'}"
    context="{'depending_on': other_field}"
/>
```

**DEMO**

On User defined filters added new field to show the feature, it is called 
**Dropdown Integer**. If any user selected just One option shoud appear, but if 
Mitchell Admin it should be possible to select option One and Two.