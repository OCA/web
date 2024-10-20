/** @odoo-module */

import {onWillStart, onWillUpdateProps} from "@odoo/owl";

import {Many2OneField} from "@web/views/fields/many2one/many2one_field";
import {Many2XAutocompleteColored} from "./many2x_autocomplete_colored.esm";
import {registry} from "@web/core/registry";
import {useService} from "@web/core/utils/hooks";

const DEFAULT_COLOR_FIELD = "color";
const COLOR_FIELD_OPTION_NAME = "color_field";
const NO_COLOR = 0;

function resIDFromProps(props) {
    if (!props.value) {
        return null;
    }
    return props.value[0];
}

export class Many2OneColoredField extends Many2OneField {
    setup() {
        super.setup();
        this.orm = useService("orm");
        this._colorField = this.props.colorField || DEFAULT_COLOR_FIELD;
        this._color = NO_COLOR;
        this._currentID = null;

        onWillStart(() => {
            return this.loadColor(resIDFromProps(this.props));
        });

        onWillUpdateProps((nextProps) => {
            return this.loadColor(resIDFromProps(nextProps));
        });
    }

    get Many2XAutocompleteProps() {
        const props = super.Many2XAutocompleteProps;
        Object.assign(props, {
            colorField: this._colorField,
            color: this._color,
        });
        return props;
    }

    async loadColor(resID) {
        if (resID === this._currentID) {
            return;
        }
        this._currentID = resID;
        if (resID === null) {
            this._color = NO_COLOR;
            return;
        }
        const records = await this.orm.read(this.relation, [resID], [this._colorField]);
        this._color = records[0][this._colorField];
    }

    get color() {
        return this._color;
    }
}

Many2OneColoredField.template = "web_widget_many2one_colored.Many2OneColoredField";
Many2OneColoredField.components = {
    Many2XAutocompleteColored,
};
// This needs to be dynamic, because other modules like web_m2x_options modify
// Many2OneField.props after this.
Object.defineProperty(Many2OneColoredField, "props", {
    get: () => {
        return {
            ...Many2OneField.props,
            colorField: {type: String, optional: true},
        };
    },
});
Many2OneColoredField.extractProps = ({attrs, field}) => {
    return {
        ...Many2OneField.extractProps({attrs, field}),
        colorField: attrs.options[COLOR_FIELD_OPTION_NAME],
    };
};

registry.category("fields").add("many2one_colored", Many2OneColoredField);
