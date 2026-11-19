/* Copyright 2026 Luca Orioli <lucaorioli@gmail.com>
 * License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl). */

import {reactive, useState, useSubEnv} from "@odoo/owl";
import {FormController} from "@web/views/form/form_controller";
import {_t} from "@web/core/l10n/translation";
import {browser} from "@web/core/browser/browser";
import {patch} from "@web/core/utils/patch";

export const HIDDEN_STORAGE_KEY = "web_chatter_resizable.hidden.form";

patch(FormController.prototype, {
    setup() {
        super.setup(...arguments);
        // Shared with the chatter, which counts itself while it is on the side
        this.chatterVisibility = useState(
            reactive({
                asideCount: 0,
                hidden: browser.localStorage.getItem(HIDDEN_STORAGE_KEY) === "1",
            })
        );
        useSubEnv({chatterVisibility: this.chatterVisibility});
    },

    get chatterVisibilityTitle() {
        return this.chatterVisibility.hidden
            ? _t("Show the chatter")
            : _t("Hide the chatter");
    },

    toggleChatterVisibility() {
        this.chatterVisibility.hidden = !this.chatterVisibility.hidden;
        if (this.chatterVisibility.hidden) {
            browser.localStorage.setItem(HIDDEN_STORAGE_KEY, "1");
        } else {
            browser.localStorage.removeItem(HIDDEN_STORAGE_KEY);
        }
    },
});
