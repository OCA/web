import {Component} from "@odoo/owl";
import {_t} from "@web/core/l10n/translation";
import {registry} from "@web/core/registry";
import {standardFieldProps} from "@web/views/fields/standard_field_props";

export class OpenTabWidget extends Component {
    static template = "web_widget_open_tab.openTab";
    static props = {
        ...standardFieldProps,
        title: {type: String, optional: true},
    };

    openNewTab(ev) {
        ev.stopPropagation();
    }
    _getReference() {
        return `/odoo/${this.props.record.resModel}/${this.props.record.data.id}`;
    }
}

export const openTabWidget = {
    component: OpenTabWidget,
    displayName: _t("Open Tab"),
    supportedTypes: ["integer"],
    extractProps: () => ({
        title: _t("Click to open on new tab"),
    }),
};

registry.category("fields").add("open_tab", openTabWidget);
