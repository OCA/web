Put a `widget="mermaid"` attribute in relevant field tags in the view declaration:

```xml
<field name="flowchart" widget="mermaid" />
```

Optionally, use an `options` attribute to pass a JSON object with
[mermaid configuration](https://mermaid.js.org/config/schema-docs/config.html):

```xml
<field
  name="flowchart"
  widget="mermaid"
  options="{'theme': 'forest', 'gantt': {'fontSize': 14}}"
/>
```

A specific `options` keyword has been added to enable Odoo theming

```xml
<field name="flowchart" widget="mermaid" options="{'odoo_theme': true}" />
```

The syntax for creating diagrams is described in
[mermaid's documentation](https://mermaid.js.org/syntax/flowchart.html).

As an example, this text:

```
graph LR
    10.0 --> 11.0
    11.0 --> 12.0
    12.0 -.-> 13.0
```

Produces this flowchart:

![Flowchart](./static/description/flowchart_example.png)

## Demonstration

In demo mode, the addon adds a flowchart field to users so you can try it. This shows up
in Runbot instances.
