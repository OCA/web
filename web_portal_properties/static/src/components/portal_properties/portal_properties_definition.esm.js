/** @odoo-module **/
import {PropertyDefinition} from "@web/views/fields/properties/property_definition";

export class PortalPropertyDefinition extends PropertyDefinition {
    onViewInPortalChange(newValue) {
        const propertyDefinition = {
            ...this.state.propertyDefinition,
            view_in_portal: newValue,
        };
        this.props.onChange(propertyDefinition);
        this.state.propertyDefinition = propertyDefinition;
    }
}

PortalPropertyDefinition.template = "web_portal_properties.PortalPropertyDefinition";
