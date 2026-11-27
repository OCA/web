import {AGGREGATE_MIN_INTERVAL_MS} from "../search_params.esm";
import {PivotController} from "@web/views/pivot/pivot_controller";
import {patch} from "@web/core/utils/patch";
import {useRecordStream} from "../../hooks/use_record_stream.esm";

patch(PivotController.prototype, {
    setup() {
        super.setup(...arguments);
        useRecordStream(this.props.resModel, {
            // ``load()`` would put back the measures and groupbys of the action
            // context over the ones the user picked, collapse the headers the
            // user expanded, and not notify the view. ``_loadData`` with the
            // current metaData keeps the layout and the folded headers.
            onReload: async () => {
                const model = this.model;
                await model._loadData({metaData: model.metaData, data: model.data});
                if (model.hasData()) {
                    model.useSampleModel = false;
                }
                model.notify();
            },
            minInterval: AGGREGATE_MIN_INTERVAL_MS,
        });
    },
});
