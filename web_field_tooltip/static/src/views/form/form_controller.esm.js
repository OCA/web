/** @odoo-module **/

import {FormController} from "@web/views/form/form_controller";
import {patch} from "@web/core/utils/patch";

import {session} from "@web/session";

patch(FormController.prototype, "web_field_tooltip", {
    getActionMenuItems() {
        const menuItems = this._super(...arguments);
        const otherMenuItems = menuItems.other;
        if (session.can_manage_tooltips) {
            otherMenuItems.push({
                key: "manage_tooltips",
                description: this.env._t("Manage tooltips"),
                callback: () => this.manageTooltips(),
            });
        }
        return menuItems;
    },

    manageTooltips() {
        const model = this.props.resModel;
        this.env.services.action.doAction(
            "web_field_tooltip.ir_model_fields_tooltip_act_window",
            {
                additionalContext: {
                    search_default_model: model,
                    default_model: model,
                },
            }
        );
    },
});
