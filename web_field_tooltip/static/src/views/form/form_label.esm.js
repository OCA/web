/** @odoo-module **/

import {FieldTooltip} from "../../components/field_tooltip/field_tooltip.esm";

import {FormLabel} from "@web/views/form/form_label";
import {patch} from "@web/core/utils/patch";

import {session} from "@web/session";

patch(FormLabel.prototype, "web_field_tooltip", {
    get showTooltipAddHelper() {
        return session.tooltip_show_add_helper;
    },

    get hasFieldTooltip() {
        const props = this.props;
        return Boolean(props.record.fields[props.fieldName].field_tooltip);
    },

    get getFieldTooltipProps() {
        const props = this.props;
        const record = props.record;
        return {
            hasFieldTooltip: this.hasFieldTooltip,
            resModel: record.resModel,
            field: record.fields[props.fieldName],
            fieldName: props.fieldName,
        };
    },
});

FormLabel.components = Object.assign({}, FormLabel.components, {
    FieldTooltip,
});
