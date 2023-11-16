/** @odoo-module */

import {Component} from "@odoo/owl";
import {_t} from "@web/core/l10n/translation";
import {registry} from "@web/core/registry";
import {standardFieldProps} from "@web/views/fields/standard_field_props";

export class OpenTabWidget extends Component {
    openNewTab(ev) {
        ev.stopPropagation();
    }
    _getReference() {
        var url = window.location.href;
        var searchParams = new URLSearchParams(url.split("#")[1]);
        searchParams.set("view_type", "form");
        searchParams.set("id", this.props.record.data.id);
        if (
            !searchParams.has("model") ||
            searchParams.get("model") !== this.props.record.resModel
        ) {
            searchParams.set("model", this.props.record.resModel);
            searchParams.delete("action");
        }
        return url.split("#")[0] + "#" + searchParams.toString();
    }
    loadAttrs(ev) {
        $(ev.target).tooltip();
    }
}

OpenTabWidget.template = "web_widget_open_tab.openTab";
OpenTabWidget.props = {
    ...standardFieldProps,
    title: {type: String, optional: true},
};

export const openTabWidget = {
    component: OpenTabWidget,
    displayName: _t("Open Tab"),
    supportedTypes: ["integer"],
    extractProps: () => ({
        title: _t("Click to open on new tab"),
    }),
};

registry.category("fields").add("open_tab", openTabWidget);
