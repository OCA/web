import {describe, expect, test} from "@odoo/hoot";
import {mountWithCleanup} from "@web/../tests/web_test_helpers";
import {WebClient} from "@web/webclient/webclient";
import {registry} from "@web/core/registry";

describe("web_ir_actions_close_wizard_refresh_view", () => {
    test("action handler is registered", async () => {
        await mountWithCleanup(WebClient);
        const handlers = registry.category("action_handlers");
        expect(handlers.contains("ir.actions.close_wizard_refresh_view")).toBe(true);
    });
});
