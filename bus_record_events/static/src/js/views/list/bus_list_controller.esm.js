/** @odoo-module */

import {ListController} from "@web/views/list/list_controller";
import {listView} from "@web/views/list/list_view";
import {registry} from "@web/core/registry";
import {useRecordStream} from "../../hooks/use_record_stream.esm";

export class BusListController extends ListController {
    setup() {
        super.setup();

        useRecordStream(this.props.resModel, {
            onUpdate: () => this.model.load(),
        });
    }
}

export const busListView = {
    ...listView,
    Controller: BusListController,
};

registry.category("views").add("bus_record_event_list", busListView);
