**Demo View**

A demo DayPilot view is available for the `resource.calendar.leaves` model (Time Off records, provided by the `resource` module dependency — no additional installations required).

To access the demo:
1. Navigate to **Settings → Technical → Resource DayPilot Demo**
2. The view displays resources as columns (the demo action groups by `resource_id`)
3. Use the search view's Group By options to change the resource grouping
4. The DayPilot calendar shows resource leaves and scheduling

This demo showcases the core functionality of the DayPilot resource-based calendar view with a simple, base Odoo model.

**Using the DayPilot View**

To use the DayPilot view in your Odoo model, define a view with type "daypilot":

```xml
<record id="view_my_model_daypilot" model="ir.ui.view">
    <field name="name">my.model.daypilot</field>
    <field name="model">my.model</field>
    <field name="type">daypilot</field>
    <field name="arch" type="xml">
        <daypilot
            date_start="start_date"
            date_stop="end_date"
            string="Resource Schedule"
            resource="user_id"
            edit="1"
            create="1"
            default_scale="CellDuration"
            default_range="day"
            time_slot_duration="30"
            business_hours_start="8"
            business_hours_end="18"
            business_hours_only="true"
            form_view_id="%(my_module.my_form_view)d"
        >
            <field name="name"/>
            <field name="resource_id"/>
        </daypilot>
    </field>
</record>
```

**Required Attributes:**
- `date_start`: Field name for the start date/time
- `date_stop`: Field name for the end date/time

Resource columns are derived from the active search **groupBy** (e.g. group by
User). Set a `default_group_by`/`group_by` on the action or search view to show
columns by default. Alternatively, use the `resource` attribute on the view
to specify a default resource field when no groupby is set.

**Optional Attributes:**
- `resource`: Default resource field for column grouping when no groupby is set (e.g. "user_id")
- `default_group_by`: Field used for resource columns; equivalent to `resource` and takes precedence when both are set
- `edit`: Whether records can be edited - default: true
- `create`: Whether new records can be created - default: true
- `delete`: Whether records can be deleted from the record dialog - default: true
- `show_current_time`: Whether to highlight the cell containing the current time with a pale yellow background - default: true
- `default_scale`: Default DayPilot cell scale (CellDuration, Minute, Hour, Day, Week) - default: "CellDuration"
- `default_range`: Period used by the prev/next/today navigation (day, week, month) - default: "day"

**Currently only the "day" range is supported.**

The bundled DayPilot Lite library renders a single day when resource columns
are active (`viewType="Resources"` ignores the `days` setting), so views
should stick to `default_range="day"` for now. The client-side internals
keep the hooks for other periods — the date range is recomputed and the
calendar is re-initialized on any range change — so enabling them later
only requires a suitable multi-day layout (see ROADMAP).
- `time_slot_duration`: Minutes per cell when scale is CellDuration - default: 60
- `business_hours_start`: Business hours start (0-23) - default: 8
- `business_hours_end`: Business hours end (0-23) - default: 18
- `business_hours_only`: Whether to hide non-business hours (outside `business_hours_start`/`business_hours_end`) - default: true
- `form_view_id`: Popup form view to open on create/click, e.g. `%(module.xmlid)d`
- `event_template`: QWeb template name for custom appointment content rendering (e.g., "my_module.daypilot_event")
- `tooltip`: Field name whose value is shown as the event tooltip. Defaults to the `daypilot_tooltip` computed field provided by this module: every model has it, and modules can override `_compute_daypilot_tooltip` (with their own `@api.depends`) to supply custom content (e.g. customer name and phone). Set `tooltip` only to use a different field.

**Customizing Appointment Content with QWeb Templates**

You can customize the appointment content displayed in the calendar using QWeb templates. This allows you to format the appointment text with HTML and include additional fields from the record.

**Step 1: Add the event_template attribute to your view**

```xml
<record id="view_my_model_daypilot" model="ir.ui.view">
    <field name="name">my.model.daypilot</field>
    <field name="model">my.model</field>
    <field name="type">daypilot</field>
    <field name="arch" type="xml">
        <daypilot
            date_start="start_date"
            date_stop="end_date"
            resource="user_id"
            event_template="my_module.daypilot_event"
        >
            <field name="name"/>
            <field name="partner_id"/>
            <field name="state"/>
        </daypilot>
    </field>
</record>
```

**Step 2: Create the QWeb template as a client-side asset**

Create the QWeb template under your module's static assets, for example `my_module/static/src/xml/daypilot_event.xml`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<templates xml:space="preserve">
    <t t-name="my_module.daypilot_event">
        <div class="o_daypilot_event">
            <span class="o_daypilot_event_time" t-if="startTime" t-esc="startTime"/>
            <span class="o_daypilot_event_title" t-out="event.text"/>
            <t t-if="record.partner_id">
                <br/>
                <small class="o_daypilot_event_partner" t-out="record.partner_id[1] if isinstance(record.partner_id, list) else record.partner_id"/>
            </t>
            <t t-if="record.state">
                <span class="badge badge-secondary o_daypilot_event_state" t-out="record.state"/>
            </t>
        </div>
    </t>
</templates>
```

**Step 3: Register the template in the manifest**

Add the static XML file to an asset bundle so the client can load the template:

```python
{
    # ...
    "assets": {
        "web.assets_backend_lazy": [
            "my_module/static/src/xml/daypilot_event.xml",
        ],
    },
}
```

**Available template variables:**

- `startTime`: Formatted start time (e.g., "09:00")
- `stopTime`: Formatted end time (e.g., "09:40")
- `record`: The full record object with all fields from the view definition
- `event`: Event object with `start`, `end`, and `text` properties

**Styling:**

You can add CSS to style your custom appointment content. For example:

```css
.o_daypilot_event {
    padding: 2px 4px;
}
.o_daypilot_event_time {
    font-weight: bold;
    margin-right: 4px;
}
.o_daypilot_event_title {
    display: inline;
}
.o_daypilot_event_partner {
    color: #666;
    display: block;
    font-size: 0.85em;
}
.o_daypilot_event_state {
    margin-left: 4px;
    font-size: 0.75em;
}
```
