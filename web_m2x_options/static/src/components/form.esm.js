import {
    KanbanMany2OneAvatarField,
    Many2OneAvatarField,
} from "@web/views/fields/many2one_avatar/many2one_avatar_field";
import {
    ListMany2ManyTagsAvatarField,
    Many2ManyTagsAvatarField,
} from "@web/views/fields/many2many_tags_avatar/many2many_tags_avatar_field";
import {
    Many2ManyTagsField,
    Many2ManyTagsFieldColorEditable,
    many2ManyTagsField,
} from "@web/views/fields/many2many_tags/many2many_tags_field";
import {Many2OneField, many2OneField} from "@web/views/fields/many2one/many2one_field";
import {FormController} from "@web/views/form/form_controller";
import {Many2OneBarcodeField} from "@web/views/fields/many2one_barcode/many2one_barcode_field";

import {Many2XAutocomplete} from "@web/views/fields/relational_utils";
import {evaluateBooleanExpr} from "@web/core/py_js/py";
import {isX2Many} from "@web/views/utils";
import {patch} from "@web/core/utils/patch";
import {session} from "@web/session";

Many2OneField.props = {
    ...Many2OneField.props,
    noSearchMore: {type: Boolean, optional: true},
    fieldColor: {type: String, optional: true},
    fieldColorOptions: {type: Object, optional: true},
};

Many2XAutocomplete.props = {
    ...Many2XAutocomplete.props,
    fieldColor: {type: String, optional: true},
    fieldColorOptions: {type: Object, optional: true},
};

KanbanMany2OneAvatarField.props = {
    ...KanbanMany2OneAvatarField.props,
    fieldColor: {type: String, optional: true},
    fieldColorOptions: {type: Object, optional: true},
};

Many2OneAvatarField.props = {
    ...Many2OneAvatarField.props,
    noSearchMore: {type: Boolean, optional: true},
    fieldColor: {type: String, optional: true},
    fieldColorOptions: {type: Object, optional: true},
};

Many2OneBarcodeField.props = {
    ...Many2OneBarcodeField.props,
    noSearchMore: {type: Boolean, optional: true},
    fieldColor: {type: String, optional: true},
    fieldColorOptions: {type: Object, optional: true},
};

Many2ManyTagsField.props = {
    ...Many2ManyTagsField.props,
    searchLimit: {type: Number, optional: true},
    fieldColor: {type: String, optional: true},
    fieldColorOptions: {type: Object, optional: true},
};

Many2ManyTagsFieldColorEditable.props = {
    ...Many2ManyTagsFieldColorEditable.props,
    searchLimit: {type: Number, optional: true},
    fieldColor: {type: String, optional: true},
    fieldColorOptions: {type: Object, optional: true},
};

ListMany2ManyTagsAvatarField.props = {
    ...ListMany2ManyTagsAvatarField.props,
    fieldColor: {type: String, optional: true},
    fieldColorOptions: {type: Object, optional: true},
};

Many2ManyTagsAvatarField.props = {
    ...Many2ManyTagsAvatarField.props,
    fieldColor: {type: String, optional: true},
    fieldColorOptions: {type: Object, optional: true},
};

patch(many2OneField, {
    m2oOptionsPropsCreate(props, attrs, options) {
        const irOptionsCreate = session.web_m2x_options["web_m2x_options.create"];

        if (options.create === false || irOptionsCreate === "False") {
            props.canQuickCreate = false;
        } else {
            props.canQuickCreate = attrs.can_create
                ? evaluateBooleanExpr(attrs.can_create)
                : true;
        }

        return props;
    },

    m2oOptionsPropsCreateEdit(props, attrs, options) {
        const irOptionsCreateEdit =
            session.web_m2x_options["web_m2x_options.create_edit"];

        if (options.create_edit === false || irOptionsCreateEdit === "False") {
            props.canCreateEdit = false;
        } else {
            props.canCreateEdit = attrs.can_create
                ? evaluateBooleanExpr(attrs.can_create)
                : true;
        }

        return props;
    },

    m2oOptionsPropsLimit(props, attrs, options) {
        const optionsLimit = Number(options.limit);
        const irOptionsLimit = Number(session.web_m2x_options["web_m2x_options.limit"]);

        props.searchLimit = optionsLimit || irOptionsLimit || props.searchLimit;

        return props;
    },

    m2oOptionsPropsSearchMore(props, attrs, options) {
        const irOptionsSearchMore =
            session.web_m2x_options["web_m2x_options.search_more"];

        if (options.search_more === false || irOptionsSearchMore === "False") {
            props.noSearchMore = true;
        } else if (options.search_more || irOptionsSearchMore === "True") {
            props.noSearchMore = false;
        }

        return props;
    },

    m2oOptionsPropsOpen(props, attrs, options) {
        const irOptionsOpen = session.web_m2x_options["web_m2x_options.open"];

        if (options.open === false || irOptionsOpen === "False") {
            props.canOpen = false;
        } else if (options.open || irOptionsOpen === "True") {
            props.canOpen = true;
        }

        return props;
    },

    m2oOptionsProps(props, attrs, options) {
        const updatedProps = {
            ...props,
            ...this.m2oOptionsPropsCreate(props, attrs, options),
            ...this.m2oOptionsPropsCreateEdit(props, attrs, options),
            ...this.m2oOptionsPropsLimit(props, attrs, options),
            ...this.m2oOptionsPropsSearchMore(props, attrs, options),
            ...this.m2oOptionsPropsOpen(props, attrs, options),
            fieldColor: options.field_color,
            fieldColorOptions: options.colors,
        };

        return updatedProps;
    },

    extractProps({attrs, context, decorations, options, string}, dynamicInfo) {
        const props = super.extractProps(
            {attrs, context, decorations, options, string},
            dynamicInfo
        );
        return this.m2oOptionsProps(props, attrs, options);
    },
});

