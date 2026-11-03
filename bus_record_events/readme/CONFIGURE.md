A model broadcasts its changes when all of these are true:

- A window action opens it. A model with no action can have no open view.
- It is not transient, abstract or an SQL view (`_auto = False`).
- It is not on the built-in denylist (`ir.*`, `mail.*`, `bus.*`, `queue.job*`,
  `calendar.attendee` and other high-churn technical models).
- It is not on the configured denylist.

Set these system parameters in *Settings > Technical > System Parameters*:

| Parameter | Value | Effect |
|---|---|---|
| `bus_record_events.denied_models` | Comma-separated model names or patterns, such as `hr.employee.location.history, x_*` | These models never broadcast. |
| `bus_record_events.allowed_models` | Comma-separated model names or patterns | Overrides the built-in denylist for these models. |
| `bus_record_events.ignored_fields` | JSON, such as `{"project.task": ["x_gps_lat", "x_gps_lng"]}` | A write that changes only these fields does not broadcast. |
| `bus_record_events.retention_minutes` | Integer, default `15` | Record events older than this are deleted. |

Code can decide for a model, without configuration:

```python
class EmployeeLocation(models.Model):
    _inherit = "hr.employee.location.history"
    _bus_record_events = False  # never broadcast; True: always broadcast


class ProjectTask(models.Model):
    _inherit = "project.task"
    _bus_record_events_ignored_fields = ("last_sync_hash",)
```

Setting these attributes needs no dependency on this module. When several
modules inherit the same model, the ignored fields of all of them apply.

To stop events for one operation, such as a large import, add
`bus_record_events_disable=True` to the context.
