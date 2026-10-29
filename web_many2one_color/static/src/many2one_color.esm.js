// Copyright 2026 glueckkanja AG
// License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

import {KanbanMany2One, Many2One} from "@web/views/fields/many2one/many2one";
import {Field} from "@web/views/fields/field";
import {KanbanCompiler} from "@web/views/kanban/kanban_compiler";
import {KanbanRecord} from "@web/views/kanban/kanban_record";
import {ListRenderer} from "@web/views/list/list_renderer";
import {Many2OneField} from "@web/views/fields/many2one/many2one_field";
import {Many2XAutocomplete} from "@web/views/fields/relational_utils";
import {patch} from "@web/core/utils/patch";
import {registry} from "@web/core/registry";
import {session} from "@web/session";
import {toRaw} from "@odoo/owl";

export const COLOR_FIELD = "many2one_color";
export const MESSAGE_FIELD = "many2one_color_message";
export const COLOR_CLASSES = {warning: "text-warning", critical: "text-danger"};
export const COLOR_SPEC = {[COLOR_FIELD]: {}, [MESSAGE_FIELD]: {}};
const RELATED_FIELDS = [
    {name: COLOR_FIELD, type: "selection", readonly: true},
    {name: MESSAGE_FIELD, type: "text", readonly: true},
];

/**
 * @param {String} resModel
 * @returns {Boolean} whether the model provides the color state fields
 */
export function isColorModel(resModel) {
    return (session.many2one_color_models || []).includes(resModel);
}

/**
 * @param {Object|false} value a many2one value or a record read from the server
 * @returns {String} the bootstrap text class for the record's color state
 */
export function colorClass(value) {
    return (value && COLOR_CLASSES[value[COLOR_FIELD]]) || "";
}

// 1. Ask for the color fields with every many2one pointing to a color model.
// The related fields end up in the web_read / web_search_read / onchange
// specification, so the color state travels with the many2one value.
const superParseFieldNode = Field.parseFieldNode;
Field.parseFieldNode = function (node, models, modelName) {
    const fieldInfo = superParseFieldNode.apply(this, arguments);
    const field = models[modelName]?.fields?.[fieldInfo.name];
    if (field?.type === "many2one" && isColorModel(field.relation)) {
        // The active fields of every node of a field are merged by the model,
        // which expects all of them to provide the same structure: nodes with
        // the `no_color` option get an empty related view instead of none.
        const related = fieldInfo.options?.no_color
            ? {}
            : Object.fromEntries(RELATED_FIELDS.map((f) => [f.name, f]));
        const current = fieldInfo.views?.default || {fieldNodes: {}, fields: {}};
        fieldInfo.viewMode = "default";
        fieldInfo.views = {
            ...fieldInfo.views,
            default: {
                fieldNodes: {...current.fieldNodes, ...related},
                fields: {...current.fields, ...related},
            },
        };
    }
    return fieldInfo;
};

// 2. Pass the `no_color` option of each field node to the field component.
// The active fields of a record are shared by every node of the same field,
// so the option can not be read from them: when a field is shown twice and
// only one node opts out, the color data is still requested for the other.
const noColorProp = {noColor: {type: Boolean, optional: true}};
Many2OneField.props = {...Many2OneField.props, ...noColorProp};

const fieldRegistry = registry.category("fields");
const patchedFieldDescriptions = new WeakSet();

/**
 * Extend a field registry entry rendering a Many2OneField so that its
 * component accepts the `noColor` prop and extracts it from the field node.
 *
 * @param {Object} fieldDescription a field registry entry
 */
function addNoColorProp(fieldDescription) {
    const component = fieldDescription?.component;
    if (
        patchedFieldDescriptions.has(fieldDescription) ||
        !component ||
        !(component === Many2OneField || component.prototype instanceof Many2OneField)
    ) {
        return;
    }
    patchedFieldDescriptions.add(fieldDescription);
    // Widgets snapshot Many2OneField.props at load time, so extend the copies too.
    const {props} = component;
    if (Array.isArray(props)) {
        if (!props.includes("*") && !props.includes("noColor?")) {
            component.props = [...props, "noColor?"];
        }
    } else if (props && !("noColor" in props)) {
        component.props = {...props, ...noColorProp};
    }
    const superExtractProps = fieldDescription.extractProps;
    if (superExtractProps) {
        fieldDescription.extractProps = (staticInfo, dynamicInfo) => ({
            ...superExtractProps(staticInfo, dynamicInfo),
            noColor: Boolean(staticInfo.options?.no_color),
        });
    }
}

fieldRegistry.getAll().forEach(addNoColorProp);
fieldRegistry.addEventListener("UPDATE", ({detail}) => {
    if (detail.operation === "add") {
        addNoColorProp(detail.value);
    }
});

// 3. Optional prop telling the Many2One component whether coloring is active.
// Components snapshot Many2One.props at load time, so extend the copies too.
const colorStateProp = {colorState: {type: Boolean, optional: true}};
Many2One.props = {...Many2One.props, ...colorStateProp};
KanbanMany2One.props = {...KanbanMany2One.props, ...colorStateProp};

