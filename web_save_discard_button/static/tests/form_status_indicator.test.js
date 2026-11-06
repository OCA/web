import {
    contains,
    defineModels,
    fields,
    models,
    mountView,
} from "@web/../tests/web_test_helpers";
import {describe, expect, test} from "@odoo/hoot";

describe.current.tags("desktop");

class Partner extends models.Model {
    name = fields.Char();
    _records = [{id: 1, name: "Test"}];
}
defineModels([Partner]);

describe("WebSaveDiscardButton", () => {
    test("Save & Discard buttons render text labels instead of icons", async () => {
        await mountView({
            type: "form",
            resModel: "partner",
            resId: 1,
            arch: `<form><field name="name"/></form>`,
        });
        // Dirty the record so the form status-indicator buttons appear.
        await contains(`[name="name"] input`).edit("changed");
        // The module replaces the cloud-upload / times icons with text labels.
        expect(".o_form_button_save").toHaveText("Save");
        expect(".o_form_button_cancel").toHaveText("Discard");
    });
});
