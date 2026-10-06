The new `work_week` and `work_month` scales are **opt-in** per calendar view.
To enable them, list them explicitly in the `scales` attribute of the
`<calendar>` element:

```xml
<calendar
    date_start="date_start"
    date_stop="date_stop"
    mode="work_week"
    scales="day,week,work_week,month,work_month,year"
>
    ...
</calendar>
```

Notes:

- The standard scales (`day`, `week`, `month`, `year`) are still controlled the
  same way. List only the ones you want to expose in the scale selector.
- You can use `work_week` or `work_month` as the default `mode`.
- If the `scales` attribute is omitted, only the four standard scales are
  available, preserving backward compatibility.

To inherit an existing calendar view and add the new scales:

```xml
<record id="my_calendar_view_workdays" model="ir.ui.view">
    <field name="name">my.model.calendar.workdays</field>
    <field name="model">my.model</field>
    <field name="inherit_id" ref="other_module.my_calendar_view"/>
    <field name="arch" type="xml">
        <xpath expr="//calendar" position="attributes">
            <attribute name="scales">day,week,work_week,month,work_month,year</attribute>
        </xpath>
    </field>
</record>
```

The view will then show two additional entries (`Work Week` and `Work Month`)
in the scale dropdown next to `Day` / `Week` / `Month` / `Year`.
