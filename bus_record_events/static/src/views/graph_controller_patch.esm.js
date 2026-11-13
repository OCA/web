import {AGGREGATE_MIN_INTERVAL_MS, searchParamsFromProps} from "./search_params.esm";
import {GraphController} from "@web/views/graph/graph_controller";
import {patch} from "@web/core/utils/patch";
import {useRecordStream} from "../hooks/use_record_stream.esm";

patch(GraphController.prototype, {
    setup() {
        super.setup(...arguments);
        useRecordStream(this.props.resModel, {
            onReload: () => this.model.load(searchParamsFromProps(this.props)),
            minInterval: AGGREGATE_MIN_INTERVAL_MS,
        });
    },
});
