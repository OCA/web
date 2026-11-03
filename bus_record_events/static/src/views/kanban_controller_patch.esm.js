import {DRAGGED_CLASS} from "@web/core/utils/draggable_hook_builder";
import {KanbanController} from "@web/views/kanban/kanban_controller";
import {patch} from "@web/core/utils/patch";
import {useRecordStream} from "../hooks/use_record_stream.esm";

patch(KanbanController.prototype, {
    setup() {
        super.setup(...arguments);
        useRecordStream(this.props.resModel, {
            // A reload would close an open quick create and re-render the card
            // under the pointer during a drag.
            isBusy: async () =>
                Boolean(this.quickCreateState?.groupId) ||
                Boolean(this.model.root.editedRecord) ||
                Boolean(document.querySelector(`.o_kanban_renderer .${DRAGGED_CLASS}`)),
            onReload: () => this.model.load(),
        });
    },
});
