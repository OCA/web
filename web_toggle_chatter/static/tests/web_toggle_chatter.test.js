import {expect, test} from "@odoo/hoot";
import {
    contains,
    defineModels,
    fields,
    models,
    mountView,
    patchWithCleanup,
} from "@web/../tests/web_test_helpers";
import {FormCompiler} from "@web/views/form/form_compiler";

class Partner extends models.Model {
    name = fields.Char();
    _records = [{id: 1, name: "Test Partner"}];
}

defineModels([Partner]);

/**
 * Patches FormCompiler to inject a mock chatter element into the compiled arch.
 * This allows testing the toggle behavior without requiring the mail module.
 */
function patchFormCompilerWithMockChatter() {
    patchWithCleanup(FormCompiler.prototype, {
        compile(node, params = {}) {
            const compiledArch = super.compile(node, params);
            if (!params.isSubView) {
                const formViewEl = compiledArch.querySelector(".o_form_view");
                if (formViewEl) {
                    const mockChatter = document.createElement("div");
                    mockChatter.className = "o-mail-Form-chatter";
                    formViewEl.appendChild(mockChatter);
                }
            }
            return compiledArch;
        },
    });
}

const FORM_ARCH = `
    <form>
        <sheet>
            <field name="name"/>
        </sheet>
    </form>
`;

test("Toggle button is not injected in form view without chatter", async () => {
    await mountView({
        resModel: "partner",
        type: "form",
        arch: FORM_ARCH,
        resId: 1,
    });
    expect(".o_web_toggle_chatter_toggle_wrapper").toHaveCount(0);
    expect(".o_web_toggle_chatter_toggle_btn").toHaveCount(0);
});

test("Toggle button is injected when chatter is present", async () => {
    patchFormCompilerWithMockChatter();
    await mountView({
        resModel: "partner",
        type: "form",
        arch: FORM_ARCH,
        resId: 1,
    });
    expect(".o_web_toggle_chatter_toggle_wrapper").toHaveCount(1);
    expect(".o_web_toggle_chatter_toggle_btn").toHaveCount(1);
});

test("Clicking toggle collapses the chatter", async () => {
    patchFormCompilerWithMockChatter();
    await mountView({
        resModel: "partner",
        type: "form",
        arch: FORM_ARCH,
        resId: 1,
    });
    // Initially visible - no collapsed class
    expect(".o_form_view").not.toHaveClass("o_web_toggle_chatter_collapsed");

    await contains(".o_web_toggle_chatter_toggle_btn").click();

    // After toggle: form gets collapsed class, chatter loses visibility
    expect(".o_form_view").toHaveClass("o_web_toggle_chatter_collapsed");
    expect(".o-mail-Form-chatter").toHaveStyle({opacity: "0"});
    expect(".o-mail-Form-chatter").toHaveStyle({maxWidth: "0"});
});

test("Clicking toggle twice restores the chatter", async () => {
    patchFormCompilerWithMockChatter();
    await mountView({
        resModel: "partner",
        type: "form",
        arch: FORM_ARCH,
        resId: 1,
    });
    await contains(".o_web_toggle_chatter_toggle_btn").click();
    expect(".o_form_view").toHaveClass("o_web_toggle_chatter_collapsed");

    await contains(".o_web_toggle_chatter_toggle_btn").click();

    expect(".o_form_view").not.toHaveClass("o_web_toggle_chatter_collapsed");
    expect(".o-mail-Form-chatter").toHaveStyle({opacity: "1"});
});

test("Toggle does not apply custom chatter styles in mobile layout", async () => {
    patchFormCompilerWithMockChatter();
    await mountView({
        resModel: "partner",
        type: "form",
        arch: FORM_ARCH,
        resId: 1,
    });
    const formView = document.querySelector(".o_form_view");
    const formRenderer = document.querySelector(".o_form_renderer") || formView;
    formRenderer.classList.add("flex-column");

    await contains(".o_web_toggle_chatter_toggle_btn").click();

    expect(".o_form_view").not.toHaveClass("o_web_toggle_chatter_collapsed");
    expect(".o_form_view").toHaveClass("o_web_toggle_chatter_mobile_mode");
    expect(".o-mail-Form-chatter").not.toHaveStyle({maxWidth: "0"});
    expect(".o-mail-Form-chatter").not.toHaveStyle({flexBasis: "0"});
    expect(".o-mail-Form-chatter").not.toHaveStyle({opacity: "0"});
});

test("Switching from desktop to mobile clears collapsed inline chatter styles", async () => {
    patchFormCompilerWithMockChatter();
    await mountView({
        resModel: "partner",
        type: "form",
        arch: FORM_ARCH,
        resId: 1,
    });

    await contains(".o_web_toggle_chatter_toggle_btn").click();
    expect(".o_form_view").toHaveClass("o_web_toggle_chatter_collapsed");
    expect(".o-mail-Form-chatter").toHaveStyle({maxWidth: "0"});

    const formView = document.querySelector(".o_form_view");
    const formRenderer = document.querySelector(".o_form_renderer") || formView;
    formRenderer.classList.add("flex-column");
    window.dispatchEvent(new Event("resize"));

    expect(".o_form_view").toHaveClass("o_web_toggle_chatter_mobile_mode");
    expect(".o_form_view").not.toHaveClass("o_web_toggle_chatter_collapsed");
    expect(".o-mail-Form-chatter").not.toHaveStyle({maxWidth: "0"});
    expect(".o-mail-Form-chatter").not.toHaveStyle({flexBasis: "0"});
    expect(".o-mail-Form-chatter").not.toHaveStyle({opacity: "0"});
});
