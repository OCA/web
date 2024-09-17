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
            preload: this.archInfo.preload,
        });

        useSetupView({
            rootRef: this.rootRef,
            getLocalState: () => {
                return {
                    rootState: this.model.root.exportState(),
                };
            },
            getOrderBy: () => {
                return this.model.root.orderBy;
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

    async _unfoldGroup(group) {
        if (!group.hasChildren) {
            return;
        }
        if (group.isFolded) {
            group.isFolded = false;
            await group.loadChildren();
        }
        return this._unfoldGroupList(group.list);
    }

    async _unfoldGroupList(list) {
        return Promise.all(list.records.map(this._unfoldGroup, this));
    }

    async expandAllGroups() {
        await this._unfoldGroupList(this.model.root);
        this.model.notify();
    }

    _foldGroup(group) {
        if (!group.hasChildren) {
            return;
        }
        if (!group.isFolded) {
            group.isFolded = true;
        }
        this._foldGroupList(group.list);
    }

    _foldGroupList(list) {
        list.records.map(this._foldGroup, this);
    }

    async collapseAllGroups() {
        // This resets the state of all groups to folded. It traverses the
        // whole loaded tree, so even if a parent is folded, its children will
        // still be checked, because otherwise unfolding the parent afterwards
        // would display its children as unfolded.
        this._foldGroupList(this.model.root);
        this.model.notify();
    }
}

RTreeController.defaultProps = {
    ...ListController.defaultProps,
    // No selection for now
    allowSelectors: false,
};
