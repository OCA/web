import {Component, useSubEnv} from "@odoo/owl";
import {Domain} from "@web/core/domain";
import {View} from "@web/views/view";
import {makeContext} from "@web/core/context";
import {registry} from "@web/core/registry";
import {standardWidgetProps} from "@web/views/widgets/standard_widget_props";
import {useService} from "@web/core/utils/hooks";

export class SubViewWidget extends Component {
    static template = "web_widget_sub_view.SubViewWidget";
    static components = {View};
    static props = {
        ...standardWidgetProps,
        resModel: String,
        recordAction: String,
        createAction: {type: String, optional: true},
        context: String,
        domain: String,
        viewType: {type: String, optional: true},
        filter: Boolean,
        groupBy: Boolean,
        favorite: Boolean,
    };

    setup() {
        this.action = useService("action");
        this.orm = useService("orm");
        useSubEnv({config: {}});
    }

    get context() {
        return makeContext(
            [this.props.context],
            this.props.record.evalContextWithVirtualIds
        );
    }

    get viewProps() {
        const {record} = this.props;
        const searchMenuTypes = [];
        if (this.props.filter) {
            searchMenuTypes.push("filter");
        }
        if (this.props.groupBy) {
            searchMenuTypes.push("groupBy");
        }
        if (this.props.favorite) {
            searchMenuTypes.push("favorite");
        }

        const type = this.props.viewType || (this.env.isSmall ? "kanban" : "list");
        return {
            display: {
                controlPanel: {
                    "top-left": false,
                    "bottom-left": true,
                },
            },
            searchMenuTypes,
            resModel: this.props.resModel,
            searchViewId: false,
            domain: new Domain(this.props.domain).toList(
                record.evalContextWithVirtualIds
            ),
            context: this.context,
            noBreadcrumbs: true,
            showButtons: true,
            selectRecord: this.selectRecord.bind(this),
            createRecord: this.createRecord.bind(this),
            type,
            ...(type === "list" ? {allowSelectors: false} : {}),
        };
    }

    async createRecord() {
        if (this.props.createAction) {
            return this.action.doActionButton({
                name: this.props.createAction,
                type: "action",
                resModel: this.props.record.resModel,
                resId: this.props.record.resId,
                resIds: this.props.record.resIds,
                context: this.context,
                onClose: async () => {
                    await this.props.record.model.root.load();
                    this.props.record.model.notify();
                },
            });
        }
        return this.action.doActionButton({
            name: "get_formview_action",
            type: "object",
            resModel: this.props.resModel,
            resIds: [],
            context: this.context,
        });
    }

    async selectRecord(resId) {
        const action = await this.orm.call(
            this.props.resModel,
            this.props.recordAction,
            [[resId]],
            {context: this.context}
        );
        return this.action.doAction(action);
    }
}

export const subViewWidget = {
    component: SubViewWidget,
    extractProps: ({attrs}) => ({
        resModel: attrs.model,
        context: attrs.context || "{}",
        recordAction: attrs["open-action"] || "get_formview_action",
        createAction: attrs["create-action"],
        domain: attrs.domain || "[]",
        viewType: attrs["view-type"],
        filter:
            attrs.filter === undefined || ["1", "true", "True"].includes(attrs.filter),
        groupBy:
            attrs["group-by"] === undefined ||
            ["1", "true", "True"].includes(attrs["group-by"]),
        favorite:
            attrs.favorite === undefined ||
            ["1", "true", "True"].includes(attrs.favorite),
    }),
};

registry.category("view_widgets").add("sub_view_widget", subViewWidget);
