import {FloatField} from "@web/views/fields/float/float_field";
import {_t} from "@web/core/l10n/translation";
import {registry} from "@web/core/registry";
import {standardFieldProps} from "@web/views/fields/standard_field_props";

export class NumericStep extends FloatField {
    setup() {
        super.setup();
    }
    _onStepClick(ev) {
        const mode = ev.target.dataset.mode;
        this._doStep(mode);
    }
    _onKeyDown(ev) {
        if (ev.keyCode === 38) {
            this._doStep("plus");
        } else if (ev.keyCode === 40) {
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
        if (cval < this.props.min) {
            cval = this.props.min;
        } else if (cval > this.props.max) {
            cval = this.props.max;
        }
        this.updateField(cval);
    }
}

NumericStep.template = "web_widget_numeric_step";
NumericStep.props = {
    ...standardFieldProps,
    inputType: {type: String, optional: true},
    step: {type: Number, optional: true},
    min: {type: Number, optional: true},
    max: {type: Number, optional: true},
    placeholder: {type: String, optional: true},
};
NumericStep.defaultProps = {
    ...FloatField.defaultProps,
    inputType: "text",
};

export const numericStep = {
    component: NumericStep,
    supportedTypes: ["float"],
    displayName: _t("Numeric Step"),
    extractProps: ({attrs, options}) => {
        return {
            name: attrs.name,
            inputType: attrs.type,
            step: options.step || 1,
            min: options.min,
            max: options.max,
            placeholder: attrs.placeholder,
        };
    },
};

registry.category("fields").add("numeric_step", numericStep);
