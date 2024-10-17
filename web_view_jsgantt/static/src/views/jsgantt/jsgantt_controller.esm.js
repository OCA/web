/** @odoo-module */

import {Component} from "@odoo/owl";
import {Layout} from "@web/search/layout";
import {useModel} from "@web/views/model";
import {useService} from "@web/core/utils/hooks";

export class JSGanttController extends Component {
    setup() {
        this.actionService = useService("action");
        this.orm = useService("orm");

        this.archInfo = this.props.archInfo;
        this.editable = this.props.editable ? this.archInfo.editable : false;
        const fields = this.props.fields;
        const {rootState} = this.props.state || {};
        this.model = useModel(this.props.Model, {
            resModel: this.props.resModel,
            fields,
            activeFields: this.archInfo.activeFields,
            fieldNodes: this.archInfo.fieldNodes,
            viewMode: "jsgantt",
            limit: this.archInfo.limit || this.props.limit,
            countLimit: this.archInfo.countLimit,
            rootState,
        });
    }

    async openRecord(record) {
        const action = await this.orm.call(
            this.props.resModel,
            "get_formview_action",
            [[record.resId]],
            {
                context: this.props.context,
            }
        );
        return this.actionService.doAction(action);
    }
}

JSGanttController.template = "web_view_jsgantt.JSGanttView";
JSGanttController.components = {Layout};
