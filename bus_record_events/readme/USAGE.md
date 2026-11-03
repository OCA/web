Open the same list in two browsers. Change a record in one browser. The other
browser reloads the list within a few seconds.

How each view reacts:

- **Form**: reloads only when its own record changes. If the user has unsaved
  changes, the form shows a warning and reloads after the user saves or
  discards. If the record is deleted, the form goes back to the previous view.
- **List and kanban**: reload at most once every 5 seconds. They wait while the
  user edits a row, has records selected, uses kanban quick create or drags a
  card.
- **Calendar**: reloads at most once every 5 seconds.
- **Pivot and graph**: reload at most once every 30 seconds.
- A view in a hidden browser tab does not reload. It reloads when the tab
  becomes visible again.

Use the hook in a custom component:

```javascript
import {useRecordStream} from "@bus_record_events/hooks/use_record_stream.esm";

useRecordStream("res.partner", {
    onReload: () => this.load(),
    isBusy: async () => this.state.editing,
});
```
