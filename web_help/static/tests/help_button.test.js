import {describe, expect, test} from "@odoo/hoot";
import {mockService, mountWithCleanup} from "@web/../tests/web_test_helpers";
import {HelpButton} from "@web_help/components/help_button/help_button.esm";

describe.current.tags("desktop");

describe("WebHelpButton", () => {
    test("renders the help button for a dialog model that has a registered trip", async () => {
        // In a dialog (e.g. the change-password wizard) the model arrives via
        // the resModel prop, not an actionId — the regression this guards.
        mockService("action", {loadAction: async () => ({})});
        await mountWithCleanup(HelpButton, {
            props: {resModel: "change.password.wizard", viewType: "form"},
        });
        expect(".js_web_help_btn").toHaveCount(1);
    });

    test("keeps the help button hidden when no trip matches the model", async () => {
        mockService("action", {loadAction: async () => ({})});
        await mountWithCleanup(HelpButton, {
            props: {resModel: "res.partner", viewType: "form"},
        });
        expect(".js_web_help_btn").toHaveCount(0);
    });
});
