/** @odoo-module
 * Copyright 2024 ACSONE SA/NV
 * License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).
 * **/
import {ProgressBarField} from "@web/views/fields/progress_bar/progress_bar_field";
import {registry} from "@web/core/registry";

export class ProgressBarFieldGradient extends ProgressBarField {
    setup() {
        super.setup();
    }
}
ProgressBarFieldGradient.template =
    "web_widget_progressbar_color.ProgressBarFieldGradient";
registry.category("fields").add("progressbar_gradient", ProgressBarFieldGradient);
