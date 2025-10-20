import {_t} from "@web/core/l10n/translation";
import {Component} from "@odoo/owl";
import {registry} from "@web/core/registry";
import {standardFieldProps} from "@web/views/fields/standard_field_props";

export class IconPopoverField extends Component {
    static template = "web_widget_popover.IconPopoverField";
    static props = {
        ...standardFieldProps,
        icon: {type: String, optional: true},
    };
    static defaultProps = {
        icon: "fa-info-circle",
    };
    get value() {
        return this.props.record.data[this.props.name] || "";
    }
    get tooltipInfo() {
        return JSON.stringify({message: this.value});
    }
}

export const iconPopoverField = {
    component: IconPopoverField,
    displayName: _t("Icon Popover"),
    supportedTypes: ["char", "text"],
    supportedOptions: [
        {
            label: _t("Icon"),
            name: "icon",
            type: "string",
            help: _t("FontAwesome icon to display"),
        },
    ],
    extractProps: ({attrs}) => ({
        icon: attrs.icon,
    }),
};

registry.category("fields").add("popover", iconPopoverField);
