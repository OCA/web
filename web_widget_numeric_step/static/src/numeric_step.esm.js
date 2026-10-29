import {
    FloatField,
    floatField,
    floatFieldProps,
} from "@web/views/fields/float/float_field";
import {t, useProps} from "@odoo/owl";
import {_t} from "@web/core/l10n/translation";
import {formatInteger} from "@web/views/fields/formatters";
import {parseInteger} from "@web/views/fields/parsers";
import {registry} from "@web/core/registry";

export class NumericStep extends FloatField {
    static template = "web_widget_numeric_step";
    props = useProps({
        ...floatFieldProps,
        step: t.number().optional(1),
        min: t.number().optional(),
        max: t.number().optional(),
        placeholder: t.string().optional(),
        additional_class: t.string().optional(),
    });

    get isInteger() {
        return this.props.record.fields[this.props.name].type === "integer";
    }
    parse(value) {
        if (this.isInteger && this.props.inputType !== "number") {
            return parseInteger(value, {allowOperation: true});
        }
        return super.parse(value);
    }
    get formattedValue() {
        // Same logic as the core IntegerField, so integers are not shown as floats
        if (
            !this.isInteger ||
            !this.props.formatNumber ||
            (this.props.inputType === "number" && !this.props.readonly)
        ) {
            return super.formattedValue;
        }
        return formatInteger(this.value, {
            humanReadable: this.props.humanReadable && !this.state.hasFocus,
            decimals: this.props.decimals,
        });
    }
    _onStepClick(ev) {
        const mode = ev.target.dataset.mode;
        this._doStep(mode);
    }
    _onKeyDown(ev) {
        if (ev.key === "ArrowUp") {
            this._doStep("plus");
        } else if (ev.key === "ArrowDown") {
            this._doStep("minus");
        }
    }
    _onWheel(ev) {
        ev.preventDefault();
        if (!this._lastWheelTime) {
            this._lastWheelTime = 0;
        }
        const now = Date.now();
        const throttleLimit = 100;
        if (now - this._lastWheelTime >= throttleLimit) {
            this._lastWheelTime = now;
            if (ev.deltaY > 0) {
                this._doStep("minus");
            } else {
                this._doStep("plus");
            }
        }
    }
    updateField(val) {
        return this.props.record.update({[this.props.name]: val});
    }
    _doStep(mode) {
        let cval = this.props.record.data[this.props.name];
        if (mode === "plus") {
            cval += this.props.step;
        } else if (mode === "minus") {
            cval -= this.props.step;
        }
        if (this.props.min !== undefined && cval < this.props.min) {
            cval = this.props.min;
        } else if (this.props.max !== undefined && cval > this.props.max) {
            cval = this.props.max;
        }
        if (this.isInteger) {
            cval = Math.round(cval);
        }
        this.updateField(cval);
    }
}

export const numericStep = {
    ...floatField,
    component: NumericStep,
    supportedTypes: ["float", "integer"],
    displayName: _t("Numeric Step"),
    // Width of the core float column plus the two step buttons
    listViewWidth: 165,
    extractProps({attrs, options}) {
        const props = floatField.extractProps(...arguments);
        return {
            ...props,
            step: options.step || 1,
            min: options.min,
            max: options.max,
            placeholder: attrs.placeholder,
            additional_class: attrs.class,
        };
    },
};

registry.category("fields").add("numeric_step", numericStep);
