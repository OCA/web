/* Copyright 2026 Luca Orioli <lucaorioli@gmail.com>
 * License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl). */

import {
    CHATTER_MIN_WIDTH,
    VIEW_MIN_WIDTH,
} from "@web_chatter_resizable/chatter/chatter_patch.esm";
import {
    SIZES,
    contains,
    defineMailModels,
    openFormView,
    patchUiSize,
    start,
    startServer,
} from "@mail/../tests/mail_test_helpers";
import {animationFrame, dblclick, queryOne} from "@odoo/hoot-dom";
import {describe, expect, test} from "@odoo/hoot";
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

async function dragHandleTo(clientX) {
    const handle = queryOne(".o_chatter_resize_handle");
    handle.dispatchEvent(
        new PointerEvent("pointerdown", {bubbles: true, button: 0, clientX})
    );
    window.dispatchEvent(new PointerEvent("pointermove", {bubbles: true, clientX}));
    window.dispatchEvent(new PointerEvent("pointerup", {bubbles: true, clientX}));
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
    const target = Math.round((CHATTER_MIN_WIDTH + maxWidth) / 2);
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
    const right = container.getBoundingClientRect().right;
    await dragHandleTo(right + 100);
    expect(browser.localStorage.getItem(STORAGE_KEY)).toBe(String(CHATTER_MIN_WIDTH));
    await dragHandleTo(right - 100000);
    const maxWidth = container.parentElement.clientWidth - VIEW_MIN_WIDTH;
    expect(browser.localStorage.getItem(STORAGE_KEY)).toBe(String(maxWidth));
});

test("web_chatter_resizable: stored width applied when opening a form", async () => {
    browser.localStorage.setItem(STORAGE_KEY, "420");
    await patchUiSize({size: SIZES.XXL});
    await openPartnerForm();
    await contains(".o-mail-Form-chatter.o-aside.o_chatter_resized");
    expect(
        queryOne(".o-mail-Form-chatter").style.getPropertyValue(
            "--ChatterResizable-width"
        )
    ).toBe("420px");
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
