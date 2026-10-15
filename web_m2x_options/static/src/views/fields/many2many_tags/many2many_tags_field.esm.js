import {
    many2ManyTagsField,
    many2ManyTagsFieldProps,
} from "@web/views/fields/many2many_tags/many2many_tags_field";
import {m2x_options_props} from "../../../utils.esm";
import {patch} from "@web/core/utils/patch";
import {t} from "@odoo/owl";

patch(many2ManyTagsFieldProps, {
    searchLimit: t.number().optional(),
});
patch(many2ManyTagsField, {
    extractProps(staticInfo, dynamicInfo) {
        const props = super.extractProps(staticInfo, dynamicInfo);
        const options = staticInfo.options;
        return m2x_options_props(props, staticInfo.attrs, options);
    },
});
