import {onWillUnmount, useChildSubEnv} from "@odoo/owl";
import {ListController} from "@web/views/list/list_controller";

export class HierarchyListController extends ListController {
    static template = "web_hierarchy_list.HierarchyListView";

    setup() {
        super.setup(...arguments);
        this.parentRecord = false;
        // Initializing breadcrumbState to an empty array is important as the HierarchyListRender
        // persists the breadcrumb state in the global state only if the environment variable
        // is set. This restriction is put in place in order not to persist the state when
        // the HierarchyListRender is mounted on a x2Many Field.
        useChildSubEnv({
            breadcrumbState: this.props.globalState?.breadcrumbState || [],
        });
        onWillUnmount(this.onWillUnmount);
    }

    async onWillUnmount() {
        delete this.actionService.currentController.action.context[
            `default_${this.archInfo.parentFieldColumn.name}`
        ];
    }

    async onParentRecordUpdate(parentRecord) {
        if (parentRecord) {
            this.actionService.currentController.action.context[
                `default_${this.archInfo.parentFieldColumn.name}`
            ] = parentRecord.resId;
        } else {
            delete this.actionService.currentController.action.context[
                `default_${this.archInfo.parentFieldColumn.name}`
            ];
        }
        const hierarchyListParentIdDomain = [
            [this.props.archInfo.parentFieldColumn.name, "=", parentRecord.resId],
        ];
        await this.model.load({hierarchyListParentIdDomain});
    }

    async onBreadcrumbReset() {
        await this.env.searchModel._notify();
    }
}
