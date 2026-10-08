- **Week and Month ranges**: the bundled DayPilot Lite library renders a
  single day when resource columns are active (`viewType="Resources"`
  ignores the `days` setting). Supporting multi-day ranges requires a layout
  decision, e.g. switching to a days-as-columns layout when ungrouped, or a
  staff-per-day column matrix (columns can carry their own `start` date).
  The `default_range` arch attribute, the model's `getRangeFromDate` and the
  renderer's re-init-on-range-change logic are kept as hooks; enabling other
  periods needs the layout implementation and a period selector in the view
  controls (removed for now, since only "day" is supported).
