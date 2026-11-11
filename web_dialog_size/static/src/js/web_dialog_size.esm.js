import {Component, signal} from "@odoo/owl";
import {ActionDialog} from "@web/webclient/actions/action_dialog";
import {Dialog} from "@web/core/dialog/dialog";
import {SelectCreateDialog} from "@web/views/view_dialogs/select_create_dialog";
import {browser} from "@web/core/browser/browser";
import {patch} from "@web/core/utils/patch";
import {useService} from "@web/core/utils/hooks";
import {useSubEnv} from "@web/owl2/utils";

const STORAGE_KEY = "odoo.web_dialog_size.value";
const LAST_SERVER_KEY = "odoo.web_dialog_size.last_server_value";

/**
 * Resizing a list column by hand fixes the width of the table and its parent in
 * pixels, so the list no longer follows the dialog width. Unset them to let the
 * list fit its columns to the new dialog size.
 *
 * A window resize event would do it too, but it also closes every component
 * listening to it, such as the analytic distribution widget, and with it the
 * "Search More..." dialog it opened.
 *
 * @param {HTMLElement} el element inside the dialog
 */
function resetListColumnWidths(el) {
    const dialog = el.closest(".modal-content");
    if (!dialog) {
        return;
    }
    for (const table of dialog.querySelectorAll(".o_list_table")) {
        table.style.width = "";
        table.parentElement.style.width = "";
    }
}

export class ExpandButton extends Component {
    static template = "web_dialog_size.ExpandButton";
    static propsSchema = {};

    get maximized() {
        return this.env.webDialogSize.maximized();
    }

    toggle(ev) {
        resetListColumnWidths(ev.currentTarget);
        const maximized = !this.maximized;
        this.env.webDialogSize.maximized.set(maximized);
        browser.localStorage.setItem(STORAGE_KEY, String(maximized));
    }
}

patch(Dialog.prototype, {
    setup() {
        super.setup();
        const storedValue = browser.localStorage.getItem(STORAGE_KEY);
        const lastServerValue = browser.localStorage.getItem(LAST_SERVER_KEY);
        this.maximized = signal(storedValue === "true");
        // Components rendered in the dialog slots (e.g. the header button) inherit it
        useSubEnv({webDialogSize: {maximized: this.maximized}});

        const orm = useService("orm");
        orm.call("ir.config_parameter", "get_web_dialog_size_config").then((r) => {
            const serverValue = String(Boolean(r.default_maximize));
            if (serverValue !== lastServerValue) {
                browser.localStorage.setItem(LAST_SERVER_KEY, serverValue);
                if (storedValue === null || storedValue === lastServerValue) {
                    browser.localStorage.setItem(STORAGE_KEY, serverValue);
                    this.maximized.set(serverValue === "true");
                }
            }
        });
    },

    get size() {
        return this.maximized() ? "fs" : super.size;
    },
});

patch(ActionDialog.prototype, {
    setup() {
        super.setup();
        // Core (mail) adds its own expand button to some action dialogs, with its
        // own state. This module already provides one for every dialog, so hide it.
        // Defined on the instance so it wins whatever the patch order is.
        Object.defineProperty(this, "canExpand", {get: () => false});
    },
});

// The header template resolves components in the context of the slot owner
for (const DialogComponent of [Dialog, ActionDialog, SelectCreateDialog]) {
    DialogComponent.components = {...DialogComponent.components, ExpandButton};
}
