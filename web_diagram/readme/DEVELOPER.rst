**Architecture overview**

The module is structured as follows:

- ``controllers/main.py`` — JSON-RPC endpoint at
  ``/web_diagram/diagram/get_diagram_info`` that computes node positions
  and connector data for a given record.
- ``models/ir_ui_view.py`` — Extends ``ir.ui.view`` to register the
  ``diagram`` view type and adds ``graph_get()``, which runs the layout
  algorithm via the internal ``graph`` tool.
- ``tools/graph.py`` — Topological-sort-based auto-layout algorithm
  (ported from Odoo 13 core).
- ``static/src/js/diagram_model.js`` — Plain ES6 class (no OWL). Calls
  the JSON-RPC endpoint and stores the resulting nodes and edges.
- ``static/src/js/diagram_controller.js`` — OWL 2 ``Component``. Owns
  the model, manages state, and opens ``FormViewDialog`` /
  ``ConfirmationDialog`` for CRUD operations.
- ``static/src/js/diagram_renderer.js`` — OWL 2 ``Component``. Renders
  the graph on a Raphael.js canvas using ``CuteGraph``, ``CuteNode``,
  and ``CuteEdge`` globals exposed by ``vec2.js`` / ``graph.js``.
- ``static/src/js/diagram_view.js`` — Registers the view in
  ``registry.category("views")`` as type ``"diagram"``.
- ``static/src/js/vec2.js``, ``static/src/js/graph.js`` — Legacy
  Raphael-based drawing utilities. Loaded before OWL modules; expose
  globals via ``window``.
- ``static/lib/js/raphael.js`` — Raphael.js vector graphics library.

**Odoo 16 migration notes**

The module was migrated from Odoo 15 to Odoo 16 as part of branch
``16.0_mig_web_diagram``. The main changes are:

1. **OWL 2 rewrite** — All JS files were rewritten from the legacy
   ``odoo.define`` / ``AbstractView.extend()`` pattern to native OWL 2
   ``Component`` classes with ``/** @odoo-module */``.

2. **Asset bundle** — ``web.assets_qweb`` was removed in Odoo 16.
   The QWeb template ``base_diagram.xml`` was moved into
   ``web.assets_backend``.

3. **``name_get()`` deprecation** — Replaced by ``.display_name``
   in the controller (``controllers/main.py``).

4. **Version bump** — ``16.0.1.0.0``.

**View switcher limitation in Odoo 16**

In Odoo 15, the diagram view appeared alongside the form view in the
control panel switcher (both are ``multiRecord: false``). In Odoo 16,
the view switcher only handles multi-record views (list, kanban, graph,
pivot…). Single-record views other than ``form`` are not shown in the
switcher.

The recommended workaround is to expose the diagram via a stat button
on the form view that calls ``action.switchView('diagram')`` through an
``ir.actions.act_window`` method. See ``USAGE.rst`` for the code
pattern.

Restoring the switcher would require overriding the core ``ControlPanel``
OWL component to filter and display ``multiRecord: false`` views — this
is fragile and not recommended.

**Graph layout algorithm**

The layout runs server-side in ``tools/graph.py``. It performs a
topological sort of the node graph starting from nodes marked with
``flow_start = True`` (if present) or from nodes with no incoming
connectors. Each node is assigned ``(x, y)`` coordinates and a ``(w, h)``
size. The controller scales these by the tuple passed as the ``scale``
parameter (default ``(140, 180)``).

**Adding a new node or connector model**

Your node model must have a ``one2many`` field pointing to the connector
model, and your connector model must have ``many2one`` fields for both
source and destination nodes. The graph layout relies on these
relationships being discoverable via ``Model._fields`` introspection —
no extra configuration is needed beyond what is declared in the
``<diagram>`` arch.

**JSON-RPC endpoint signature**

.. code-block:: python

   POST /web_diagram/diagram/get_diagram_info
   {
       "id": <int>,               # record id of the parent model
       "model": "<str>",          # parent model name
       "node": "<str>",           # node model name
       "connector": "<str>",      # connector model name
       "src_node": "<str>",       # source field on connector
       "des_node": "<str>",       # destination field on connector
       "label": "<str>|false",    # label expression
       "bgcolor": "<str>",        # bgcolor attribute from arch
       "shape": "<str>",          # shape attribute from arch
       "visible_nodes": [...],    # visible field names on node
       "invisible_nodes": [...],  # invisible field names on node
       "node_fields_string": [...],
       "connector_fields_string": [...]
   }

Response:

.. code-block:: python

   {
       "nodes": {<id>: {"x", "y", "w", "h", "color", "shape", "options"}},
       "conn": {<id>: {"id", "s_id", "d_id", "source", "destination",
                       "signal", "options"}},
       "display_name": "<str>",
       "parent_field": "<str>"
   }
