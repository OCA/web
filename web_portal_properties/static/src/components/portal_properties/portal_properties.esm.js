import {PortalPropertyDefinition} from "./portal_properties_definition.esm";
import {PropertiesField} from "@web/views/fields/properties/properties_field";
import {_t} from "@web/core/l10n/translation";
import {exprToBoolean} from "@web/core/utils/strings";
import {registry} from "@web/core/registry";
import {usePopover} from "@web/core/popover/popover_hook";

export class PortalPropertiesField extends PropertiesField {
    setup() {
        super.setup();
        // Override the popover to use our custom PropertyDefinition
        this.popover = usePopover(PortalPropertyDefinition, {
            closeOnClickAway: this.checkPopoverClose,
            popoverClass: "o_property_field_popover",
            position: "top",
            onClose: () => this.onCloseCurrentPopover?.(),
            fixedPosition: true,
            arrow: false,
        });
    }
}

PortalPropertiesField.components = {
    ...PropertiesField.components,
    PropertyDefinition: PortalPropertyDefinition,
};

export const portalPropertiesField = {
    component: PortalPropertiesField,
    displayName: _t("Properties"),
    supportedTypes: ["properties"],
    additionalClasses: ["o_field_properties"],
    extractProps({attrs}, dynamicInfo) {
        return {
            context: dynamicInfo.context,
            columns: parseInt(attrs.columns || "1", 10),
            showAddButton: exprToBoolean(attrs.showAddButton),
        };
    },
};

registry.category("fields").add("portal_properties", portalPropertiesField);
