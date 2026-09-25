This module does not define any security groups or access control lists of
its own.

Access to diagram data is governed entirely by the access rules of the
underlying models declared in the ``<node>`` and ``<arrow>`` elements of
the diagram view architecture.  Users must have at least read access to
those models to view the diagram, and write/create/delete access to
create, edit or remove nodes and connectors respectively.

The JSON-RPC endpoint ``/web_diagram/diagram/get_diagram_info`` is
restricted to authenticated users (``auth='user'``).  It reads data
through the ORM and therefore respects all existing record rules and
field-level access controls.
