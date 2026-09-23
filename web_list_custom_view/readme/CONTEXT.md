In many business scenarios, users need to see additional fields in list views
that are not included in the default view definition. Common use cases include:

- Displaying extra informational columns for reporting or analysis.
- Adapting list views to specific roles or workflows without touching the source code.
- Avoiding view inheritance XML files for simple column additions.
- Supporting business testing and UAT phases, where functional users or consultants
  need to temporarily expose fields to verify data correctness or validate business
  rules, without involving a developer for every inspection need.

Previously, adding fields to a list view required developer intervention through
XML view inheritance, which increases maintenance overhead and couples
customizations to the module codebase. During testing phases this creates
unnecessary back-and-forth between business and technical teams just to surface
a field for verification.

The `web_list_custom_view` module resolves this by providing a dedicated model
where technical users can declare additional fields to display in list views,
keeping customizations data-driven and easily manageable through the UI.
