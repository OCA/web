/** @odoo-module **/
/*
    Copyright 2023 Camptocamp SA (https://www.camptocamp.com).
    License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl).
*/
import {browser} from "@web/core/browser/browser";
import {SIZES} from "@web/core/ui/ui_service";

import {append} from "@web/core/utils/xml";
import {FormController} from "@web/views/form/form_controller";
import {patch} from "@web/core/utils/patch";
import {
    onMounted,
    onPatched,
    onWillDestroy,
    onWillPatch,
    useExternalListener,
    useRef,
    useState,
} from "@odoo/owl";

/**
 * So, you've landed here and you have no idea what this is about. Don't worry, you're
 * not the only one. Here's a quick summary of what's going on:
 *
 * In core, the chatter position depends on the size of the screen and wether there is
 * an attachment viewer or not. There are 3 possible positions, and for each position a
 * different chatter instance is displayed.
 *
 * So, in fact, we have 3 chatter instances running, and we switch their visibility
 * depending on the desired position.
 *
 * A) Bottom position
 *    https://github.com/odoo/odoo/blob/2ef010907/addons/mail/static/src/views/form/form_compiler.js#L160
 *    Condition: `!this.props.hasAttachmentViewer and uiService.size < ${SIZES.XXL}`
 *
 *    This is the bottom position you would except. However it can only be there until
 *    XXL screen sizes, because the container is a flexbox and changes from row to
 *    column display. It's hidden in the presence of an attachment viewer.
 *
 * B) Bottom In-sheet position
 *    https://github.com/odoo/odoo/blob/2ef010907/addons/mail/static/src/views/form/form_compiler.js#L181
 *    Condition: `this.props.hasAttachmentViewer`
 *
 *    This is the bottom position that's used when there's an attachment viewer in place.
 *    It's rendered within the form sheet, possibly to by-pass the flexbox issue
 *    beforementioned. It's only instanciated when there's an attachment viewer.
 *
 * C) Sided position
 *    https://github.com/odoo/odoo/blob/2ef010907/addons/mail/static/src/views/form/form_compiler.js#L83
 *    Condition: `!hasAttachmentViewer() and uiService.size >= ${SIZES.XXL}`
 *
 *    This is the sided position, hidden in the presence of an attachment viewer.
 *    It's the better half of `A`.
 *
 * The patches and overrides you see below are here to alter these conditions to force
 * a specific position regardless of the screen size, depending on an user setting.

 */

patch(FormController.prototype, "web_chatter_position", {
    setup() {
        this._super();
        this.state = useState({
            ...this.state,
            currentPosition: odoo.web_chatter_position,
        });

        this.rootRef = useRef("root");

        onWillPatch(() => {
            if (this.rootRef.el && this.state.currentPosition === "bottom") {
                this._moveChatter(this.rootRef.el);
            }
        });

        onMounted(() => {
            this.moveChatter();
        });

        useExternalListener(browser, "resize", () => {
            // Quick hack to avoid DOMException
            // Node.insertBefore: Child to insert before is not a child of this node
            if (this.state.currentPosition === "bottom") {
                this._moveChatter(this.rootRef.el);
                // W/o it, cannot see content of chatter
                this.rootRef.el.style.overflow = "auto";
            }
        });

        onPatched(() => {
            this.moveChatter();
        });

        onWillDestroy(() => {
            if (this.rootRef.el && this.state.currentPosition === "bottom") {
                this._moveChatter(this.rootRef.el);
            }
        });
    },

    //* *
    // * Change position in-place: either Bottom or Sided
    // */
    onClickChangePosition() {
        const newPosition =
            this.state.currentPosition === "bottom" ? "sided" : "bottom";
        this.state.currentPosition = newPosition;
        this.moveChatter();
    },

    moveChatter() {
        if (
            this.ui.size < SIZES.XXL || // Let standard handle when screen is small
            this.state.currentPosition === "auto"
        ) {
            return;
        }
        const rootEl = this.rootRef.el;
        if (!rootEl) {
            return;
        }

        const formSheetBg = rootEl.querySelector(".o_form_sheet_bg");
        if (!formSheetBg) {
            return;
        }

        if (this.hasAttachmentViewer() || this.state.currentPosition === "bottom") {
            this._moveChatter(formSheetBg);
        } else if (this.state.currentPosition === "sided") {
            this._moveChatter(rootEl);
        }
    },

    _moveChatter(target) {
        if (!target || !this.rootRef.el) {
            return;
        }
        const currentChatter = this.rootRef.el.querySelector(
            "div.o_FormRenderer_chatterContainer.oe_chatter"
        );
        if (!currentChatter) {
            return;
        }
        append(target, currentChatter);

        const forceBottom = this.hasAttachmentViewer();
        const chatterContainer = currentChatter.querySelector("div.o_ChatterContainer");

        if (forceBottom || this.state.currentPosition === "bottom") {
            currentChatter.classList.remove("o-aside");
            currentChatter.classList.add("o-isInFormSheetBg");
            if (chatterContainer) {
                chatterContainer.classList.add("o-isInFormSheetBg", "mx-auto");
            }
        } else {
            // Sided
            currentChatter.classList.remove("o-isInFormSheetBg");
            currentChatter.classList.add("o-aside");
            if (chatterContainer) {
                chatterContainer.classList.remove("o-isInFormSheetBg", "mx-auto");
            }
        }
    },
});
