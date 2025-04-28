import {
    AvatarMany2XAutocomplete,
    Many2XAutocomplete,
} from "@web/views/fields/relational_utils";
import {Many2OneField, many2OneField} from "@web/views/fields/many2one/many2one_field";
import {FormController} from "@web/views/form/form_controller";
import {evaluateBooleanExpr} from "@web/core/py_js/py";
import {fieldColorProps} from "../views/fields/standard_field_props.esm";
import {isX2Many} from "@web/views/utils";
import {many2ManyTagsField} from "@web/views/fields/many2many_tags/many2many_tags_field";
import {patch} from "@web/core/utils/patch";
import {registry} from "@web/core/registry";
import {session} from "@web/session";

AvatarMany2XAutocomplete.props = {
    ...AvatarMany2XAutocomplete.props,
    ...fieldColorProps,
};
Many2XAutocomplete.props = {
    ...Many2XAutocomplete.props,
    ...fieldColorProps,
};

function evaluateSystemParameterDefaultTrue(option) {
    const isOptionSet = session.web_m2x_options[`web_m2x_options.${option}`];
    return isOptionSet ? evaluateBooleanExpr(isOptionSet) : true;
}

patch(many2OneField, {
    m2o_options_props_create(props, attrs, options) {
        const canQuickCreate = evaluateSystemParameterDefaultTrue("create");
        if (options.no_quick_create) {
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
    },

    m2o_options_props_create_edit(props, attrs, options) {
        const canCreateEdit = evaluateSystemParameterDefaultTrue("create_edit");
        if (options.no_create_edit) {
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
    },

    m2o_options_props_limit(props, attrs, options) {
        const ir_options = session.web_m2x_options;
        if (Number(options.limit)) {
            props.searchLimit = Number(options.limit);
        } else if (Number(ir_options["web_m2x_options.limit"])) {
            props.searchLimit = Number(ir_options["web_m2x_options.limit"]);
        }
        return props;
    },

    m2o_options_props_search_more(props, attrs, options) {
        const noSearchMore = !evaluateSystemParameterDefaultTrue("search_more");
        if (options.search_more) {
            props.noSearchMore = false;
        } else if ("search_more" in options) {
            props.noSearchMore = true;
        } else if (!noSearchMore && props.noSearchMore) {
            props.noSearchMore = false;
        } else if (noSearchMore) {
            props.noSearchMore = true;
        }
        return props;
    },

    m2o_options_props_open(props, attrs, options) {
        if (!("no_open" in options)) {
            props.canOpen = evaluateSystemParameterDefaultTrue("open");
        }
        return props;
    },

    m2o_options_props(props, attrs, options) {
        let newProps = props;
        newProps = this.m2o_options_props_create(newProps, attrs, options);
        newProps = this.m2o_options_props_create_edit(newProps, attrs, options);
        newProps = this.m2o_options_props_limit(newProps, attrs, options);
        newProps = this.m2o_options_props_search_more(newProps, attrs, options);
        newProps = this.m2o_options_props_open(newProps, attrs, options);
        newProps.fieldColor = options.field_color;
        newProps.fieldColorOptions = options.colors;
        return newProps;
    },
    extractProps({attrs, context, decorations, options, string}, dynamicInfo) {
        const props = super.extractProps(
            {attrs, context, decorations, options, string},
            dynamicInfo
        );
        return this.m2o_options_props(props, attrs, options);
    },
});

patch(Many2OneField.prototype, {
    get Many2XAutocompleteProps() {
        const search_limit = this.props.searchLimit;
        const no_search_more = this.props.noSearchMore;
        const field_color = this.props.fieldColor;
        const field_color_options = this.props.fieldColorOptions;
        const props = super.Many2XAutocompleteProps;
        const ret_props = {...props};
        if (Number(search_limit) && Number(search_limit) > 1) {
            ret_props.searchLimit = search_limit - 1;
        }
        if (no_search_more) {
            ret_props.noSearchMore = no_search_more;
        }
        if (field_color && field_color_options) {
            ret_props.fieldColor = field_color;
            ret_props.fieldColorOptions = field_color_options;
        }
        return ret_props;
    },
});

patch(many2ManyTagsField, {
    m2m_options_props_create(props, attrs, options) {
        const canQuickCreate = evaluateSystemParameterDefaultTrue("create");
        // Create option already available for m2m fields
        if (!options.no_quick_create) {
            if (!canQuickCreate && props.canQuickCreate) {
                props.canQuickCreate = false;
            } else if (canQuickCreate && !props.canQuickCreate) {
                props.canQuickCreate = attrs.can_create
                    ? evaluateBooleanExpr(attrs.can_create)
                    : true;
            }
        }
        return props;
    },

    m2m_options_props_create_edit(props, attrs, options) {
        const canCreateEdit = evaluateSystemParameterDefaultTrue("create_edit");
        if (options.no_create_edit) {
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
    },

    m2m_options_props_limit(props, attrs, options) {
        const ir_options = session.web_m2x_options;
        if (Number(options.limit) && options.limit > 1) {
            props.searchLimit = Number(options.limit) - 1;
        } else if (
            Number(ir_options["web_m2x_options.limit"]) &&
            ir_options["web_m2x_options.limit"] > 1
        ) {
            props.searchLimit = Number(ir_options["web_m2x_options.limit"]) - 1;
        }
        return props;
    },

    m2m_options_props_search_more(props, attrs, options) {
        const noSearchMore = !evaluateSystemParameterDefaultTrue("search_more");
        if (options.search_more) {
            props.noSearchMore = false;
        } else if ("search_more" in options) {
            props.noSearchMore = true;
        } else if (!noSearchMore && props.noSearchMore) {
            props.noSearchMore = false;
        } else if (noSearchMore) {
            props.noSearchMore = true;
        }
        return props;
    },

    m2m_options_props(props, attrs, options) {
        let newProps = props;
        newProps = this.m2m_options_props_create(newProps, attrs, options);
        newProps = this.m2m_options_props_create_edit(newProps, attrs, options);
        newProps = this.m2m_options_props_limit(newProps, attrs, options);
        newProps = this.m2m_options_props_search_more(newProps, attrs, options);
        newProps.fieldColor = options.field_color;
        newProps.fieldColorOptions = options.colors;
        return newProps;
    },
    extractProps({attrs, options, string}, dynamicInfo) {
        const props = super.extractProps({attrs, options, string}, dynamicInfo);
        return this.m2m_options_props(props, attrs, options);
    },
});

patch(Many2XAutocomplete.prototype, {
    async loadOptionsSource(request) {
        var options = await super.loadOptionsSource(request);
        this.field_color = this.props.fieldColor;
        this.colors = this.props.fieldColorOptions;
        if (this.colors && this.field_color) {
            var value_ids = options.map((result) => result.value);
            const objects = await this.orm.call(
                this.props.resModel,
                "search_read",
                [],
                {
                    domain: [["id", "in", value_ids]],
                    fields: [this.field_color],
                }
            );
            for (var index in objects) {
                for (var index_value in options) {
                    if (options[index_value].value === objects[index].id) {
                        // Find value in values by comparing ids
                        var option = options[index_value];
                        // Find color with field value as key
                        var color =
                            this.colors[objects[index][this.field_color]] || "black";
                        option.style = "color:" + color;
                        break;
                    }
                }
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
        const activeFields = this.archInfo.fieldNodes,
            isSmall = this.user;

        var limit = ir_options["web_m2x_options.field_limit_entries"];
        if (!(typeof limit === "undefined")) {
            limit = parseInt(limit, 10);
        }
        for (const fieldName in activeFields) {
            const field = activeFields[fieldName];
            if (!isX2Many(field)) {
                // What follows only concerns x2many fields
                continue;
            }
            // Const fieldInfo = activeFields[fieldName];
            if (field.invisible) {
                // No need to fetch the sub view if the field is always invisible
                continue;
            }

            if (!field.field.useSubView) {
                // The FieldComponent used to render the field doesn't need a sub view
                continue;
            }
            let viewType = field.viewMode || "list,kanban";
            viewType = viewType.replace("tree", "list");
            if (viewType.includes(",")) {
                viewType = isSmall ? "kanban" : "list";
            }
            field.viewMode = viewType;
            if (field.views && field.views[viewType] && limit) {
                field.views[viewType].limit = limit;
            }
        }
    },
});

// O.W.L. v18+: schema is validated in dev mode on adding to registry
patch(registry.category("fields").validationSchema, {
    m2o_options_props_create: {type: Function, optional: true},
    m2o_options_props_create_edit: {type: Function, optional: true},
    m2o_options_props_limit: {type: Function, optional: true},
    m2o_options_props_search_more: {type: Function, optional: true},
    m2o_options_props_open: {type: Function, optional: true},
    m2o_options_props: {type: Function, optional: true},
    m2m_options_props_create: {type: Function, optional: true},
    m2m_options_props_create_edit: {type: Function, optional: true},
    m2m_options_props_limit: {type: Function, optional: true},
    m2m_options_props_search_more: {type: Function, optional: true},
    m2m_options_props: {type: Function, optional: true},
});
