import * as many2one from "@web/views/fields/many2one/many2one";
import {Many2One, many2OneProps} from "@web/views/fields/many2one/many2one";
import {evaluateSystemParameterDefaultTrue} from "../../../utils.esm";
import {fieldColorProps} from "../standard_field_props.esm";
import {patch} from "@web/core/utils/patch";
import {t} from "@odoo/owl";

patch(many2OneProps, {
    ...fieldColorProps,
    searchLimit: t.number().optional(),
});

const oldcomputeM2OProps = many2one.computeM2OProps;
many2one.computeM2OProps = (fieldProps) => {
    const _super = oldcomputeM2OProps(fieldProps);
    return {
        ..._super,
        searchLimit: fieldProps.searchLimit,
    };
};

patch(Many2One.prototype, {
    get activeActions() {
        const actions = super.activeActions;
        if (!evaluateSystemParameterDefaultTrue("create_edit")) {
            actions.createEdit = false;
        }
        return actions;
    },
    get hasLinkButton() {
        if (!evaluateSystemParameterDefaultTrue("open")) {
            return false;
        }
        return super.hasLinkButton;
    },
    get many2XAutocompleteProps() {
        const props = {...super.many2XAutocompleteProps};
        props.searchLimit = this.props.searchLimit;
        props.fieldColor = this.props.fieldColor;
        props.fieldColorOptions = this.props.fieldColorOptions;
        if (!evaluateSystemParameterDefaultTrue("create") && !this.props.quickCreate) {
            props.quickCreate = null;
        }
        return props;
    },
});
