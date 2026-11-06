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

After a reload, the view marks what changed for about 3 seconds:

- **Form**: each field whose value changed gets a light tint and a bar on its
  left side. Screen readers announce that the record was updated.
- **List**: each changed cell gets the mark. All cells of a row that is new
  in the view get the mark: a record created elsewhere, or a record changed
  so that it now matches the filter, group or page.
- **Kanban**: the whole card of a changed or new record gets the mark.

The browser compares the values from before and after the reload. The bus
event still contains ids only. A change the user made in the same view gives
no mark. If more than 10 records changed in one reload, no record gets the
mark. If the browser asks for reduced motion, the mark does not fade.

Use the hook in a custom component:

```javascript
import {useRecordStream} from "@bus_record_events/hooks/use_record_stream.esm";

useRecordStream("res.partner", {
    onReload: () => this.load(),
    isBusy: async () => this.state.editing,
});
```
