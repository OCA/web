This module adds a new `resource` view type to the web client: an OWL
calendar that displays events in vertical columns, one per resource,
based on the [FullCalendar
Scheduler](https://fullcalendar.io/docs/resource-timegrid-view) plugins.

It reuses Odoo's standard calendar view as much as possible. Only the
arch parser (to read the `resource_field` attribute), the model (to load
the resources) and the renderer (to enable the `resourceTimeGrid` views)
are specialized.

The bundled FullCalendar Scheduler plugins (`static/lib/fullcalendar/`,
v6.1.11) are tri-licensed (commercial / CC BY-NC-ND / GPLv3). They are
used here under the GPLv3 option, enabled through the
`schedulerLicenseKey = "GPL-My-Project-Is-Open-Source"` setting, which
is compatible with the AGPL-3 license of this module. The FullCalendar
core (shipped by the `web` module) is MIT-licensed; only the Scheduler
plugins are covered by this tri-license.
