/* Copyright 2026 Luca Orioli <lucaorioli@gmail.com>
 * License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl). */

import {onWillUnmount, useEffect, useRef} from "@odoo/owl";
import {Chatter} from "@mail/chatter/web_portal/chatter";
import {browser} from "@web/core/browser/browser";
import {localization} from "@web/core/l10n/localization";
import {patch} from "@web/core/utils/patch";

export const CHATTER_MIN_WIDTH = 10;
// Width always left to the view beside the chatter
export const VIEW_MIN_WIDTH = 10;
const WIDTH_PROPERTY = "--ChatterResizable-width";

patch(Chatter.prototype, {
    setup() {
        super.setup(...arguments);
        this.resizeHandleRef = useRef("resizeHandle");
        this.stopChatterResize = null;
        useEffect(
            (handle) => {
                const container = handle?.parentElement;
                if (!container) {
                    return;
                }
                const width = this.getStoredChatterWidth();
                if (width) {
                    this.applyChatterWidth(container, width);
                }
                // The container is kept when the chatter moves below the view
                return () => this.resetChatterWidth(container);
            },
            () => [this.resizeHandleRef.el]
        );
        onWillUnmount(() => this.stopChatterResize?.());
    },

    /**
     * One width per kind of view, e.g. forms and the bank reconciliation
     * kanban, as the room left beside the chatter differs.
     */
    get chatterWidthStorageKey() {
        return `web_chatter_resizable.width.${this.env.config?.viewType || "default"}`;
    },

    getStoredChatterWidth() {
        return (
            parseInt(browser.localStorage.getItem(this.chatterWidthStorageKey), 10) || 0
        );
    },

    computeChatterWidth(container, clientX) {
        const rect = container.getBoundingClientRect();
        const width =
            localization.direction === "rtl"
                ? clientX - rect.left
                : rect.right - clientX;
        const maxWidth = container.parentElement.clientWidth - VIEW_MIN_WIDTH;
        return Math.round(Math.max(CHATTER_MIN_WIDTH, Math.min(width, maxWidth)));
    },

    applyChatterWidth(container, width) {
        container.classList.add("o_chatter_resized");
        container.style.setProperty(WIDTH_PROPERTY, `${width}px`);
    },

    resetChatterWidth(container) {
        container.classList.remove("o_chatter_resized");
        container.style.removeProperty(WIDTH_PROPERTY);
    },

    onResizeHandlePointerDown(ev) {
        if (ev.button !== 0) {
            return;
        }
        ev.preventDefault();
        const container = ev.currentTarget.parentElement;
        let width = 0;
        const onPointerMove = (moveEv) => {
            width = this.computeChatterWidth(container, moveEv.clientX);
            this.applyChatterWidth(container, width);
        };
        const stop = () => {
            browser.removeEventListener("pointermove", onPointerMove);
            browser.removeEventListener("pointerup", stop);
            document.body.classList.remove("o_chatter_resizing");
            this.stopChatterResize = null;
            if (width) {
                browser.localStorage.setItem(
                    this.chatterWidthStorageKey,
                    String(width)
                );
            }
        };
        browser.addEventListener("pointermove", onPointerMove);
        browser.addEventListener("pointerup", stop);
        document.body.classList.add("o_chatter_resizing");
        this.stopChatterResize = stop;
    },

    onResizeHandleDblClick(ev) {
        const container = ev.currentTarget.parentElement;
        container.classList.remove("o_chatter_resized");
        container.style.removeProperty(WIDTH_PROPERTY);
        browser.localStorage.removeItem(this.chatterWidthStorageKey);
    },
});
