/*
    Copyright 2026 ForgeFlow S.L. (https://www.forgeflow.com).
    License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl).
*/

import {FormController} from "@web/views/form/form_controller";
import {patch} from "@web/core/utils/patch";
import {resetViewCompilerCache} from "@web/views/view_compiler";
import {useService} from "@web/core/utils/hooks";

patch(FormController.prototype, {
    setup() {
        super.setup(...arguments);
        this.actionService = useService("action");
    },

    get isChatterToggleVisible() {
        if (this.env.inDialog || this.env.isSmall) {
            return false;
        }
        const xmlDoc = this.archInfo?.xmlDoc;
        if (!xmlDoc) {
            return false;
        }
        return Boolean(xmlDoc.querySelector("chatter"));
    },

    async toggleChatterPosition() {
        const current = odoo.web_chatter_position || "auto";
        if (current === "bottom") {
            odoo.web_chatter_position = "sided";
        } else {
            odoo.web_chatter_position = "bottom";
        }
        resetViewCompilerCache();
        const controller = this.actionService.currentController;
        if (controller?.action?.controllers?.form) {
            delete controller.action.controllers.form;
        }
        const resId = this.model.root.resId;
        await this.actionService.switchView("form", {resId});
    },
});
