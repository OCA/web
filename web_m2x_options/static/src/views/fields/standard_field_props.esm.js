import {patch} from "@web/core/utils/patch";
import {standardFieldProps} from "@web/views/fields/standard_field_props";

export const fieldColorProps = {
    fieldColor: {type: String, optional: true},
    fieldColorOptions: {type: Object, optional: true},
};

// Set when the field defines its own create/create_edit options, so the
// Many2One component does not apply the system parameters over them
export const m2xOverrideProps = {
    m2xCreateOverride: {type: Boolean, optional: true},
    m2xCreateEditOverride: {type: Boolean, optional: true},
};

patch(standardFieldProps, {
    ...fieldColorProps,
    ...m2xOverrideProps,
    searchLimit: {type: Number, optional: true},
});
