/** @odoo-module **/

// Copyright 2026 Pol Reig <pol.reig@qubiq.es>
// License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

import {whenReady} from "@odoo/owl";
import {browser} from "@web/core/browser/browser";
import {_t} from "@web/core/l10n/translation";
import {getPopoverForTarget} from "@web/core/popover/popover";
import {Tooltip} from "@web/core/tooltip/tooltip";
import {tooltipService} from "@web/core/tooltip/tooltip_service";

const STICKY_CLOSE_DELAY = 250;
const COPIED_FEEDBACK_MS = 1200;

/**
 * @param {unknown} value
 * @returns {String}
 */
export function formatCopyValue(value) {
    if (value === undefined || value === null) {
        return "";
    }
    if (typeof value === "string") {
        return value;
    }
    try {
        return JSON.stringify(value);
    } catch {
        return String(value);
    }
}

/**
 * Prefer the Clipboard API; fall back to execCommand for HTTP / older contexts.
 *
 * @param {String} text
 * @returns {Promise<void>}
 */
export async function writeTextToClipboard(text) {
    if (browser.navigator?.clipboard?.writeText) {
        try {
            await browser.navigator.clipboard.writeText(text);
            return;
        } catch {
            // Fall through to legacy path.
        }
    }

    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.top = "0";
    textarea.style.left = "-9999px";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    textarea.setSelectionRange(0, textarea.value.length);

    let copied = false;
    try {
        copied = document.execCommand("copy");
    } finally {
        document.body.removeChild(textarea);
    }
    if (!copied) {
        throw new Error("Clipboard copy failed");
    }
}

/**
 * @param {HTMLElement|null} anchor
 * @param {EventTarget|null} related
 * @returns {Boolean}
 */
function isRelatedInsidePopover(anchor, related) {
    if (!anchor || !(related instanceof Element)) {
        return false;
    }
    const popoverEl = getPopoverForTarget(anchor);
    return Boolean(popoverEl && popoverEl.contains(related));
}

/**
 * @param {HTMLElement|null} anchor
 * @returns {Boolean}
 */
function isAnchorOrPopoverHovered(anchor) {
    if (!anchor) {
        return false;
    }
    if (anchor.matches(":hover")) {
        return true;
    }
    const popoverEl = getPopoverForTarget(anchor);
    return Boolean(popoverEl && popoverEl.matches(":hover"));
}

/**
 * Wrap the stock tooltip service instead of forking it:
 * - FieldTooltip popovers stay open while the pointer moves into them
 * - technical values are click-to-copy
 */
const originalStart = tooltipService.start.bind(tooltipService);

tooltipService.start = function fieldTooltipCopyStart(env, {popover}) {
    /** @type {(() => void) | null} */
    let interactiveClose = null;
    /** @type {HTMLElement | null} */
    let interactiveAnchor = null;
    let stickyCloseTimeout = null;

    function clearStickyClose() {
        browser.clearTimeout(stickyCloseTimeout);
        stickyCloseTimeout = null;
    }

    function closeInteractive() {
        clearStickyClose();
        const close = interactiveClose;
        interactiveClose = null;
        interactiveAnchor = null;
        if (close) {
            close();
        }
    }

    function scheduleStickyClose() {
        clearStickyClose();
        const anchor = interactiveAnchor;
        stickyCloseTimeout = browser.setTimeout(() => {
            stickyCloseTimeout = null;
            if (interactiveAnchor !== anchor) {
                return;
            }
            if (!isAnchorOrPopoverHovered(anchor)) {
                closeInteractive();
            }
        }, STICKY_CLOSE_DELAY);
    }

    /**
     * @param {HTMLElement} el
     * @param {String} value
     */
    async function copyValue(el, value) {
        const text = formatCopyValue(value);
        if (!text) {
            return;
        }
        try {
            await writeTextToClipboard(text);
        } catch (error) {
            browser.console.warn(error);
            env.services.notification?.add(_t("Could not copy to clipboard"), {
                type: "danger",
            });
            return;
        }
        el.classList.add("o_field_tooltip_copy_done");
        const badge = el.querySelector(".o_field_tooltip_copy_badge");
        if (badge) {
            badge.textContent = _t("Copied!");
            badge.classList.remove("d-none");
        }
        browser.setTimeout(() => {
            el.classList.remove("o_field_tooltip_copy_done");
            if (badge) {
                badge.classList.add("d-none");
            }
        }, COPIED_FEEDBACK_MS);
    }

    const wrappedPopover = {
        add(target, component, props = {}, options = {}) {
            const isFieldTooltip =
                component === Tooltip && props.template === "web.FieldTooltip";
            if (!isFieldTooltip) {
                return popover.add(target, component, props, options);
            }

            let closed = false;
            const remove = popover.add(target, component, props, {
                ...options,
                holdOnHover: true,
                closeOnClickAway: (clicked) => !clicked?.closest?.(".o-tooltip"),
                onClose: () => {
                    closed = true;
                    if (interactiveAnchor === target) {
                        interactiveClose = null;
                        interactiveAnchor = null;
                    }
                    clearStickyClose();
                    options.onClose?.();
                },
            });

            // Same function the stock service stores as closeTooltip — safe to
            // call from sticky close or from stock cleanup without double-remove.
            const closeFn = () => {
                if (closed) {
                    return;
                }
                closed = true;
                if (interactiveAnchor === target) {
                    interactiveClose = null;
                    interactiveAnchor = null;
                }
                clearStickyClose();
                remove();
            };

            interactiveClose = closeFn;
            interactiveAnchor = target;
            return closeFn;
        },
    };

    // Register sticky listeners before the stock service (whenReady order).
    whenReady(() => {
        // Capture phase, registered first: can delay stock mouseleave cleanup.
        document.body.addEventListener(
            "mouseleave",
            (ev) => {
                const anchor = ev.target?.closest?.(
                    "[data-tooltip], [data-tooltip-template]"
                );
                if (!anchor || interactiveAnchor !== anchor) {
                    return;
                }
                if (isRelatedInsidePopover(anchor, ev.relatedTarget)) {
                    ev.stopImmediatePropagation();
                    clearStickyClose();
                    return;
                }
                if (getPopoverForTarget(anchor)) {
                    // Grace period to cross the gap into the popover.
                    ev.stopImmediatePropagation();
                    scheduleStickyClose();
                }
            },
            true
        );

        document.body.addEventListener(
            "mouseenter",
            (ev) => {
                if (ev.target?.closest?.(".o_popover, .popover, .o-tooltip")) {
                    clearStickyClose();
                }
            },
            true
        );

        document.body.addEventListener(
            "mouseleave",
            (ev) => {
                if (!interactiveAnchor) {
                    return;
                }
                const popoverEl = getPopoverForTarget(interactiveAnchor);
                if (!popoverEl || !popoverEl.contains(ev.target)) {
                    return;
                }
                if (interactiveAnchor.contains(ev.relatedTarget)) {
                    clearStickyClose();
                    return;
                }
                scheduleStickyClose();
            },
            true
        );

        document.body.addEventListener(
            "click",
            (ev) => {
                const copyEl = ev.target?.closest?.("[data-copy-value]");
                if (!copyEl || !copyEl.closest(".o-tooltip")) {
                    return;
                }
                ev.preventDefault();
                ev.stopPropagation();
                ev.stopImmediatePropagation();
                copyValue(copyEl, copyEl.dataset.copyValue);
            },
            true
        );
    });

    return originalStart(env, {popover: wrappedPopover});
};
