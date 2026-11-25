import {
    contains,
    defineModels,
    fields,
    mockService,
    models,
    mountView,
    patchWithCleanup,
} from "@web/../tests/web_test_helpers";
import {expect, test} from "@odoo/hoot";
import {EventBus} from "@odoo/owl";
import {FormCompiler} from "@web/views/form/form_compiler";
import {SIZES} from "@web/core/ui/ui_service";

class Partner extends models.Model {
    name = fields.Char();
    _records = [{id: 1, name: "Test Partner"}];
}

defineModels([Partner]);

/**
 * The toggle is only active in the side-by-side ("sided chatter") layout, which
 * core renders solely at >= XXL — below XXL the sheet and chatter stack and core
 * adds `flex-column` to the form renderer, which this module reads as the
 * stacked/mobile layout and hides the toggle (see static/src/scss + core
 * form_compiler's responsive class). The Hoot viewport is below XXL, so force a
 * wide screen to exercise the desktop behavior deterministically, independent of
 * the CI runner's window size.
 */
function forceWideScreen() {
    const bus = new EventBus();
    mockService("ui", (env) => {
        Object.defineProperty(env, "isSmall", {value: false});
        return {
            bus,
            size: SIZES.XXL,
            isSmall: false,
        };
    });
}

/**
 * Patch FormCompiler to inject a mock chatter into the compiled arch, standing
 * in for the mail module so the toggle is testable without it. The chatter is
 * appended to the compiled root (the form-view class is emitted as a
 * `t-att-class`, so it is not matchable with a static selector on the template),
 * then the module's own — idempotent — `_ensureChatterToggleButton` is re-run
 * against it. This mirrors the real compile order: the module's compile patch
 * already ran inside `super.compile`, just as it runs before mail's chatter in
 * production; re-running it here is what mail's later pass effectively triggers.
 */
function patchFormCompilerWithMockChatter() {
    patchWithCleanup(FormCompiler.prototype, {
        compile(node, params = {}) {
            const compiledArch = super.compile(node, params);
            if (!params.isSubView) {
                const host = compiledArch.firstElementChild || compiledArch;
                const mockChatter = document.createElement("div");
                mockChatter.className = "o-mail-Form-chatter";
                host.appendChild(mockChatter);
                this._ensureChatterToggleButton(compiledArch);
            }
            return compiledArch;
        },
    });
}

// Each test compiles a UNIQUE arch: Odoo caches the compiled view by
// model+viewType+arch, so a shared arch would let whichever test compiles first
// (test order is randomized) decide whether the mock chatter is baked in.
let archSeq = 0;
const formArch = () => `
    <form>
        <sheet class="wtc_test_${archSeq++}">
            <field name="name"/>
        </sheet>
    </form>
`;

// The module marks the renderer stacked/mobile when it carries `flex-column`
// (core's sub-XXL responsive class). Tests that need the stacked layout add it
// explicitly and re-run the layout sync, so they don't depend on the viewport.
function switchToStackedLayout() {
    document.querySelector(".o_form_renderer").classList.add("flex-column");
    window.dispatchEvent(new Event("resize"));
}

// The module applies its state classes to whichever container a given sync cycle
// resolves (the form view at >= XXL, the renderer otherwise — sometimes both), so
// assertions anchor on the single, unambiguous chatter element whose inline
// styles always reflect the current state, plus a tolerant "is stacked" check.
const isStacked = () =>
    document.querySelector(".o_web_toggle_chatter_mobile_mode") !== null;

test("Toggle button is not injected in form view without chatter", async () => {
    forceWideScreen();
    await mountView({resModel: "partner", type: "form", arch: formArch(), resId: 1});
    expect(".o_web_toggle_chatter_toggle_wrapper").toHaveCount(0);
    expect(".o_web_toggle_chatter_toggle_btn").toHaveCount(0);
});

test("Toggle button is injected when chatter is present", async () => {
    forceWideScreen();
    patchFormCompilerWithMockChatter();
    await mountView({resModel: "partner", type: "form", arch: formArch(), resId: 1});
    expect(".o_web_toggle_chatter_toggle_wrapper").toHaveCount(1);
    expect(".o_web_toggle_chatter_toggle_btn").toHaveCount(1);
});

test("Clicking toggle collapses the chatter", async () => {
    forceWideScreen();
    patchFormCompilerWithMockChatter();
    await mountView({resModel: "partner", type: "form", arch: formArch(), resId: 1});
    expect(".o-mail-Form-chatter").not.toHaveStyle({maxWidth: "0px"});

    await contains(".o_web_toggle_chatter_toggle_btn").click();

    expect(".o-mail-Form-chatter").toHaveStyle({opacity: "0"});
    expect(".o-mail-Form-chatter").toHaveStyle({maxWidth: "0px"});
});

test("Clicking toggle twice restores the chatter", async () => {
    forceWideScreen();
    patchFormCompilerWithMockChatter();
    await mountView({resModel: "partner", type: "form", arch: formArch(), resId: 1});

    await contains(".o_web_toggle_chatter_toggle_btn").click();
    expect(".o-mail-Form-chatter").toHaveStyle({maxWidth: "0px"});

    await contains(".o_web_toggle_chatter_toggle_btn").click();

    expect(".o-mail-Form-chatter").not.toHaveStyle({maxWidth: "0px"});
    expect(".o-mail-Form-chatter").toHaveStyle({opacity: "1"});
});

test("Stacked (mobile) layout does not apply custom chatter collapse styles", async () => {
    // In the stacked layout the toggle button is hidden by design (it only makes
    // sense for a sided chatter), so there is no button to click — entering the
    // stacked layout must itself leave the chatter free of any collapse styles.
    forceWideScreen();
    patchFormCompilerWithMockChatter();
    await mountView({resModel: "partner", type: "form", arch: formArch(), resId: 1});

    switchToStackedLayout();

    expect(isStacked()).toBe(true);
    expect(".o-mail-Form-chatter").not.toHaveStyle({maxWidth: "0px"});
    expect(".o-mail-Form-chatter").not.toHaveStyle({flexBasis: "0px"});
    expect(".o-mail-Form-chatter").not.toHaveStyle({opacity: "0"});
});

test("Switching from desktop to mobile clears collapsed inline chatter styles", async () => {
    forceWideScreen();
    patchFormCompilerWithMockChatter();
    await mountView({resModel: "partner", type: "form", arch: formArch(), resId: 1});

    await contains(".o_web_toggle_chatter_toggle_btn").click();
    expect(".o-mail-Form-chatter").toHaveStyle({maxWidth: "0px"});

    switchToStackedLayout();

    expect(isStacked()).toBe(true);
    expect(".o-mail-Form-chatter").not.toHaveStyle({maxWidth: "0px"});
    expect(".o-mail-Form-chatter").not.toHaveStyle({flexBasis: "0px"});
    expect(".o-mail-Form-chatter").not.toHaveStyle({opacity: "0"});
});
