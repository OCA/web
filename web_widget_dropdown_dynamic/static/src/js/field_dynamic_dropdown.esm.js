/** @odoo-module **/
import {_t} from "@web/core/l10n/translation";
import {registry} from "@web/core/registry";
import {standardFieldProps} from "@web/views/fields/standard_field_props";
import {Component, onWillStart, onWillUpdateProps} from "@odoo/owl";
import {useOwnedDialogs} from "@web/core/utils/hooks";
import {SelectMenu} from "@web/core/select_menu/select_menu";
import {hasTouch} from "@web/core/browser/feature_detection";

export class FieldDynamicDropdown extends Component {
    // The core SelectionField template renders a <SelectMenu>, which must be
    // declared here because OWL resolves subcomponents from this component.
    static components = {SelectMenu};
    static template = "web.SelectionField";
    static props = {
        ...standardFieldProps,
        method: {type: String},
        context: {type: Object},
        // The core template references props.placeholder, which
        // standardFieldProps does not include; the core SelectionField
        // declares it separately too.
        placeholder: {type: String, optional: true},
    };
    setup() {
        super.setup();
        this.dialogs = useOwnedDialogs();
        this.type = this.props.record.fields[this.props.name].type;
        onWillStart(async () => {
            this.specialData = await this._fetchSpecialData(this.props);
        });
        onWillUpdateProps(async (nextProps) => {
            if (this.props.context.depending_on !== nextProps.context.depending_on) {
                this.specialData = await this._fetchSpecialData(nextProps);
            }
        });
    }
    async _fetchSpecialData(props) {
        const {resModel} = props.record.model.config;
        const {specialDataCaches, orm} = props.record.model;
        const key = `__reference__${props.name}-${props.context.depending_on}`;
        if (!specialDataCaches[key]) {
            specialDataCaches[key] = await orm.call(resModel, props.method, [], {
                context: props.context,
            });
        }
        return specialDataCaches[key];
    }
    get options() {
        const fieldType = this.type || "";
        if (["char", "integer", "selection"].includes(fieldType)) {
            if (
                this.props.record.data[this.props.name] &&
                !this.specialData
                    .map((val) => String(val[0]))
                    .includes(String(this.props.record.data[this.props.name]))
            ) {
                this.props.record.update({[this.props.name]: null});
            }
            return this.specialData;
        }
        return [];
    }
    /**
     * The template consumes `choices` as [{value, label}], not as
     * [value, label] pairs. Values are normalized to String so that SelectMenu
     * matches the current value on integer fields too (the server may return
     * the value as text).
     */
    get choices() {
        return this.options.map(([value, label]) => ({value: String(value), label}));
    }
    /**
     * On small screens with touch, SelectMenu opens as a bottom sheet.
     * Same condition as the core SelectionField.
     */
    get isBottomSheet() {
        return this.env.isSmall && hasTouch();
    }
    /**
     * The template uses `string` to render the value in readonly mode.
     */
    get string() {
        const current = this.props.record.data[this.props.name];
        if (current === false || current === null || current === undefined) {
            return "";
        }
        const option = this.options.find((opt) => String(opt[0]) === String(current));
        return option ? option[1] : "";
    }
    get value() {
        const raw = this.props.record.data[this.props.name];
        if (raw === false || raw === null || raw === undefined) {
            return undefined;
        }
        return String(raw);
    }
    /**
     * SelectMenu calls onSelect(value) with the value directly, and with null
     * when clearing.
     */
    onChange(value) {
        if (value === null || value === undefined) {
            this.props.record.update({[this.props.name]: false});
            return;
        }
        let newValue = value;
        if (this.type === "integer") {
            newValue = Number(value);
            if (!newValue) {
                this.props.record.setInvalidField(this.props.name);
                return;
            }
        }
        this.props.record.update({[this.props.name]: newValue});
    }
}
export const dynamicDropdownField = {
    component: FieldDynamicDropdown,
    displayName: _t("Dynamic Dropdown"),
    supportedTypes: ["char", "integer", "selection"],
    extractProps: ({options, placeholder}, {context}) => ({
        method: options?.values,
        context,
        placeholder,
    }),
};
registry.category("fields").add("dynamic_dropdown", dynamicDropdownField);
