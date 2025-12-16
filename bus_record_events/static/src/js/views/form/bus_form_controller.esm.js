/** @odoo-module */

import {FormController} from "@web/views/form/form_controller";
import {formView} from "@web/views/form/form_view";
import {registry} from "@web/core/registry";
import {useRecordStream} from "../../hooks/use_record_stream.esm";

export class BusFormController extends FormController {
    setup() {
        super.setup();

        useRecordStream(this.props.resModel, {
            id: this.props.resId,
            // In create mode (no resId), we don't want to listen to any events.
            filter: () => Boolean(this.props.resId),
            isDirty: async () => await this.model.root.isDirty(),
            onReload: async () => await this.model.load(),
            onRecordDeleted: () => this.env.config.historyBack(),
        });
    }
}

export const busFormView = {
    ...formView,
    Controller: BusFormController,
};

registry.category("views").add("bus_record_event_form", busFormView);
