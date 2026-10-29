import {patch} from "@web/core/utils/patch";
import {standardFieldProps} from "@web/views/fields/standard_field_props";

export const fieldColorProps = {
    fieldColor: {type: String, optional: true},
    fieldColorOptions: {type: Object, optional: true},
    fieldColorStyle: {type: String, optional: true},
};

export const fieldIconProps = {
    fieldIcon: {type: String, optional: true},
    fieldIconOptions: {type: Object, optional: true},
};

patch(standardFieldProps, {
    ...fieldColorProps,
    ...fieldIconProps,
    searchLimit: {type: Number, optional: true},
});
