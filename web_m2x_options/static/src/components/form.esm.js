import * as many2OneField from "@web/views/fields/many2one/many2one_field";
import * as many2one from "@web/views/fields/many2one/many2one";
import {FormController} from "@web/views/form/form_controller";
import {Many2One, many2OneProps} from "@web/views/fields/many2one/many2one";
import {Many2OneField} from "@web/views/fields/many2one/many2one_field";
import {
    Many2XAutocomplete,
    many2XAutocompleteProps,
} from "@web/views/fields/relational_utils";
import {evaluateBooleanExpr} from "@web/core/py_js/py";
import {fieldColorProps} from "../views/fields/standard_field_props.esm";
import {isX2Many} from "@web/views/utils";
import {
    many2ManyTagsField,
    many2ManyTagsFieldProps,
} from "@web/views/fields/many2many_tags/many2many_tags_field";
import {patch} from "@web/core/utils/patch";
import {registry} from "@web/core/registry";
import {session} from "@web/session";
import {t} from "@odoo/owl";

const many2oneField = registry.category("fields").get("many2one");

patch(many2XAutocompleteProps, {
    ...fieldColorProps,
});

patch(many2OneProps, {
    ...fieldColorProps,
    searchLimit: t.number().optional(),
});

function evaluateSystemParameterDefaultTrue(option) {
    const isOptionSet = session.web_m2x_options?.[`web_m2x_options.${option}`];
    return isOptionSet ? evaluateBooleanExpr(isOptionSet) : true;
}

export function m2x_options_props_create(props, attrs, options) {
    const canQuickCreate = evaluateSystemParameterDefaultTrue("create");
    if (options.no_create || options.no_quick_create) {
        props.canQuickCreate = false;
    } else if ("no_quick_create" in options) {
        props.canQuickCreate = attrs.can_create
            ? evaluateBooleanExpr(attrs.can_create)
            : true;
    } else if (!canQuickCreate && props.canQuickCreate) {
        props.canQuickCreate = false;
    } else if (canQuickCreate && !props.canQuickCreate) {
        props.canQuickCreate = attrs.can_create
            ? evaluateBooleanExpr(attrs.can_create)
            : true;
    }
    return props;
}

export function m2x_options_props_create_edit(props, attrs, options) {
    const canCreateEdit = evaluateSystemParameterDefaultTrue("create_edit");
    if (options.no_create || options.no_create_edit) {
        props.canCreateEdit = false;
    } else if ("no_create_edit" in options) {
        // Same condition set in web/views/fields/many2one/many2one_field
        props.canCreateEdit = attrs.can_create
            ? evaluateBooleanExpr(attrs.can_create)
            : true;
    } else if (!canCreateEdit && props.canCreateEdit) {
        props.canCreateEdit = false;
    } else if (canCreateEdit && !props.canCreateEdit) {
        // Same condition set in web/views/fields/many2one/many2one_field
        props.canCreateEdit = attrs.can_create
            ? evaluateBooleanExpr(attrs.can_create)
            : true;
    }
    return props;
}

export function m2x_options_props_limit(props, attrs, options) {
    const ir_options = session.web_m2x_options;
    if (Number(options.limit)) {
        props.searchLimit = Number(options.limit);
    } else if (Number(ir_options["web_m2x_options.limit"])) {
        props.searchLimit = Number(ir_options["web_m2x_options.limit"]);
    }
    props.searchLimit = Math.max(props.searchLimit - 1, 0);
    return props;
}

export function m2x_options_props_open(props, attrs, options) {
    if (!("no_open" in options)) {
        props.canOpen = evaluateSystemParameterDefaultTrue("open");
    }
    return props;
}

export function m2x_options_props(props, attrs, options) {
    let newProps = props;
    newProps = m2x_options_props_create(newProps, attrs, options);
    newProps = m2x_options_props_create_edit(newProps, attrs, options);
    newProps = m2x_options_props_limit(newProps, attrs, options);
    newProps = m2x_options_props_open(newProps, attrs, options);
    newProps.fieldColor = options.field_color;
    newProps.fieldColorOptions = options.colors;
    return newProps;
}

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

const oldcomputeM2OProps = many2one.computeM2OProps;
many2one.computeM2OProps = (fieldProps) => {
    const _super = oldcomputeM2OProps(fieldProps);
    return {
        ..._super,
        searchLimit: fieldProps.searchLimit,
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

patch(Many2XAutocomplete.prototype, {
    async loadOptionsSource(request) {
        const options = await super.loadOptionsSource(request);
        const {fieldColor, fieldColorOptions, resModel} = this.props;
        if (!fieldColor || !fieldColorOptions || !options.length) {
            return options;
        }
        const recordOptions = options.filter((option) => option.data?.record?.id);
        const valueIds = recordOptions.map((option) => option.data.record.id);
        if (!valueIds.length) {
            return options;
        }
        const records = await this.orm.call(resModel, "search_read", [], {
            domain: [["id", "in", valueIds]],
            fields: [fieldColor],
        });
        const valuesById = new Map(
            records.map((record) => [record.id, record[fieldColor]])
        );
        for (const option of recordOptions) {
            const fieldValue = valuesById.get(option.data.record.id);
            if (fieldValue !== undefined) {
                option.style = `color:${fieldColorOptions[fieldValue] || "black"}`;
            }
        }
        return options;
    },
});

patch(FormController.prototype, {
    /**
     * @override
     */
    setup() {
        super.setup(...arguments);
        this._setSubViewLimit();
    },
    /**
     * @override
     * add more method to add subview limit on formview
     */
    async _setSubViewLimit() {
        const ir_options = session.web_m2x_options || {};
        const activeFields = this.archInfo.fieldNodes;
        const limit = parseInt(ir_options["web_m2x_options.field_limit_entries"], 10);
        if (!Number.isFinite(limit) || limit <= 0) {
            return;
        }
        for (const fieldName in activeFields) {
            const field = activeFields[fieldName];
            if (!isX2Many(field)) {
                // What follows only concerns x2many fields
                continue;
            }
            if (field.invisible === "True" || field.invisible === "1") {
                // No need to fetch the sub view if the field is always invisible
                continue;
            }

            if (!field.field.useSubView) {
                // The FieldComponent used to render the field doesn't need a sub view
                continue;
            }
            let viewType = field.viewMode || "list,kanban";
            if (viewType.includes(",")) {
                viewType = this.ui.isSmall ? "kanban" : "list";
            }
            field.viewMode = viewType;
            if (field.views?.[viewType]) {
                field.views[viewType].limit = limit;
            }
        }
    },
});
