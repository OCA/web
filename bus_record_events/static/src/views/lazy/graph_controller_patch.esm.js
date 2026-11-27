import {AGGREGATE_MIN_INTERVAL_MS} from "../search_params.esm";
import {GraphController} from "@web/views/graph/graph_controller";
import {patch} from "@web/core/utils/patch";
import {useRecordStream} from "../../hooks/use_record_stream.esm";

patch(GraphController.prototype, {
    setup() {
        super.setup(...arguments);
        useRecordStream(this.props.resModel, {
            // ``load()`` would put back the mode, measure and order of the
            // action context over the ones the user picked, and it does not
            // notify the view. Fetch again with the current settings instead.
            onReload: async () => {
                const model = this.model;
                await model._fetchDataPoints({...model.metaData});
                if (model.hasData()) {
                    model.useSampleModel = false;
                }
                model.notify();
            },
            minInterval: AGGREGATE_MIN_INTERVAL_MS,
        });
    },
});
