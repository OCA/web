import {AGGREGATE_MIN_INTERVAL_MS, searchParamsFromProps} from "./search_params.esm";
import {PivotController} from "@web/views/pivot/pivot_controller";
import {patch} from "@web/core/utils/patch";
import {useRecordStream} from "../hooks/use_record_stream.esm";

patch(PivotController.prototype, {
    setup() {
        super.setup(...arguments);
        useRecordStream(this.props.resModel, {
            onReload: () => this.model.load(searchParamsFromProps(this.props)),
            minInterval: AGGREGATE_MIN_INTERVAL_MS,
        });
    },
});
