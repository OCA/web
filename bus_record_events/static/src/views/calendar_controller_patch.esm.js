import {CalendarController} from "@web/views/calendar/calendar_controller";
import {patch} from "@web/core/utils/patch";
import {useRecordStream} from "../hooks/use_record_stream.esm";

patch(CalendarController.prototype, {
    setup() {
        super.setup(...arguments);
        useRecordStream(this.props.resModel, {
            onReload: () => this.model.load(),
        });
    },
});