patch(Many2OneField.prototype, {
    get Many2XAutocompleteProps() {
        const {searchLimit, noSearchMore, fieldColor, fieldColorOptions} = this.props;
        const props = super.Many2XAutocompleteProps;
        const retProps = {...props};

        if (Number(searchLimit) > 1) {
            retProps.searchLimit = Number(searchLimit) - 1;
        }

        if (noSearchMore) {
            retProps.noSearchMore = noSearchMore;
        }

        if (fieldColor && fieldColorOptions) {
            retProps.fieldColor = fieldColor;
            retProps.fieldColorOptions = fieldColorOptions;
        }

        return retProps;
    },
});

patch(many2ManyTagsField, {
    m2mOptionsPropsCreate(props, attrs, options) {
        const irOptionsCreate = session.web_m2x_options["web_m2x_options.create"];

        if (!options.create) {
            if (irOptionsCreate === "False" && props.canQuickCreate) {
                props.canQuickCreate = false;
            } else if (irOptionsCreate === "True" && !props.canQuickCreate) {
                props.canQuickCreate = attrs.can_create
                    ? evaluateBooleanExpr(attrs.can_create)
                    : true;
            }
        }

        return props;
    },

    m2mOptionsPropsCreateEdit(props, attrs, options) {
        const irOptionsCreateEdit =
            session.web_m2x_options["web_m2x_options.create_edit"];

        if (options.create_edit === false || irOptionsCreateEdit === "False") {
            props.canCreateEdit = false;
        } else if (options.create_edit || irOptionsCreateEdit === "True") {
            props.canCreateEdit = attrs.can_create
                ? evaluateBooleanExpr(attrs.can_create)
                : true;
        }

        return props;
    },

    m2mOptionsPropsLimit(props, attrs, options) {
        const optionLimit = Number(options.limit);
        const irOptionLimit = Number(session.web_m2x_options["web_m2x_options.limit"]);

        if (optionLimit > 1) {
            props.searchLimit = optionLimit - 1;
        } else if (irOptionLimit > 1) {
            props.searchLimit = irOptionLimit - 1;
        }

        return props;
    },

    m2mOptionsPropsSearchMore(props, attrs, options) {
        const irOptionsSearchMore =
            session.web_m2x_options["web_m2x_options.search_more"];

        if (options.search_more === false || irOptionsSearchMore === "False") {
            props.noSearchMore = true;
        } else if (options.search_more || irOptionsSearchMore === "True") {
            props.noSearchMore = false;
        }

        return props;
    },

    m2mOptionsProps(props, attrs, options) {
        const updatedProps = {
            ...props,
            ...this.m2mOptionsPropsCreate(props, attrs, options),
            ...this.m2mOptionsPropsCreateEdit(props, attrs, options),
            ...this.m2mOptionsPropsLimit(props, attrs, options),
            ...this.m2mOptionsPropsSearchMore(props, attrs, options),
            fieldColor: options.field_color,
            fieldColorOptions: options.colors,
        };

        return updatedProps;
    },

    extractProps({attrs, options, string}, dynamicInfo) {
        const props = super.extractProps({attrs, options, string}, dynamicInfo);
        const new_props = this.m2mOptionsProps(props, attrs, options);
        return new_props;
    },
});

patch(Many2XAutocomplete.prototype, {
    async loadOptionsSource(request) {
        const options = await super.loadOptionsSource(request);
        const {fieldColor, fieldColorOptions: colors, resModel} = this.props;

        if (fieldColor && colors) {
            const valueIds = options.map((result) => result.value);

            const objects = await this.orm.searchRead(
                resModel,
                [["id", "in", valueIds]],
                [fieldColor]
            );

            const objectMap = objects.reduce((map, obj) => {
                map[obj.id] = obj[fieldColor];
                return map;
            }, {});

            options.forEach((option) => {
                const colorKey = objectMap[option.value];
                if (colorKey) {
                    const color = colors[colorKey] || "black";
                    option.style = `color:${color}`;
                }
            });
        }
        return options;
    },
});

patch(FormController.prototype, {
    /**
     * @override
     */
    setup() {
        super.setup();
        this._setSubViewLimit();
    },
    /**
     * @override
     * add more method to add subview limit on formview
     */
    async _setSubViewLimit() {
        const irOptions = session.web_m2x_options || {};
        const {fieldNodes: activeFields} = this.archInfo;

        const limit = parseInt(irOptions["web_m2x_options.field_limit_entries"], 10);

        for (const fieldName in activeFields) {
            const field = activeFields[fieldName];

            if (!isX2Many(field) || field.invisible || !field.field.useSubView) {
                // Skip non-x2many fields, invisible fields, or fields not using sub view
                continue;
            }

            let viewType = (field.viewMode || "list,kanban").replace("tree", "list");
            if (viewType.includes(",")) {
                viewType = this.user ? "kanban" : "list";
            }

            field.viewMode = viewType;

            if (field.views?.[viewType] && limit) {
                field.views[viewType].limit = limit;
            }
        }
    },
});
