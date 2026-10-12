/** @odoo-module */

import {Component} from "@odoo/owl";
import {Domain} from "@web/core/domain";
import {View} from "@web/views/view";
import {makeContext} from "@web/core/context";
import {registry} from "@web/core/registry";
import {standardWidgetProps} from "@web/views/widgets/standard_widget_props";
import {useService} from "@web/core/utils/hooks";

const {useSubEnv} = owl;

class SubViewWidget extends Component {
    setup() {
        super.setup();
        this.action = useService("action");
        this.orm = useService("orm");
        useSubEnv({
            config: {},
        });
    }
    get context() {
        return makeContext([this.props.context], this.props.record.data);
    }
    get viewProps() {
        const domain = new Domain(this.props.domain);
        var searchTypes = [];
        if (this.props.filter) {
            searchTypes.push("filter");
        }
        if (this.props.groupBy) {
            searchTypes.push("groupBy");
        }
        if (this.props.favorite) {
            searchTypes.push("favorite");
        }
        const result = {
            display: {
                controlPanel: {
                    // Hiding the control panel buttons
                    "top-left": false,
                    "bottom-left": true,
                },
            },
            searchMenuTypes: searchTypes,
            resModel: this.props.resModel,
            searchViewId: false,
            domain: domain.toList(this.props.record.data),
            context: this.context,
            noBreadcrumbs: true,
            showButtons: true,
            selectRecord: this.selectRecord.bind(this),
            createRecord: this.createRecord.bind(this),
            type: this.props.ViewType,
        };
        if (!result.type && this.env.isSmall) {
            result.type = "kanban";
        } else if (!result.type) {
            result.type = "list";
        }
        if (result.type === "list") {
            result.allowSelectors = false;
        }
        return result;
    }
    async createRecord() {
        if (this.props.createAction) {
            this.action.doActionButton({
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
        } else {
            this.action.doActionButton({
                name: "get_formview_action",
                type: "object",
                resModel: this.props.resModel,
                resIds: [],
                context: this.context,
            });
        }
    }
    async selectRecord(resId) {
        const context = makeContext([
            this.props.record.getFieldContext(),
            this.context,
        ]);
        const action = await this.orm.call(
            this.props.resModel,
            this.props.recordAction,
            [[resId]],
            {context}
        );
        this.action.doAction(action);
    }
}

SubViewWidget.template = "web_widget_sub_view.SubViewWidget";
SubViewWidget.props = {
    ...standardWidgetProps,
    resModel: String,
    recordAction: String,
    createAction: {type: String, optional: true},
    context: String,
    domain: String,
    ViewType: {type: String, optional: true},
    filter: Boolean,
    groupBy: Boolean,
    favorite: Boolean,
};
SubViewWidget.components = {
    View,
};
SubViewWidget.defaultProps = {};
SubViewWidget.extractProps = ({attrs}) => {
    return {
        resModel: attrs.model,
        context: attrs.context || "{}",
        recordAction: attrs["open-action"] || "get_formview_action",
        createAction: attrs["create-action"],
        domain: attrs.domain || "[]",
        ViewType: attrs["view-type"],
        filter: Boolean(JSON.parse(attrs.filter || "1")),
        groupBy: Boolean(JSON.parse(attrs["group-by"] || "1")),
        favorite: Boolean(JSON.parse(attrs.favorite || "1")),
    };
};

registry.category("view_widgets").add("sub_view_widget", SubViewWidget);
