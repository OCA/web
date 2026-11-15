**``<node>`` attributes**

.. list-table::
   :header-rows: 1

   * - Attribute
     - Description
   * - ``object``
     - Technical name of the node model (e.g. ``my.node.model``).
   * - ``bgcolor``
     - Semicolon-separated list of ``color:python_expression`` pairs.
       The node background is set to the first color whose expression
       evaluates to ``True`` for that record.
       Example: ``"green:is_start;red:is_final"``
   * - ``shape``
     - Semicolon-separated list of ``shape:python_expression`` pairs.
       Supported shape: ``rectangle``.
       Example: ``"rectangle:is_final"``

**``<arrow>`` attributes**

.. list-table::
   :header-rows: 1

   * - Attribute
     - Description
   * - ``object``
     - Technical name of the connector model (e.g. ``my.connector.model``).
   * - ``source``
     - Field name on the connector model that points to the source node
       (many2one to the node model).
   * - ``destination``
     - Field name on the connector model that points to the destination node
       (many2one to the node model).
   * - ``label``
     - Python list expression of field names whose values are displayed on
       the connector. Example: ``"[('name', '!=', False)]"``

**``<field>`` inside ``<node>``**

Fields listed under ``<node>`` are displayed inside each node box.
Mark a field with ``invisible="1"`` to use it in ``bgcolor``/``shape``
expressions without showing it in the node.

**``<label>`` inside ``<diagram>``**

Adds a legend text displayed above the diagram canvas. Multiple
``<label>`` elements are supported.
