import {patch} from "@web/core/utils/patch";
import {standardFieldProps} from "@web/views/fields/standard_field_props";
import {t} from "@odoo/owl";

export const fieldColorProps = {
    fieldColor: t.string().optional(),
    fieldColorOptions: t.object().optional(),
};

patch(standardFieldProps, {
    ...fieldColorProps,
    searchLimit: t.number().optional(),
});
