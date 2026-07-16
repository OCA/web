## For Developers

To enable notifications on a model, simply inherit from the `bus.record.event.mixin` mixin:

```python
class MyModel(models.Model):
    _name = 'my.model'
    _inherit = ['my.model', 'bus.record.event.mixin']
```

### Subscription Channels

The module manages two types of channels for client-side subscriptions (OWL/JS):

1.  **Model Events (`create`)**:
    *   Channel: `record_events:{model_name}`
    *   Example: `record_events:res.partner`
    *   Requires: Read permissions at the model level.

2.  **Record Events (`write`, `unlink`)**:
    *   Channel: `record_events:{model_name}:{record_id}`
    *   Example: `record_events:res.partner:15`
    *   Requires: Read permissions on the specific record (record rules applied).

## Reactive Views

The module includes extended view controllers that automatically listen for these events and update the interface or notify the user.

To use these reactive views, you must specify the `js_class` attribute in the XML view definition.

### Available Views

| View Type | js_class | Behavior |
| :--- | :--- | :--- |
| **Form** | `bus_record_event_form` | Notifies if the record has been modified or deleted by another user while editing. If there are no unsaved changes, it automatically reloads the data. |
| **Kanban** | `bus_record_event_kanban` | Automatically reloads the view upon receiving create, update, or delete events in the model. |
| **Pivot** | `bus_record_event_pivot` | Automatically reloads the view upon changes in the model. |
| **Graph** | `bus_record_event_graph` | Automatically reloads the view upon changes in the model. |
| **Calendar** | `bus_record_event_calendar` | Automatically reloads the view upon changes in the model. |
| **List** | `bus_record_event_list` | Automatically reloads the view upon changes in the model. |

### Usage Example (XML)

```xml
<record id="view_my_model_form" model="ir.ui.view">
    <field name="name">my.model.form</field>
    <field name="model">my.model</field>
    <field name="arch" type="xml">
        <form js_class="bus_record_event_form">
            <!-- ... -->
        </form>
    </field>
</record>

<record id="view_my_model_kanban" model="ir.ui.view">
    <field name="name">my.model.kanban</field>
    <field name="model">my.model</field>
    <field name="arch" type="xml">
        <kanban js_class="bus_record_event_kanban">
            <!-- ... -->
        </kanban>
    </field>
</record>
```

## JavaScript API

### Service: `bus_record_event_service`

The module provides a service to manage subscriptions to record events.

```javascript
const busRecordEventService = useService("bus_record_event_service");

// Add a channel to listen to
busRecordEventService.addChannel("record_events:res.partner:1");

// Subscribe to notifications
const unsubscribe = busRecordEventService.subscribe((payload) => {
    console.log("Received event:", payload);
});

// Clean up
unsubscribe();
```

### Hook: `useRecordStream`

For OWL components, it is recommended to use the `useRecordStream` hook. It handles the lifecycle of the subscription (adding channels on start, unsubscribing on unmount).

```javascript
import { useRecordStream } from "@bus_record_events/js/hooks/use_record_stream.esm";

setup() {
    useRecordStream("res.partner", {
        id: this.props.resId, // Optional: Listen to a specific record
        onReload: async () => {
            // Callback to reload the view/component
            await this.model.load();
        },
        onUpdate: async (payload) => {
            // Optional: Custom handling of the event
        },
        filter: (payload) => {
            // Optional: Filter events before processing
            return true;
        }
    });
}
```
