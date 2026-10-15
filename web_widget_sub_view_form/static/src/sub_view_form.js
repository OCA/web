// OWL base class and hook to override the environment of child components
import {Component, useSubEnv} from "@odoo/owl";
// Evaluates a context string with the record values
import {makeContext} from "@web/core/context";
// Odoo registries (here: form view widgets)
import {registry} from "@web/core/registry";
// Generic component able to load and render any view (here: a form)
import {View} from "@web/views/view";
// Props every view widget receives (record, readonly)
import {standardWidgetProps} from "@web/views/widgets/standard_widget_props";

// Shows the record pointed by a reference field in a form sub view
export class SubViewForm extends Component {
    // QWeb template, defined in sub_view_form.xml
    static template = "web_widget_sub_view_form.SubViewForm";
    // Sub components used in the template
    static components = {View};
    // Props declaration, checked by OWL in debug mode
    static props = {
        // record + readonly
        ...standardWidgetProps,
        // name of the reference field on the current record
        refField: String,
        // context string evaluated with the current record
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

    // Props given to the View component
    get viewProps() {
        return {
            // always a form: the reference points to a single record
            type: "form",
            // model only known at runtime, from the reference value
            resModel: this.ref.resModel,
            // record loaded by the form
            resId: this.ref.resId,
            // no pager: only this record
            resIds: [this.ref.resId],
            // widget context evaluated with the current record values
            context: makeContext([this.props.context], this.props.record.evalContext),
            // no search view needed for a single record
            searchViewId: false,
            noBreadcrumbs: true,
            // no "New" button
            preventCreate: true,
            // control panel kept for the save / discard indicator
            display: {controlPanel: {}},
        };
    }
}

// Widget definition registered for <widget name="sub_view_form"/>
export const subViewForm = {
    // component to render
    component: SubViewForm,
    // map the xml attributes to the component props
    extractProps: ({attrs}) => ({
        refField: attrs["ref-field"],
        context: attrs.context || "{}",
    }),
};

// Make the widget available in form views
registry.category("view_widgets").add("sub_view_form", subViewForm);
