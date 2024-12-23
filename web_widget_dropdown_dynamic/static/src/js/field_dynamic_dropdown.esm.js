/** @odoo-module **/
import {_t} from "@web/core/l10n/translation";
import {registry} from "@web/core/registry";
import {standardFieldProps} from "@web/views/fields/standard_field_props";
import {Component, onWillStart, onWillUpdateProps} from "@odoo/owl";
import {useOwnedDialogs} from "@web/core/utils/hooks";

export class FieldDynamicDropdown extends Component {
    static template = "web.SelectionField";
    static props = {
        ...standardFieldProps,
        method: {type: String},
        context: {type: Object},
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
                    .map((val) => val[0])
                    .includes(String(this.props.record.data[this.props.name]))
            ) {
                this.props.record.update({[this.props.name]: null});
            }
            return this.specialData;
        }
        return [];
    }
    get value() {
        return String(this.props.record.data[this.props.name]);
    }
    parseInteger(value) {
        return Number(value);
    }
    /**
     * @param {Event} ev
     */
    onChange(ev) {
        let isInvalid = false;
        let value = JSON.parse(ev.target.value);
        if (this.type === "integer") {
            value = Number(value);
            if (!value) {
                if (this.props.record) {
                    this.props.record.setInvalidField(this.props.name);
                }
                isInvalid = true;
            }
        }
        if (!isInvalid) {
            this.props.record.update({[this.props.name]: value});
        }
    }
    stringify(value) {
        return JSON.stringify(value);
    }
}
export const dynamicDropdownField = {
    component: FieldDynamicDropdown,
    displayName: _t("Dynamic Dropdown"),
    supportedTypes: ["char", "integer", "selection"],
    extractProps: ({options}, {context}) => ({
        method: options?.values,
        context,
    }),
};
registry.category("fields").add("dynamic_dropdown", dynamicDropdownField);
