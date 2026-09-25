/**
 * Copyright 2024 ACSONE SA/NV
 * License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).
 * **/
import {ProgressBarField} from "@web/views/fields/progress_bar/progress_bar_field";
import {registry} from "@web/core/registry";

const {onMounted} = owl;
export class ProgressBarFieldGradient extends ProgressBarField {
    static template = "web_widget_progressbar_color.ProgressBarFieldGradient";
    static props = {
        ...ProgressBarField.props,
        inverse: {type: Boolean, optional: true},
    };

    setup() {
        super.setup();
        onMounted(() => this._mounted());
    }

    _mounted() {
        // Set the gradient css and inverse if set
        for (const child of this.__owl__.bdom.el.children) {
            if (child.classList.contains("o_progress")) {
                child.children[0].classList.add("o_progressbar_gradient");
                if (this.props.inverse) {
                    child.children[0].classList.add("o_inverse");
                }
            }
        }
    }

    extractProps = ({attrs}) => {
        return {
            inverse: attrs.options.inverse,
        };
    };
}

export const ProgressBarFieldGradientWidget = {
    component: ProgressBarFieldGradient,
};

registry.category("fields").add("progressbar_gradient", ProgressBarFieldGradientWidget);
