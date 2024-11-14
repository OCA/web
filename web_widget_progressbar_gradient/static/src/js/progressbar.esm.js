/** @odoo-module
 * Copyright 2024 ACSONE SA/NV
 * License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).
 * **/
import {ProgressBarField} from "@web/views/fields/progress_bar/progress_bar_field";
import {registry} from "@web/core/registry";

const {onMounted} = owl;
export class ProgressBarFieldGradient extends ProgressBarField {
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
}
ProgressBarFieldGradient.extractProps = ({attrs}) => {
    return {
        inverse: attrs.options.inverse,
    };
};
ProgressBarFieldGradient.template =
    "web_widget_progressbar_color.ProgressBarFieldGradient";
ProgressBarFieldGradient.props = {
    ...ProgressBarField.props,
    inverse: {type: Boolean, optional: true},
};

registry.category("fields").add("progressbar_gradient", ProgressBarFieldGradient);
