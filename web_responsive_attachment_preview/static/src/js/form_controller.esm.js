/** @odoo-module */
/* Copyright 2024 Hunki Enterprises BV
 * License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl-3.0) */

import {FormController} from "@web/views/form/form_controller";
import {unpatch} from "@web/core/utils/patch";

// Undo web_responsive's patch so that forms that choose so show the attachment preview
// just as standard Odoo does
unpatch(FormController.prototype, "web_responsive.FormController");
