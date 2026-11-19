/* Copyright 2026 Luca Orioli <lucaorioli@gmail.com>
 * License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl). */

import {onWillUnmount, useEffect, useRef, useState} from "@odoo/owl";
import {Chatter} from "@mail/chatter/web_portal/chatter";
import {browser} from "@web/core/browser/browser";
import {localization} from "@web/core/l10n/localization";
import {patch} from "@web/core/utils/patch";

// Fallback for the standard width of the side chatter, set in the SCSS
export const CHATTER_MIN_WIDTH = 530;
// Width always left to the view beside the chatter
export const VIEW_MIN_WIDTH = 10;
const WIDTH_PROPERTY = "--ChatterResizable-width";
const MIN_WIDTH_PROPERTY = "--ChatterResizable-minWidth";

export function getChatterMinWidth() {
    const minWidth = parseInt(
        getComputedStyle(document.documentElement).getPropertyValue(MIN_WIDTH_PROPERTY),
        10
    );
    return minWidth > 0 ? minWidth : CHATTER_MIN_WIDTH;
}

export function clampChatterWidth(width, parentWidth, minWidth) {
    const maxWidth = Math.max(0, parentWidth - VIEW_MIN_WIDTH);
    return Math.round(Math.min(Math.max(width, minWidth), maxWidth));
}

patch(Chatter.prototype, {
    setup() {
        super.setup(...arguments);
        this.resizeHandleRef = useRef("resizeHandle");
        this.stopChatterResize = null;
        // Set by the form controller, to show or hide the side chatter
        this.chatterVisibility = this.env.chatterVisibility
            ? useState(this.env.chatterVisibility)
            : null;
        useEffect(
            (handle) => {
                const container = handle?.parentElement;
                if (!container) {
                    return;
                }
                // Some side chatters are narrower by design, e.g. in the bank
                // reconciliation: never jump above their standard width
                this.chatterMinWidth = Math.min(
                    getChatterMinWidth(),
                    container.getBoundingClientRect().width || Infinity
                );
                // The view beside the chatter gets narrower with the window
                const applyStoredWidth = () => {
                    const width = this.getStoredChatterWidth();
                    if (width && !this.stopChatterResize) {
                        this.applyChatterWidth(
                            container,
                            clampChatterWidth(
                                width,
                                container.parentElement.clientWidth,
                                this.chatterMinWidth
                            )
                        );
                    }
                };
                applyStoredWidth();
                browser.addEventListener("resize", applyStoredWidth);
                if (this.chatterVisibility) {
                    this.chatterVisibility.asideCount++;
                }
                // The container is kept when the chatter moves below the view
                return () => {
                    browser.removeEventListener("resize", applyStoredWidth);
                    if (this.chatterVisibility) {
                        this.chatterVisibility.asideCount--;
                    }
                    this.resetChatterWidth(container);
                };
            },
            () => [this.resizeHandleRef.el]
        );
        useEffect(
            (handle, hidden) => {
                const container = handle?.parentElement;
                container?.classList.toggle("o_chatter_hidden", hidden);
                return () => container?.classList.remove("o_chatter_hidden");
            },
            () => [this.resizeHandleRef.el, Boolean(this.chatterVisibility?.hidden)]
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

    /**
     * Width between the pointer and the edge of the chatter that does not move.
     */
    getPointerChatterWidth(container, clientX) {
        const rect = container.getBoundingClientRect();
        return localization.direction === "rtl"
            ? clientX - rect.left
            : rect.right - clientX;
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
        if (ev.button !== 0 || !ev.isPrimary || this.stopChatterResize) {
            return;
        }
        ev.preventDefault();
        const handle = ev.currentTarget;
        const container = handle.parentElement;
        const parentWidth = container.parentElement.clientWidth;
        // Keep the distance between the pointer and the edge during the drag,
        // wherever the handle is grabbed
        const grabOffset =
            container.getBoundingClientRect().width -
            this.getPointerChatterWidth(container, ev.clientX);
        // Keep receiving the events above iframes and outside the window
        try {
            handle.setPointerCapture(ev.pointerId);
        } catch {
            // No active pointer, e.g. a synthetic event
        }
        let width = 0;
        let frame = 0;
        const onPointerMove = (moveEv) => {
            if (moveEv.pointerId !== ev.pointerId) {
                return;
            }
            width = clampChatterWidth(
                this.getPointerChatterWidth(container, moveEv.clientX) + grabOffset,
                parentWidth,
                this.chatterMinWidth
            );
            frame ||= browser.requestAnimationFrame(() => {
                frame = 0;
                this.applyChatterWidth(container, width);
            });
        };
        const stop = () => {
            browser.cancelAnimationFrame(frame);
            browser.removeEventListener("pointermove", onPointerMove);
            browser.removeEventListener("pointerup", stop);
            browser.removeEventListener("pointercancel", stop);
            document.body.classList.remove("o_chatter_resizing");
            this.stopChatterResize = null;
            if (width) {
                this.applyChatterWidth(container, width);
                browser.localStorage.setItem(
                    this.chatterWidthStorageKey,
                    String(width)
                );
            }
        };
        browser.addEventListener("pointermove", onPointerMove);
        browser.addEventListener("pointerup", stop);
        browser.addEventListener("pointercancel", stop);
        document.body.classList.add("o_chatter_resizing");
        this.stopChatterResize = stop;
    },

    onResizeHandleDblClick(ev) {
        this.stopChatterResize?.();
        this.resetChatterWidth(ev.currentTarget.parentElement);
        browser.localStorage.removeItem(this.chatterWidthStorageKey);
    },
});
