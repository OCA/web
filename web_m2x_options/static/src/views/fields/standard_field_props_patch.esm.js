// This patch extends the standardFieldProps with additional optional properties
// to support enhanced field customization and configurability in views.
import {patch} from "@web/core/utils/patch";
import {standardFieldProps} from "@web/views/fields/standard_field_props";

// Add custom optional props to standardFieldProps
patch(standardFieldProps, {
    fieldColor: {type: String, optional: true},
    fieldColorOptions: {type: Object, optional: true},
    noSearchMore: {type: Boolean, optional: true},
    searchLimit: {type: Number, optional: true},
});
