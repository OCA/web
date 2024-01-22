/** @odoo-module */

import {ListController} from "@web/views/list/list_controller";
import {useModel} from "@web/views/model";
import {useRef} from "@odoo/owl";
import {useService} from "@web/core/utils/hooks";
import {useSetupView} from "@web/views/view_hook";

export class RTreeController extends ListController {
    setup() {
        // This is a copy of ListController.setup() with a few changes in the
        // useModel() arguments.
        this.actionService = useService("action");
        this.dialogService = useService("dialog");
        this.notificationService = useService("notification");
        this.userService = useService("user");
        this.rpc = useService("rpc");
        this.rootRef = useRef("root");
        this.orm = useService("orm");

        this.archInfo = this.props.archInfo;
        this.editable = this.props.editable ? this.archInfo.editable : false;
        this.multiEdit = this.archInfo.multiEdit;
        this.activeActions = this.archInfo.activeActions;
        const fields = this.props.fields;
        const {rootState} = this.props.state || {};
        this.model = useModel(this.props.Model, {
            resModel: this.props.resModel,
            fields,
            activeFields: this.archInfo.activeFields,
            fieldNodes: this.archInfo.fieldNodes,
            handleField: this.archInfo.handleField,
            viewMode: "rtree",
            // No groupByInfo because not supported
            limit: this.archInfo.limit || this.props.limit,
            defaultOrder: this.archInfo.defaultOrder,
            expand: this.archInfo.expand,
            groupsLimit: this.archInfo.groupsLimit,
            multiEdit: this.multiEdit,
            rootState,
            parentDefs: this.archInfo.parentDefs,
        });

        useSetupView({
            rootRef: this.rootRef,
            getLocalState: () => {
                return {
                    rootState: this.model.root.exportState(),
                };
            },
        });
    }

    async openRecord(record) {
        if (record.isRecord) {
            return super.openRecord(record);
        }
        // Record is a group: get and launch its form action.
        const action = await this.orm.call(
            record.resModel,
            "get_formview_action",
            [[record.resId]],
            {
                context: this.props.context,
            }
        );
        return this.actionService.doAction(action);
    }
}

RTreeController.defaultProps = {
    ...ListController.defaultProps,
    // No selection for now
    allowSelectors: false,
};
