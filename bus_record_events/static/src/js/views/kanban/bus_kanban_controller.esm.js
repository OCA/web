/** @odoo-module */

import {KanbanController} from "@web/views/kanban/kanban_controller";
import {kanbanView} from "@web/views/kanban/kanban_view";
import {registry} from "@web/core/registry";
import {useRecordStream} from "../../hooks/use_record_stream.esm";

export class BusKanbanController extends KanbanController {
    setup() {
        super.setup();

        useRecordStream(this.props.resModel, {
            onReload: async () => await this.model.load(),
        });
    }
}

export const busKanbanView = {
    ...kanbanView,
    Controller: BusKanbanController,
};

registry.category("views").add("bus_record_event_kanban", busKanbanView);
