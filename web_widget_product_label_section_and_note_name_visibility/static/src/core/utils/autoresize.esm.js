/** @odoo-module **/
/* Copyright Odoo S.A.
 * Copyright 2024 Tecnativa - Carlos Lopez
 * License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl). */

import {useEffect} from "@odoo/owl";
import {browser} from "@web/core/browser/browser";
import {resizeTextArea} from "@web/core/utils/autoresize";

function resizeInput(input) {
    // This mesures the maximum width of the input which can get from the flex layout.
    input.style.width = "100%";
    const maxWidth = input.clientWidth;
    // Somehow Safari 16 computes input sizes incorrectly. This is fixed in Safari 17
    const isSafari16 = /Version\/16.+Safari/i.test(browser.navigator.userAgent);
    // Minimum width of the input
    input.style.width = "10px";
    if (input.value === "" && input.placeholder !== "") {
        input.style.width = "auto";
        return;
    }
    if (input.scrollWidth + 5 + (isSafari16 ? 8 : 0) > maxWidth) {
        input.style.width = "100%";
        return;
    }
    input.style.width = input.scrollWidth + 5 + (isSafari16 ? 8 : 0) + "px";
}

/**
 * This is used on text inputs or textareas to automatically resize it based on its
 * content each time it is updated. It takes the reference of the element as
 * parameter and some options. Do note that it may introduce mild performance issues
 * since it will force a reflow of the layout each time the element is updated.
 * Do also note that it only works with textareas that are nested as only child
 * of some parent div (like in the text_field component).
 *
 * @param {Ref} ref
 */
export function useAutoresize(ref, options = {}) {
    let wasProgrammaticallyResized = false;
    let resize = null;
    useEffect(
        (el) => {
            if (el) {
                resize = (programmaticResize = false) => {
                    wasProgrammaticallyResized = programmaticResize;
                    if (el instanceof HTMLInputElement) {
                        resizeInput(el, options);
                    } else {
                        resizeTextArea(el, options);
                    }
                    if (options.onResize) {
                        options.onResize(el, options);
                    }
                };
                el.addEventListener("input", () => resize(true));
                const resizeObserver = new ResizeObserver(() => {
                    // This ensures that the resize function is not called twice on input or page load
                    if (wasProgrammaticallyResized) {
                        wasProgrammaticallyResized = false;
                        return;
                    }
                    resize();
                });
                resizeObserver.observe(el);
                return () => {
                    el.removeEventListener("input", resize);
                    resizeObserver.unobserve(el);
                    resizeObserver.disconnect();
                    resize = null;
                };
            }
        },
        () => [ref.el]
    );
    useEffect(() => {
        if (resize) {
            resize(true);
        }
    });
}
