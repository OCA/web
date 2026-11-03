import {ListController} from "@web/views/list/list_controller";
import {patch} from "@web/core/utils/patch";
import {useRecordStream} from "../hooks/use_record_stream.esm";

patch(ListController.prototype, {
    setup() {
        super.setup(...arguments);
        useRecordStream(this.props.resModel, {
            // A reload discards the row being edited and the selection a mass
            // action is about to use.
            isBusy: async () =>
                Boolean(this.model.root.editedRecord) ||
                this.model.root.selection.length > 0,
            onReload: () => this.model.load(),
        });
    },
});
