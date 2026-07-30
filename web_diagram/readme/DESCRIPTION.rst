This module restores the **diagram view** for Odoo, which was removed from the
standard distribution in Odoo 13.

It allows developers to declare ``<diagram>`` view types in window actions,
providing an interactive node-and-edge graph representation of records and
their relationships (e.g. workflow states and transitions).

Key features:

- Declares the ``diagram`` view type in the ``ir.ui.view`` model.
- Renders nodes (states) and connectors (transitions) using Raphael.js.
- Supports node background colors and shapes driven by field expressions.
- Provides a "New Node" button directly in the control panel.
- Supports create/edit/delete of nodes and connectors via form dialogs.
- Auto-layouts the graph using a built-in topological sort algorithm.
- Fully rewritten as an OWL 2 component for Odoo 16 compatibility.
