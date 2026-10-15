import * as many2OneField from "@web/views/fields/many2one/many2one_field";
import {Many2OneField} from "@web/views/fields/many2one/many2one_field";
import {m2x_options_props} from "../../../utils.esm";
import {patch} from "@web/core/utils/patch";
import {registry} from "@web/core/registry";

const many2oneField = registry.category("fields").get("many2one");

const oldBuildM2OFieldDescription = many2OneField.buildM2OFieldDescription;
many2OneField.buildM2OFieldDescription = (component) => {
    const _super = oldBuildM2OFieldDescription(component);
    return {
        ..._super,
        extractProps(staticInfo, dynamicInfo) {
            return many2OneField.extractM2OFieldProps(staticInfo, dynamicInfo);
        },
    };
};

const oldExtractM2OFieldProps = many2OneField.extractM2OFieldProps;
many2OneField.extractM2OFieldProps = (staticInfo, dynamicInfo) => {
    // Enforce the create/create_edit/open system parameters here, on the shared
    // Many2One component, rather than only in the many2one field's extractProps.
    // Specialized widgets (e.g. sol_product_many2one on sale/purchase order lines)
    // define their own extractProps and never call m2x_options_props, so a
    // field-level override does not reach them. They all render this component,
    // so gating it here covers every many2one.
    const props = oldExtractM2OFieldProps(staticInfo, dynamicInfo);
    return {
        ...props,
        ...m2x_options_props(props, staticInfo.attrs, staticInfo.options),
    };
};

patch(many2oneField, {
    extractProps(staticInfo, dynamicInfo) {
        const props = super.extractProps(staticInfo, dynamicInfo);
        const options = staticInfo.options;
        return m2x_options_props(props, staticInfo.attrs, options);
    },
});

patch(Many2OneField.prototype, {
    get m2oProps() {
        return {
            ...super.m2oProps,
            searchLimit: this.props.searchLimit,
            fieldColor: this.props.fieldColor,
            fieldColorOptions: this.props.fieldColorOptions,
        };
    },
});
