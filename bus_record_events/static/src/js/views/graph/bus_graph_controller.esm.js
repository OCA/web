/** @odoo-module */

import {GraphController} from "@web/views/graph/graph_controller";
import {graphView} from "@web/views/graph/graph_view";
import {registry} from "@web/core/registry";
import {useRecordStream} from "../../hooks/use_record_stream.esm";

export class BusGraphController extends GraphController {
    setup() {
        super.setup();

        useRecordStream(this.props.resModel, {
            onReload: async () => await this.loadAll(),
        });
    }
}

export const busGraphView = {
    ...graphView,
    Controller: BusGraphController,
};

registry.category("views").add("bus_record_event_graph", busGraphView);
