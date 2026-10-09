import {
    asyncStep,
    mockService,
    patchWithCleanup,
    waitForSteps,
} from "@web/../tests/web_test_helpers";
import {
    click,
    contains,
    defineMailModels,
    openFormView,
    registerArchs,
    start,
    startServer,
} from "@mail/../tests/mail_test_helpers";
import {describe, expect, test} from "@odoo/hoot";
import {Chatter} from "@mail/chatter/web_portal/chatter";
import {animationFrame} from "@odoo/hoot-mock";
describe.current.tags("desktop");
defineMailModels();

const archs = {
    "res.fake,false,form": `
        <form string="Fake">
            <sheet></sheet>
            <chatter/>
        </form>`,
};

/**
 * Capture the action the chatter dispatches instead of letting the wizard open.
 *
 * @returns {{action: object|null}} filled in once "Send message" is clicked
 */
function mockFullComposerAction() {
    const captured = {action: null};
    mockService("action", {
        async doAction(action) {
            if (action?.res_model !== "mail.compose.message") {
                return super.doAction(...arguments);
            }
            captured.action = action;
            asyncStep("full_composer");
            return Promise.resolve();
        },
    });
    return captured;
}

describe("WebSendMessagePopup", () => {
    test("'Send message' opens the full composer instead of the inline one", async () => {
        registerArchs(archs);
        const pyEnv = await startServer();
        const fakeId = pyEnv["res.fake"].create({});
        const captured = mockFullComposerAction();
        await start();
        await openFormView("res.fake", fakeId);
        await contains("button", {text: "Send message"});
        // Go through the button, not through openFullComposer(): the patched
        // toggleComposer("message") is the feature, and routing through it is
        // what catches the patch failing to apply or being ordered wrong.
        await click("button", {text: "Send message"});
        await waitForSteps(["full_composer"]);
        // The inline composer must never appear — that is the whole module.
        await contains(".o-mail-Composer", {count: 0});
        const {context, target} = captured.action;
        expect(target).toBe("new");
        expect(context.default_model).toBe("res.fake");
        expect(context.default_res_ids).toEqual([fakeId]);
        expect(context.default_subtype_xmlid).toBe("mail.mt_comment");
    });

    test("dispatched context matches the 19.0 full composer", async () => {
        registerArchs(archs);
        const pyEnv = await startServer();
        const fakeId = pyEnv["res.fake"].create({});
        const captured = mockFullComposerAction();
        await start();
        await openFormView("res.fake", fakeId);
        await click("button", {text: "Send message"});
        await waitForSteps(["full_composer"]);
        const {context} = captured.action;
        // Without this the wizard hides the followers-only recipients widget
        // and makes the forward-style one required.
        expect(context.clicked_on_full_composer).toBe(true);
        // Lets the attachment selector reuse the thread composer.
        expect(context.is_thread_composer).toBe(true);
        // Lets a template body win over a signature-only default body.
        expect(context.body_contains_signature_only).toBe(true);
        // 19.0 dropped autofollow; the popup must not silently re-add it.
        expect("mail_post_autofollow" in context).toBe(false);
        // Recipients without a partner_id are filtered out, as core does.
        expect(context.default_partner_ids).toEqual([]);
    });

    test("body is built for the editor and carries the signature", async () => {
        registerArchs(archs);
        const pyEnv = await startServer();
        const fakeId = pyEnv["res.fake"].create({});
        const captured = mockFullComposerAction();
        await start();
        await openFormView("res.fake", fakeId);
        await click("button", {text: "Send message"});
        await waitForSteps(["full_composer"]);
        const {context} = captured.action;
        // The wizard renders this as html, so it must not arrive as a bare string.
        expect(context.default_body.toString()).toMatch(/^<(DIV|div|BR|br)/);
        // The signature is appended by the composer, never by the wizard.
        expect(context.default_email_add_signature).toBe(false);
    });

    test("'Log note' still uses the inline composer", async () => {
        registerArchs(archs);
        const pyEnv = await startServer();
        const fakeId = pyEnv["res.fake"].create({});
        mockFullComposerAction();
        await start();
        await openFormView("res.fake", fakeId);
        // The module only intercepts mode "message"; notes must fall through to
        // core, or the override has over-reached.
        await click("button", {text: "Log note"});
        await contains(".o-mail-Composer");
    });

    test("isDiscard decides whether the parent record is reloaded", async () => {
        registerArchs(archs);
        const pyEnv = await startServer();
        const fakeId = pyEnv["res.fake"].create({});
        // ReloadParentView() opens with `await this.props.saveRecord?.()`, so a
        // discard that reaches it silently saves the underlying form.
        patchWithCleanup(Chatter.prototype, {
            reloadParentView() {
                asyncStep("reload");
                return super.reloadParentView(...arguments);
            },
        });
        let captured = null;
        mockService("action", {
            async doAction(action, options) {
                if (action?.res_model !== "mail.compose.message") {
                    return super.doAction(...arguments);
                }
                captured = options;
                return Promise.resolve();
            },
        });
        await start();
        await openFormView("res.fake", fakeId);

        // Discard (the wizard's Discard button sends special: true) — no reload.
        await click("button", {text: "Send message"});
        captured.onClose({special: true});
        await animationFrame();
        await waitForSteps([]);

        // Sent (no dismiss/special) — reload is expected.
        await click("button", {text: "Send message"});
        captured.onClose({});
        await animationFrame();
        await waitForSteps(["reload"]);
    });
});
