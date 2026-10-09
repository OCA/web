/** @odoo-module **/

import {FormController} from "@web/views/form/form_controller";
import {_t} from "@web/core/l10n/translation";
import {patch} from "@web/core/utils/patch";
import {session} from "@web/session";

const web_field_tooltip = {
    get actionMenuItems() {
        const menuItems = super.actionMenuItems;
        const otherMenuItems = menuItems.action;
        if (session.can_manage_tooltips) {
            otherMenuItems.push({
                key: "manage_tooltips",
                description: _t("Manage tooltips"),
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
};

patch(FormController.prototype, web_field_tooltip);
