import { Component, useState, xml, toRaw, useRef } from "@odoo/owl";
import { registry } from "@web/core/registry";
import { standardFieldProps } from "@web/views/fields/standard_field_props";
import { _t } from "@web/core/l10n/translation";


export class InputRangeWidget extends Component {
    static template = "InputRangeWidget";

    static props = {
        min: { type: Number },
        max: { type: Number },
        value: { type: Number },
        step: { type: Number },
        onChange: { type: Function, optional: true },
    };

    onInput(e){
        this.rangeInputBoxValueRef.el.textContent = e.target.value;
    }

    onChange(e){
        if (this.props.onChange) {
            this.props.onChange(e.target.value);
        }
    }

    setup() {
        this.rangeInputBoxValueRef = useRef('rangeInputBoxValue');
    }
}


export class RangeSlider extends Component {
    static template = xml`<InputRangeWidget min="props.min" max="props.max" step="props.step" value="initialValue" onChange.bind="onChange"/>`;

    static components = { InputRangeWidget };

    static props = {
        ...standardFieldProps,
        min: InputRangeWidget.props.min,
        max: InputRangeWidget.props.max,
        step: InputRangeWidget.props.step,
        onChange: InputRangeWidget.props.onChange
    };

    setup() {
        this.initialValue = this.props.record.data[this.props.name];
    }

    async onChange(value) {
        await this.props.record.update({ [this.props.name]: value });

        if (this.props.onChange) {
            this.props.onChange(value);
        }
    }
}


export const rangeSlider = {
    component: RangeSlider,
    displayName: _t("Range Slider"),
    supportedOptions: [
        {
            label: _t("Step"),
            name: "step",
            type: "number",
            default: 1
        },
        {
            label: _t("Max"),
            name: "max",
            type: "number",
            default: 100
        },
        {
            label: _t("Min"),
            name: "min",
            type: "number",
            default: 0
        },
        {
            label: _t("On change function handler"),
            name: "onChange",
            type: "function"
        },
    ],
    supportedTypes: ["float"],
    isEmpty: () => false,
    extractProps: ({ attrs, options }) => {
        return {
            min: options.min ?? 0,
            max: options.max ?? 100,
            step: options.step ?? 1,
            onChange: options.onChange
        };
    },
};


registry.category("fields").add("range_slider", rangeSlider);