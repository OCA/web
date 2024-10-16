/** @odoo-module **/
import {
    Many2ManyTagsField,
    Many2ManyTagsFieldColorEditable,
    many2ManyTagsField,
} from "@web/views/fields/many2many_tags/many2many_tags_field";
import {Many2OneField, many2OneField} from "@web/views/fields/many2one/many2one_field";
import {FormController} from "@web/views/form/form_controller";
import {
    KanbanMany2OneAvatarField,
    Many2OneAvatarField,
} from "@web/views/fields/many2one_avatar/many2one_avatar_field";
import {
    KanbanMany2ManyTagsAvatarField,
    Many2ManyTagsAvatarField,
} from "@web/views/fields/many2many_tags_avatar/many2many_tags_avatar_field";

import {Many2XAutocomplete} from "@web/views/fields/relational_utils";
import {evaluateBooleanExpr} from "@web/core/py_js/py";
import {isX2Many} from "@web/views/utils";
import {patch} from "@web/core/utils/patch";
import {session} from "@web/session";

const fieldColorProps = {
    fieldColor: {type: String, optional: true},
    fieldColorOptions: {type: Object, optional: true},
};

Many2OneField.props = {
    ...Many2OneField.props,
    noSearchMore: {type: Boolean, optional: true},
    ...fieldColorProps,
};
Many2XAutocomplete.props = {
    ...Many2XAutocomplete.props,
    ...fieldColorProps,
};

KanbanMany2OneAvatarField.props = {
    ...KanbanMany2OneAvatarField.props,
    ...fieldColorProps,
};

Many2OneAvatarField.props = {
    ...Many2OneAvatarField.props,
    noSearchMore: {type: Boolean, optional: true},
    ...fieldColorProps,
};

Many2ManyTagsField.props = {
    ...Many2ManyTagsField.props,
    searchLimit: {type: Number, optional: true},
    ...fieldColorProps,
};

Many2ManyTagsFieldColorEditable.props = {
    ...Many2ManyTagsFieldColorEditable.props,
    searchLimit: {type: Number, optional: true},
    ...fieldColorProps,
};

Many2ManyTagsAvatarField.props = {
    ...Many2ManyTagsAvatarField.props,
    ...fieldColorProps,
};

KanbanMany2ManyTagsAvatarField.props = {
    ...KanbanMany2ManyTagsAvatarField.props,
    ...fieldColorProps,
};

