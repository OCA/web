/* Copyright 2026 Luca Orioli <lucaorioli@gmail.com>
 * License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl). */

import {
    SIZES,
    contains,
    defineMailModels,
    openFormView,
    patchUiSize,
    start,
    startServer,
} from "@mail/../tests/mail_test_helpers";
import {
    VIEW_MIN_WIDTH,
    getChatterMinWidth,
} from "@web_chatter_resizable/chatter/chatter_patch.esm";
import {animationFrame, click, dblclick, queryOne} from "@odoo/hoot-dom";
import {describe, expect, test} from "@odoo/hoot";
import {HIDDEN_STORAGE_KEY} from "@web_chatter_resizable/views/form_controller_patch.esm";
import {browser} from "@web/core/browser/browser";

describe.current.tags("desktop");
defineMailModels();

const STORAGE_KEY = "web_chatter_resizable.width.form";

async function openPartnerForm() {
    const pyEnv = await startServer();
    await start();
    const partnerId = pyEnv["res.partner"].create({name: "John Doe"});
    await openFormView("res.partner", partnerId);
}

/**
 * Grab the handle on the edge of the chatter, so that the width follows the
 * pointer exactly, and drop it at clientX.
 */
async function dragHandleTo(clientX) {
    const handle = queryOne(".o_chatter_resize_handle");
    const options = {bubbles: true, button: 0, isPrimary: true, pointerId: 1};
    const startX = handle.parentElement.getBoundingClientRect().left;
    handle.dispatchEvent(
        new PointerEvent("pointerdown", {...options, clientX: startX})
    );
    window.dispatchEvent(new PointerEvent("pointermove", {...options, clientX}));
    await animationFrame();
    window.dispatchEvent(new PointerEvent("pointerup", {...options, clientX}));
    await animationFrame();
}

test("web_chatter_resizable: handle only on the side chatter", async () => {
    await patchUiSize({size: SIZES.XXL});
    await openPartnerForm();
    await contains(".o-mail-Form-chatter.o-aside > .o_chatter_resize_handle");
    await patchUiSize({size: SIZES.LG});
    await contains(".o-mail-Form-chatter:not(.o-aside)");
    await contains(".o_chatter_resize_handle", {count: 0});
});

test("web_chatter_resizable: drag, keep and restore the width", async () => {
    await patchUiSize({size: SIZES.XXL});
    await openPartnerForm();
    await contains(".o-mail-Form-chatter.o-aside > .o_chatter_resize_handle");
    const container = queryOne(".o-mail-Form-chatter");
    const maxWidth = container.parentElement.clientWidth - VIEW_MIN_WIDTH;
    const target = Math.round((getChatterMinWidth() + maxWidth) / 2);
    await dragHandleTo(container.getBoundingClientRect().right - target);
    expect(container).toHaveClass("o_chatter_resized");
    expect(container.style.getPropertyValue("--ChatterResizable-width")).toBe(
        `${target}px`
    );
    expect(browser.localStorage.getItem(STORAGE_KEY)).toBe(String(target));

    await dblclick(".o_chatter_resize_handle");
    expect(container).not.toHaveClass("o_chatter_resized");
    expect(container.style.getPropertyValue("--ChatterResizable-width")).toBe("");
    expect(browser.localStorage.getItem(STORAGE_KEY)).toBe(null);
});

test("web_chatter_resizable: width kept within the limits", async () => {
    await patchUiSize({size: SIZES.XXL});
    await openPartnerForm();
    await contains(".o-mail-Form-chatter.o-aside > .o_chatter_resize_handle");
    const container = queryOne(".o-mail-Form-chatter");
    const {right, width} = container.getBoundingClientRect();
    await dragHandleTo(right + 100);
    // Never above the standard width, e.g. narrower with web_responsive
    const minWidth = Math.round(Math.min(getChatterMinWidth(), width));
    expect(browser.localStorage.getItem(STORAGE_KEY)).toBe(String(minWidth));
    await dragHandleTo(right - 100000);
    const maxWidth = container.parentElement.clientWidth - VIEW_MIN_WIDTH;
    expect(browser.localStorage.getItem(STORAGE_KEY)).toBe(String(maxWidth));
});

test("web_chatter_resizable: stored width applied when opening a form", async () => {
    browser.localStorage.setItem(STORAGE_KEY, "640");
    await patchUiSize({size: SIZES.XXL});
    await openPartnerForm();
    await contains(".o-mail-Form-chatter.o-aside.o_chatter_resized");
    expect(
        queryOne(".o-mail-Form-chatter").style.getPropertyValue(
            "--ChatterResizable-width"
        )
    ).toBe("640px");
});

test("web_chatter_resizable: form fills the room beside the side chatter", async () => {
    await patchUiSize({size: SIZES.XXL});
    await openPartnerForm();
    await contains(".o-mail-Form-chatter.o-aside > .o_chatter_resize_handle");
    expect(getComputedStyle(queryOne(".o_form_sheet_bg")).maxWidth).toBe("none");
    expect(getComputedStyle(queryOne(".o_form_renderer")).maxWidth).toBe("none");
    await patchUiSize({size: SIZES.LG});
    await contains(".o-mail-Form-chatter:not(.o-aside)");
    expect(getComputedStyle(queryOne(".o_form_sheet_bg")).maxWidth).not.toBe("none");
});

test("web_chatter_resizable: show and hide the side chatter", async () => {
    await patchUiSize({size: SIZES.XXL});
    await openPartnerForm();
    await contains(".o-mail-Form-chatter.o-aside > .o_chatter_resize_handle");
    await contains(".o_chatter_visibility_toggle.active");
    await click(".o_chatter_visibility_toggle");
    await contains(".o-mail-Form-chatter.o_chatter_hidden");
    await contains(".o_chatter_visibility_toggle:not(.active)");
    expect(browser.localStorage.getItem(HIDDEN_STORAGE_KEY)).toBe("1");
    await click(".o_chatter_visibility_toggle");
    await contains(".o-mail-Form-chatter:not(.o_chatter_hidden)");
    expect(browser.localStorage.getItem(HIDDEN_STORAGE_KEY)).toBe(null);
    // Nothing to hide when the chatter is below the form
    await patchUiSize({size: SIZES.LG});
    await contains(".o-mail-Form-chatter:not(.o-aside)");
    await contains(".o_chatter_visibility_toggle", {count: 0});
});

test("web_chatter_resizable: hidden side chatter kept when opening a form", async () => {
    browser.localStorage.setItem(HIDDEN_STORAGE_KEY, "1");
    await patchUiSize({size: SIZES.XXL});
    await openPartnerForm();
    await contains(".o-mail-Form-chatter.o-aside.o_chatter_hidden");
    // Below the form the chatter is always shown
    await patchUiSize({size: SIZES.LG});
    await contains(".o-mail-Form-chatter:not(.o-aside):not(.o_chatter_hidden)");
});