patch(Many2OneField.prototype, {
    get m2oProps() {
        const props = super.m2oProps;
        const {record, name} = this.props;
        if (!isColorModel(record.fields[name].relation)) {
            return props;
        }
        // The `no_color` option of this node disables the feature. The shared
        // active fields only tell whether the color data is requested at all.
        const enabled =
            !this.props.noColor &&
            Boolean(record.activeFields[name]?.related?.activeFields?.[COLOR_FIELD]);
        props.colorState = enabled;
        if (!enabled) {
            return props;
        }
        const superUpdate = props.update;
        props.update = async (value, options) => {
            const current = toRaw(record.data[name]);
            let newValue = value;
            if (
                value &&
                value.id &&
                COLOR_FIELD in value &&
                current?.id === value.id &&
                current.display_name === value.display_name
            ) {
                record.data[name] = {...current, ...value};
                return undefined;
            }
            if (
                value &&
                value.id &&
                !(COLOR_FIELD in value) &&
                current?.id === value.id
            ) {
                // Same record without color data (e.g. saved in the edit dialog):
                // Record._update would drop a change with the same id and
                // display name, so refresh the value ourselves.
                const [fresh] = await record.model.orm.webRead(
                    record.fields[name].relation,
                    [value.id],
                    {
                        specification: {display_name: {}, ...COLOR_SPEC},
                        context: props.context,
                    }
                );
                if (toRaw(record.data[name]) !== current) {
                    return undefined;
                }
                if (!fresh) {
                    return superUpdate(value, options);
                }
                if (fresh.display_name === current.display_name) {
                    record.data[name] = fresh;
                    return undefined;
                }
                newValue = fresh;
            }
            return superUpdate(newValue, options);
        };
        return props;
    },
});

// 4. Shared behaviour of every widget rendering the Many2One component.
patch(Many2One.prototype, {
    get colorStateEnabled() {
        return this.props.colorState ?? isColorModel(this.props.relation);
    },
    get colorStateClass() {
        return this.colorStateEnabled ? colorClass(this.props.value) : "";
    },
    get colorStateTooltip() {
        const value = this.props.value;
        if (!this.colorStateEnabled || !value || !value[COLOR_FIELD]) {
            return undefined;
        }
        return value[MESSAGE_FIELD] || undefined;
    },
    get many2XAutocompleteProps() {
        const props = super.many2XAutocompleteProps;
        if (!this.colorStateEnabled) {
            return props;
        }
        return {
            ...props,
            specification: {...props.specification, ...COLOR_SPEC},
            // Keep the color fields returned by web_name_search: the default
            // callback reduces the record to its id and display name.
            update: (records) =>
                this.update(records && records[0] ? records[0] : false),
        };
    },
    update(value) {
        let newValue = value;
        if (this.colorStateEnabled && value && value.id) {
            if (COLOR_FIELD in value) {
                let displayName = value.display_name;
                if (!("display_name" in value) && "name" in value) {
                    displayName = value.name?.id ? value.name.display_name : value.name;
                }
                newValue = {
                    id: value.id,
                    display_name: displayName,
                    [COLOR_FIELD]: value[COLOR_FIELD],
                    [MESSAGE_FIELD]: value[MESSAGE_FIELD],
                };
            } else {
                // Let the record complete the value with the related fields.
                newValue = {id: value.id};
            }
        }
        return super.update(newValue);
    },
});

// 5. Color the matching entries of the autocomplete dropdown.
patch(Many2XAutocomplete.prototype, {
    buildRecordSuggestion(request, record) {
        const suggestion = super.buildRecordSuggestion(...arguments);
        const cls = colorClass(record);
        if (cls) {
            suggestion.cssClass = [suggestion.cssClass, cls].filter(Boolean).join(" ");
        }
        return suggestion;
    },
});

// 6. Read-only list cells and kanban fields without a widget are rendered as
// formatted text, not through the Many2One component: color them as well.
// Field nodes with the `no_color` option stay uncolored even when another
// node of the same field made the record request the color data.
patch(ListRenderer.prototype, {
    getCellClass(column, record) {
        let classNames = super.getCellClass(...arguments);
        if (
            column.type === "field" &&
            !column.options?.no_color &&
            this.canUseFormatter(column, record)
        ) {
            const cls = colorClass(record.data[column.name]);
            if (cls) {
                classNames = [classNames, cls].filter(Boolean).join(" ");
            }
        }
        return classNames;
    },
    getCellTitle(column, record) {
        const value = record.data[column.name];
        if (
            this.fields[column.name].type === "many2one" &&
            !column.options?.no_color &&
            colorClass(value)
        ) {
            return value[MESSAGE_FIELD] || super.getCellTitle(...arguments);
        }
        return super.getCellTitle(...arguments);
    },
});

patch(KanbanCompiler.prototype, {
    compileField(el, params) {
        const compiled = super.compileField(...arguments);
        if (!el.hasAttribute("widget") && !params?.formattedValueExpr) {
            const fieldId = el.getAttribute("field_id");
            compiled.setAttribute(
                "t-att-class",
                `__comp__.getMany2oneColorClass("${fieldId}")`
            );
            compiled.setAttribute(
                "t-att-data-tooltip",
                `__comp__.getMany2oneColorTooltip("${fieldId}")`
            );
        }
        return compiled;
    },
});

patch(KanbanRecord.prototype, {
    getMany2oneColorValue(fieldId) {
        const {archInfo, record} = this.props;
        const fieldInfo = archInfo.fieldNodes[fieldId];
        return fieldInfo.options?.no_color ? false : record.data[fieldInfo.name];
    },
    getMany2oneColorClass(fieldId) {
        return colorClass(this.getMany2oneColorValue(fieldId));
    },
    getMany2oneColorTooltip(fieldId) {
        const value = this.getMany2oneColorValue(fieldId);
        return (colorClass(value) && value[MESSAGE_FIELD]) || undefined;
    },
});
