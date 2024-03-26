/** @odoo-module **/

import {FieldTooltip} from "../../components/field_tooltip/field_tooltip.esm";

import {ListRenderer} from "@web/views/list/list_renderer";
import {patch} from "@web/core/utils/patch";

import {session} from "@web/session";

patch(ListRenderer.prototype, "web_field_tooltip", {
    showTooltipAddHelper() {
        return session.tooltip_show_add_helper;
    },

    hasFieldTooltip(column) {
        const fieldName = column.name;
        const fields = this.props.list.fields;
        return Boolean(fields[fieldName].field_tooltip);
    },

    getFieldTooltipProps(column) {
        const props = this.props;
        const fieldName = column.name;
        const fields = props.list.fields;
        return {
            hasFieldTooltip: this.hasFieldTooltip(column),
            resModel: props.list.resModel,
            field: fields[fieldName],
            fieldName: fieldName,
        };
    },
});

ListRenderer.components = Object.assign({}, ListRenderer.components, {
    FieldTooltip,
});
