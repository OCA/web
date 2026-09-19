Opt a timeline view in with a single arch attribute (optionally with status
colors that the theme harmonizes):

```xml
<timeline
    date_start="planned_date_start"
    date_stop="planned_date_end"
    default_group_by="project_id"
    dependency_arrow="depend_on_ids"
    colors="#ffffff: user_ids == []; #a8dbc0: state == '1_done'; #f0b9b3: state == '1_canceled'"
    gantt_ux="true"
/>
```

Everything else is automatic:

- One row per record, grouped under collapsible bands of the
  `default_group_by` field. Click a band to collapse or expand it; click a
  row to open the record.
- Drag a bar to reschedule (snaps to whole days); if other records depend on
  it, a dialog asks whether to shift them along.
- To create a dependency, hover the predecessor bar and drag the circle at
  its right end onto the successor. To remove one, click its arrow and
  confirm.

Views without `gantt_ux="true"` keep stock `web_timeline` behavior.