patch(many2OneField, {
    m2o_options_props_create(props, attrs, options) {
        const ir_options = session.web_m2x_options;
        if (options.create === false) {
            props.canQuickCreate = false;
        } else if (options.create) {
            props.canQuickCreate = attrs.can_create
                ? evaluateBooleanExpr(attrs.can_create)
                : true;
        } else if (
            ir_options["web_m2x_options.create"] === "False" &&
            props.canQuickCreate
        ) {
            props.canQuickCreate = false;
        } else if (
            ir_options["web_m2x_options.create"] === "True" &&
            !props.canQuickCreate
        ) {
            props.canQuickCreate = attrs.can_create
                ? evaluateBooleanExpr(attrs.can_create)
                : true;
        }
        return props;
    },

    m2o_options_props_create_edit(props, attrs, options) {
        const ir_options = session.web_m2x_options;
        if (options.create_edit === false) {
            props.canCreateEdit = false;
        } else if (options.create_edit) {
            // Same condition set in web/views/fields/many2one/many2one_field
            props.canCreateEdit = attrs.can_create
                ? evaluateBooleanExpr(attrs.can_create)
                : true;
        } else if (
            ir_options["web_m2x_options.create_edit"] === "False" &&
            props.canCreateEdit
        ) {
            props.canCreateEdit = false;
        } else if (
            ir_options["web_m2x_options.create_edit"] === "True" &&
            !props.canCreateEdit
        ) {
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
        const ir_options = session.web_m2x_options;
        if (options.search_more) {
            props.noSearchMore = false;
        } else if (options.search_more === false) {
            props.noSearchMore = true;
        } else if (
            ir_options["web_m2x_options.search_more"] === "True" &&
            props.noSearchMore
        ) {
            props.noSearchMore = false;
        } else if (ir_options["web_m2x_options.search_more"] === "False") {
            props.noSearchMore = true;
        }
        return props;
    },

    m2o_options_props_open(props, attrs, options) {
        const ir_options = session.web_m2x_options;
        if (options.open) {
            props.canOpen = true;
        } else if (options.open === false) {
            props.canOpen = false;
        } else if (ir_options["web_m2x_options.open"] === "True") {
            props.canOpen = true;
        } else if (ir_options["web_m2x_options.open"] === "False") {
            props.canOpen = false;
        }
        return props;
    },

    m2o_options_props(props, attrs, options) {
        props = this.m2o_options_props_create(props, attrs, options);
        props = this.m2o_options_props_create_edit(props, attrs, options);
        props = this.m2o_options_props_limit(props, attrs, options);
        props = this.m2o_options_props_search_more(props, attrs, options);
        props = this.m2o_options_props_open(props, attrs, options);
        props.fieldColor = options.field_color;
        props.fieldColorOptions = options.colors;
        return props;
    },
    extractProps({attrs, context, decorations, options, string}, dynamicInfo) {
        const props = super.extractProps(
            {attrs, context, decorations, options, string},
            dynamicInfo
        );
        const new_props = this.m2o_options_props(props, attrs, options);
        return new_props;
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
        const ir_options = session.web_m2x_options;
        // Create option already available for m2m fields
        if (!options.create) {
            if (
                ir_options["web_m2x_options.create"] === "False" &&
                props.canQuickCreate
            ) {
                props.canQuickCreate = false;
            } else if (
                ir_options["web_m2x_options.create"] === "True" &&
                !props.canQuickCreate
            ) {
                props.canQuickCreate = attrs.can_create
                    ? evaluateBooleanExpr(attrs.can_create)
                    : true;
            }
        }
        return props;
    },

    m2m_options_props_create_edit(props, attrs, options) {
        const ir_options = session.web_m2x_options;
        if (options.create_edit === false) {
            props.canCreateEdit = false;
        } else if (options.create_edit) {
            // Same condition set in web/views/fields/many2one/many2one_field
            props.canCreateEdit = attrs.can_create
                ? evaluateBooleanExpr(attrs.can_create)
                : true;
        } else if (
            ir_options["web_m2x_options.create_edit"] === "False" &&
            props.canCreateEdit
        ) {
            props.canCreateEdit = false;
        } else if (
            ir_options["web_m2x_options.create_edit"] === "True" &&
            !props.canCreateEdit
        ) {
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
        const ir_options = session.web_m2x_options;
        if (options.search_more) {
            props.noSearchMore = false;
        } else if (options.search_more === false) {
            props.noSearchMore = true;
        } else if (
            ir_options["web_m2x_options.search_more"] === "True" &&
            props.noSearchMore
        ) {
            props.noSearchMore = false;
        } else if (ir_options["web_m2x_options.search_more"] === "False") {
            props.noSearchMore = true;
        }
        return props;
    },

    m2m_options_props(props, attrs, options) {
        props = this.m2m_options_props_create(props, attrs, options);
        props = this.m2m_options_props_create_edit(props, attrs, options);
        props = this.m2m_options_props_limit(props, attrs, options);
        props = this.m2m_options_props_search_more(props, attrs, options);
        props.fieldColor = options.field_color;
        props.fieldColorOptions = options.colors;
        return props;
    },
    extractProps({attrs, options, string}, dynamicInfo) {
        const props = super.extractProps({attrs, options, string}, dynamicInfo);
        const new_props = this.m2m_options_props(props, attrs, options);
        return new_props;
    },
});

patch(Many2XAutocomplete.prototype, {
    setup() {
        super.setup();
        this.ir_options = session.web_m2x_options;
    },
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
