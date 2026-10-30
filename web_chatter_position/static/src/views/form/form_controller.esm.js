/*
    Copyright 2026 ForgeFlow S.L. (https://www.forgeflow.com).
    License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl).
*/
import {onMounted, onPatched, useExternalListener, useState} from "@odoo/owl";

import {browser} from "@web/core/browser/browser";
import {SIZES} from "@web/core/ui/ui_service";
import {patch} from "@web/core/utils/patch";
import {FormController} from "@web/views/form/form_controller";

patch(FormController.prototype, {
    setup() {
        super.setup(...arguments);
        this.chatterPositionState = useState({
            currentPosition: odoo.web_chatter_position || "auto",
        });

        onMounted(() => {
            this.moveChatter();
        });

        useExternalListener(browser, "resize", () => {
            if (this.chatterPositionState.currentPosition === "bottom") {
                const formSheetBg = this.rootRef?.el?.querySelector(".o_form_sheet_bg");
                if (formSheetBg) {
                    this._moveChatter(formSheetBg);
                    this.rootRef.el.style.overflowX = "hidden";
                    this.rootRef.el.style.overflowY = "auto";
                }
            }
        });

        onPatched(() => {
            this.moveChatter();
        });
    },

    onClickChangePosition() {
        const newPosition =
            this.chatterPositionState.currentPosition === "bottom" ? "sided" : "bottom";
        this.chatterPositionState.currentPosition = newPosition;
        this.moveChatter();
    },

    get isChatterToggleVisible() {
        if (this.env.inDialog || this.env.isSmall) {
            return false;
        }
        if (this.ui.size < SIZES.XXL) {
            return false;
        }
        const xmlDoc = this.archInfo?.xmlDoc;
        if (!xmlDoc) {
            return false;
        }
        return Boolean(xmlDoc.querySelector("chatter"));
    },

    moveChatter() {
        if (
            this.ui.size < SIZES.XXL ||
            this.chatterPositionState.currentPosition === "auto"
        ) {
            return;
        }
        const rootEl = this.rootRef?.el;
        if (!rootEl) {
            return;
        }
        const formSheetBg = rootEl.querySelector(".o_form_sheet_bg");
        if (!formSheetBg) return;
        const formRenderer = formSheetBg.parentElement;
        if (!formRenderer) return;

        if (this.chatterPositionState.currentPosition === "bottom") {
            this._moveChatter(formSheetBg);
        } else if (this.chatterPositionState.currentPosition === "sided") {
            this._moveChatter(formRenderer);
        }
    },

    _moveChatter(target) {
        if (!target || !this.rootRef?.el) {
            return;
        }
        const currentChatter = this.rootRef.el.querySelector(".o-mail-Form-chatter");
        if (!currentChatter) {
            return;
        }
        target.appendChild(currentChatter);

        if (this.chatterPositionState.currentPosition === "bottom") {
            currentChatter.classList.remove("o-aside", "w-print-100");
            currentChatter.classList.add(
                "o-isInFormSheetBg",
                "mt-4",
                "mt-md-0",
                "w-auto"
            );
            const formSheetBg = this.rootRef.el.querySelector(".o_form_sheet_bg");
            if (formSheetBg) {
                formSheetBg.classList.add("o_fullwidth");
            }
            this.rootRef.el.style.overflowX = "hidden";
            this.rootRef.el.style.overflowY = "auto";
        } else {
            currentChatter.classList.remove(
                "o-isInFormSheetBg",
                "mt-4",
                "mt-md-0",
                "w-auto"
            );
            currentChatter.classList.add("o-aside", "w-print-100");
            const formSheetBg = this.rootRef.el.querySelector(".o_form_sheet_bg");
            if (formSheetBg) {
                formSheetBg.classList.remove("o_fullwidth");
            }
            this.rootRef.el.style.overflowX = "";
            this.rootRef.el.style.overflowY = "";
        }
    },
});
