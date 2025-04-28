import {patch} from "@web/core/utils/patch";
import {standardFieldProps} from "@web/views/fields/standard_field_props";

export const fieldColorProps = {
    fieldColor: {type: String, optional: true},
    fieldColorOptions: {type: Object, optional: true},
};

patch(standardFieldProps, {
    ...fieldColorProps,
    noSearchMore: {type: Boolean, optional: true},
    searchLimit: {type: Number, optional: true},
});
