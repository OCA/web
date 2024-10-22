import {onWillStart, useState} from "@odoo/owl";
import {HierarchyListBreadcrumb} from "./hierarchy_list_breadcrumb.esm";
import {ListRenderer} from "@web/views/list/list_renderer";
import {evaluateBooleanExpr} from "@web/core/py_js/py";
import {useSetupAction} from "@web/search/action_hook";

export class HierarchyListRenderer extends ListRenderer {
    static components = {
        ...ListRenderer.components,
        HierarchyListBreadcrumb,
    };
    static props = [...ListRenderer.props, "onParentRecordUpdate", "onBreadcrumbReset"];
    static template = "web_hierarchy_list.HierarchyListRenderer";
    static rowsTemplate = "web_hierarchy_list.HierarchyListRenderer.Rows";
    static recordRowTemplate = "web_hierarchy_list.HierarchyListRenderer.RecordRow";
    setup() {
        super.setup();
        useSetupAction({
            getGlobalState: () => {
                // We only persist the breadcrumb state in the global state if it was provided
                // by the environment. Indeed, the environment variable is created by the
                // HierarchyListController, which ensures that the state is only persisted there
                // and not when the renderer is used in a x2Many field.
                if (
                    !this.env.breadcrumbState ||
                    this.state.breadcrumbState.length === 0
                ) {
                    return {};
                }
                return {
                    breadcrumbState: this._getBreadcrumbState(),
                };
            },
        });
        // As the breadcrumb state is not provided when the renderer is mounted into a x2Many
        // field, we need to have a fallback value.
        this.state = useState({
            breadcrumbState: this.env.breadcrumbState || [],
        });
        onWillStart(this.willStart);
    }

    async willStart() {
        if (this.state.breadcrumbState.length > 0) {
            this.navigate(
                this.state.breadcrumbState[this.state.breadcrumbState.length - 1]
            );
        }
    }

    _getBreadcrumbState() {
        return this.state.breadcrumbState.map((parentRecord) =>
            this._getParentRecord(parentRecord)
        );
    }

    getDisplayName(record) {
        if (this.props.archInfo.nameFieldColumn.fieldType === "many2one") {
            return record.data[this.props.archInfo.nameFieldColumn.name][1];
        }
        return record.data[this.props.archInfo.nameFieldColumn.name];
    }

    _getParentRecord(record) {
        const data = {};
        data[this.props.archInfo.nameFieldColumn.name] =
            record.data[this.props.archInfo.nameFieldColumn.name];
        return {resId: record.resId, data};
    }

    _updateBreadcrumbState(record) {
        const existingRecordIndex = this.state.breadcrumbState
            .map((r) => r.resId)
            .indexOf(record.resId);
        if (existingRecordIndex >= 0)
            this.state.breadcrumbState = this.state.breadcrumbState.slice(
                0,
                existingRecordIndex + 1
            );
        else {
            this.state.breadcrumbState.push(this._getParentRecord(record));
        }
    }

    canDrillDown(record) {
        if (!this.props.archInfo.drillDownCondition) {
            return true;
        }
        return evaluateBooleanExpr(
            this.props.archInfo.drillDownCondition,
            record.evalContextWithVirtualIds
        );
    }

    async navigate(parent) {
        this._updateBreadcrumbState(parent);
        await this.props.onParentRecordUpdate(parent);
    }

    async reset() {
        this.state.breadcrumbState.length = 0;
        await this.props.onBreadcrumbReset();
    }
}
