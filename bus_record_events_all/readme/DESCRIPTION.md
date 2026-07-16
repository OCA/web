This module extends `bus_record_events` to automatically apply the `bus.record.event.mixin` behavior to all models in the system (with some technical exceptions).

It also automatically injects the appropriate `js_class` (e.g., `bus_record_event_form`, `bus_record_event_kanban`) into views, making them reactive by default without manual XML changes.

**WARNING**: This module should be installed with caution, being aware of the risks it entails, both in terms of database space usage (due to the volume of bus notifications) and security implications (broadcasting events for all models).
