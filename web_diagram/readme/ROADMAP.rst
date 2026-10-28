**Known issues / limitations**

* The view type switcher does not display the diagram view in Odoo 16.
  Access must be provided via a dedicated button or action (see
  ``USAGE.rst``).

* The graph layout algorithm is purely server-side and does not
  preserve manual node positions across reloads.

* Drag-and-drop node repositioning is not persistent — positions reset
  on next reload.

* The ``scale`` parameter passed to the layout algorithm is hard-coded
  to ``(140, 180)`` in the controller and is not configurable from the
  arch.

**Roadmap**

* Persist manual node positions on the node model (custom x/y fields).
* Make the layout scale configurable via an arch attribute.
* Support ``many2many`` connectors in addition to ``one2many``.
* Add support for the ``accesskey`` shortcut attribute on the view.
* Investigate restoring the control panel view switcher for
  single-record views without overriding core OWL components.
