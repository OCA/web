import {Component, xml} from "@odoo/owl";
import {
    assignDialogTestEnv,
    contains,
    mountWithCleanup,
    onRpc,
} from "@web/../tests/web_test_helpers";
import {beforeEach, expect, test} from "@odoo/hoot";
import {Dialog} from "@web/core/dialog/dialog";
import {animationFrame} from "@odoo/hoot-mock";
import {browser} from "@web/core/browser/browser";

class Parent extends Component {
    static components = {Dialog};
    static template = xml`<Dialog size="'md'" title="'Test'">Hello</Dialog>`;
}

beforeEach(() => {
    onRpc("ir.config_parameter", "get_web_dialog_size_config", () => ({
        default_maximize: false,
    }));
});

test("the user can maximize and restore a dialog", async () => {
    assignDialogTestEnv();
    await mountWithCleanup(Parent);
    expect(".modal-dialog.modal-md").toHaveCount(1);
    await contains(".dialog_button_extend").click();
    expect(".modal-dialog.modal-dialog_full_screen").toHaveCount(1);
    expect(browser.localStorage.getItem("odoo.web_dialog_size.value")).toBe("true");
    await contains(".dialog_button_restore").click();
    expect(".modal-dialog.modal-md").toHaveCount(1);
    expect(browser.localStorage.getItem("odoo.web_dialog_size.value")).toBe("false");
});

test("a stored preference opens the dialog maximized", async () => {
    browser.localStorage.setItem("odoo.web_dialog_size.value", "true");
    assignDialogTestEnv();
    await mountWithCleanup(Parent);
    expect(".modal-dialog.modal-dialog_full_screen").toHaveCount(1);
});

test("the server default maximizes dialogs without a stored preference", async () => {
    onRpc("ir.config_parameter", "get_web_dialog_size_config", () => ({
        default_maximize: true,
    }));
    assignDialogTestEnv();
    await mountWithCleanup(Parent);
    await animationFrame();
    expect(".modal-dialog.modal-dialog_full_screen").toHaveCount(1);
});
