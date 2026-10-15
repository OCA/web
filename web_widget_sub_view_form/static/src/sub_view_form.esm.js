import {Component, useSubEnv} from "@odoo/owl";
import {makeContext} from "@web/core/context";
import {registry} from "@web/core/registry";
import {View} from "@web/views/view";
import {standardWidgetProps} from "@web/views/widgets/standard_widget_props";

// Shows the record pointed by a reference field in a form sub view
export class SubViewForm extends Component {
    static template = "web_widget_sub_view_form.SubViewForm";
    static components = {View};
    static props = {
        ...standardWidgetProps,
        refField: String,
        context: String,
    };

    setup() {
        // Fresh config so the sub view does not touch the parent action (breadcrumbs...)
        useSubEnv({config: {}});
    }

    // Reference value: {resModel, resId, displayName} or false when empty
    get ref() {
        return this.props.record.data[this.props.refField];
    }

    get viewProps() {
        return {
            type: "form",
            resModel: this.ref.resModel,
            resId: this.ref.resId,
            // No pager: only this record
            resIds: [this.ref.resId],
            context: makeContext([this.props.context], this.props.record.evalContext),
            searchViewId: false,
            noBreadcrumbs: true,
            preventCreate: true,
            // Control panel kept for the save / discard indicator
            display: {controlPanel: {}},
        };
    }
}

export const subViewForm = {
    component: SubViewForm,
    extractProps: ({attrs}) => ({
        refField: attrs["ref-field"],
        context: attrs.context || "{}",
    }),
};

registry.category("view_widgets").add("sub_view_form", subViewForm);
